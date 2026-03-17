import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WhitelistApplication } from "@/lib/types";

async function getPlayers() {
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

function getStatusClasses(status: WhitelistApplication["status"]) {
  if (status === "aprobada") {
    return "border-green-500/20 bg-green-500/10 text-green-300";
  }

  if (status === "rechazada") {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
}

export default async function AdminJugadoresPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  const players = await getPlayers();

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
              Jugadores y whitelist
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Consulta solicitudes, estado actual, revisiones y datos básicos de
              cada jugador.
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

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="panel p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Total
            </p>
            <h2 className="mt-3 text-3xl font-black">{players.length}</h2>
          </article>

          <article className="panel p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Aprobadas
            </p>
            <h2 className="mt-3 text-3xl font-black">
              {players.filter((p) => p.status === "aprobada").length}
            </h2>
          </article>

          <article className="panel p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Pendientes
            </p>
            <h2 className="mt-3 text-3xl font-black">
              {players.filter((p) => p.status === "pendiente").length}
            </h2>
          </article>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-5 py-4 text-sm font-semibold text-white/70">
                    Nombre RP
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-white/70">
                    Discord
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-white/70">
                    Correo
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-white/70">
                    Estado
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-white/70">
                    Revisado por
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-white/70">
                    Fecha
                  </th>
                </tr>
              </thead>

              <tbody>
                {players.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-white/60"
                    >
                      No hay jugadores o solicitudes registradas todavía.
                    </td>
                  </tr>
                ) : (
                  players.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold">{player.rp_name}</div>
                        <div className="text-sm text-white/50">
                          Edad real: {player.real_age} · Edad PJ:{" "}
                          {player.character_age}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>{player.discord_user}</div>
                        <div className="text-sm text-white/50">
                          {player.discord_id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-white/75">
                        {player.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm ${getStatusClasses(
                            player.status
                          )}`}
                        >
                          {player.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-white/70">
                        {player.reviewed_by || "—"}
                      </td>

                      <td className="px-5 py-4 text-white/60">
                        {new Date(player.created_at).toLocaleString("es-CR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}