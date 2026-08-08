'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Modal, Input, Button } from '@/components/ui';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: { id: string; name: string }[];
}

const NEW_CATEGORY_VALUE = '__new__';

interface FormValues {
  category_id: string;
  profile_url: string;
  username: string;
  email: string;
  password: string;
  two_fa_key: string;
  gmail_password: string;
  newCategoryName: string;
  newCategoryPlatform: string;
  newCategoryPrice: string;
}

export function AddAccountModal({ isOpen, onClose, onSaved, categories }: AddAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { category_id: categories[0]?.id ?? '' },
  });

  const selectedCategory = watch('category_id');
  const isCreatingNewCategory = selectedCategory === NEW_CATEGORY_VALUE;

  async function onSubmit(values: FormValues) {
    if (!values.category_id) {
      toast.error('Choose a category');
      return;
    }

    if (isCreatingNewCategory && (!values.newCategoryName || !values.newCategoryPlatform || !values.newCategoryPrice)) {
      toast.error('Fill in the new category name, platform, and price');
      return;
    }

    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      profile_url: values.profile_url,
      username: values.username,
      email: values.email,
      password: values.password,
      two_fa_key: values.two_fa_key,
      gmail_password: values.gmail_password,
    };

    if (isCreatingNewCategory) {
      payload.newCategory = {
        name: values.newCategoryName,
        platform: values.newCategoryPlatform,
        price: Number(values.newCategoryPrice),
      };
    } else {
      payload.category_id = values.category_id;
    }

    const res = await fetch('/api/admin/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setIsSubmitting(false);

    if (!res.ok) {
      toast.error(data.error || 'Failed to add account');
      return;
    }

    toast.success('Account added');
    reset();
    onSaved();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Account" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs text-neutral">Category</label>
          <select
            {...register('category_id')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value={NEW_CATEGORY_VALUE}>+ Add New Category</option>
          </select>
        </div>

        {isCreatingNewCategory && (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <Input icon="lucide:tag" placeholder="New category name" {...register('newCategoryName')} />
            <Input icon="lucide:globe" placeholder="Platform (e.g. facebook)" {...register('newCategoryPlatform')} />
            <Input icon="lucide:banknote" type="number" placeholder="Price (₦)" {...register('newCategoryPrice')} />
          </div>
        )}

        <Input icon="lucide:link" placeholder="Profile URL (optional)" {...register('profile_url')} />
        <Input icon="lucide:user" placeholder="Username (optional)" {...register('username')} />
        <Input icon="lucide:mail" placeholder="Email (optional)" {...register('email')} />
        <Input icon="lucide:lock" placeholder="Password (optional)" {...register('password')} />
        <Input icon="lucide:shield" placeholder="2FA Key (optional)" {...register('two_fa_key')} />
        <Input icon="lucide:mail" placeholder="Gmail Password (optional)" {...register('gmail_password')} />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
