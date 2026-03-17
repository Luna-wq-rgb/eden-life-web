"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AdminAnunciosPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const publicar = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Completa el título y el contenido.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/anuncios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        content,
        admin: "Admin"
      })
    });

    setLoading(false);

    if (!res.ok) {
      alert("No se pudo publicar el anuncio.");
      return;
    }

    setTitle("");
    setContent("");
    alert("Anuncio publicado correctamente.");
  };

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <div className="panel p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Panel Admin
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase">
            Publicar anuncio
          </h1>
          <p className="mt-4 text-white/70">
            Desde aquí puedes publicar anuncios visibles en la página principal.
          </p>

          <div className="mt-8 space-y-4">
            <input
              className="input"
              placeholder="Título del anuncio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="textarea"
              placeholder="Contenido del anuncio"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button
              onClick={publicar}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Publicando..." : "📢 Publicar anuncio"}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}