import { Card } from '@/components/ui/Card';

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  /** URL gambar hasil impor dari `@/assets/icons`. */
  icon: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
      {/* Tanpa kotak latar: ikonnya ilustrasi yang sudah berwarna sendiri, dan
          kotak terang di baliknya jadi tambalan putih di mode gelap. */}
      {/* `alt` kosong: labelnya sudah ada di sebelah, ikon cuma hiasan. */}
      {/* Tanpa `dark:`: ramp slate sudah dibalik di `:root.dark` (CLAUDE.md
          §Styling). `dark:text-slate-300` justru memakai warna GELAP di mode
          gelap — labelnya hilang di atas kartu. */}
      <img
        src={icon}
        alt=""
        width={144}
        height={144}
        loading="lazy"
        decoding="async"
        className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
      />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-semibold text-slate-700 sm:whitespace-normal sm:text-sm sm:font-bold"
          title={label}
        >
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 sm:text-2xl">{value}</p>
      </div>
    </Card>
  );
}
