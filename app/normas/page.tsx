"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type RuleTableColumn = {
  title: string;
  items: string[];
};

type RuleGroup = {
  title: string;
  points: string[];
  table?: {
    columns: RuleTableColumn[];
  };
};

type RuleCategory = {
  id: string;
  emoji: string;
  label: string;
  title: string;
  intro: string;
  rules: RuleGroup[];
};

type RulesDocument = {
  categorias: RuleCategory[];
};

export default function NormasPage() {
  const [rulesData, setRulesData] = useState<RulesDocument>({ categorias: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    fetch("/api/normas", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "No se pudieron cargar las normativas.");
        }
        setRulesData(json);
        setActiveId(json.categorias?.[0]?.id ?? "");
      })
      .catch(() => {
        setRulesData({ categorias: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const categorias = useMemo(() => rulesData.categorias ?? [], [rulesData]);

  const activeCategory =
    categorias.find((category) => category.id === activeId) ?? categorias[0];

  const filteredRules = useMemo(() => {
    if (!activeCategory) return [];

    const query = search.trim().toLowerCase();

    if (!query) return activeCategory.rules;

    return activeCategory.rules.filter((rule) => {
      const inTitle = rule.title.toLowerCase().includes(query);
      const inPoints = rule.points.some((point) =>
        point.toLowerCase().includes(query)
      );

      const inTable =
        rule.table?.columns.some((column) => {
          const inColumnTitle = column.title.toLowerCase().includes(query);
          const inItems = column.items.some((item) =>
            item.toLowerCase().includes(query)
          );
          return inColumnTitle || inItems;
        }) ?? false;

      return inTitle || inPoints || inTable;
    });
  }, [activeCategory, search]);

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Normativas</p>
          <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
            Reglamento de Eden Life
          </h1>
          <p className="mt-4 text-white/70">
            Explora las categorías activas del servidor. El staff puede actualizarlas
            desde el panel administrativo y los cambios se verán aquí automáticamente.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="panel h-fit p-5">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Categorías disponibles
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase">Secciones</h2>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/65">
                Cargando categorías...
              </div>
            ) : (
              <div className="space-y-3">
                {categorias.map((category) => {
                  const isActive = activeCategory?.id === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setActiveId(category.id);
                        setSearch("");
                      }}
                      className={[
                        "w-full rounded-2xl border px-4 py-4 text-left transition duration-300",
                        isActive
                          ? "border-white/25 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.06)]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                          {category.emoji}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                            {category.label}
                          </p>
                          <h3 className="mt-2 text-lg font-bold uppercase">
                            {category.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-white/60">
                            {category.intro}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <div className="space-y-6">
            {loading ? (
              <section className="panel p-6">
                <p className="text-white/70">Cargando normativas...</p>
              </section>
            ) : activeCategory ? (
              <section
                key={activeCategory.id}
                className="panel animate-[fadeIn_.25s_ease] p-6 md:p-8"
              >
                <div className="mb-6 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-4xl">
                      {activeCategory.emoji}
                    </div>

                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-white/45">
                        {activeCategory.label}
                      </p>
                      <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                        {activeCategory.title}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 max-w-3xl text-white/70">
                    {activeCategory.intro}
                  </p>

                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="Buscar norma dentro de esta categoría..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {filteredRules.length > 0 ? (
                    filteredRules.map((rule, index) => (
                      <article
                        key={`${activeCategory.id}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:bg-white/[0.05]"
                      >
                        <h3 className="text-xl font-bold">{rule.title}</h3>

                        {rule.table?.columns?.length ? (
                          <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {rule.table.columns.map((column, columnIndex) => (
                              <div
                                key={columnIndex}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                              >
                                <h4 className="mb-4 text-center text-lg font-bold uppercase text-white">
                                  {column.title}
                                </h4>

                                <ul className="space-y-2 text-center text-white/75">
                                  {column.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ul className="mt-4 space-y-3 text-white/75">
                            {rule.points.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex gap-3">
                                <span className="mt-1 text-white/45">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/65">
                      No se encontraron normas con esa búsqueda dentro de esta categoría.
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="panel p-6">
                <p className="text-white/70">No hay categorías disponibles todavía.</p>
              </section>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}