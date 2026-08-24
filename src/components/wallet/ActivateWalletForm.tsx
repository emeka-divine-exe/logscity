'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input, Button } from '@/components/ui';

const activateSchema = z.object({
  idType: z.enum(['nin', 'bvn']),
  idValue: z.string().regex(/^\d{11}$/, 'Must be exactly 11 digits'),
  phoneNumber: z.string().regex(/^0\d{10}$/, 'Enter a valid Nigerian phone number'),
});

type ActivateFormValues = z.infer<typeof activateSchema>;

export function ActivateWalletForm() {
  const router = useRouter();
  const [idType, setIdType] = useState<'nin' | 'bvn'>('nin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivateFormValues>({
    resolver: zodResolver(activateSchema),
    defaultValues: { idType: 'nin' },
  });

  function selectIdType(type: 'nin' | 'bvn') {
    setIdType(type);
    setValue('idType', type);
  }

  async function onSubmit(values: ActivateFormValues) {
    setIsSubmitting(true);

    const res = await fetch('/api/wallet/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();

    setIsSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? 'Something went wrong');
      return;
    }

    toast.success('Wallet activated');
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <p className="text-sm font-medium text-white">Activate your wallet</p>
      <p className="mt-1 text-sm text-neutral">
        Verify your identity once to get a permanent top-up account. This is a Central Bank of
        Nigeria requirement, not a LogsCity policy.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        <div className="flex gap-2">
          {(['nin', 'bvn'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => selectIdType(type)}
              className={`h-11 flex-1 rounded-2xl border text-sm font-medium transition-colors duration-200 ${
                idType === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/10 text-neutral'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <Input
          icon="lucide:id-card"
          placeholder={`Enter your ${idType.toUpperCase()}`}
          inputMode="numeric"
          maxLength={11}
          error={errors.idValue?.message}
          {...register('idValue')}
        />

        <Input
          icon="lucide:phone"
          placeholder="Phone number (e.g. 0801xxxxxxx)"
          inputMode="numeric"
          maxLength={11}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />

        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Activate wallet
        </Button>

        <p className="text-xs text-neutral">
          Your {idType.toUpperCase()} is sent securely to verify your account and is not stored
          on LogsCity&apos;s servers.
        </p>
      </form>
    </div>
  );
                }
