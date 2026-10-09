import { AppShell } from './AppShell';
import { getCurrentUser, getBalance } from '@/lib/data';

/** Server wrapper: loads the sidebar balance for the current user, then renders the (unchanged) shell. */
export async function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  const user = await getCurrentUser();
  return <AppShell title={title} balance={await getBalance(user.id)} user={{ name: user.name, image: user.image }}>{children}</AppShell>;
}
