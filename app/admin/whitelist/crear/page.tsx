"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WhitelistCategory } from "@/lib/types";

export default function AdminCrearWhitelistPage() {
  const [categories, setCategories] = useState<WhitelistCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [toggleMessage, setToggleMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState("");

  async function loadCategories() {
    const response = await fetch("/api/whitelist-categories");
    const data = await response.json();

    if (response.ok) {
      setCategories(data.categories ?? []);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/admin/whitelist-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, questions }),
    });

    const data = await response.json();
    setLoading(false);
    setMessage(data.message);

    if (response.ok) {
      setTitle("");
      setDescription("");
      setQuestions("");
      await loadCategories();
    }
  }

  async function handleToggle(categoryId: string, isActive: boolean) {
    setToggleMessage(null);

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

    const data = await response.json();
    setToggleMessage(data.message);

    if (response.ok) {
      await loadCategories();
    }
  }

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Panel secreto</p>
            <h1 className="mt-3 text-4xl font-black uppercase">Crear whitelist</h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Crea categorías nuevas con sus preguntas personalizadas y controla si están abiertas o cerradas.
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleCreate} className="panel panel-highlight space-y-5 p-6 md:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Nueva categoría</p>
              <h2 className="mt-2 text-2xl font-bold">Configurar whitelist</h2>
            </div>

            <input
              className="input"
              placeholder="Ej: Whitelist Staff"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <textarea
              className="textarea"
              placeholder="Descripción breve de esta whitelist"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <div className="space-y-3">
              <p className="text-sm text-white/70">
                Escribe una pregunta por línea. Cada línea será una pregunta para esa categoría.
              </p>
              <textarea
                className="textarea min-h-[220px]"
                placeholder={`Ejemplo:
¿Por qué quieres entrar al staff?
¿Qué harías en un reporte entre jugadores?
¿Cómo actuarías ante abuso de poder?
¿Cuánto tiempo puedes dedicar al servidor?`}
                value={questions}
                onChange={(event) => setQuestions(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="btn-primary" disabled={loading}>
                {loading ? "Creando..." : "➕ Crear whitelist"}
              </button>
              {message ? <p className="text-sm text-white/75">{message}</p> : null}
            </div>
          </form>

          <div className="space-y-5">
            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Control de categorías</p>
              <h2 className="mt-2 text-2xl font-bold">Whitelist creadas</h2>
              <p className="mt-3 text-white/65">
                Desde aquí puedes abrir o cerrar temporalmente cualquier whitelist.
              </p>
            </div>

            {toggleMessage ? (
              <div className="panel p-4 text-sm text-white/75">{toggleMessage}</div>
            ) : null}

            {categories.length === 0 ? (
              <div className="panel p-6 text-white/65">
                Aún no hay categorías creadas.
              </div>
            ) : (
              categories.map((category) => (
                <article key={category.id} className="panel p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      {category.description ? (
                        <p className="mt-2 text-white/65">{category.description}</p>
                      ) : null}
                      <p className="mt-3 text-sm text-white/50">
                        Preguntas: {category.questions?.length ?? 0}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
                          category.is_active
                            ? "border-green-500/20 bg-green-500/10 text-green-300"
                            : "border-red-500/20 bg-red-500/10 text-red-300"
                        }`}
                      >
                        {category.is_active ? "Abierta" : "Cerrada"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggle(category.id, category.is_active)}
                        className="btn-secondary"
                      >
                        {category.is_active ? "🔒 Cerrar WH" : "🔓 Abrir WH"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {(category.questions ?? []).map((question, index) => (
                      <div
                        key={`${category.id}-${question.id}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                      >
                        {index + 1}. {question.label}
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