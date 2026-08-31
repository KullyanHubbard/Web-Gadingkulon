/** Satu baris `<dt>/<dd>` di dalam kartu keterangan wilayah. */
export function BarisKeterangan({
  label,
  nilai,
}: {
  label: string;
  nilai: string;
}) {
  return (
    <div className="flex items-baseline gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="min-w-[8rem] text-sm text-slate-500">{label}</dt>
      <dd className="flex-1 text-right font-semibold text-slate-900">{nilai}</dd>
    </div>
  );
}
