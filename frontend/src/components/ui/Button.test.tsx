'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Spinner } from './spinner';

// This is a test component to demonstrate Button functionality
const ButtonTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setIsLoading(true);
    setClickCount(prev => prev + 1);

    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Button Component Tests</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. All Variants Test</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. All Sizes Test</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. Loading State Test</h3>
        <div className="flex flex-wrap gap-2">
          <Button isLoading={isLoading} onClick={handleClick}>
            {isLoading ? 'Loading...' : 'Click to Load'}
          </Button>
          <Button variant="secondary" isLoading={true}>
            Always Loading
          </Button>
        </div>
        <p>Click count: {clickCount}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">4. Full Width Test</h3>
        <div className="max-w-md">
          <Button fullWidth>Full Width Button</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">5. Disabled State Test</h3>
        <div className="flex flex-wrap gap-2">
          <Button disabled>Disabled Button</Button>
          <Button variant="destructive" disabled>Destructive Disabled</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">6. onClick Handler Test</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => alert('Primary button clicked!')}>Alert Button</Button>
          <Button variant="secondary" onClick={() => console.log('Secondary button clicked!')}>
            Console Button
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ButtonTest;