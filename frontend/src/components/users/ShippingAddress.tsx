import { useState } from 'react';
import { Plus, Trash2, Check, Loader2, MapPin, X } from 'lucide-react';
import { useAddress } from '@/context/AddressContext';

export const ShippingAddress = () => {
  const { addresses, isLoading, createAddress, deleteAddress, setDefaultAddress } = useAddress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('');
  const [province, setProvince] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      setFormError('Full name must be at least 2 characters');
      return;
    }
    if (!phone || !/^[0-9]{10,11}$/.test(phone.trim())) {
      setFormError('Phone number must be 10 or 11 digits');
      return;
    }
    if (!street || street.trim().length < 5) {
      setFormError('Street address must be at least 5 characters');
      return;
    }
    if (!province || province.trim().length < 2) {
      setFormError('Please specify a valid province or city');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAddress({
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        ward: ward.trim() || undefined,
        province: province.trim(),
        isDefault,
      });

      setIsModalOpen(false);

      // Reset form
      setFullName('');
      setPhone('');
      setStreet('');
      setWard('');
      setProvince('');
      setIsDefault(false);
    } catch (error: any) {
      console.error('Failed to create address:', error);
      setFormError(error.message || 'Failed to create address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-outline-variant/20 shadow-sm w-full min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-on-surface-variant mt-4">Loading your addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full lg:col-span-2">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-headline-md text-on-surface font-bold">Shipping Addresses</h3>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-widest text-white hover:bg-on-surface transition-all active:scale-95 duration-300 shadow-sm"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" />
          ADD NEW ADDRESS
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/60 text-center">
          <MapPin className="w-12 h-12 text-on-surface-variant/40 mb-4" />
          <h4 className="text-title-lg font-bold text-on-surface mb-1">No Addresses Yet</h4>
          <p className="text-sm text-on-surface-variant font-medium max-w-sm mb-6">
            You don't have any shipping addresses saved yet. Add one to checkout faster next time.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-primary px-6 py-3 text-xs font-bold tracking-widest text-white hover:bg-on-surface transition-all active:scale-95 duration-300 shadow-sm"
            style={{ color: '#ffffff' }}
          >
            ADD YOUR FIRST ADDRESS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <section
              key={address.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${address.isDefault
                  ? 'bg-white border-primary/40 shadow-md ring-1 ring-primary/20'
                  : 'bg-white border-outline-variant/20 shadow-sm hover:border-outline-variant/50'
                }`}
            >
              <div>
                {/* Title & default Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-title-md font-bold text-on-surface">{address.fullName}</p>
                    <p className="text-sm font-semibold text-on-surface-variant">{address.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {address.isDefault && (
                      <span className="text-[10px] bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-1 text-sm font-medium text-on-surface-variant">
                  <p>{address.street}</p>
                  <p>
                    {address.ward ? `${address.ward}, ` : ''}
                    {address.province}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center gap-4">
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => void handleSetDefault(address.id)}
                    className="text-xs font-bold text-primary hover:text-on-surface transition-colors flex items-center gap-1"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Active Default
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => void handleDelete(address.id)}
                  className="text-on-surface-variant hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add Address Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/20 bg-surface-lowest">
              <h3 className="text-title-lg font-bold text-on-surface">Add Shipping Address</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => void handleCreateAddress(e)} className="p-8 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl p-4">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                />
              </div>

              {/* Province & Ward in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Province/City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hồ Chí Minh"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ward</label>
                  <input
                    type="text"
                    placeholder="Phường Bến Nghé"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                  />
                </div>
              </div>

              {/* Street */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="123 Nguyễn Huệ, Lầu 3"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full border border-outline-variant/40 rounded-xl px-4 py-3 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                />
              </div>

              {/* Set as Default Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-2"
                />
                <label htmlFor="defaultAddressCheckbox" className="text-sm font-semibold text-on-surface select-none cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/20 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-outline-variant px-6 py-3 text-xs font-bold tracking-widest text-on-surface hover:bg-surface-container transition-all active:scale-95"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-primary px-6 py-3 text-xs font-bold tracking-widest text-white hover:bg-on-surface transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  style={{ color: '#ffffff' }}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  SAVE ADDRESS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
