import { redirect } from "next/navigation";

export default function TiendaPage() {
  redirect(process.env.TEBEX_URL || "https://tu-servidor.tebex.io");
}
