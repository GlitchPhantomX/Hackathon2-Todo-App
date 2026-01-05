import React from 'react';

interface FocusVisibleProps {
  children: React.ReactNode;
  className?: string;
  focusClassName?: string;
}

export const FocusVisible: React.FC<FocusVisibleProps> = ({
  children,
  className = '',
  focusClassName = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
}) => {
  // This component is a conceptual wrapper for applying focus-visible styles
  // In practice, we'd add the focusClassName to the actual interactive elements
  return (
    <div className={`${className} ${focusClassName}`}>
      {children}
    </div>
  );
};