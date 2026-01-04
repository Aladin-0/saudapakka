import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

interface User {
  id: string;
  first_name?: string;  // Added for layout compatibility
  last_name?: string;   // Added for layout compatibility
  full_name: string;
  email: string;
  is_active_seller: boolean;
  is_active_broker: boolean;
  is_staff: boolean;
}

interface AuthState {
  user: User | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkUser: () => Promise<void>; // Alias for layouts
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setAuth: (user, token) => {
        Cookies.set('access_token', token, { expires: 7 });
        set({ user });
      },

      refreshUser: async () => {
        try {
          const res = await api.get("/api/user/me/");
          // This updates the local state AND the persisted localStorage
          set({ user: res.data });
          console.log("✅ Auth State Synchronized:", res.data);
        } catch (error) {
          console.error("Failed to refresh user data", error);
        }
      },

      // Use this in layouts to ensure fresh data on every navigation
      checkUser: async () => {
        const token = Cookies.get('access_token');
        if (token) {
          await get().refreshUser();
        }
      },

      logout: () => {
        Cookies.remove('access_token');
        localStorage.removeItem('saudapakka-auth'); // Clear storage
        set({ user: null });
      },
    }),
    {
      name: 'saudapakka-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);