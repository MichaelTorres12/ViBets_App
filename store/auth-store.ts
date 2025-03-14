import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateCoins: (amount: number) => void;
}

// Mock user data for demo purposes
const mockUsers = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    coins: 0, // Global coins (real money) start at 0
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password123', // In a real app, this would be hashed
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    coins: 0, // Global coins (real money) start at 0
    createdAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user by email (mock authentication)
          const user = mockUsers.find(u => u.email === email && u.password === password);
          
          if (!user) {
            throw new Error('Invalid credentials');
          }
          
          // Remove password from user object before storing in state
          const { password: _, ...userWithoutPassword } = user;
          
          set({ 
            user: userWithoutPassword as User, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if email already exists
          if (mockUsers.some(u => u.email === email)) {
            throw new Error('Email already in use');
          }
          
          // Create new user
          const newUser = {
            id: String(mockUsers.length + 1),
            username,
            email,
            password, // In a real app, this would be hashed
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw3NjA4Mjc3NHx8ZW58MHx8fHx8',
            coins: 0, // Global coins (real money) start at 0
            createdAt: new Date().toISOString(),
          };
          
          // Add to mock users (in a real app, this would be an API call)
          mockUsers.push(newUser);
          
          // Remove password from user object before storing in state
          const { password: _, ...userWithoutPassword } = newUser;
          
          set({ 
            user: userWithoutPassword as User, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },
      
      updateCoins: (amount: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, coins: user.coins + amount } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);