import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WhitelistApplication } from "@/lib/types";

async function getApplications() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("whitelist_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WhitelistApplication[];
}

function getStatusBadge(status: WhitelistApplication["status"]) {
  if (status === "aprobada") {
    return { emoji: "✅", label: "Aprobada", description: "Solicitud revisada y aceptada" };
  }

  if (status === "rechazada") {
    return { emoji: "❌", label: "Rechazada", description: "Solicitud revisada y no aprobada" };
  }

  return { emoji: "🕓", label: "Pendiente", description: "Esperando revisión del staff" };
}

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  const applications = await getApplications();

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
<div className="flex flex-wrap items-end justify-between gap-4">
  <div>
    <p className="text-xs uppercase tracking-[0.35em] text-white/45">Panel secreto</p>
    <h1 className="mt-3 text-4xl font-black uppercase">Revisión de whitelist</h1>
    <p className="mt-4 text-white/70">Cada solicitud puede aprobarse o rechazarse desde aquí sin alterar el flujo actual.</p>
  </div>

  <div className="flex flex-wrap gap-3">
    <Link href="/admin/normativas" className="btn-secondary">
      📚 Editar normativas
    </Link>
    <Link href="/" className="btn-secondary">
      ⬅️ Volver al inicio
    </Link>
  </div>
</div>

        <div className="mt-10 space-y-6">
          {applications.length === 0 ? (
            <div className="panel p-8 text-white/70">No hay whitelist registradas todavía.</div>
          ) : applications.map((application) => {
            const status = getStatusBadge(application.status);
            const isReviewed = application.status === "aprobada" || application.status === "rechazada";

            return (
              <article
                key={application.id}
                className={`panel relative overflow-hidden p-6 md:p-8 ${isReviewed ? "reviewed-card" : ""}`}
              >
                {isReviewed ? (
                  <div className="pointer-events-none absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-hidden="true" />
                ) : null}

                <div className="relative z-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold">{application.rp_name}</h2>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-white/75">
                          <span>{status.emoji}</span>
                          <span>{status.label}</span>
                        </span>
                      </div>
                      <p className="mt-2 text-white/65">
                        Discord: {application.discord_user} · ID: {application.discord_id}
                      </p>
                      <p className="text-white/65">Correo: {application.email}</p>
                      <p className="text-white/50">Estado actual: {application.status}</p>
                      {application.reviewed_by ? (
                        <p className="text-white/50">Revisado por: {application.reviewed_by}</p>
                      ) : null}
                      {application.reviewed_at ? (
                        <p className="text-white/50">
                          Fecha revisión: {new Date(application.reviewed_at).toLocaleString("es-CR")}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2 text-right text-sm text-white/50">
                      <p>{new Date(application.created_at).toLocaleString("es-CR")}</p>
                      <p>{status.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold">Experiencia RP</h3>
                      <p className="mt-2 text-white/70">{application.experience}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Rol serio</h3>
                      <p className="mt-2 text-white/70">{application.serious_roleplay}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">RDM</h3>
                      <p className="mt-2 text-white/70">{application.rdm}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">VDM</h3>
                      <p className="mt-2 text-white/70">{application.vdm}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Metagaming</h3>
                      <p className="mt-2 text-white/70">{application.metagaming}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Powergaming</h3>
                      <p className="mt-2 text-white/70">{application.powergaming}</p>
                    </div>
                  </div>

                  <form action="/api/admin/review" method="POST" className="mt-8 flex flex-wrap gap-4">
                    <input type="hidden" name="id" value={application.id} />
                    <button type="submit" name="result" value="approved" className="btn-primary">
                      ✅ Aprobaste la WH
                    </button>
                    <button type="submit" name="result" value="rejected" className="btn-secondary">
                      ❌ Reprobaste la WH, vuelve a intentarlo
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}
