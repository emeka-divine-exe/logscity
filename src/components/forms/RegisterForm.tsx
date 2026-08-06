'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Input, Button } from '@/components/ui';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    setAuthError(null);
    setEmailExists(false);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    // Supabase silently succeeds on duplicate email when confirmation is disabled
    // but returns a user with an identities array that's empty
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setEmailExists(true);
      return;
    }

    toast.success('Account created successfully');
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        icon="lucide:user"
        placeholder="Full name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        icon="lucide:mail"
        type="email"
        placeholder="Email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        icon="lucide:lock"
        type="password"
        placeholder="Password"
        error={errors.password?.message}
        {...register('password')}
      />

      {emailExists && (
        <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          An account with this email already exists.{' '}
          <Link href="/login" className="underline">
            Log in instead
          </Link>
        </p>
      )}

      {authError && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {authError}
        </p>
      )}

      <Button type="submit" variant="primary" isLoading={isSubmitting} className="mt-2">
        Create account
      </Button>
    </form>
  );
      }
