"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";

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

const EMPTY_RICH_TEXT = "<p>Escribe aquí la norma</p>";
const EMPTY_INTRO_TEXT = "<p>Describe esta sección</p>";
const EMPTY_COLUMN_ITEM = "<p>Elemento 1</p>";

export default function AdminNormativasPage() {
  const [data, setData] = useState<RulesDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/normas", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error al cargar normas");
        setData(json);

        if (json?.categorias?.length) {
          const firstCategoryId = json.categorias[0].id;
          setActiveCategoryId(firstCategoryId);

          const nextExpandedRules: Record<string, boolean> = {};
          json.categorias.forEach((category: RuleCategory) => {
            category.rules.forEach((_, ruleIndex) => {
              nextExpandedRules[ruleKey(category.id, ruleIndex)] = ruleIndex === 0;
            });
          });
          setExpandedRules(nextExpandedRules);
        }
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categorias = useMemo(() => data?.categorias ?? [], [data]);

  const activeCategoryIndex = useMemo(() => {
    if (!data?.categorias?.length) return -1;
    return data.categorias.findIndex((category) => category.id === activeCategoryId);
  }, [data, activeCategoryId]);

  const activeCategory =
    activeCategoryIndex >= 0 && data
      ? data.categorias[activeCategoryIndex]
      : data?.categorias?.[0];

  function updateCategory(index: number, field: keyof RuleCategory, value: string) {
    if (!data) return;
    const copy = structuredClone(data);
    const previousId = copy.categorias[index].id;
    (copy.categorias[index][field] as string) = value;
    setData(copy);

    if (field === "id" && activeCategoryId === previousId) {
      setActiveCategoryId(value);
    }
  }

  function updateRuleTitle(catIndex: number, ruleIndex: number, value: string) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules[ruleIndex].title = value;
    setData(copy);
  }

  function updatePoint(catIndex: number, ruleIndex: number, pointIndex: number, value: string) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules[ruleIndex].points[pointIndex] = value;
    setData(copy);
  }

  function addCategory() {
    if (!data) return;
    const copy = structuredClone(data);

    const newCategory: RuleCategory = {
      id: `cat-${Date.now()}`,
      emoji: "📘",
      label: "Nueva categoría",
      title: "Nuevo bloque",
      intro: EMPTY_INTRO_TEXT,
      rules: [
        {
          title: "Nueva regla",
          points: [EMPTY_RICH_TEXT],
        },
      ],
    };

    copy.categorias.push(newCategory);
    setData(copy);
    setActiveCategoryId(newCategory.id);
    setExpandedRules((prev) => ({
      ...prev,
      [ruleKey(newCategory.id, 0)]: true,
    }));
  }

  function removeCategory(catIndex: number) {
    if (!data) return;

    const copy = structuredClone(data);
    const removedCategory = copy.categorias[catIndex];
    copy.categorias.splice(catIndex, 1);
    setData(copy);

    if (removedCategory.id === activeCategoryId) {
      setActiveCategoryId(copy.categorias[0]?.id ?? "");
    }
  }

  function addRule(catIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules.push({
      title: "Nueva regla",
      points: [EMPTY_RICH_TEXT],
    });

    const newRuleIndex = copy.categorias[catIndex].rules.length - 1;
    setData(copy);
    setExpandedRules((prev) => ({
      ...prev,
      [ruleKey(copy.categorias[catIndex].id, newRuleIndex)]: true,
    }));
  }

  function removeRule(catIndex: number, ruleIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules.splice(ruleIndex, 1);
    setData(copy);
  }

  function addPoint(catIndex: number, ruleIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules[ruleIndex].points.push(EMPTY_RICH_TEXT);
    setData(copy);
  }

  function removePoint(catIndex: number, ruleIndex: number, pointIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules[ruleIndex].points.splice(pointIndex, 1);

    if (copy.categorias[catIndex].rules[ruleIndex].points.length === 0) {
      copy.categorias[catIndex].rules[ruleIndex].points.push(EMPTY_RICH_TEXT);
    }

    setData(copy);
  }

  function enableTable(catIndex: number, ruleIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    const rule = copy.categorias[catIndex].rules[ruleIndex];

    if (!rule.table) {
      rule.table = {
        columns: [
          { title: "Columna 1", items: [EMPTY_COLUMN_ITEM] },
          { title: "Columna 2", items: [EMPTY_COLUMN_ITEM] },
          { title: "Columna 3", items: [EMPTY_COLUMN_ITEM] },
        ],
      };
    }

    setData(copy);

    setExpandedColumns((prev) => ({
      ...prev,
      [columnKey(copy.categorias[catIndex].id, ruleIndex, 0)]: true,
      [columnKey(copy.categorias[catIndex].id, ruleIndex, 1)]: true,
      [columnKey(copy.categorias[catIndex].id, ruleIndex, 2)]: true,
    }));
  }

  function disableTable(catIndex: number, ruleIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules[ruleIndex].table = undefined;
    setData(copy);
  }

  function updateColumnTitle(
    catIndex: number,
    ruleIndex: number,
    columnIndex: number,
    value: string
  ) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;
    table.columns[columnIndex].title = value;
    setData(copy);
  }

  function updateColumnItem(
    catIndex: number,
    ruleIndex: number,
    columnIndex: number,
    itemIndex: number,
    value: string
  ) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;
    table.columns[columnIndex].items[itemIndex] = value;
    setData(copy);
  }

  function addColumn(catIndex: number, ruleIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;

    table.columns.push({
      title: `Columna ${table.columns.length + 1}`,
      items: [EMPTY_COLUMN_ITEM],
    });

    const newColumnIndex = table.columns.length - 1;
    setData(copy);
    setExpandedColumns((prev) => ({
      ...prev,
      [columnKey(copy.categorias[catIndex].id, ruleIndex, newColumnIndex)]: true,
    }));
  }

  function removeColumn(catIndex: number, ruleIndex: number, columnIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;

    table.columns.splice(columnIndex, 1);

    if (table.columns.length === 0) {
      copy.categorias[catIndex].rules[ruleIndex].table = undefined;
    }

    setData(copy);
  }

  function addColumnItem(catIndex: number, ruleIndex: number, columnIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;
    table.columns[columnIndex].items.push(EMPTY_COLUMN_ITEM);
    setData(copy);
  }

  function removeColumnItem(
    catIndex: number,
    ruleIndex: number,
    columnIndex: number,
    itemIndex: number
  ) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;

    table.columns[columnIndex].items.splice(itemIndex, 1);

    if (table.columns[columnIndex].items.length === 0) {
      table.columns[columnIndex].items.push(EMPTY_COLUMN_ITEM);
    }

    setData(copy);
  }

  async function save() {
    if (!data) return;

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/admin/normas", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "No se pudo guardar");
      }

      setMessage("Normativas guardadas correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function toggleRule(catId: string, ruleIndex: number) {
    const key = ruleKey(catId, ruleIndex);
    setExpandedRules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function toggleColumn(catId: string, ruleIndex: number, columnIndex: number) {
    const key = columnKey(catId, ruleIndex, columnIndex);
    setExpandedColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 text-white">
        <p>Cargando editor de normativas...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 text-white">
        <p>No se pudieron cargar las normativas.</p>
        {message ? <p className="mt-3 text-red-400">{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Panel de administración
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase">
            Editor de normativas
          </h1>
          <p className="mt-3 text-white/70">
            Crea, organiza y actualiza las categorías visibles para los jugadores.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin" className="btn-secondary">
            ⬅️ Volver
          </Link>
          <button type="button" onClick={save} className="btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "💾 Guardar cambios"}
          </button>
        </div>
      </div>

      {message ? (
        <div className="panel mb-6 p-4 text-sm text-white/80">{message}</div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="panel h-fit p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                Categorías
              </p>
              <h2 className="mt-2 text-2xl font-bold">Secciones</h2>
            </div>

            <button type="button" onClick={addCategory} className="btn-secondary">
              ➕ Añadir
            </button>
          </div>

          <div className="space-y-3">
            {categorias.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                No hay categorías todavía.
              </div>
            ) : (
              categorias.map((category, catIndex) => {
                const isActive = category.id === activeCategory?.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition",
                      isActive
                        ? "border-white/25 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                          Categoría {catIndex + 1}
                        </p>

                        <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/55">
                          {category.rules.length} reglas
                        </span>
                      </div>

                      <h3 className="mt-2 truncate text-lg font-bold">
                        {category.emoji} {category.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-white/60">
                        {stripHtml(category.label)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="space-y-8">
          {activeCategory ? (
            <section className="panel p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                    Editando categoría
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {activeCategory.emoji} {activeCategory.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => removeCategory(activeCategoryIndex)}
                  className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300"
                >
                  🗑️ Eliminar categoría
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm text-white/60">ID</span>
                  <input
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    value={activeCategory.id}
                    onChange={(e) =>
                      updateCategory(activeCategoryIndex, "id", e.target.value)
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-white/60">Emoji</span>
                  <input
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    value={activeCategory.emoji}
                    onChange={(e) =>
                      updateCategory(activeCategoryIndex, "emoji", e.target.value)
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-white/60">Etiqueta corta</span>
                  <input
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    value={activeCategory.label}
                    onChange={(e) =>
                      updateCategory(activeCategoryIndex, "label", e.target.value)
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-white/60">Título principal</span>
                  <input
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    value={activeCategory.title}
                    onChange={(e) =>
                      updateCategory(activeCategoryIndex, "title", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                <span className="text-sm text-white/60">Introducción</span>
                <RichTextEditor
                  value={activeCategory.intro}
                  onChange={(value) =>
                    updateCategory(activeCategoryIndex, "intro", value)
                  }
                  placeholder="Describe esta sección"
                />
              </div>
            </section>
          ) : (
            <section className="panel p-6">
              <p className="text-white/70">Selecciona una categoría para editar.</p>
            </section>
          )}

          {activeCategory ? (
            <section className="panel p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                    Reglas de la categoría
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{activeCategory.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => addRule(activeCategoryIndex)}
                  className="btn-secondary"
                >
                  ➕ Añadir regla
                </button>
              </div>

              <div className="space-y-4">
                {activeCategory.rules.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/60">
                    Esta categoría no tiene reglas todavía.
                  </div>
                ) : (
                  activeCategory.rules.map((rule, ruleIndex) => {
                    const ruleId = ruleKey(activeCategory.id, ruleIndex);
                    const isRuleOpen = expandedRules[ruleId] ?? ruleIndex === 0;

                    return (
                      <div
                        key={ruleId}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                          <button
                            type="button"
                            onClick={() => toggleRule(activeCategory.id, ruleIndex)}
                            className="min-w-0 text-left"
                          >
                            <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                              Regla {ruleIndex + 1}
                            </p>
                            <h4 className="mt-2 truncate text-xl font-bold">
                              {rule.title || `Regla #${ruleIndex + 1}`}
                            </h4>
                          </button>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                              {rule.points.length} puntos
                            </span>

                            {rule.table ? (
                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                                {rule.table.columns.length} columnas
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => toggleRule(activeCategory.id, ruleIndex)}
                              className="btn-secondary"
                            >
                              {isRuleOpen ? "Ocultar" : "Editar"}
                            </button>

                            <button
                              type="button"
                              onClick={() => removeRule(activeCategoryIndex, ruleIndex)}
                              className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>

                        {isRuleOpen ? (
                          <div className="border-t border-white/10 p-5">
                            <div className="mb-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => addPoint(activeCategoryIndex, ruleIndex)}
                                className="btn-secondary"
                              >
                                ➕ Añadir punto
                              </button>

                              {!rule.table ? (
                                <button
                                  type="button"
                                  onClick={() => enableTable(activeCategoryIndex, ruleIndex)}
                                  className="btn-secondary"
                                >
                                  📊 Añadir columnas / rangos
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => addColumn(activeCategoryIndex, ruleIndex)}
                                    className="btn-secondary"
                                  >
                                    ➕ Añadir columna
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => disableTable(activeCategoryIndex, ruleIndex)}
                                    className="btn-secondary"
                                  >
                                    🗑️ Quitar columnas / rangos
                                  </button>
                                </>
                              )}
                            </div>

                            <label className="grid gap-2">
                              <span className="text-sm text-white/60">Título de la regla</span>
                              <input
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                value={rule.title}
                                onChange={(e) =>
                                  updateRuleTitle(
                                    activeCategoryIndex,
                                    ruleIndex,
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <div className="mt-5 space-y-4">
                              {rule.points.map((point, pointIndex) => (
                                <div
                                  key={pointIndex}
                                  className="rounded-2xl border border-white/10 bg-black/10 p-4"
                                >
                                  <div className="mb-3 flex items-center justify-between gap-3">
                                    <span className="text-sm text-white/60">
                                      Punto #{pointIndex + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removePoint(
                                          activeCategoryIndex,
                                          ruleIndex,
                                          pointIndex
                                        )
                                      }
                                      className="rounded-xl border border-red-500/30 px-3 py-1 text-xs text-red-300"
                                    >
                                      Eliminar
                                    </button>
                                  </div>

                                  <RichTextEditor
                                    value={point}
                                    onChange={(value) =>
                                      updatePoint(
                                        activeCategoryIndex,
                                        ruleIndex,
                                        pointIndex,
                                        value
                                      )
                                    }
                                    placeholder="Escribe aquí la norma"
                                  />
                                </div>
                              ))}
                            </div>

                            {rule.table ? (
                              <div className="mt-6 space-y-4">
                                <div className="grid gap-4 xl:grid-cols-3">
                                  {rule.table.columns.map((column, columnIndex) => {
                                    const colId = columnKey(
                                      activeCategory.id,
                                      ruleIndex,
                                      columnIndex
                                    );
                                    const isColumnOpen =
                                      expandedColumns[colId] ?? columnIndex === 0;

                                    return (
                                      <div
                                        key={colId}
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-black/10"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              toggleColumn(
                                                activeCategory.id,
                                                ruleIndex,
                                                columnIndex
                                              )
                                            }
                                            className="min-w-0 text-left"
                                          >
                                            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                                              Columna {columnIndex + 1}
                                            </p>
                                            <h5 className="mt-2 truncate text-lg font-bold">
                                              {column.title || `Columna ${columnIndex + 1}`}
                                            </h5>
                                          </button>

                                          <div className="flex items-center gap-3">
                                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                                              {column.items.length} elementos
                                            </span>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                toggleColumn(
                                                  activeCategory.id,
                                                  ruleIndex,
                                                  columnIndex
                                                )
                                              }
                                              className="btn-secondary"
                                            >
                                              {isColumnOpen ? "Ocultar" : "Editar"}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeColumn(
                                                  activeCategoryIndex,
                                                  ruleIndex,
                                                  columnIndex
                                                )
                                              }
                                              className="rounded-xl border border-red-500/30 px-3 py-1 text-xs text-red-300"
                                            >
                                              Eliminar
                                            </button>
                                          </div>
                                        </div>

                                        {isColumnOpen ? (
                                          <div className="border-t border-white/10 p-4">
                                            <div className="mb-4">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  addColumnItem(
                                                    activeCategoryIndex,
                                                    ruleIndex,
                                                    columnIndex
                                                  )
                                                }
                                                className="btn-secondary"
                                              >
                                                ➕ Añadir elemento
                                              </button>
                                            </div>

                                            <label className="grid gap-2">
                                              <span className="text-sm text-white/60">
                                                Título de columna
                                              </span>
                                              <input
                                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                                value={column.title}
                                                onChange={(e) =>
                                                  updateColumnTitle(
                                                    activeCategoryIndex,
                                                    ruleIndex,
                                                    columnIndex,
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </label>

                                            <div className="mt-4 space-y-4">
                                              {column.items.map((item, itemIndex) => (
                                                <div
                                                  key={itemIndex}
                                                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                                >
                                                  <div className="mb-3 flex items-center justify-between gap-3">
                                                    <span className="text-sm text-white/60">
                                                      Elemento #{itemIndex + 1}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeColumnItem(
                                                          activeCategoryIndex,
                                                          ruleIndex,
                                                          columnIndex,
                                                          itemIndex
                                                        )
                                                      }
                                                      className="rounded-xl border border-red-500/30 px-3 py-1 text-xs text-red-300"
                                                    >
                                                      Eliminar
                                                    </button>
                                                  </div>

                                                  <RichTextEditor
                                                    value={item}
                                                    onChange={(value) =>
                                                      updateColumnItem(
                                                        activeCategoryIndex,
                                                        ruleIndex,
                                                        columnIndex,
                                                        itemIndex,
                                                        value
                                                      )
                                                    }
                                                    placeholder="Escribe aquí el contenido de la columna"
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function ruleKey(categoryId: string, ruleIndex: number) {
  return `${categoryId}-rule-${ruleIndex}`;
}

function columnKey(categoryId: string, ruleIndex: number, columnIndex: number) {
  return `${categoryId}-rule-${ruleIndex}-column-${columnIndex}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}