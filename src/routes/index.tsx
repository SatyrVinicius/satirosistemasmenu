import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";

import wallpaper from "@/assets/wallpaper.jpg";
import logo from "@/assets/logo.png";
import mesa from "@/assets/mesa.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sátiro Lanches | Lanchonete — Escolha sua Mesa" },
      {
        name: "description",
        content:
          "Sátiro Lanches: hambúrgueres artesanais, porções e bebidas. Escolha sua mesa e faça seu pedido direto pelo celular.",
      },
      { property: "og:title", content: "Sátiro Lanches — Escolha sua Mesa" },
      {
        property: "og:description",
        content: "Hamburgueria artesanal. Toque na sua mesa e peça agora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const mesas = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Mesa 6"];

function Index() {
  return (
    <main
      className="flex min-h-screen flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="flex min-h-screen flex-col bg-black/70 backdrop-blur-[2px]">
        {/* Logo + descrição */}
        <header className="flex flex-col items-center px-6 pt-12 text-center">
          <img
            src={logo}
            alt="Logo Sátiro Lanches"
            width={150}
            height={150}
            className="h-[150px] w-[150px] rounded-full object-cover drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
          />
          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase tracking-wide text-amber-400 sm:text-5xl">
            Sátiro Lanches
          </h1>
          <p className="mt-3 max-w-xl text-base text-neutral-300 sm:text-lg">
            Hambúrgueres artesanais no ponto certo, porções generosas e
            refrigerante gelado. Escolha sua mesa abaixo e faça o pedido sem
            sair do lugar.
          </p>
        </header>

        {/* Mesas */}
        <section className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-amber-200/80">
            Toque na sua mesa
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {mesas.map((nome, i) => (
              <article
                key={nome}
                className="flex flex-col items-center rounded-2xl border border-white/10 bg-black/50 p-5 shadow-xl"
              >
                <img
                  src={mesa}
                  alt={`Figura da ${nome}`}
                  width={512}
                  height={512}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-28 w-28 object-contain"
                />
                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-amber-100 transition hover:bg-red-600 active:scale-95"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  {nome}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Rodapé */}
        <footer className="border-t border-white/10 bg-black/60 px-6 py-6 text-center text-sm text-neutral-300">
          <p className="font-semibold tracking-wide">
            Desenvolvido pela Sátiro Sistemas&nbsp;|&nbsp;(84) 9
            3300-4200&nbsp;|&nbsp;@satirosistemas
          </p>
        </footer>
      </div>
    </main>
  );
}
