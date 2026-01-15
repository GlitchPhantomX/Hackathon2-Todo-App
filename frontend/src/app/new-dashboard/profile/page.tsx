'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsIcon, UserIcon, MailIcon, CalendarIcon } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--background)' }}>
      <PageHeader
        title="Profile"
        description="Manage your personal information and account settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card
            className="border shadow-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)'
            }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                    }}
                  >
                    JD
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute bottom-0 right-0 rounded-full p-2 border"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--card)',
                      color: 'var(--foreground)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card)';
                    }}
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
                <h2 
                  className="text-xl font-bold mt-4"
                  style={{ color: 'var(--foreground)' }}
                >
                  John Doe
                </h2>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  john.doe@example.com
                </p>
                <p 
                  className="text-sm mt-2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Member since Jan 2025
                </p>

                <div className="mt-6 w-full space-y-2">
                  <div 
                    className="flex items-center text-sm"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <UserIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <span>Full Name: John Doe</span>
                  </div>
                  <div 
                    className="flex items-center text-sm"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <MailIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <span>Email: john.doe@example.com</span>
                  </div>
                  <div 
                    className="flex items-center text-sm"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <CalendarIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <span>Joined: Jan 15, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card
            className="border shadow-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)'
            }}
          >
            <CardContent className="p-6">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full p-2 border rounded mt-1 transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      className="text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full p-2 border rounded mt-1 transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label 
                    className="text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full p-2 border rounded mt-1 transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    className="text-white shadow-md hover:shadow-lg transition-all"
                    style={{
                      background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border shadow-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)'
            }}
          >
            <CardContent className="p-6">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 
                      className="font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Change Password
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Change
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 
                      className="font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Two-Factor Authentication
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Add extra security to your account
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Setup
                  </Button>
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