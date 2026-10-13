import { Frame } from '@/components/layout/Frame';
import { Card, Avatar } from '@/components/ui/primitives';
import { BankDetailsForm } from '@/components/settings/BankDetailsForm';
import { getCurrentUser } from '@/lib/data';

export const dynamic = 'force-dynamic';

const Row = ({ label, value }: { label: string; value: string }) =>
  <div className="flex flex-wrap justify-between gap-1 border-b border-line/40 py-3 last:border-0"><dt className="text-sm text-ink2">{label}</dt><dd className="text-sm font-medium">{value}</dd></div>;

export default async function SettingsPage() {
  const u = await getCurrentUser();
  return (
    <Frame title="Settings">
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4"><Avatar name={u.name} src={u.image ?? undefined} size={56} /><div><p className="text-lg font-semibold">{u.name}</p><p className="text-sm text-ink2">{u.email}</p></div></div>
        <dl className="mt-5"><Row label="Role" value={u.role === 'CLIENT' ? 'Client' : u.role === 'FREELANCER' ? 'Freelancer' : 'Admin'} /><Row label="Member since" value={u.createdAt.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} /></dl>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Payout account</h2>
        {u.role === 'FREELANCER'
          ? <><p className="mt-2 text-sm text-ink2">{u.accountNumber ? `Saved: ${u.bankName ?? u.bankCode}, account ending ${u.accountNumber.slice(-4)}.` : 'Add your Nigerian bank account. You need it before you can accept a project.'}</p>
              <BankDetailsForm initial={{ bankCode: u.bankCode ?? '', accountNumber: u.accountNumber ?? '', accountName: u.accountName ?? '' }} /></>
          : <p className="mt-2 text-sm text-ink2">Clients fund milestones and don’t need a payout account.</p>}
      </Card>
    </Frame>
  );
}
