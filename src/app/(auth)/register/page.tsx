import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/AuthForms';

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" sub="Choose how you’ll use TrustPay."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-soft">Log in</Link></>}>
      <RegisterForm />
    </AuthShell>
  );
}
