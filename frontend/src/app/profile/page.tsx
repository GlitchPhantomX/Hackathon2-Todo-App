'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/apiService';
import { LogOut, Mail, Calendar, Shield, Home, Camera, Save, User as UserIcon } from 'lucide-react';
import type { User } from '@/types/auth.types';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Profile data type for form
interface ProfileFormData {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  phone: string;
  timezone: string;
  locale: string;
}

// Profile update data type (without email)
interface ProfileUpdateData {
  name: string;
  avatar: string;
  bio: string;
  phone: string;
  timezone: string;
  locale: string;
}

// API response type
interface ProfileResponse {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: authUser?.name ?? '',
    email: authUser?.email ?? '',
    avatar: authUser?.avatar ?? '',
    bio: authUser?.bio ?? '',
    phone: authUser?.phone ?? '',
    timezone: authUser?.timezone ?? 'UTC',
    locale: authUser?.locale ?? 'en-US',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (authUser) {
        try {
          const profileData: ProfileResponse = await profileService.getProfile();
          
          // Cast to User type to ensure compatibility
          const userProfile: User = {
            id: profileData.id,
            email: profileData.email,
            name: profileData.fullName || profileData.username || profileData.name || authUser.name || '',
            avatar: profileData.avatar || authUser.avatar || '',
            bio: profileData.bio || authUser.bio || '',
            phone: profileData.phone || authUser.phone || '',
            timezone: profileData.timezone || authUser.timezone || 'UTC',
            locale: profileData.locale || authUser.locale || 'en-US',
            createdAt: profileData.createdAt || authUser.createdAt || new Date().toISOString(),
            updatedAt: profileData.updatedAt || authUser.updatedAt || new Date().toISOString(),
          };
          
          setUser(userProfile);
          setFormData({
            name: userProfile.name ?? '',
            email: userProfile.email ?? '',
            avatar: userProfile.avatar ?? '',
            bio: userProfile.bio ?? '',
            phone: userProfile.phone ?? '',
            timezone: userProfile.timezone ?? 'UTC',
            locale: userProfile.locale ?? 'en-US',
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Fallback to authUser data if profile fetch fails
          if (authUser) {
            setUser(authUser);
            setFormData({
              name: authUser.name ?? '',
              email: authUser.email ?? '',
              avatar: authUser.avatar ?? '',
              bio: authUser.bio ?? '',
              phone: authUser.phone ?? '',
              timezone: authUser.timezone ?? 'UTC',
              locale: authUser.locale ?? 'en-US',
            });
          }
        }
      }
    };

    fetchProfileData();
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Cancel edit - reset form
      setFormData({
        name: user.name ?? '',
        email: user.email ?? '',
        avatar: user.avatar ?? '',
        bio: user.bio ?? '',
        phone: user.phone ?? '',
        timezone: user.timezone ?? 'UTC',
        locale: user.locale ?? 'en-US',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileUpdateData: ProfileUpdateData = {
        name: formData.name,
        avatar: formData.avatar,
        bio: formData.bio,
        phone: formData.phone,
        timezone: formData.timezone,
        locale: formData.locale,
      };

      const updatedProfile: ProfileResponse = await profileService.updateProfile(profileUpdateData);

      // Cast to User type to ensure compatibility
      const userProfile: User = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.fullName || updatedProfile.username || updatedProfile.name || formData.name,
        avatar: updatedProfile.avatar || formData.avatar,
        bio: updatedProfile.bio || formData.bio,
        phone: updatedProfile.phone || formData.phone,
        timezone: updatedProfile.timezone || formData.timezone,
        locale: updatedProfile.locale || formData.locale,
        createdAt: updatedProfile.createdAt || user?.createdAt || new Date().toISOString(),
        updatedAt: updatedProfile.updatedAt || new Date().toISOString(),
      };

      setUser(userProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex justify-center items-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-purple-500/20 border-4 border-purple-500/30 border-t-purple-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const memberSinceDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-900/50 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-purple-500/50">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                TodoMaster
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-300">Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-purple-500/20 shadow-2xl shadow-purple-500/10 overflow-hidden">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="px-6 pb-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-1 shadow-2xl">
                  <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-purple-400" />
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                {isEditing && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Change
                    </Button>
                  </div>
                )}
              </div>

              {/* User Info */}
              {isEditing ? (
                <div className="mt-4 w-full max-w-md">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-center text-3xl font-bold text-white bg-gray-700/50 border-purple-500/50 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <div className="text-purple-300 mt-2 flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-gray-700/50 border-purple-500/50 focus:ring-purple-500 focus:border-purple-500 text-center"
                      disabled
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mt-4">
                    {user.name || 'User'}
                  </h2>
                  <p className="text-purple-300 mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </>
              )}
            </div>

            {/* Profile Form */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-gray-300">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-gray-700/50 border-purple-500/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="bg-gray-700/50 border-purple-500/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => handleSelectChange('timezone', value)}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-purple-500/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                        <SelectItem value="Europe/London">London (UK)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (France)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (Japan)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (China)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locale" className="text-gray-300">Locale</Label>
                    <Select
                      value={formData.locale}
                      onValueChange={(value) => handleSelectChange('locale', value)}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-purple-500/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="ja-JP">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="bg-gray-700/50 border-purple-500/50 text-white"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEditToggle}
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-2xl mx-auto">
                  {/* Member Since */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                        <Calendar className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Member Since
                      </h3>
                    </div>
                    <p className="text-xl font-semibold text-white">{memberSinceDate}</p>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                        <Shield className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Account Status
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-xl font-semibold text-white">Active</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="mt-6 space-y-4">
                  {user.bio && (
                    <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">About</h3>
                      <p className="text-gray-300">{user.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.phone && (
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Phone</h3>
                        <p className="text-gray-300">{user.phone}</p>
                      </div>
                    )}

                    {user.timezone && (
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Timezone</h3>
                        <p className="text-gray-300">{user.timezone}</p>
                      </div>
                    )}

                    {user.locale && (
                      <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Locale</h3>
                        <p className="text-gray-300">{user.locale}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="mt-8 max-w-md mx-auto space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleEditToggle}
                  variant={isEditing ? "outline" : "default"}
                  className={`${isEditing ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'} flex-1`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at{' '}
            <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
              support@todomaster.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}