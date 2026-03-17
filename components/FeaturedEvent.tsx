import Link from "next/link";

export function FeaturedEvent() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
      <div className="panel panel-highlight overflow-hidden p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">
          Evento destacado
        </p>

        <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase md:text-5xl">
          Apertura de temporada y nueva etapa para la ciudad
        </h2>

        <p className="mt-4 max-w-2xl text-white/68">
          Una nueva fase comienza en Eden Life. Cambios, mejoras visuales y nuevas
          oportunidades para construir historias dentro de la ciudad.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/discord" className="btn-primary">
            🎟️ Ver evento
          </Link>
          <Link href="/normas" className="btn-secondary">
            📚 Revisar normativa
          </Link>
        </div>
      </div>
    </section>
  );
}