"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  is_featured?: boolean | null;
  created_at: string;
};

function isValidImageUrl(url: string) {
  if (!url.trim()) return true;

  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function isValidVideoUrl(url: string) {
  if (!url.trim()) return true;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    const isYoutube =
      host.includes("youtube.com") || host.includes("youtu.be");
    const isVimeo = host.includes("vimeo.com");
    const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(parsed.pathname);

    return isYoutube || isVimeo || isDirectVideo;
  } catch {
    return false;
  }
}

function isValidButtonUrl(url: string) {
  if (!url.trim()) return true;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function AdminAnunciosPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAnnouncements() {
    setLoadingList(true);

    try {
      const res = await fetch("/api/anuncios", { cache: "no-store" });
      const data = await res.json();

      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
      }
    } catch {
      setAnnouncements([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function publicar() {
    if (!title.trim() || !content.trim()) {
      alert("Completa el título y el contenido.");
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      alert("La URL de la imagen no es válida.");
      return;
    }

    if (!isValidVideoUrl(videoUrl)) {
      alert("La URL del video no es válida.");
      return;
    }

    if (!isValidButtonUrl(buttonUrl)) {
      alert("La URL del botón no es válida.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/anuncios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
          videoUrl,
          buttonText,
          buttonUrl,
          isFeatured,
          admin: "Admin"
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "No se pudo publicar el anuncio.");
        return;
      }

      setTitle("");
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      setButtonText("");
      setButtonUrl("");
      setIsFeatured(false);

      await loadAnnouncements();
      alert("Anuncio publicado correctamente.");
    } catch {
      alert("Ocurrió un error al publicar el anuncio.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm("¿Seguro que quieres borrar este anuncio?");
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await fetch("/api/anuncios", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "No se pudo borrar el anuncio.");
        return;
      }

      await loadAnnouncements();
    } catch {
      alert("Ocurrió un error al borrar el anuncio.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 md:py-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Panel admin
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase">
            Gestión de anuncios
          </h1>
          <p className="mt-4 max-w-2xl text-white/68">
            Publica, revisa y elimina anuncios del servidor desde un solo lugar.
          </p>
        </div>

        <Link href="/admin" className="btn-secondary">
          ← Volver al panel
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Crear anuncio
          </p>

          <div className="mt-6 space-y-4">
            <input
              className="input"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="textarea min-h-[140px]"
              placeholder="Contenido"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <input
              className="input"
              placeholder="URL de imagen (opcional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <input
              className="input"
              placeholder="URL de video (YouTube, Vimeo o .mp4) (opcional)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />

            <input
              className="input"
              placeholder="Texto del botón (opcional)"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />

            <input
              className="input"
              placeholder="URL del botón (opcional)"
              value={buttonUrl}
              onChange={(e) => setButtonUrl(e.target.value)}
            />

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/75">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Marcar como anuncio destacado
            </label>

            <button
              onClick={publicar}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Publicando..." : "📢 Publicar anuncio"}
            </button>
          </div>
        </section>

        <section className="panel p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                Anuncios actuales
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                Lista de anuncios
              </h2>
            </div>

            <button onClick={loadAnnouncements} className="btn-secondary">
              Recargar
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loadingList ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/65">
                Cargando anuncios...
              </div>
            ) : announcements.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/65">
                No hay anuncios publicados todavía.
              </div>
            ) : (
              announcements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        {item.is_featured ? (
                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
                            Destacado
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-3 text-white/65">{item.content}</p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
                        {item.image_url ? (
                          <span className="rounded-full border border-white/10 px-3 py-1">
                            Imagen
                          </span>
                        ) : null}

                        {item.video_url ? (
                          <span className="rounded-full border border-white/10 px-3 py-1">
                            Video
                          </span>
                        ) : null}

                        {item.button_text && item.button_url ? (
                          <span className="rounded-full border border-white/10 px-3 py-1">
                            Botón
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-4 text-xs text-white/40">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteAnnouncement(item.id)}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "Borrando..." : "Borrar"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}