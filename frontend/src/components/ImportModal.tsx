import React, { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskSync } from '@/contexts/TaskSyncContext';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileUp,
  Eye,
  Table2
} from 'lucide-react';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { addTask } = useTaskSync();
  const { createTaskNotification } = useDashboard();
  
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'result'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      setFileType('csv');
      parseCSV(selectedFile);
    } else if (extension === 'json') {
      setFileType('json');
      parseJSON(selectedFile);
    } else {
      alert('❌ Unsupported file type. Please upload CSV or JSON files only.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        alert('❌ Failed to read CSV file');
        return;
      }
      const text = result;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('❌ CSV must have header and at least one data row');
        return;
      }

      const firstLine = lines[0];
      if (!firstLine) {
        alert('❌ CSV must have a header row');
        return;
      }
      const headers = firstLine.split(',').map(h => h.trim().replace(/['"]/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = (values && values[index] !== undefined) ? values[index] : '';
        });
        return row;
      });

      console.log('📊 CSV parsed:', data);
      setPreviewData(data);
      setActiveTab('preview');
    };
    reader.readAsText(file);
  };

  const parseJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        alert('❌ Failed to read JSON file');
        return;
      }
      try {
        const json = JSON.parse(result);
        const data = Array.isArray(json) ? json : [json];
        console.log('📊 JSON parsed:', data);
        setPreviewData(data);
        setActiveTab('preview');
      } catch (error: any) {
        console.error('❌ Invalid JSON file:', error.message);
        alert('❌ Invalid JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!userId || previewData.length === 0) return;

    setIsProcessing(true);
    setImportProgress(0);
    let imported = 0;
    let errors = 0;

    try {
      console.log('📥 Starting import of', previewData.length, 'tasks');

      for (let i = 0; i < previewData.length; i++) {
        const row = previewData[i];
        
        try {
          const priorityValue = row.priority || row.Priority || 'medium';
          const taskData: {
            id: string;
            title: string;
            description: string;
            status: 'pending' | 'in_progress' | 'completed';
            priority: 'low' | 'medium' | 'high' | 'urgent';
            due_date: string | null;
            created_at: string;
            updated_at: string;
            user_id: string;
          } = {
            id: `temp-${Date.now()}-${Math.random()}`,
            title: row.title || row.Title || 'Untitled Task',
            description: row.description || row.Description || '',
            status: 'pending',
            priority: (typeof priorityValue === 'string' && ['low', 'medium', 'high', 'urgent'].includes(priorityValue.toLowerCase())) ?
                      priorityValue.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent' : 'medium',
            due_date: row.dueDate || row.due_date || row.DueDate || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId,
          };

          // due_date is already handled in the taskData initialization above

          console.log('➕ Creating task:', taskData.title);
          await addTask(taskData);
          
          imported++;
          setImportProgress(Math.round(((i + 1) / previewData.length) * 100));
        } catch (error) {
          console.error('❌ Error importing task:', row, error);
          errors++;
        }
      }

      console.log(`✅ Import complete: ${imported} imported, ${errors} errors`);
      
      setImportResult({ imported, errors });
      setActiveTab('result');

      if (imported > 0) {
        createTaskNotification('created', `${imported} tasks imported successfully`);
      }
      
    } catch (error: any) {
      console.error('❌ Import failed:', error);
      alert('Import failed: ' + error.message || 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileType(null);
    setPreviewData([]);
    setImportResult(null);
    setImportProgress(0);
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Import Tasks</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Upload CSV or JSON files to bulk import tasks
              </p>
            </div>
            <Badge variant={activeTab === 'result' ? 'default' : 'secondary'} className="text-xs">
              {activeTab === 'upload' && '📁 Upload'}
              {activeTab === 'preview' && '👁️ Preview'}
              {activeTab === 'result' && '✅ Complete'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center py-4 border-b">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${activeTab === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                activeTab === 'upload' ? 'border-primary bg-primary text-white' : 
                ['preview', 'result'].includes(activeTab) ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
              }`}>
                {['preview', 'result'].includes(activeTab) ? <CheckCircle2 className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            
            <div className={`flex items-center gap-2 ${activeTab === 'preview' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                activeTab === 'preview' ? 'border-primary bg-primary text-white' : 
                activeTab === 'result' ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
              }`}>
                {activeTab === 'result' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Preview</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            
            <div className={`flex items-center gap-2 ${activeTab === 'result' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                activeTab === 'result' ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`transition-transform ${dragActive ? 'scale-110' : ''}`}>
                  <FileUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    <span className="text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    CSV or JSON files (max 10MB)
                  </p>
                  <Badge variant="outline" className="text-xs">
                    📄 CSV, JSON supported
                  </Badge>
                </div>
              </div>

              <Input
                type="file"
                ref={fileInputRef}
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* File Info */}
              {file && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-green-900">{file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-green-700">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <Badge variant="default" className="text-xs bg-green-600">
                              {fileType ? fileType.toUpperCase() : ''}
                            </Badge>
                            {previewData.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {previewData.length} tasks detected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreviewData([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sample Format */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Table2 className="h-4 w-4" />
                    Expected Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs">
                    <div className="text-gray-600 mb-2">CSV Example:</div>
                    <div className="text-gray-800">
                      title,description,priority,dueDate<br />
                      Buy groceries,Get milk and eggs,high,2025-01-05<br />
                      Clean room,Vacuum and dust,medium,2025-01-06
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Review your data before importing. {previewData.length} tasks will be created.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Data Preview</CardTitle>
                    <Badge>{previewData.length} rows</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-gray-100 border-b">
                          <tr>
                            <th className="text-left p-3 text-xs font-semibold text-gray-600">#</th>
                            {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                              <th key={key} className="text-left p-3 text-xs font-semibold text-gray-600">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                              {Object.values(row).map((value: any, idx) => (
                                <td key={idx} className="p-3 text-sm">
                                  {value || <span className="text-gray-400">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Result Tab */}
          {activeTab === 'result' && importResult && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                {importResult.imported > 0 && importResult.errors === 0 ? (
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-4">
                    <AlertCircle className="h-10 w-10 text-yellow-600" />
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">Import Complete!</h3>
                <p className="text-muted-foreground">
                  Your tasks have been imported to your workspace
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {importResult.imported}
                    </p>
                    <p className="text-sm text-green-700">Tasks Imported</p>
                  </CardContent>
                </Card>

                <Card className={importResult.errors > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}>
                  <CardContent className="p-6 text-center">
                    <p className={`text-4xl font-bold mb-2 ${importResult.errors > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {importResult.errors}
                    </p>
                    <p className={`text-sm ${importResult.errors > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                      Errors
                    </p>
                  </CardContent>
                </Card>
              </div>

              {importResult.errors > 0 && (
                <Alert variant="error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.errors} tasks failed to import. Check console for details.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-4 py-8">
              <div className="text-center mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="font-medium">Importing tasks...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your file</p>
              </div>
              <Progress value={importProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {importProgress}% complete
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          <div className="flex gap-2">
            {activeTab === 'preview' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('upload')}
                  disabled={isProcessing}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isProcessing || previewData.length === 0}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Importing...' : `Import ${previewData.length} Tasks`}
                </Button>
              </>
            )}

            {activeTab === 'result' && (
              <Button onClick={handleClose}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;