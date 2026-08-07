'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Input, Button } from '@/components/ui';

const settingsSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  profileId: string;
  initialFullName: string;
}

export function SettingsForm({ profileId, initialFullName }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { fullName: initialFullName },
  });

  async function onSubmit(values: SettingsFormValues) {
    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: values.fullName })
      .eq('id', profileId);

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    toast.success('Profile updated');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        icon="lucide:user"
        placeholder="Full name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-fit">
        Save Changes
      </Button>
    </form>
  );
}
