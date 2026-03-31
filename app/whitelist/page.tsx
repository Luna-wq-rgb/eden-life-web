"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { WhitelistCategory } from "@/lib/types";

type AnswerState = Record<string, string>;

export default function WhitelistPage() {
  const [categories, setCategories] = useState<WhitelistCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch("/api/whitelist-categories");
      const data = await response.json();

      if (response.ok) {
        const loadedCategories = data.categories ?? [];
        setCategories(loadedCategories);

        if (loadedCategories.length > 0) {
          setSelectedCategoryId(loadedCategories[0].id);
        }
      }

      setLoadingCategories(false);
    }

    loadCategories();
  }, []);

  function handleAnswerChange(questionLabel: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionLabel]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory) {
      setMessage("Debes seleccionar una categoría.");
      return;
    }

    if (!selectedCategory.is_active) {
      setMessage("Esta whitelist está temporalmente inactiva.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const dynamicAnswers = (selectedCategory.questions ?? []).map((question) => ({
      question: question.label,
      answer: answers[question.label] ?? "",
    }));

    const response = await fetch("/api/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        categoryId: selectedCategory.id,
        acceptedRules: formData.get("acceptedRules") === "on",
        answers: dynamicAnswers,
      }),
    });

    const data = await response.json();
    setLoading(false);
    setMessage(data.message);

    if (response.ok) {
      event.currentTarget.reset();
      setAnswers({});
    }
  }

  return (
    <main>
      <Navbar />
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%)]"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <div className="mb-10 grid gap-5 md:grid-cols-[1fr_0.72fr] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Whitelist</p>
              <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
                Whitelist Eden Life
              </h1>
              <p className="mt-4 max-w-2xl text-white/70">
                Selecciona una categoría y completa el formulario con calma. Cada categoría tiene sus propias preguntas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <div className="panel p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">📝 Responde con calma</p>
                <p className="mt-2 text-white/68">
                  La coherencia vale más que responder rápido. Queremos ver criterio y rol serio.
                </p>
              </div>
              <div className="panel p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">📬 Revisión manual</p>
                <p className="mt-2 text-white/68">
                  El equipo revisa cada solicitud dentro de la categoría correspondiente.
                </p>
              </div>
            </div>
          </div>

          {loadingCategories ? (
            <div className="panel p-8 text-white/70">Cargando categorías...</div>
          ) : categories.length === 0 ? (
            <div className="panel p-8 text-white/70">
              No hay whitelist disponibles en este momento.
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
                  const isSelected = category.id === selectedCategoryId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setMessage(null);
                      }}
                      className={`panel relative overflow-hidden p-6 text-left transition ${
                        isSelected ? "border-white/30 bg-white/[0.07]" : ""
                      }`}
                    >
                      {!category.is_active ? (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-[3px]">
                          <span className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm font-semibold text-white">
                            Temporalmente inactivo
                          </span>
                        </div>
                      ) : null}

                      <div className={!category.is_active ? "blur-sm" : ""}>
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-2xl font-bold">{category.title}</h2>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              category.is_active
                                ? "border-green-500/20 bg-green-500/10 text-green-300"
                                : "border-red-500/20 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {category.is_active ? "Abierta" : "Cerrada"}
                          </span>
                        </div>

                        {category.description ? (
                          <p className="mt-3 text-white/65">{category.description}</p>
                        ) : null}

                        <p className="mt-4 text-sm text-white/50">
                          Preguntas personalizadas: {category.questions?.length ?? 0}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCategory ? (
                <form onSubmit={handleSubmit} className="panel panel-highlight space-y-5 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45">Categoría seleccionada</p>
                      <h2 className="mt-2 text-3xl font-black uppercase">{selectedCategory.title}</h2>
                      {selectedCategory.description ? (
                        <p className="mt-3 max-w-3xl text-white/65">{selectedCategory.description}</p>
                      ) : null}
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                        selectedCategory.is_active
                          ? "border-green-500/20 bg-green-500/10 text-green-300"
                          : "border-red-500/20 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {selectedCategory.is_active ? "Disponible" : "Temporalmente inactiva"}
                    </span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <input className="input" name="rpName" placeholder="Nombre completo RP" required />
                    <input className="input" name="realAge" placeholder="Edad real" required />
                    <input className="input" name="characterAge" placeholder="Edad del personaje" required />
                    <input className="input" name="email" type="email" placeholder="Correo electrónico" required />
                    <input className="input" name="discordId" placeholder="ID de Discord" required />
                    <input className="input" name="discordUser" placeholder="Usuario de Discord" required />
                  </div>

                  <textarea
                    className="textarea"
                    name="experience"
                    placeholder="Cuéntanos tu experiencia en roleplay"
                    required
                  />
                  <textarea className="textarea" name="rdm" placeholder="¿Qué es RDM?" required />
                  <textarea className="textarea" name="vdm" placeholder="¿Qué es VDM?" required />
                  <textarea className="textarea" name="metagaming" placeholder="¿Qué es metagaming?" required />
                  <textarea className="textarea" name="powergaming" placeholder="¿Qué es powergaming?" required />
                  <textarea
                    className="textarea"
                    name="seriousRoleplay"
                    placeholder="Explica una situación de rol serio"
                    required
                  />

                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Preguntas de esta categoría
                    </p>

                    {(selectedCategory.questions ?? []).map((question) => (
                      <textarea
                        key={question.id}
                        className="textarea"
                        placeholder={question.placeholder || question.label}
                        value={answers[question.label] ?? ""}
                        onChange={(event) => handleAnswerChange(question.label, event.target.value)}
                        required={question.required ?? true}
                        disabled={!selectedCategory.is_active}
                      />
                    ))}
                  </div>

                  <input className="hidden" name="website" tabIndex={-1} autoComplete="off" />

                  <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/80">
                    <input type="checkbox" name="acceptedRules" required className="mt-1" />
                    <span>Confirmo que leí las normativas del servidor y que la información enviada es correcta.</span>
                  </label>

                  {!selectedCategory.is_active ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
                      Esta categoría está temporalmente inactiva. No puedes enviarla hasta que vuelva a abrirse.
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-4">
                    <button className="btn-primary" disabled={loading || !selectedCategory.is_active}>
                      {loading ? "Enviando..." : "📝 Enviar whitelist"}
                    </button>
                    {message ? <p className="text-sm text-white/75">{message}</p> : null}
                  </div>
                </form>
              ) : null}
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}