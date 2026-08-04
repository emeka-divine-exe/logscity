'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Input, Button } from '@/components/ui';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Welcome back');
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="mt-2">
        Log in
      </Button>
    </form>
  );
}
