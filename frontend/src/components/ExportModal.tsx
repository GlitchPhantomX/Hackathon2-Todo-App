import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importExportService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { Download, Calendar, CalendarCheck, FileText } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { tasks } = useDashboard();
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportOption, setExportOption] = useState<'all' | 'selected' | 'current'>('all');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleExport = async () => {
    if (!user?.id) return;

    setIsProcessing(true);
    setExportResult(null);

    try {
      // In a real app, this would call the export service
      // const result = await importExportService.exportTasks(user.id, format, {
      //   option: exportOption,
      //   includeCompleted,
      //   dateRange,
      // });

      // For now, we'll simulate the export
      setTimeout(() => {
        setExportResult({
          success: true,
          message: `Successfully exported ${tasks.length} tasks as ${format.toUpperCase()} file`
        });
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Error exporting tasks:', error);
      setExportResult({
        success: false,
        message: 'Failed to export tasks. Please try again.'
      });
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    // In a real app, this would trigger the actual file download
    console.log('Download file in', format, 'format');
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormat('csv');
    setExportOption('all');
    setIncludeCompleted(true);
    setDateRange(null);
    setExportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Selection */}
              <div>
                <Label>Export Format</Label>
                <div className="flex space-x-2 mt-2">
                  {(['csv', 'json', 'pdf'] as const).map((f) => (
                    <Button
                      key={f}
                      type="button"
                      variant={format === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat(f)}
                    >
                      {f.toUpperCase()}
                      {f === 'csv' && <FileText className="ml-1 h-4 w-4" />}
                      {f === 'json' && <FileText className="ml-1 h-4 w-4" />}
                      {f === 'pdf' && <FileText className="ml-1 h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Export Option */}
              <div>
                <Label>Export Option</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['all', 'selected', 'current'] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={exportOption === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportOption(option)}
                      className="text-xs"
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Include Completed */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeCompleted"
                  checked={includeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="includeCompleted">Include completed tasks</Label>
              </div>

              {/* Date Range */}
              <div>
                <Label>Date Range</Label>
                <div className="flex space-x-2 mt-2">
                  <div className="flex-1">
                    <Label htmlFor="startDate">Start</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange?.start || ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endDate">End</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange?.end || ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {exportResult ? (
            <Card>
              <CardHeader>
                <CardTitle>Export Result</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={exportResult.success ? 'text-green-600' : 'text-red-600'}>
                  {exportResult.message}
                </p>
                {exportResult.success && (
                  <Button className="mt-4 w-full" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Exporting...' : 'Export Tasks'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;