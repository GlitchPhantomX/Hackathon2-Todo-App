'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const memberSinceDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-500" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">{user.name || user.email}</h2>
          <p className="text-gray-600 mt-1">{user.email}</p>

          <div className="mt-6 w-full max-w-md">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member since</h3>
                <p className="mt-1 text-gray-900">{memberSinceDate}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account status</h3>
                <p className="mt-1 text-gray-900">Active</p>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full max-w-md">
            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
              className="flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}