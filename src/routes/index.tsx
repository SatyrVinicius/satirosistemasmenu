import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, UtensilsCrossed } from "lucide-react";

import { supabase } from "@/lib/supabase";
import wallpaperFallback from "@/assets/wallpaper.jpg";
import logoFallback from "@/assets/logo.png";
import mesaFig from "@/assets/mesa.png";

type Lanchonete = {
  id: number;
  descricao: string | null;
  logo: string | null;
  walpaper: string | null;
  slogan: string | null;
  codigo_lanchonete: string | null;
  amplia: boolean | null;
};

type Mesa = {
  id: number;
  descricao: string | null;
  link_mesa: string | null;
};

export const Route = createFileRoute("/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { cod?: string | undefined } => ({
    cod: typeof search["cod"] === "string" ? search["cod"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sátiro Lanches | Escolha sua Mesa" },
      {
        name: "description",
        content:
          "Sátiro Lanches: escolha sua mesa e faça seu pedido direto pelo celular.",
      },
      { property: "og:title", content: "Sátiro Lanches — Escolha sua Mesa" },
      {
        property: "og:description",
        content: "Toque na sua mesa e peça agora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { cod } = Route.useSearch();
  const [fullscreen, setFullscreen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const refreshing = useRef(false);

  const { data: lanchonete } = useQuery({
    queryKey: ["lanchonete", cod ?? "default"],
    enabled: !!cod,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("LANCHONETES")
        .select("id,descricao,logo,walpaper,slogan,codigo_lanchonete,amplia")
        .eq("codigo_lanchonete", cod)
        .limit(1)
        .single();
      if (error) throw error;
      return data as Lanchonete | null;
    },
  });

  const amplia = lanchonete?.amplia === true;
  const refCod = lanchonete?.codigo_lanchonete ?? undefined;

  const { data: mesas } = useQuery({
    queryKey: ["mesas", refCod],
    enabled: !!refCod,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("MESAS")
        .select("id,descricao,link_mesa")
        .eq("ref_lanchonete", refCod!)
        .order("id");
      if (error) throw error;
      return (data ?? []) as Mesa[];
    },
  });


  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!activeLink) {
      document.body.style.overscrollBehaviorY = "";
      return;
    }

    document.body.style.overscrollBehaviorY = "none";

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const y = e.touches[0]?.clientY ?? touchStartY.current;
      const delta = y - touchStartY.current;
      const atTop = window.scrollY <= 0;

      if (atTop && delta > 80 && !refreshing.current) {
        e.preventDefault();
        refreshing.current = true;
        const iframe = iframeRef.current;
        if (iframe) {
          const currentSrc = iframe.src;
          iframe.src = "about:blank";
          setTimeout(() => {
            iframe.src = currentSrc;
            refreshing.current = false;
          }, 80);
        }
      }
    };

    const onTouchEnd = () => {
      touchStartY.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.body.style.overscrollBehaviorY = "";
    };
  }, [activeLink]);

  useEffect(() => {
    if (!amplia || document.fullscreenElement) return;
    const enter = () => {
      document.documentElement.requestFullscreen?.().catch(() => {});
      window.removeEventListener("pointerdown", enter);
    };
    document.documentElement.requestFullscreen?.().catch(() => {
      // navegadores exigem gesto do usuário: tenta no primeiro toque
      window.addEventListener("pointerdown", enter, { once: true });
    });
    return () => window.removeEventListener("pointerdown", enter);
  }, [amplia]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const wallpaper = lanchonete?.walpaper || wallpaperFallback;
  const logo = lanchonete?.logo || logoFallback;

  if (!cod || !lanchonete) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-fixed px-6"
        style={{ backgroundImage: `url("${wallpaperFallback.replace(/"/g, '%22')}")` }}
      >
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black/80 backdrop-blur-[2px]">
          <div className="max-w-md rounded-2xl border border-white/10 bg-black/60 p-8 text-center shadow-xl">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-amber-400" />
            <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-amber-400">
              Lanchonete não encontrada
            </h1>
            <p className="mt-2 text-neutral-300">
              Informe um código válido na URL, por exemplo: <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-200">/?cod=teste</code>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url("${wallpaper.replace(/"/g, '%22')}")` }}
    >
      <div className="flex min-h-screen flex-col bg-black/70 backdrop-blur-[2px]">
        <header className="flex flex-col items-center px-6 pt-12 text-center">
          <img
            src={logo}
            alt="Logo da lanchonete"
            width={150}
            height={150}
            className="h-[150px] w-[150px] rounded-full object-cover drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
          />
          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase tracking-wide text-amber-400 sm:text-5xl">
            {lanchonete.descricao ?? "Sátiro Lanches"}
          </h1>
          {lanchonete.slogan && (
            <p className="mt-3 max-w-xl text-base text-neutral-300 sm:text-lg">
              {lanchonete.slogan}
            </p>
          )}
        </header>

        <section className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-amber-200/80">
            Toque na sua mesa
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {(mesas ?? []).map((m, i) => (
              <article
                key={m.id}
                className="flex flex-col items-center rounded-2xl border border-white/10 bg-black/50 p-5 shadow-xl"
              >
                <img
                  src={mesaFig}
                  alt={`Figura da ${m.descricao ?? "mesa"}`}
                  width={512}
                  height={512}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-28 w-28 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!m.link_mesa) return;
                    const href = /^https?:\/\//i.test(m.link_mesa)
                      ? m.link_mesa
                      : `https://${m.link_mesa}`;
                    setActiveLink(href);
                  }}

                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-amber-100 transition hover:bg-red-600 active:scale-95"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  {m.descricao ?? `Mesa ${m.id}`}
                </button>
              </article>
            ))}
          </div>
          {mesas && mesas.length === 0 && (
            <p className="mt-10 text-center text-neutral-300">
              Nenhuma mesa cadastrada para esta lanchonete.
            </p>
          )}
        </section>

        <div className="flex justify-center pb-6">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-black/50 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-amber-200 transition hover:bg-black/70 active:scale-95"
          >
            {fullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
            {fullscreen ? "Desampliar" : "Ampliar"}
          </button>
        </div>

        <footer className="border-t border-white/10 bg-black/60 px-6 py-6 text-center text-sm text-neutral-300">
          <p className="font-semibold tracking-wide">
            Desenvolvido pela Sátiro Sistemas&nbsp;|&nbsp;(84) 9
            3300-4200&nbsp;|&nbsp;@satirosistemas
          </p>
        </footer>
      </div>

      {activeLink && (
        <div className="fixed inset-0 z-50 bg-black">
          <iframe
            ref={iframeRef}
            src={activeLink}
            title="Webview da mesa"
            className="h-full w-full border-0"
            allow="fullscreen"
          />
        </div>
      )}
    </main>
  );
}
