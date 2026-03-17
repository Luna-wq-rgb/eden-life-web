"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  video_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  is_featured?: boolean | null;
};

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  try {
    const parsed = new URL(url);
    return /\.(mp4|webm|ogg)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function ServerAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/anuncios")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          setAnnouncements(json);
        }
      })
      .catch(() => setAnnouncements([]));
  }, []);

  if (announcements.length === 0) {
    return (
      <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-6 text-white/65">
        Todavía no hay anuncios publicados.
      </div>
    );
  }

  const featured = announcements.find((item) => item.is_featured);
  const regular = announcements.filter((item) => !item.is_featured).slice(0, 4);

  const renderMedia = (item: Announcement) => {
    if (!item.video_url && !item.image_url) return null;

    const youtubeEmbed = item.video_url ? getYoutubeEmbedUrl(item.video_url) : null;
    const vimeoEmbed = item.video_url ? getVimeoEmbedUrl(item.video_url) : null;
    const directVideo =
      item.video_url && isDirectVideo(item.video_url) ? item.video_url : null;

    if (youtubeEmbed) {
      return (
        <div className="border-b border-white/10 bg-black">
          <iframe
            src={youtubeEmbed}
            title={item.title}
            className="h-56 w-full md:h-72"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (vimeoEmbed) {
      return (
        <div className="border-b border-white/10 bg-black">
          <iframe
            src={vimeoEmbed}
            title={item.title}
            className="h-56 w-full md:h-72"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (directVideo) {
      return (
        <div className="border-b border-white/10 bg-black">
          <video
            src={directVideo}
            controls
            className="h-56 w-full object-cover md:h-72"
          />
        </div>
      );
    }

    if (item.image_url) {
      return (
        <div className="border-b border-white/10 bg-black">
          <img
            src={item.image_url}
            alt={item.title}
            className="h-56 w-full object-cover md:h-72"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      {featured && (
        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]">
          {renderMedia(featured)}

          <div className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Destacado
            </p>

            <h3 className="mt-3 text-3xl font-black md:text-4xl">
              {featured.title}
            </h3>

            <p className="mt-4 max-w-3xl text-white/68">
              {featured.content}
            </p>

            {featured.button_text && featured.button_url && (
              <div className="mt-6">
                <Link
                  href={featured.button_url}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  {featured.button_text}
                </Link>
              </div>
            )}
          </div>
        </article>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {regular.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            {renderMedia(item)}

            <div className="p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                Anuncio
              </p>

              <h3 className="mt-3 text-2xl font-bold">{item.title}</h3>

              <p className="mt-3 text-white/65">{item.content}</p>

              {item.button_text && item.button_url && (
                <div className="mt-5">
                  <Link
                    href={item.button_url}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                  >
                    {item.button_text}
                  </Link>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}