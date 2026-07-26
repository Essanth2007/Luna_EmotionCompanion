import { api, handleApiCall, ApiResponse } from './api';

// Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  moodStreak: number;
  wellnessScore: number;
  joinDate: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: File;
  preferences?: Partial<UserProfile['preferences']>;
  emergencyContact?: UserProfile['emergencyContact'];
}

// Profile Service
export const profileService = {
  // Get Profile
  getProfile: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.get<ApiResponse<UserProfile>>('/profile')
    // );
    
    console.log('Getting user profile');
    return {
      data: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/assets/luna/images/luna.png',
        bio: 'On a journey to better mental health',
        moodStreak: 7,
        wellnessScore: 78,
        joinDate: '2024-01-01',
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'en',
        },
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567890',
          relationship: 'Spouse',
        },
      },
      error: null,
    };
  },

  // Update Profile
  updateProfile: async (data: UpdateProfileData) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.patch<ApiResponse<UserProfile>>('/profile', data, {
    //     headers: data.avatar ? { 'Content-Type': 'multipart/form-data' } : {}
    //   })
    // );
    
    console.log('Updating profile:', data);
    return {
      data: {
        id: '1',
        name: data.name || 'John Doe',
        email: 'john@example.com',
        avatar: data.avatar ? '/assets/luna/images/luna.png' : '/assets/luna/images/luna.png',
        bio: data.bio || 'On a journey to better mental health',
        moodStreak: 7,
        wellnessScore: 78,
        joinDate: '2024-01-01',
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'en',
          ...data.preferences,
        },
        emergencyContact: data.emergencyContact,
      },
      error: null,
    };
  },

  // Update Emergency Contact
  updateEmergencyContact: async (contact: UserProfile['emergencyContact']) => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.patch<ApiResponse<UserProfile>>('/profile/emergency-contact', contact)
    // );
    
    console.log('Updating emergency contact:', contact);
    return {
      data: null,
      error: null,
    };
  },

  // Delete Account
  deleteAccount: async () => {
    // Placeholder - replace with actual API call
    // return await handleApiCall(
    //   api.delete<ApiResponse<void>>('/profile')
    // );
    
    console.log('Deleting account');
    return { data: null, error: null };
  },
};
