'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsIcon, UserIcon, MailIcon, CalendarIcon } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <Button size="sm" variant="outline" className="absolute bottom-0 right-0 rounded-full p-2">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold mt-4">John Doe</h2>
                <p className="text-gray-600 dark:text-gray-400">john.doe@example.com</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Member since Jan 2025</p>

                <div className="mt-6 w-full space-y-2">
                  <div className="flex items-center text-sm">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Full Name: John Doe</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MailIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Email: john.doe@example.com</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Joined: Jan 15, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add extra security to your account</p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;