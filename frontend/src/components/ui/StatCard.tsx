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
          `Card` sudah putih — kotak putih di atas putih cuma markup mati. */}
      {/* `alt` kosong: labelnya sudah ada di sebelah, ikon cuma hiasan. */}
      {/* 44px: ikonnya ilustrasi berdetail, di bawah itu bentuknya luruh. */}
      <img src={icon} alt="" className="h-11 w-11" />
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
