import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WhitelistApplication, WhitelistCategory } from "@/lib/types";

type CategoryWithApplications = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  applications: WhitelistApplication[];
};

async function getCategoriesAndApplications() {
  const supabase = getSupabaseAdmin();

  const [
    { data: categories, error: categoriesError },
    { data: applications, error: applicationsError },
  ] = await Promise.all([
    supabase.from("whitelist_categories").select("*").order("created_at", { ascending: true }),
    supabase.from("whitelist_applications").select("*").order("created_at", { ascending: false }),
  ]);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (applicationsError) {
    throw new Error(applicationsError.message);
  }

  const safeCategories = (categories ?? []) as WhitelistCategory[];
  const safeApplications = (applications ?? []) as WhitelistApplication[];

  const grouped: CategoryWithApplications[] = safeCategories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    is_active: category.is_active,
    applications: safeApplications.filter((application) => application.category_id === category.id),
  }));

  const legacyApplications = safeApplications.filter((application) => !application.category_id);

  if (legacyApplications.length > 0) {
    grouped.push({
      id: "legacy",
      title: "Solicitudes antiguas",
      description: "Whitelist enviadas antes del sistema por categorías.",
      is_active: true,
      applications: legacyApplications,
    });
  }

  return grouped;
}

function getStatusBadge(status: WhitelistApplication["status"]) {
  if (status === "aprobada") {
    return { emoji: "✅", label: "Aprobada", className: "premium-chip premium-chip--success" };
  }

  if (status === "rechazada") {
    return { emoji: "❌", label: "Rechazada", className: "premium-chip premium-chip--danger" };
  }

  return { emoji: "🕓", label: "Pendiente", className: "premium-chip premium-chip--soft" };
}

function renderAnswers(application: WhitelistApplication) {
  if (application.answers && application.answers.length > 0) {
    return application.answers.map((item, index) => (
      <div
        key={`${application.id}-answer-${index}`}
        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Pregunta {index + 1}
        </p>
        <h3 className="mt-2 font-semibold text-white/90">{item.question}</h3>
        <p className="mt-3 whitespace-pre-wrap text-white/70">{item.answer}</p>
      </div>
    ));
  }

  return (
    <>
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-semibold">Experiencia RP</h3>
        <p className="mt-2 whitespace-pre-wrap text-white/70">{application.experience}</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-semibold">Rol serio</h3>
        <p className="mt-2 whitespace-pre-wrap text-white/70">{application.serious_roleplay}</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-semibold">RDM</h3>
        <p className="mt-2 whitespace-pre-wrap text-white/70">{application.rdm}</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-semibold">VDM</h3>
        <p className="mt-2 whitespace-pre-wrap text-white/70">{application.vdm}</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-semibold">Metagaming</h3>
        <p className="mt-2 whitespace-pre-wrap text-white/70">{application.metagaming}</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-semibold">Powergaming</h3>
        <p className="mt-2 whitespace-pre-wrap text-white/70">{application.powergaming}</p>
      </div>
    </>
  );
}

export default async function AdminWhitelistPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  const categories = await getCategoriesAndApplications();

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Panel secreto
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Revisión de whitelist
            </h1>
            <p className="mt-4 max-w-3xl text-white/70">
              Revisa solicitudes separadas por categoría, con todas las respuestas
              visibles y un panel más limpio, premium y ordenado.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/whitelist/crear" className="btn-primary">
              ➕ Crear whitelist
            </Link>
            <Link href="/admin" className="btn-secondary">
              ⬅️ Volver al panel
            </Link>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {categories.length === 0 ? (
            <div className="panel p-8 text-white/70">
              No hay categorías de whitelist creadas todavía.
            </div>
          ) : (
            categories.map((category) => (
              <section key={category.id} className="space-y-6">
                <div className="panel premium-card p-6 md:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                        Categoría
                      </p>
                      <h2 className="mt-2 text-3xl font-black uppercase">
                        {category.title}
                      </h2>
                      {category.description ? (
                        <p className="mt-3 text-white/65">{category.description}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="premium-chip premium-chip--soft">
                        {category.applications.length} solicitudes
                      </span>
                      <span
                        className={`premium-chip ${
                          category.is_active
                            ? "premium-chip--success"
                            : "premium-chip--danger"
                        }`}
                      >
                        {category.is_active ? "Activa" : "Cerrada"}
                      </span>
                    </div>
                  </div>
                </div>

                {category.applications.length === 0 ? (
                  <div className="panel p-8 text-white/60">
                    No hay solicitudes en esta categoría todavía.
                  </div>
                ) : (
                  category.applications.map((application) => {
                    const badge = getStatusBadge(application.status);
                    const isReviewed = application.status !== "pendiente";

                    return (
                      <article
                        key={application.id}
                        className={`panel premium-card relative overflow-hidden p-6 md:p-8 ${
                          isReviewed ? "reviewed-card" : ""
                        }`}
                      >
                        {isReviewed ? (
                          <div
                            className="pointer-events-none absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                            aria-hidden="true"
                          />
                        ) : null}

                        <div className="relative z-10">
                          <div className="flex flex-wrap items-start justify-between gap-5">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-2xl font-bold">{application.rp_name}</h3>
                                <span className={badge.className}>
                                  {badge.emoji} {badge.label}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-2 text-white/65 md:grid-cols-2">
                                <p>Discord: {application.discord_user}</p>
                                <p>ID Discord: {application.discord_id}</p>
                                <p>Correo: {application.email}</p>
                                <p>Categoría: {application.category_name || category.title}</p>
                                <p>Edad real: {application.real_age}</p>
                                <p>Edad personaje: {application.character_age}</p>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="premium-chip premium-chip--soft">
                                  Estado: {application.status}
                                </span>

                                {application.reviewed_by ? (
                                  <span className="premium-chip premium-chip--soft">
                                    Revisado por: {application.reviewed_by}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="text-right text-sm text-white/50">
                              <p>{new Date(application.created_at).toLocaleString("es-CR")}</p>
                              {application.reviewed_at ? (
                                <p className="mt-2">
                                  Revisión: {new Date(application.reviewed_at).toLocaleString("es-CR")}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-7 grid gap-5 md:grid-cols-2">
                            {renderAnswers(application)}
                          </div>

                          <form
                            action="/api/admin/review"
                            method="POST"
                            className="mt-8 flex flex-wrap gap-4"
                          >
                            <input type="hidden" name="id" value={application.id} />

                            <button
                              type="submit"
                              name="result"
                              value="approved"
                              className="btn-primary"
                              disabled={isReviewed}
                            >
                              ✅ Aprobar whitelist
                            </button>

                            <button
                              type="submit"
                              name="result"
                              value="rejected"
                              className="btn-secondary"
                              disabled={isReviewed}
                            >
                              ❌ Reprobar whitelist
                            </button>

                            {isReviewed ? (
                              <p className="self-center text-sm text-white/60">
                                Esta solicitud ya fue revisada y no puede volver a cambiarse.
                              </p>
                            ) : null}
                          </form>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>
            ))
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}