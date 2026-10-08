import { Frame } from '@/components/layout/Frame';
import { Card } from '@/components/ui/primitives';
import { getCurrentUser, getNotifications } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const items = await getNotifications((await getCurrentUser()).id);
  return (
    <Frame title="Notifications">
      {items.length === 0 ? <Card className="p-8 text-center text-sm text-ink2">You’re all caught up.</Card> : (
        <ul className="space-y-3">{items.map(n => (
          <li key={n.id}><Card className="flex gap-3 p-4 sm:p-5">
            <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.unread ? 'bg-primary' : 'bg-s3'}`} />
            <div className="min-w-0 flex-1"><p className="font-semibold">{n.title}</p><p className="mt-1 text-sm text-ink2">{n.body}</p></div>
            <p className="shrink-0 text-xs text-ink2">{n.date}</p>
          </Card></li>))}</ul>
      )}
    </Frame>
  );
}
