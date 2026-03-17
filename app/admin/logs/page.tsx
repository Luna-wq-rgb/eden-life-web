import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WhitelistApplication } from "@/lib/types";

async function getLogs() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("whitelist_applications")
    .select("*")
    .not("reviewed_at", "is", null)
    .order("reviewed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as WhitelistApplication[];
}

function getActionText(status: WhitelistApplication["status"]) {
  if (status === "aprobada") return "Whitelist aprobada";
  if (status === "rechazada") return "Whitelist rechazada";
  return "Acción registrada";
}

export default async function AdminLogsPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  const logs = await getLogs();

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Panel secreto
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase">
              Logs administrativos
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Historial reciente de revisiones realizadas desde el panel admin.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/whitelist" className="btn-secondary">
              📝 Revisar whitelist
            </Link>
            <Link href="/admin" className="btn-secondary">
              ⬅️ Volver al panel
            </Link>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {logs.length === 0 ? (
            <div className="panel p-8 text-white/65">
              Aún no hay logs registrados.
            </div>
          ) : (
            logs.map((log) => (
              <article key={log.id} className="panel p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Registro
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {getActionText(log.status)}
                    </h2>
                    <p className="mt-3 text-white/70">
                      Jugador: <span className="font-semibold">{log.rp_name}</span>
                    </p>
                    <p className="text-white/60">
                      Discord: {log.discord_user} · {log.discord_id}
                    </p>
                    <p className="text-white/60">
                      Revisado por: {log.reviewed_by || "—"}
                    </p>
                  </div>

                  <div className="text-right text-sm text-white/50">
                    <p>
                      {log.reviewed_at
                        ? new Date(log.reviewed_at).toLocaleString("es-CR")
                        : "—"}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}