'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusMessage } from '@/components/common/StatusMessage';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { userService } from '@/features/users/services/user.service';

export const ChangePasswordForm = () => {
  const { error, isSubmitting, message, run } = useAsyncAction();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    void run(async () => {
      await userService.changePassword({
        oldPassword: String(formData.get('oldPassword')),
        newPassword: String(formData.get('newPassword')),
      });
      form.reset();
    }, 'Password changed. Please sign in again if your session expires.');
  };

  return (
    <form className="panel-form" onSubmit={handleSubmit}>
      <Input label="Old password" name="oldPassword" type="password" required minLength={6} />
      <Input label="New password" name="newPassword" type="password" required minLength={6} />
      <StatusMessage message={error} tone="error" />
      <StatusMessage message={message} tone="success" />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Changing...' : 'Change password'}
      </Button>
    </form>
  );
};
