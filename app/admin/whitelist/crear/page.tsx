"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WhitelistCategory } from "@/lib/types";

type DraftQuestion = {
  id: string;
  label: string;
};

function makeQuestion(id?: string): DraftQuestion {
  return {
    id: id || crypto.randomUUID(),
    label: "",
  };
}

async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: "El servidor devolvió un JSON inválido." };
    }
  }

  if (response.status === 404) {
    return { message: "La ruta API no existe o no fue desplegada todavía." };
  }

  if (response.status === 401) {
    return { message: "Tu sesión de admin expiró o ya no tienes permisos." };
  }

  if (response.status === 500) {
    return { message: "El servidor devolvió un error interno." };
  }

  return {
    message: "El servidor devolvió una respuesta no válida.",
  };
}

export default function AdminCrearWhitelistPage() {
  const [categories, setCategories] = useState<WhitelistCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    makeQuestion("q1"),
    makeQuestion("q2"),
  ]);

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [toggleMessage, setToggleMessage] = useState<string | null>(null);

  async function loadCategories() {
    setLoadingCategories(true);
    setToggleMessage(null);

    try {
      const response = await fetch("/api/whitelist-categories", {
        cache: "no-store",
      });

      const data = await safeJson(response);

      if (!response.ok) {
        setToggleMessage(data.message || "No se pudieron cargar las categorías.");
        setCategories([]);
        return;
      }

      setCategories(data.categories ?? []);
    } catch {
      setToggleMessage("No se pudieron cargar las categorías.");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const cleanedQuestions = useMemo(
    () =>
      questions
        .map((question) => ({
          ...question,
          label: question.label.trim(),
        }))
        .filter((question) => question.label.length > 0),
    [questions]
  );

  function updateQuestion(id: string, value: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, label: value } : question
      )
    );
  }

  function addQuestion() {
    setQuestions((current) => [...current, makeQuestion()]);
  }

  function removeQuestion(id: string) {
    setQuestions((current) => {
      if (current.length <= 1) return current;
      return current.filter((question) => question.id !== id);
    });
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Debes escribir el nombre de la whitelist.");
      return;
    }

    if (cleanedQuestions.length === 0) {
      setMessage("Debes agregar al menos una pregunta.");
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/whitelist-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          questions: cleanedQuestions,
        }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        setMessage(data.message || "No se pudo crear la whitelist.");
        return;
      }

      setMessage(data.message || "Whitelist creada correctamente.");
      setTitle("");
      setDescription("");
      setQuestions([makeQuestion("q1"), makeQuestion("q2")]);
      await loadCategories();
    } catch {
      setMessage("Ocurrió un error al crear la whitelist.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(categoryId: string, isActive: boolean) {
    setToggleMessage(null);

    try {
      const response = await fetch("/api/admin/whitelist-categories/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
          isActive: !isActive,
        }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        setToggleMessage(data.message || "No se pudo actualizar la whitelist.");
        return;
      }

      setToggleMessage(data.message || "Estado actualizado.");
      await loadCategories();
    } catch {
      setToggleMessage("Ocurrió un error al actualizar la whitelist.");
    }
  }

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Panel secreto
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Crear whitelist
            </h1>
            <p className="mt-4 max-w-3xl text-white/70">
              Crea categorías nuevas con un constructor de preguntas más premium,
              limpio y ordenado. También puedes abrir o cerrar cada whitelist
              temporalmente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/whitelist" className="btn-secondary">
              📝 Ir a revisión
            </Link>
            <Link href="/admin" className="btn-secondary">
              ⬅️ Volver al panel
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleCreate}
            className="panel panel-highlight premium-card p-6 md:p-8"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                  Nueva categoría
                </p>
                <h2 className="mt-2 text-3xl font-black">Configurar whitelist</h2>
                <p className="mt-3 text-white/65">
                  Rellena la información principal y luego agrega las preguntas una
                  por una.
                </p>
              </div>

              <div className="premium-chip">
                {cleanedQuestions.length} pregunta{cleanedQuestions.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  Nombre de la whitelist
                </label>
                <input
                  className="input"
                  placeholder="Ej: Whitelist Staff"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  Descripción
                </label>
                <textarea
                  className="textarea"
                  placeholder="Ej: Formulario para postulaciones al equipo staff."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Constructor de preguntas
                    </p>
                    <h3 className="mt-2 text-xl font-bold">Preguntas personalizadas</h3>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn-primary"
                  >
                    ➕ Agregar pregunta
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-[24px] border border-white/10 bg-black/30 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="premium-chip premium-chip--soft">
                          Pregunta {index + 1}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="btn-secondary"
                          disabled={questions.length <= 1}
                        >
                          🗑️ Quitar
                        </button>
                      </div>

                      <textarea
                        className="textarea min-h-[110px]"
                        placeholder={`Escribe aquí la pregunta ${index + 1}`}
                        value={question.label}
                        onChange={(event) =>
                          updateQuestion(question.id, event.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button className="btn-primary" disabled={creating}>
                  {creating ? "Creando..." : "🚀 Crear whitelist"}
                </button>

                {message ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                    {message}
                  </div>
                ) : null}
              </div>
            </div>
          </form>

          <div className="space-y-5">
            <div className="panel premium-card p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                Control de categorías
              </p>
              <h2 className="mt-2 text-3xl font-black">Whitelist creadas</h2>
              <p className="mt-3 text-white/65">
                Desde aquí puedes abrir o cerrar temporalmente cualquier whitelist
                sin borrar su configuración.
              </p>
            </div>

            {toggleMessage ? (
              <div className="panel p-4 text-sm text-white/75">{toggleMessage}</div>
            ) : null}

            {loadingCategories ? (
              <div className="panel p-6 text-white/65">Cargando categorías...</div>
            ) : categories.length === 0 ? (
              <div className="panel p-6 text-white/65">
                Aún no hay categorías creadas.
              </div>
            ) : (
              categories.map((category) => (
                <article key={category.id} className="panel premium-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">{category.title}</h3>
                      {category.description ? (
                        <p className="mt-2 text-white/65">{category.description}</p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="premium-chip premium-chip--soft">
                          {(category.questions ?? []).length} preguntas
                        </span>
                        <span
                          className={`premium-chip ${
                            category.is_active
                              ? "premium-chip--success"
                              : "premium-chip--danger"
                          }`}
                        >
                          {category.is_active ? "Abierta" : "Cerrada"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(category.id, category.is_active)}
                      className="btn-secondary"
                    >
                      {category.is_active ? "🔒 Cerrar WH" : "🔓 Abrir WH"}
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(category.questions ?? []).map((question, index) => (
                      <div
                        key={`${category.id}-${question.id}-${index}`}
                        className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
                      >
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Pregunta {index + 1}
                        </p>
                        <p className="mt-2 text-white/80">{question.label}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}