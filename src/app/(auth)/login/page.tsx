import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/AuthForms';

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" sub="Log in to manage your projects and milestones."
      footer={<>New to TrustPay? <Link href="/register" className="font-semibold text-soft">Create an account</Link></>}>
      <LoginForm />
    </AuthShell>
  );
}
