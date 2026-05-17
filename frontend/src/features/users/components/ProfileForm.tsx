'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusMessage } from '@/components/common/StatusMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { userService } from '@/features/users/services/user.service';

export const ProfileForm = () => {
  const { user, refreshProfile } = useAuth();
  const { error, isSubmitting, message, run } = useAsyncAction();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void run(async () => {
      const name = String(formData.get('name') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const avatar = String(formData.get('avatar') || '').trim();

      await userService.updateProfile({
        ...(name ? { name } : {}),
        phone: phone || null,
        avatar: avatar || null,
      });
      await refreshProfile();
    }, 'Profile updated');
  };

  return (
    <form className="panel-form" onSubmit={handleSubmit}>
      <Input label="Name" name="name" type="text" defaultValue={user?.name || ''} minLength={2} />
      <Input label="Phone" name="phone" type="tel" defaultValue={user?.phone || ''} />
      <Input label="Avatar URL" name="avatar" type="url" defaultValue={user?.avatar || ''} />
      <StatusMessage message={error} tone="error" />
      <StatusMessage message={message} tone="success" />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  );
};
