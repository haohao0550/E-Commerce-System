import { FormEvent, useState, useEffect, useRef } from 'react';
import { Edit2 } from 'lucide-react';
import { StatusMessage } from '@/components/common/StatusMessage';
import { useAuth } from '@/context/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { userService } from '@/features/users/services/user.service';

/**
 * ProfileForm Component
 * Renders user's personal details (Name, Email, Phone) and allows updating them.
 * Includes a real-time Cloudinary file uploader for updating the user's avatar.
 */
export const ProfileForm = () => {
  // --- Auth Context Hooks & State ---
  const { user, refreshProfile } = useAuth();
  const { error, isSubmitting, message, run } = useAsyncAction();
  
  // Local state to hold current avatar URL to allow real-time UI preview changes
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Ref for the hidden file upload input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal local state with authenticated user's details on change
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user]);

  // --- Event Handlers & API Actions ---

  /**
   * Triggers the hidden system file-picker dialog when edit icon is clicked.
   */
  const handleEditAvatar = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles avatar selection, verifies file limits, and uploads to Cloudinary backend.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size limit (max 1MB)
    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      alert('The file size is too large. Please select an image file smaller than 1MB.');
      return;
    }

    // Call upload service inside async runner wrapper to handle feedback state
    void run(async () => {
      const uploadedUrl = await userService.uploadAvatar(file);
      setAvatarUrl(uploadedUrl);
    }, 'Avatar uploaded successfully! Click "Save Changes" to save it permanently.');
  };

  /**
   * Handles final profile updates form submission.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void run(async () => {
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const avatar = String(formData.get('avatar') || '').trim();

      await userService.updateProfile({
        ...(name ? { name } : {}),
        email: email || undefined,
        phone: phone || null,
        avatar: avatar || null,
      });
      await refreshProfile();
    }, 'Profile updated');
  };

  // Fallback placeholder image for users without a custom avatar
  const defaultAvatar = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop';

  return (
    <section className="bg-white p-10 rounded-xl border border-outline-variant/20 shadow-sm">
      {/* Hidden file input bound to React ref for programmatic triggers */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Profile Header and Avatar Row */}
      <div className="flex items-center gap-8 mb-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary p-1 bg-white">
            <img 
              src={avatarUrl || defaultAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <button 
            type="button"
            onClick={handleEditAvatar}
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h2 className="text-headline-md text-primary">Personal Details</h2>
          <p className="text-sm text-on-surface-variant font-medium">Update your account information and how we contact you.</p>
        </div>
      </div>

      {/* Main Details Form */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-label-lg text-primary">Full Name</label>
          <input 
            type="text" 
            name="name"
            defaultValue={user?.name || ''}
            required
            className="bg-surface-container-low border-b-2 border-primary focus:ring-0 focus:bg-white transition-all py-3 px-0 outline-none text-base font-medium"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-label-lg text-primary">Email Address</label>
          <input 
            type="email" 
            name="email"
            defaultValue={user?.email || ''}
            required
            className="bg-surface-container-low border-b-2 border-primary focus:ring-0 focus:bg-white transition-all py-3 px-0 outline-none text-base font-medium"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-lg text-primary">Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            defaultValue={user?.phone || ''}
            className="bg-surface-container-low border-b-2 border-primary focus:ring-0 focus:bg-white transition-all py-3 px-0 outline-none text-base font-medium"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-lg text-primary">Avatar Image URL</label>
          <input 
            type="url" 
            name="avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="bg-surface-container-low border-b-2 border-primary focus:ring-0 focus:bg-white transition-all py-3 px-0 outline-none text-base font-medium"
          />
        </div>

        {/* Global Feedback Notifications */}
        <div className="md:col-span-2 space-y-4">
          <StatusMessage message={error} tone="error" />
          <StatusMessage message={message} tone="success" />
        </div>

        {/* Submit Actions Button */}
        <div className="md:col-span-2 pt-6">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-on-primary text-label-lg py-4 px-12 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
};

