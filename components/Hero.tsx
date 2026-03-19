import Link from "next/link";
import { CityBackdrop } from "@/components/CityBackdrop";
import { EdenLogo } from "@/components/EdenLogo";

const highlights = [
  {
    eyebrow: "Acceso",
    title: "Mini whitelist desde la web",
    text: "Envía tu solicitud, recibe seguimiento claro y entra con una base sólida de rol."
  },
  {
    eyebrow: "Normativas",
    title: "Reglas claras y ordenadas",
    text: "Toda la comunidad puede consultar las reglas por categoría con una lectura mucho más cómoda."
  },
  {
    eyebrow: "Servidor",
    title: "Anuncios y estado en vivo",
    text: "Consulta novedades del servidor y revisa el estado actual de Eden Life desde la portada."
  }
];

const metrics = [
  { value: "WL", label: "Acceso ordenado" },
  { value: "RP", label: "Serio y limpio" },
  { value: "24/7", label: "Ciudad activa" }
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <CityBackdrop />

      <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-6 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div className="relative z-10 reveal-up">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-white/60 backdrop-blur">
            FiveM · QBCore · Eden Life
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <EdenLogo withWordmark={false} className="hero-logo" />
            <div className="h-12 w-px bg-white/10" />
            <p className="eden-network-badge">
              Eden Life
            </p>
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-black uppercase leading-[0.9] md:text-7xl xl:text-[5.7rem]">
            Eden , una ciudad <span className="text-white/60">sobria, premium</span> y memorable.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
            Diseñada para sentirse distinta desde el primer vistazo: identidad limpia, acceso cuidado, normativa clara,
            anuncios visibles y una presencia visual que transmite orden, exclusividad y rol serio.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/whitelist" className="btn-primary">📝 Hacer whitelist</Link>
            <Link href="/normas" className="btn-secondary">📚 Ver normativas</Link>
             <a
              href="https://discord.gg/6hFFpBaJWP"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
>
              💬 Entrar al Discord
             </a>
          </div>

          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {metrics.map((item, index) => (
              <div
                key={item.label}
                className="info-chip reveal-up"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="info-chip__value">{item.value}</span>
                <span className="info-chip__label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid gap-5 reveal-up" style={{ animationDelay: "140ms" }}>
          <div className="panel panel-highlight overflow-hidden p-6 md:p-8">
            <div className="scanline" aria-hidden="true" />
            <div className="floating-particles" aria-hidden="true">
              <span className="particle particle--soft particle-a" />
              <span className="particle particle--soft particle-b" />
              <span className="particle particle--soft particle-c" />
            </div>

            <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Eden Network</p>
                <h2 className="mt-2 text-3xl font-black uppercase">Entrada a la ciudad</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/55">
                Premium
              </span>
            </div>

            <div className="relative z-10 grid gap-4">
              {highlights.map((item, index) => (
                <article
                  key={item.title}
                  className="lift-card rule-hover rounded-[1.75rem] border border-white/10 bg-black/55 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-white/45">{item.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-white/65">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">


            <article className="panel p-5 reveal-up" style={{ animationDelay: "320ms" }}>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Experiencia</p>
              <h3 className="mt-2 text-xl font-bold">Recorrido claro y moderno</h3>
              <p className="mt-3 text-white/65">
                Cada bloque guía al usuario para entrar, leer normas, revisar anuncios y seguir su progreso.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}