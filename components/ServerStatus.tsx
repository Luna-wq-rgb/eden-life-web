"use client";

import { useEffect, useState } from "react";

type ServerStatusData = {
  online: boolean;
  players: number;
  max: number;
  message?: string;
};

export function ServerStatus() {
  const [data, setData] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/server-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() =>
        setData({
          online: false,
          players: 0,
          max: 0,
          message: "No se pudo obtener el estado del servidor.",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const title = loading
    ? "🟡 Comprobando servidor..."
    : data?.online
    ? "🟢 Eden Life Online"
    : "🔴 Eden Life Offline";

  const description = loading
    ? "Consultando estado del servidor..."
    : data?.online
    ? `👥 ${data.players} / ${data.max} jugadores`
    : data?.message || "Servidor no disponible";

  return (
    <article className="panel lift-card p-6 reveal-up">
      <p className="text-xs uppercase tracking-[0.35em] text-white/40">
        Estado del servidor
      </p>

      <h3 className="mt-2 text-2xl font-bold">{title}</h3>

      <p className="mt-3 text-white/65">{description}</p>
    </article>
  );
}