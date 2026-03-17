export function ServerQuickStats() {
  const stats = [

    { label: "Conexión", value: "Estable" }
  ];

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {stats.map((item) => (
        <article
          key={item.label}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            {item.label}
          </p>
          <h3 className="mt-3 text-2xl font-bold">{item.value}</h3>
        </article>
      ))}
    </div>
  );
}