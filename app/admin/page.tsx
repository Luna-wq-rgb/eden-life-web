import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isAdminAuthenticated } from "@/lib/auth";

const adminSections = [
  {
    title: "Whitelist",
    description: "Revisa, aprueba o rechaza solicitudes de acceso por categoría.",
    href: "/admin/whitelist",
    icon: "📝"
  },
  {
    title: "Crear whitelist",
    description: "Crea categorías nuevas, agrega preguntas y abre o cierra whitelist.",
    href: "/admin/whitelist/crear",
    icon: "🛠️"
  },
  {
    title: "Normativas",
    description: "Edita reglas, consulta historial y restaura versiones.",
    href: "/admin/normativas",
    icon: "📚"
  },
  {
    title: "Anuncios",
    description: "Publica anuncios del servidor visibles en el inicio.",
    href: "/admin/anuncios",
    icon: "📢"
  },
  {
    title: "Jugadores",
    description: "Consulta estado, aprobación e historial de whitelist.",
    href: "/admin/jugadores",
    icon: "👥"
  },
  {
    title: "Logs",
    description: "Revisa acciones administrativas importantes.",
    href: "/admin/logs",
    icon: "🧾"
  }
];

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Panel secreto</p>
            <h1 className="mt-3 text-4xl font-black uppercase">Panel Admin</h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Gestiona whitelist, categorías, normativas, anuncios, jugadores y logs desde un solo lugar.
            </p>
          </div>

          <Link href="/" className="btn-secondary">
            ⬅️ Volver al inicio
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="panel lift-card rule-hover p-6 transition"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                {section.icon}
              </div>

              <h2 className="mt-5 text-2xl font-bold">{section.title}</h2>
              <p className="mt-3 text-white/65">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}