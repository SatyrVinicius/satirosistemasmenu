import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, RefreshCw, UtensilsCrossed } from "lucide-react";


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
  const [showPedidoPopup, setShowPedidoPopup] = useState(false);
  const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshWebview = () => {
    const el = iframeRef.current;
    if (el) el.src = el.src;
  };

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      refreshWebview();
    }, 20 * 60 * 1000);
  };

  const openWebview = (link: string) => {
    const href = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    window.history.pushState({ webview: true }, "");
    setActiveLink(href);
  };

  useEffect(() => {
    if (!activeLink) return;
    // Bloqueia o botão voltar nativo: recria uma entrada no histórico
    // toda vez que o usuário pressiona voltar, impedindo que saia do webview.
    const trapBack = () => {
      window.history.pushState({ webview: true }, "");
    };
    window.addEventListener("popstate", trapBack);
    return () => window.removeEventListener("popstate", trapBack);
  }, [activeLink]);

  useEffect(() => {
    if (!activeLink) return;
    document.documentElement.style.overscrollBehaviorY = "none";
    document.body.style.overscrollBehaviorY = "none";
    return () => {
      document.documentElement.style.overscrollBehaviorY = "";
      document.body.style.overscrollBehaviorY = "";
    };
  }, [activeLink]);

  useEffect(() => {
    if (!activeLink) return;

    const interactionEvents = ["pointerdown", "touchstart", "click", "keydown", "scroll"];
    interactionEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [activeLink]);



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

  const isFullscreen = () => {
    return !!(
      document.fullscreenElement ||
      // @ts-expect-error vendor prefixed
      document.webkitFullscreenElement ||
      // @ts-expect-error vendor prefixed
      document.msFullscreenElement
    );
  };

  const requestFullscreen = async () => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const exitFullscreen = async () => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void;
      msExitFullscreen?: () => Promise<void> | void;
    };
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onChange = () => setFullscreen(isFullscreen());
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("msfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("msfullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    if (!amplia || isFullscreen()) return;

    let triggered = false;
    const enter = () => {
      if (triggered) return;
      triggered = true;
      requestFullscreen();
    };

    // tenta imediatamente; se falhar, aguarda o primeiro gesto do usuário
    requestFullscreen().catch(() => {
      window.addEventListener("pointerdown", enter, { once: true });
      window.addEventListener("touchstart", enter, { once: true });
      window.addEventListener("click", enter, { once: true });
    });

    return () => {
      window.removeEventListener("pointerdown", enter);
      window.removeEventListener("touchstart", enter);
      window.removeEventListener("click", enter);
    };
  }, [amplia]);

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen();
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
                    openWebview(m.link_mesa);
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
          <button
            type="button"
            onClick={() => {
              const el = iframeRef.current;
              if (!el) return;

              let currentUrl: string | null = null;
              try {
                const href = el.contentWindow?.location?.href;
                if (href && href !== "about:blank") currentUrl = href;
              } catch {
                // cross-origin: não é possível ler a URL atual do iframe
              }

              if (currentUrl && currentUrl.includes("/pedido/")) {
                setShowPedidoPopup(true);
                if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
                popupTimeoutRef.current = setTimeout(() => setShowPedidoPopup(false), 2000);
              }

              el.src = el.src;
            }}
            aria-label="Atualizar página"
            className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/90 transition hover:bg-black/70 active:scale-95"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <iframe
            ref={iframeRef}
            src={activeLink}
            title="Webview"
            className="h-full w-full border-0"
            allow="fullscreen"
            onLoad={resetInactivityTimer}
          />

          {showPedidoPopup && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6">
              <div className="rounded-2xl bg-card px-8 py-6 text-center shadow-2xl">
                <p className="text-lg font-semibold text-card-foreground">
                  Sucesso!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </main>
  );
}
