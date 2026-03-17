"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discordReady, setDiscordReady] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const discord = searchParams.get("discord");
    const urlError = searchParams.get("error");

    if (discord === "ok") setDiscordReady(true);

    if (urlError === "not_allowed") {
      setError("Tu cuenta de Discord no tiene acceso al panel admin.");
    } else if (urlError === "discord_code") {
      setError("Discord no devolvió el código de acceso.");
    } else if (urlError === "discord_token") {
      setError("No se pudo validar el login con Discord.");
    } else if (urlError === "discord_user") {
      setError("No se pudo leer tu usuario de Discord.");
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "No se pudo iniciar sesión.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-xl px-6 py-14 md:py-20">
        <div className="panel p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Acceso admin
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase">Panel secreto</h1>
          <p className="mt-4 text-white/70">
            Primero inicia sesión con Discord y luego introduce la clave extra.
          </p>

          {!discordReady ? (
            <div className="mt-8">
              <a href="/api/admin/discord/start" className="btn-primary inline-flex">
                💬 Iniciar sesión con Discord
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-green-300">
                Discord verificado correctamente.
              </div>

              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Clave de administrador"
                required
              />

              <button className="btn-primary" disabled={loading}>
                {loading ? "Entrando..." : "🛡️ Entrar"}
              </button>
            </form>
          )}

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}