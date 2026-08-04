import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/forms';
import { BackButton } from '@/components/shared';

export default function LoginPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div className="absolute left-4 top-6 sm:left-6">
        <BackButton />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[100px]"
        style={{ background: 'var(--color-primary)' }}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-neutral">Log in to your LogsCity account.</p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-neutral">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
          }
