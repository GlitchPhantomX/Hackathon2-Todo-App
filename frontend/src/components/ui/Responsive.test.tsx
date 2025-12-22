'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Alert } from './alert';
import { Card } from './card';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

// This is a test component to demonstrate responsive behavior of UI components
const ResponsiveTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Responsive UI Components Test</h2>
      <p className="text-center text-gray-600">
        Resize your browser window to test responsive behavior of components
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Button Component</h3>
          <div className="space-y-2">
            <Button fullWidth>Full Width Button</Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Input Component</h3>
          <Input
            label="Responsive Input"
            placeholder="This input is responsive"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alert Component</h3>
        <Alert variant="info" title="Responsive Alert">
          This alert adjusts its layout based on screen size. Try resizing your browser to see the responsive behavior.
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Card Component</h3>
          <Card padding="lg" className="w-full">
            <h4 className="font-medium mb-2">Responsive Card</h4>
            <p className="text-sm text-gray-600">
              This card adjusts its padding and layout based on screen size.
              On mobile, it takes full width with appropriate padding.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Spinner Component</h3>
          <div className="flex items-center justify-center p-4 bg-gray-100 rounded">
            <Spinner size="md" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Modal Component</h3>
        <div className="flex justify-center">
          <Button onClick={() => setIsModalOpen(true)}>Open Responsive Modal</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Combined Components</h3>
        <Card padding="md" className="w-full">
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              fullWidth
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" fullWidth>Cancel</Button>
              <Button variant="primary" fullWidth>Submit</Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Responsive Modal"
        size="md"
      >
        <div className="space-y-4">
          <p>
            This modal demonstrates responsive behavior. On smaller screens,
            it takes up more of the viewport width. On larger screens, it maintains
            a reasonable width while staying centered.
          </p>
          <Input
            label="Modal Input"
            placeholder="Responsive input in modal"
            fullWidth
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Responsive Testing Guidelines:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Mobile (&lt; 768px)</strong>: Components should stack vertically, take full width where appropriate</li>
          <li><strong>Tablet (768px - 1024px)</strong>: Components should adapt layout, possibly using 2-column grids</li>
          <li><strong>Desktop (&gt; 1024px)</strong>: Components should use more horizontal space efficiently</li>
          <li>Text should remain readable at all sizes</li>
          <li>Touch targets should be appropriately sized on mobile</li>
        </ul>
      </div>
    </div>
  );
};

export default ResponsiveTest;