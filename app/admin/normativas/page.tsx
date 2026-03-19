"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch("/api/admin/normas", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error al cargar normas");
        setData(json);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  function updateCategory(index: number, field: keyof RuleCategory, value: string) {
    if (!data) return;
    const copy = structuredClone(data);
    (copy.categorias[index][field] as string) = value;
    setData(copy);
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
    copy.categorias.push({
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
    });
    setData(copy);
  }

  function removeCategory(catIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias.splice(catIndex, 1);
    setData(copy);
  }

  function addRule(catIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    copy.categorias[catIndex].rules.push({
      title: "Nueva regla",
      points: [EMPTY_RICH_TEXT],
    });
    setData(copy);
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
    setData(copy);
  }

  function removeColumn(catIndex: number, ruleIndex: number, columnIndex: number) {
    if (!data) return;
    const copy = structuredClone(data);
    const table = copy.categorias[catIndex].rules[ruleIndex].table;
    if (!table) return;
    table.columns.splice(columnIndex, 1);
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
    setData(copy);
  }

  async function save() {
    if (!data) return;

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/admin/normas", {
        method: "POST",
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

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-white">
        <p>Cargando editor de normativas...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-white">
        <p>No se pudieron cargar las normativas.</p>
        {message ? <p className="mt-3 text-red-400">{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 text-white">
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

      <div className="mb-6">
        <button type="button" onClick={addCategory} className="btn-secondary">
          ➕ Añadir categoría
        </button>
      </div>

      <div className="space-y-8">
        {data.categorias.map((category, catIndex) => (
          <section key={category.id} className="panel p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">
                {category.emoji} Categoría #{catIndex + 1}
              </h2>
              <button
                type="button"
                onClick={() => removeCategory(catIndex)}
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
                  value={category.id}
                  onChange={(e) => updateCategory(catIndex, "id", e.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/60">Emoji</span>
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  value={category.emoji}
                  onChange={(e) => updateCategory(catIndex, "emoji", e.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/60">Etiqueta corta</span>
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  value={category.label}
                  onChange={(e) => updateCategory(catIndex, "label", e.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/60">Título principal</span>
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  value={category.title}
                  onChange={(e) => updateCategory(catIndex, "title", e.target.value)}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-2">
              <span className="text-sm text-white/60">Introducción</span>
              <RichTextEditor
                value={category.intro}
                onChange={(value) => updateCategory(catIndex, "intro", value)}
                placeholder="Describe esta sección"
              />
            </div>

            <div className="mt-6 space-y-6">
              {category.rules.map((rule, ruleIndex) => (
                <div
                  key={`${category.id}-${ruleIndex}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <strong className="text-lg">Regla #{ruleIndex + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeRule(catIndex, ruleIndex)}
                      className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300"
                    >
                      🗑️ Eliminar regla
                    </button>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm text-white/60">Título de la regla</span>
                    <input
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                      value={rule.title}
                      onChange={(e) => updateRuleTitle(catIndex, ruleIndex, e.target.value)}
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {!rule.table ? (
                      <button
                        type="button"
                        onClick={() => enableTable(catIndex, ruleIndex)}
                        className="btn-secondary"
                      >
                        📊 Añadir columnas / rangos
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => disableTable(catIndex, ruleIndex)}
                        className="btn-secondary"
                      >
                        🗑️ Quitar columnas / rangos
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    {rule.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-white/60">
                            Punto #{pointIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePoint(catIndex, ruleIndex, pointIndex)}
                            className="rounded-xl border border-red-500/30 px-3 py-1 text-xs text-red-300"
                          >
                            Eliminar punto
                          </button>
                        </div>

                        <RichTextEditor
                          value={point}
                          onChange={(value) =>
                            updatePoint(catIndex, ruleIndex, pointIndex, value)
                          }
                          placeholder="Escribe aquí la norma"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => addPoint(catIndex, ruleIndex)}
                      className="btn-secondary"
                    >
                      ➕ Añadir punto
                    </button>
                  </div>

                  {rule.table ? (
                    <div className="mt-6 space-y-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        {rule.table.columns.map((column, columnIndex) => (
                          <div
                            key={columnIndex}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                          >
                            <div className="mb-4 flex items-center justify-between gap-2">
                              <strong className="text-sm text-white/80">
                                Columna #{columnIndex + 1}
                              </strong>
                              <button
                                type="button"
                                onClick={() => removeColumn(catIndex, ruleIndex, columnIndex)}
                                className="rounded-xl border border-red-500/30 px-3 py-1 text-xs text-red-300"
                              >
                                Eliminar columna
                              </button>
                            </div>

                            <label className="grid gap-2">
                              <span className="text-sm text-white/60">Título de columna</span>
                              <input
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                value={column.title}
                                onChange={(e) =>
                                  updateColumnTitle(
                                    catIndex,
                                    ruleIndex,
                                    columnIndex,
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <div className="mt-4 space-y-4">
                              {column.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="grid gap-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-white/60">
                                      Elemento #{itemIndex + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeColumnItem(
                                          catIndex,
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
                                        catIndex,
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

                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => addColumnItem(catIndex, ruleIndex, columnIndex)}
                                className="btn-secondary"
                              >
                                ➕ Añadir elemento
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addColumn(catIndex, ruleIndex)}
                        className="btn-secondary"
                      >
                        ➕ Añadir columna
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button type="button" onClick={() => addRule(catIndex)} className="btn-secondary">
                ➕ Añadir regla
              </button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}