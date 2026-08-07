'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal, Input, Textarea, Checkbox, Button } from '@/components/ui';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  platform: z.string().min(2, 'Platform is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  featured: z.boolean().optional(),
  requires_selection: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingCategory?: {
    id: string;
    name: string;
    platform: string;
    description: string | null;
    price: number;
    featured: boolean;
    requires_selection: boolean;
  } | null;
}

export function CategoryFormModal({ isOpen, onClose, onSaved, editingCategory }: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      featured: false,
      requires_selection: true,
      price: '',
    },
  });

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        platform: editingCategory.platform,
        description: editingCategory.description ?? '',
        price: String(editingCategory.price),
        featured: editingCategory.featured,
        requires_selection: editingCategory.requires_selection,
      });
    } else {
      reset({
        name: '',
        platform: '',
        description: '',
        price: '',
        featured: false,
        requires_selection: true,
      });
    }
  }, [editingCategory, isOpen, reset]);

  async function onSubmit(values: CategoryFormValues) {
    const priceNumber = Number(values.price);

    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('Enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, price: priceNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save category');
        setIsSubmitting(false);
        return;
      }

      toast.success(editingCategory ? 'Category updated' : 'Category created');
      onSaved();
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Category' : 'Add Category'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input placeholder="Name (e.g. Facebook Accounts)" error={errors.name?.message} {...register('name')} />
        <Input placeholder="Platform (e.g. facebook)" error={errors.platform?.message} {...register('platform')} />
        <Textarea placeholder="Description" error={errors.description?.message} {...register('description')} />
        <Input
          type="number"
          placeholder="Price (₦)"
          error={errors.price?.message}
          {...register('price')}
        />

        <Checkbox
          label="Show on homepage (Featured)"
          checked={watch('featured')}
          onChange={(checked) => setValue('featured', checked)}
        />

        <Checkbox
          label="Buyers pick specific accounts (uncheck if they just choose a quantity)"
          checked={watch('requires_selection')}
          onChange={(checked) => setValue('requires_selection', checked)}
        />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
