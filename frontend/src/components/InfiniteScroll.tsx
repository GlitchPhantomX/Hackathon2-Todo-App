import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  className = '',
}) => {
  const [ref, inView] = useInView({
    threshold,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={ref} className="flex justify-center my-4">
          {isLoading ? (
            <div className="py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading more...</p>
            </div>
          ) : (
            <Button variant="outline" onClick={onLoadMore}>
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;