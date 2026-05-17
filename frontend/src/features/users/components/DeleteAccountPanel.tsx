'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { StatusMessage } from '@/components/common/StatusMessage';
import { clearAccessToken } from '@/services/api-client';
import { ROUTES } from '@/constants/routes';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { userService } from '@/features/users/services/user.service';

export const DeleteAccountPanel = () => {
  const router = useRouter();
  const { error, isSubmitting, run } = useAsyncAction();

  const handleDelete = () => {
    const confirmed = window.confirm('Delete this account? This action marks your account as deleted.');
    if (!confirmed) return;

    void run(async () => {
      await userService.deleteAccount();
      clearAccessToken();
      router.push(ROUTES.register);
    });
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-[#707072]">
        Your account will be marked as deleted and active sessions will be revoked.
      </p>
      <StatusMessage message={error} tone="error" />
      <Button type="button" variant="danger" onClick={handleDelete} disabled={isSubmitting}>
        {isSubmitting ? 'Deleting...' : 'Delete account'}
      </Button>
    </div>
  );
};
