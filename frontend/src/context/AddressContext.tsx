import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { addressService, UserAddress, CreateAddressPayload } from '@/features/users/services/address.service';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface AddressContextValue {
  addresses: UserAddress[];
  isLoading: boolean;
  fetchAddresses: () => Promise<void>;
  createAddress: (payload: CreateAddressPayload) => Promise<UserAddress>;
  updateAddress: (id: string, payload: Partial<CreateAddressPayload>) => Promise<UserAddress>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

const AddressContext = createContext<AddressContextValue | null>(null);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      showToast('Could not load shipping addresses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = async (payload: CreateAddressPayload) => {
    try {
      const newAddress = await addressService.createAddress(payload);
      showToast('Address created successfully', 'success');
      await fetchAddresses();
      return newAddress;
    } catch (error: any) {
      console.error('Failed to create address:', error);
      showToast(error.message || 'Failed to create address', 'error');
      throw error;
    }
  };

  const updateAddress = async (id: string, payload: Partial<CreateAddressPayload>) => {
    try {
      const updated = await addressService.updateAddress(id, payload);
      showToast('Address updated successfully', 'success');
      await fetchAddresses();
      return updated;
    } catch (error: any) {
      console.error('Failed to update address:', error);
      showToast(error.message || 'Failed to update address', 'error');
      throw error;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      showToast('Address deleted successfully', 'success');
      await fetchAddresses();
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      showToast(error.message || 'Failed to delete address', 'error');
      throw error;
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      showToast('Default address updated', 'success');
      await fetchAddresses();
    } catch (error: any) {
      console.error('Failed to set default address:', error);
      showToast(error.message || 'Failed to set default address', 'error');
      throw error;
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        isLoading,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
};
