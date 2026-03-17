const images = [
  "/gallery/city-1.jpg",
  "/gallery/city-2.jpg",
  "/gallery/city-3.jpg",
  "/gallery/city-4.jpg"
];

export function CityGallery() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
      <div className="panel p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">
          Galería
        </p>

        <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
          La ciudad en imágenes
        </h2>

        <p className="mt-4 max-w-2xl text-white/68">
          Un vistazo a la atmósfera, los espacios y la identidad visual de Eden Life.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {images.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-black"
            >
              <img
                src={src}
                alt="Captura de Eden Life"
                className="h-64 w-full object-cover transition duration-500 hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}