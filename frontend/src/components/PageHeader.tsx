'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
      </Card>
    </div>
  );
};

export default PageHeader;