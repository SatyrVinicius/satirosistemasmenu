import { createFileRoute } from "@tanstack/react-router";
import { Ruler, Hammer, Truck, ShieldCheck, ArrowRight } from "lucide-react";

import mesa1 from "@/assets/mesa-1.jpg";
import mesa2 from "@/assets/mesa-2.jpg";
import mesa3 from "@/assets/mesa-3.jpg";
import mesa4 from "@/assets/mesa-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mesas Marcenaria Sátiro | Catálogo de Mesas Artesanais" },
      {
        name: "description",
        content:
          "Catálogo de mesas artesanais: mesa de jantar em carvalho, mesa redonda, mesa lateral e mesa industrial. Veja figura e descrição de cada mesa.",
      },
      { property: "og:title", content: "Catálogo de Mesas Artesanais" },
      {
        property: "og:description",
        content: "Quatro modelos de mesa com figura, descrição e orçamento direto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const mesas = [
  {
    img: mesa1,
    nome: "Mesa Carvalho",
    descricao: "Mesa de jantar em carvalho maciço, pés cônicos, 8 lugares.",
    medida: "220 × 95 cm",
  },
  {
    img: mesa2,
    nome: "Mesa Redonda",
    descricao: "Tampo em pedra clara com base tubular de aço preto.",
    medida: "Ø 110 cm",
  },
  {
    img: mesa3,
    nome: "Mesa Lateral",
    descricao: "Mesa de apoio em nogueira com tampo de vidro temperado.",
    medida: "Ø 50 cm",
  },
  {
    img: mesa4,
    nome: "Mesa Industrial",
    descricao: "Estrutura em aço preto e tampo de madeira de demolição.",
    medida: "180 × 80 cm",
  },
];

const servicos = [
  { icon: Ruler, titulo: "Sob medida", texto: "Cada mesa ajustada ao seu espaço." },
  { icon: Hammer, titulo: "Feito à mão", texto: "Marcenaria tradicional, peça a peça." },
  { icon: Truck, titulo: "Entrega montada", texto: "Chega pronta para usar." },
  { icon: ShieldCheck, titulo: "5 anos", texto: "Garantia total de estrutura." },
];

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b-[3px] border-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <span className="font-display text-lg font-bold uppercase tracking-[0.2em]">
            Mesas
          </span>
          <nav className="hidden gap-8 text-sm font-semibold uppercase tracking-widest sm:flex">
            <a href="#catalogo" className="hover:text-accent">
              Catálogo
            </a>
            <a href="#servicos" className="hover:text-accent">
              Serviços
            </a>
          </nav>
          <a href="#catalogo" className="btn-solid text-xs">
            Orçamento
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Marcenaria artesanal
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-6xl">
          Quatro mesas. Uma para cada jeito de viver a casa.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Figura, descrição e medida de cada modelo — escolha a sua e peça um orçamento
          sem compromisso.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#catalogo" className="btn-solid">
            Ver as mesas <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#servicos" className="btn-outline">
            Como fazemos
          </a>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {mesas.map((m, i) => (
            <article key={m.nome} className="flex flex-col">
              <div className="frame bg-card">
                <img
                  src={m.img}
                  alt={`${m.nome} — ${m.descricao}`}
                  width={800}
                  height={800}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <h2 className="mt-5 text-lg font-bold uppercase tracking-wide">{m.nome}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{m.descricao}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em]">
                {m.medida}
              </p>
              <a href="#servicos" className="btn-outline mt-4 text-xs">
                Detalhes
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="servicos" className="border-y-[3px] border-foreground bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {servicos.map((s) => (
            <div key={s.titulo}>
              <s.icon className="h-8 w-8" strokeWidth={2.5} />
              <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
                {s.titulo}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Mesas — marcenaria artesanal.</span>
        <span className="font-semibold uppercase tracking-widest text-foreground">
          contato@mesas.com.br
        </span>
      </footer>
    </main>
  );
}
