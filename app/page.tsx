import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ServerStatus } from "@/components/ServerStatus";
import { ServerAnnouncements } from "@/components/ServerAnnouncements";
import { ServerQuickStats } from "@/components/ServerQuickStats";
import { FeaturedEvent } from "@/components/FeaturedEvent";
import { CityGallery } from "@/components/CityGallery";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="panel p-8 md:p-10 reveal-up">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Estado del servidor
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Eden Life
            </h2>

            <p className="mt-4 max-w-xl text-white/68">
              Consulta aquí el estado actual del servidor y si se encuentra
              disponible para entrar.
            </p>

            <div className="mt-8">
              <ServerStatus />
            </div>

            <ServerQuickStats />
          </div>

          <div className="panel p-8 md:p-10 reveal-up">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Comunidad
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Lo último de Eden Life
            </h2>

            <p className="mt-4 max-w-2xl text-white/68">
              Mantente al día con los anuncios oficiales del servidor, avances,
              novedades visuales y cambios importantes publicados por el staff.
            </p>

            <div className="mt-8">
              <ServerAnnouncements />
            </div>
          </div>
        </div>
      </section>

      <FeaturedEvent />
      <CityGallery />

      <Footer />
    </main>
  );
}