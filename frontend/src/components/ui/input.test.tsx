'use client';

import React, { useState } from 'react';
import { Input } from './input';

// This is a test component to demonstrate Input functionality
const InputTest = () => {
  const [inputValue, setInputValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  const [helperValue, setHelperValue] = useState('');

  const validateInput = (value: string) => {
    if (value.length < 3) {
      return 'Input must be at least 3 characters';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleErrorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setErrorValue(value);
  };

  const handleHelperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHelperValue(value);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Input Component Tests</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. Label Display Test</h3>
        <Input label="Username" placeholder="Enter your username" />
        <Input label="Email" placeholder="Enter your email" type="email" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. Error State Test</h3>
        <Input
          label="Error Input"
          placeholder="This input has an error"
          error="This is an error message"
        />
        <Input
          label="Validation Input"
          placeholder="Type at least 3 characters"
          value={errorValue}
          onChange={handleErrorChange}
          error={validateInput(errorValue)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. Helper Text Test</h3>
        <Input
          label="Helper Text Input"
          placeholder="Input with helper text"
          helperText="This is helper text to guide the user"
        />
        <Input
          label="Validation Helper"
          placeholder="Type something"
          value={helperValue}
          onChange={handleHelperChange}
          helperText="Enter your information here"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">4. Combined Error and Helper Test</h3>
        <Input
          label="Combined Test"
          placeholder="This shows error when invalid"
          value={inputValue}
          onChange={handleInputChange}
          error={validateInput(inputValue)}
          helperText="This helper text disappears when there's an error"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">5. Full Width Test</h3>
        <Input
          label="Full Width Input"
          placeholder="This input takes full width"
          fullWidth
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">6. Without Label Test</h3>
        <Input placeholder="Input without label" />
        <Input
          placeholder="Input without label but with error"
          error="Error without label"
        />
      </div>
    </div>
  );
};

export default InputTest;