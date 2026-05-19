import { useRouter } from 'next/router';
import { StatusMessage } from '@/components/common/StatusMessage';
import { clearAccessToken } from '@/services/api-client';
import { ROUTES } from '@/routes';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { userService } from '@/features/users/services/user.service';

export const DeleteAccountPanel = () => {
  const router = useRouter();
  const { error, isSubmitting, run } = useAsyncAction();

  const handleDelete = () => {
    const confirmed = window.confirm(
      'Delete this account? This action marks your account as deleted and you will be signed out.'
    );
    if (!confirmed) return;

    void run(async () => {
      await userService.deleteAccount();
      clearAccessToken();
      router.push(ROUTES.register);
    });
  };

  return (
    <section className="bg-white p-10 rounded-xl border border-red-500/20 shadow-sm">
      <div className="mb-10">
        <h2 className="text-headline-md text-red-600">Danger Zone</h2>
        <p className="text-sm text-on-surface-variant font-medium">Deactivating or deleting your account is permanent.</p>
      </div>

      <div className="space-y-6">
        <p className="text-sm leading-6 text-on-surface-variant">
          Once you delete your account, you will be immediately logged out, your active sessions will be revoked, 
          and your personal data will be marked as deactivated. Please proceed with caution.
        </p>

        <StatusMessage message={error} tone="error" />

        <div className="pt-4">
          <button 
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-600 text-white text-label-lg py-4 px-12 rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </section>
  );
};

