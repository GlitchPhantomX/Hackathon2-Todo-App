'use client';

import React, { useState } from 'react';
import { Alert } from './Alert';

// This is a test component to demonstrate Alert functionality
const AlertTest = () => {
  const [showAlerts, setShowAlerts] = useState({
    success: true,
    error: true,
    warning: true,
    info: true
  });

  const handleClose = (type: string) => {
    setShowAlerts(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const resetAlerts = () => {
    setShowAlerts({
      success: true,
      error: true,
      warning: true,
      info: true
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Alert Component Tests</h2>

      <div className="flex gap-2">
        <button
          onClick={resetAlerts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Alerts
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. All Variants Test</h3>

        {showAlerts.success && (
          <Alert
            variant="success"
            title="Success!"
            onClose={() => handleClose('success')}
          >
            This is a success message. Operation completed successfully.
          </Alert>
        )}

        {showAlerts.error && (
          <Alert
            variant="error"
            title="Error!"
            onClose={() => handleClose('error')}
          >
            This is an error message. Something went wrong.
          </Alert>
        )}

        {showAlerts.warning && (
          <Alert
            variant="warning"
            title="Warning!"
            onClose={() => handleClose('warning')}
          >
            This is a warning message. Please be careful.
          </Alert>
        )}

        {showAlerts.info && (
          <Alert
            variant="info"
            title="Information"
            onClose={() => handleClose('info')}
          >
            This is an information message. Here's something you should know.
          </Alert>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. Without Title Test</h3>

        <Alert variant="success">
          This alert has no title, just a message.
        </Alert>

        <Alert variant="error" onClose={() => alert('Close callback fired!')}>
          This alert has no title but has a close button with callback.
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. Without Close Button Test</h3>

        <Alert variant="warning" title="No Close Button">
          This alert has no close button since onClose is not provided.
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">4. Without Icons Test</h3>

        <Alert variant="info" title="No Icons" showIcon={false} onClose={() => {}}>
          This alert has no icon displayed.
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">5. With Complex Content Test</h3>

        <Alert variant="success" title="Complex Content">
          <p>This alert contains <strong>formatted text</strong> and <em>multiple elements</em>.</p>
          <ul className="list-disc pl-5 mt-2">
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
          </ul>
        </Alert>
      </div>
    </div>
  );
};

export default AlertTest;