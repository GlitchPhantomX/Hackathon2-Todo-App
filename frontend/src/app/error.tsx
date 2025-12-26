'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-gray-400 mb-4">500</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Server Error</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Sorry, something went wrong. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Link href="/" passHref>
            <Button variant="outline">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}