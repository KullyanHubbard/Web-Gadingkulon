import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { PendudukDetailView as PendudukDetailData } from '../view-model';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

/**
 * Kartu detail lengkap satu penduduk.
 *
 * Menerima data yang sudah diterjemahkan `toPendudukDetail` — tidak ada peta
 * enum maupun perhitungan umur di sini, hanya tata letak.
 */
export function PendudukDetailView({ detail }: { detail: PendudukDetailData }) {
  return (
    <Card>
      <CardHeader
        title={detail.nama}
        action={<Badge tone="brand">{detail.hubungan}</Badge>}
      />
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          {detail.fields.map((f) => (
            <Field key={f.label} label={f.label} value={f.value} />
          ))}
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Alamat
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">
              {detail.alamat}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
