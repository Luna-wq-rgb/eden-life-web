"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { FormEvent, useState } from "react";

export default function WhitelistPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setLoading(false);
    setMessage(data.message);

    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <main>
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%)]" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <div className="mb-10 grid gap-5 md:grid-cols-[1fr_0.72fr] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Whitelist</p>
              <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">Mini whitelist Eden Life</h1>
              <p className="mt-4 max-w-2xl text-white/70">
                Completa este formulario con calma. Cuando lo envíes, recibirás un correo automático y el equipo revisará
                tu solicitud. El resultado se publicará en Discord en menos de 24 horas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <div className="panel p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">📝 Responde con calma</p>
                <p className="mt-2 text-white/68">La coherencia vale más que responder rápido. Queremos ver criterio y rol serio.</p>
              </div>
              <div className="panel p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">📬 Revisión manual</p>
                <p className="mt-2 text-white/68">El equipo revisa cada solicitud sin cambiar el flujo actual del sistema.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="panel panel-highlight space-y-5 p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <input className="input" name="rpName" placeholder="Nombre completo RP" required />
              <input className="input" name="realAge" placeholder="Edad real" required />
              <input className="input" name="characterAge" placeholder="Edad del personaje" required />
              <input className="input" name="email" type="email" placeholder="Correo electrónico" required />
              <input className="input" name="discordId" placeholder="ID de Discord" required />
              <input className="input" name="discordUser" placeholder="Usuario de Discord" required />
            </div>

            <textarea className="textarea" name="experience" placeholder="Cuéntanos tu experiencia en roleplay" required />
            <textarea className="textarea" name="rdm" placeholder="¿Qué es RDM?" required />
            <textarea className="textarea" name="vdm" placeholder="¿Qué es VDM?" required />
            <textarea className="textarea" name="metagaming" placeholder="¿Qué es metagaming?" required />
            <textarea className="textarea" name="powergaming" placeholder="¿Qué es powergaming?" required />
            <textarea className="textarea" name="seriousRoleplay" placeholder="Explica una situación de rol serio" required />

            <input className="hidden" name="website" tabIndex={-1} autoComplete="off" />

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/80">
              <input type="checkbox" name="acceptedRules" required className="mt-1" />
              <span>Confirmo que leí las normativas del servidor y que la información enviada es correcta.</span>
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <button className="btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "📝 Enviar whitelist"}
              </button>
              {message ? <p className="text-sm text-white/75">{message}</p> : null}
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
