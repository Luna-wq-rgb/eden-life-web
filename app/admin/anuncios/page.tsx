"use client";

import { useState } from "react";

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

export default function AdminAnuncios() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const publicar = async () => {
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

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        alert(error?.error || "No se pudo publicar el anuncio.");
        return;
      }

      setTitle("");
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      setButtonText("");
      setButtonUrl("");
      setIsFeatured(false);

      alert("Anuncio publicado correctamente.");
    } catch {
      alert("Ocurrió un error al publicar el anuncio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel mx-auto mt-20 max-w-3xl p-10">
      <h1 className="mb-3 text-3xl font-bold">Publicar anuncio</h1>
      <p className="mb-8 text-white/65">
        Puedes publicar anuncios con texto, imagen, video, botón y destacarlos.
      </p>

      <div className="space-y-4">
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
          placeholder="URL de la imagen (opcional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          className="input"
          placeholder="URL del video (YouTube, Vimeo o .mp4) (opcional)"
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          <p className="font-medium text-white/75">Ejemplos válidos:</p>

          <p className="mt-3 text-white/60">Imagen:</p>
          <p>https://tusitio.com/banner.jpg</p>

          <p className="mt-3 text-white/60">Video:</p>
          <p>https://www.youtube.com/watch?v=...</p>
          <p>https://youtu.be/...</p>
          <p>https://vimeo.com/...</p>
          <p>https://tusitio.com/video.mp4</p>

          <p className="mt-3 text-white/60">Botón:</p>
          <p>https://discord.gg/...</p>
        </div>

        <button
          onClick={publicar}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Publicando..." : "📢 Publicar anuncio"}
        </button>
      </div>
    </div>
  );
}