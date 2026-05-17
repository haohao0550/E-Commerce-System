import { AuthRedirect } from '@/features/auth/components/AuthRedirect';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthRedirect>
      <main className="page py-12">
        <section className="grid items-start gap-8 lg:grid-cols-[1fr_560px]">
          <div className="bg-[#f5f5f5] p-8">
            <p className="text-sm font-medium text-[#707072]">New member</p>
            <h1 className="mt-4 max-w-xl font-[Impact] text-6xl uppercase leading-[0.9] md:text-8xl">Create your lane</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#707072]">
              Register with email, optional phone, and profile name. Your access token is stored locally for protected backend calls.
            </p>
          </div>
          <div>
            <h1 className="page-title">Create account</h1>
            <p className="page-subtitle">Register a new customer account.</p>
            <RegisterForm />
          </div>
        </section>
      </main>
    </AuthRedirect>
  );
}
