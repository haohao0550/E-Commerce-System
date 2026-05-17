import { AuthRedirect } from '@/features/auth/components/AuthRedirect';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthRedirect>
      <main className="page py-12">
        <section className="grid items-start gap-8 lg:grid-cols-[1fr_560px]">
          <div className="bg-[#111111] p-8 text-white">
            <p className="text-sm font-medium text-[#9e9ea0]">Member access</p>
            <h1 className="mt-4 max-w-xl font-[Impact] text-6xl uppercase leading-[0.9] md:text-8xl">Move with your account</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#e5e5e5]">
              Sign in to manage your profile, password, deleted account state, and administrator controls when your role allows it.
            </p>
          </div>
          <div>
            <h1 className="page-title">Sign in</h1>
            <p className="page-subtitle">Use an existing account from the backend.</p>
            <LoginForm />
          </div>
        </section>
      </main>
    </AuthRedirect>
  );
}
