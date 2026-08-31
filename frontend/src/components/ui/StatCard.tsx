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
    <Card className="flex items-center gap-4 p-4">
      {/* Tanpa kotak latar: ikonnya ilustrasi yang sudah berwarna sendiri, dan
          kotak terang di baliknya jadi tambalan putih di mode gelap. */}
      {/* `alt` kosong: labelnya sudah ada di sebelah, ikon cuma hiasan. */}
      <img src={icon} alt="" className="h-12 w-12" />
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
