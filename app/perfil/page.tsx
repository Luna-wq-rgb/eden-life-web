"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type PerfilLog = {
  id: string;
  status: string;
  changed_by: string;
  changed_at: string;
};

export default function PerfilPage() {
  const [discord, setDiscord] = useState("");
  const [logs, setLogs] = useState<PerfilLog[]>([]);
  const [searched, setSearched] = useState(false);

  const buscar = async () => {
    const res = await fetch(`/api/perfil?discord=${encodeURIComponent(discord)}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setLogs(data);
    } else {
      setLogs([]);
    }

    setSearched(true);
  };

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <div className="panel p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Perfil del jugador
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase">
            Consultar whitelist
          </h1>
          <p className="mt-4 text-white/70">
            Escribe tu Discord ID para ver tu estado, si fuiste aprobado y tu historial.
          </p>

          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            <input
              className="input"
              placeholder="Discord ID"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
            />

            <button className="btn-primary" onClick={buscar}>
              Buscar
            </button>
          </div>

          {searched && (
            <div className="mt-8">
              {logs.length === 0 ? (
                <div className="panel p-6 text-white/65">
                  No se encontró historial para ese Discord ID.
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((item) => (
                    <article key={item.id} className="panel p-5">
                      <h3 className="text-xl font-bold">Estado: {item.status}</h3>
                      <p className="mt-2 text-white/65">Cambiado por: {item.changed_by}</p>
                      <p className="text-white/65">
                        Fecha: {new Date(item.changed_at).toLocaleString("es-CR")}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}