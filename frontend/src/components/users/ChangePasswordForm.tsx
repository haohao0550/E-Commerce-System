import { FormEvent } from 'react';
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
    }, 'Password updated successfully.');
  };

  return (
    <section className="bg-white p-10 rounded-xl border border-outline-variant/20 shadow-sm">
      <div className="mb-10">
        <h2 className="text-headline-md text-primary">Security & Password</h2>
        <p className="text-sm text-on-surface-variant font-medium">Update your password to keep your account secure.</p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-label-lg text-primary">Old Password</label>
          <input 
            type="password" 
            name="oldPassword"
            required
            minLength={6}
            className="bg-surface-container-low border-b-2 border-primary focus:ring-0 focus:bg-white transition-all py-3 px-0 outline-none text-base font-medium"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-lg text-primary">New Password</label>
          <input 
            type="password" 
            name="newPassword"
            required
            minLength={6}
            className="bg-surface-container-low border-b-2 border-primary focus:ring-0 focus:bg-white transition-all py-3 px-0 outline-none text-base font-medium"
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <StatusMessage message={error} tone="error" />
          <StatusMessage message={message} tone="success" />
        </div>

        <div className="md:col-span-2 pt-6">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary text-label-lg py-4 px-12 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
};

