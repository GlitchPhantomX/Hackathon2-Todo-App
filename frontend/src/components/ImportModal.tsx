import React, { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importExportService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Download, FileText, X } from 'lucide-react';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ColumnMapping {
  [key: string]: string;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Determine file type from extension
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        setFileType('csv');
      } else if (extension === 'json') {
        setFileType('json');
      } else {
        alert('Unsupported file type. Please upload a CSV or JSON file.');
        return;
      }
      setActiveTab('mapping');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Determine file type from extension
      const extension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        setFileType('csv');
      } else if (extension === 'json') {
        setFileType('json');
      } else {
        alert('Unsupported file type. Please upload a CSV or JSON file.');
        return;
      }
      setActiveTab('mapping');
    }
  };

  const handleColumnMappingChange = (csvColumn: string, taskField: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [csvColumn]: taskField
    }));
  };

  const handlePreview = async () => {
    if (!file || !user?.id) return;

    setIsProcessing(true);
    try {
      // In a real app, this would parse the file and show a preview
      // For now, we'll simulate with sample data
      const sampleData = [
        { title: 'Sample Task 1', description: 'Sample description', priority: 'high', dueDate: '2023-12-25' },
        { title: 'Sample Task 2', description: 'Another sample', priority: 'medium', dueDate: '2023-12-26' },
      ];
      setPreviewData(sampleData);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error previewing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!file || !user?.id) return;

    setIsProcessing(true);
    try {
      // In a real app, this would call the import service
      // const result = await importExportService.importTasks(user.id, file);
      // For now, we'll simulate the result
      const result = { imported: 5, errors: 0 };
      setImportResult(result);
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error importing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileType(null);
    setColumnMappings({});
    setPreviewData([]);
    setImportResult(null);
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const availableTaskFields = [
    'title',
    'description',
    'priority',
    'dueDate',
    'status',
    'projectId',
    'tags',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Import Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              Upload File
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'mapping'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('mapping')}
              disabled={!file}
            >
              Column Mapping
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab('preview')}
              disabled={previewData.length === 0}
            >
              Preview
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  CSV or JSON files only
                </p>
              </div>
              <Input
                type="file"
                ref={fileInputRef}
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              {file && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Mapping Tab */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Column Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Map your file columns to task fields
                    </p>
                    {/* In a real app, we would parse the CSV/JSON to get column names */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>File Column</Label>
                        <div className="text-sm font-medium">Title</div>
                      </div>
                      <div>
                        <Label>Task Field</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={columnMappings['Title'] || ''}
                          onChange={(e) => handleColumnMappingChange('Title', e.target.value)}
                        >
                          <option value="">Select field</option>
                          {availableTaskFields.map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>File Column</Label>
                        <div className="text-sm font-medium">Description</div>
                      </div>
                      <div>
                        <Label>Task Field</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={columnMappings['Description'] || ''}
                          onChange={(e) => handleColumnMappingChange('Description', e.target.value)}
                        >
                          <option value="">Select field</option>
                          {availableTaskFields.map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>File Column</Label>
                        <div className="text-sm font-medium">Priority</div>
                      </div>
                      <div>
                        <Label>Task Field</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={columnMappings['Priority'] || ''}
                          onChange={(e) => handleColumnMappingChange('Priority', e.target.value)}
                        >
                          <option value="">Select field</option>
                          {availableTaskFields.map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('upload')}
                >
                  Back
                </Button>
                <Button onClick={handlePreview} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Preview'}
                </Button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(previewData[0]).map(key => (
                              <th key={key} className="text-left p-2">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b">
                              {Object.values(row).map((value, idx) => (
                                <td key={idx} className="p-2">{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No preview data available
                    </p>
                  )}
                </CardContent>
              </Card>
              {importResult ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Import Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p>Successfully imported {importResult.imported} tasks</p>
                      {importResult.errors > 0 && (
                        <p className="text-red-500">Errors: {importResult.errors}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('mapping')}
                  >
                    Back
                  </Button>
                  <Button onClick={handleImport} disabled={isProcessing}>
                    {isProcessing ? 'Importing...' : 'Import Tasks'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;