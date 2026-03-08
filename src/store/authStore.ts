import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerInfo {
  id: number;
  name: string;
  homeNo: string | null;
  shopId: number;
}

interface AuthState {
  accessToken: string | null;
  customer: CustomerInfo | null;
  shopId: number | null;
  setAuth: (token: string, customer: CustomerInfo, shopId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      customer: null,
      shopId: null,
      setAuth: (accessToken, customer, shopId) => set({ accessToken, customer, shopId }),
      logout: () => set({ accessToken: null, customer: null, shopId: null }),
    }),
    { name: 'portal-auth' },
  ),
);
