import React, { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
          const taskData: any = {
            id: `temp-${Date.now()}-${Math.random()}`,
            title: row.title || row.Title || 'Untitled Task',
            description: row.description || row.Description || '',
            status: 'pending',
            priority: (typeof priorityValue === 'string' && ['low', 'medium', 'high', 'urgent'].includes(priorityValue.toLowerCase())) ?
                      priorityValue.toLowerCase() : 'medium',
            due_date: row.dueDate || row.due_date || row.DueDate || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId,
          };

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
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-black border border-gray-800">
        <DialogHeader className="pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">Import Tasks</DialogTitle>
              <p className="text-sm text-gray-400 mt-1">
                Upload CSV or JSON files to bulk import tasks
              </p>
            </div>
            <Badge variant={activeTab === 'result' ? 'default' : 'secondary'} className="text-xs bg-gray-800 text-white border border-gray-700">
              {activeTab === 'upload' && '📁 Upload'}
              {activeTab === 'preview' && '👁️ Preview'}
              {activeTab === 'result' && '✅ Complete'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${activeTab === 'upload' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                activeTab === 'upload' ? 'border-blue-400 bg-blue-500 text-white' : 
                ['preview', 'result'].includes(activeTab) ? 'border-green-500 bg-green-600 text-white' : 'border-gray-700 bg-gray-800'
              }`}>
                {['preview', 'result'].includes(activeTab) ? <CheckCircle2 className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-600 mx-2" />
            
            <div className={`flex items-center gap-2 ${activeTab === 'preview' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                activeTab === 'preview' ? 'border-blue-400 bg-blue-500 text-white' : 
                activeTab === 'result' ? 'border-green-500 bg-green-600 text-white' : 'border-gray-700 bg-gray-800'
              }`}>
                {activeTab === 'result' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Preview</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-600 mx-2" />
            
            <div className={`flex items-center gap-2 ${activeTab === 'result' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                activeTab === 'result' ? 'border-blue-400 bg-blue-500 text-white' : 'border-gray-700 bg-gray-800'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6 px-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-950/30 scale-[1.02]' 
                    : 'border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`transition-transform ${dragActive ? 'scale-110' : ''}`}>
                  <FileUp className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                  <p className="text-lg font-medium mb-2 text-white">
                    <span className="text-blue-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    CSV or JSON files (max 10MB)
                  </p>
                  <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
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
                <Card className="border-blue-900 bg-blue-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-blue-400 mt-1" />
                        <div>
                          <p className="font-medium text-white">{file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-blue-300">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <Badge variant="default" className="text-xs bg-blue-600 text-white">
                              {fileType ? fileType.toUpperCase() : ''}
                            </Badge>
                            {previewData.length > 0 && (
                              <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-200">
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
                        className="hover:bg-blue-900 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sample Format */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <Table2 className="h-4 w-4" />
                    Expected Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 font-mono text-xs border border-gray-800">
                    <div className="text-gray-400 mb-2">CSV Example:</div>
                    <div className="text-gray-200">
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
              <Alert className="bg-blue-950/30 border-blue-900">
                <Eye className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Review your data before importing. {previewData.length} tasks will be created.
                </AlertDescription>
              </Alert>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Data Preview</CardTitle>
                    <Badge className="bg-gray-800 text-white border border-gray-700">{previewData.length} rows</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-black border-b border-gray-800">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold text-gray-400">#</th>
                          {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                            <th key={key} className="text-left p-3 text-xs font-semibold text-gray-400">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900">
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                            <td className="p-3 text-sm text-gray-400 font-medium">{index + 1}</td>
                            {Object.values(row).map((value: any, idx) => (
                              <td key={idx} className="p-3 text-sm text-gray-200">
                                {value || <span className="text-gray-600">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-950 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-950 mb-4">
                    <AlertCircle className="h-10 w-10 text-yellow-400" />
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2 text-white">Import Complete!</h3>
                <p className="text-gray-400">
                  Your tasks have been imported to your workspace
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Card className="border-green-900 bg-green-950/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold text-green-400 mb-2">
                      {importResult.imported}
                    </p>
                    <p className="text-sm text-green-300 font-medium">Tasks Imported</p>
                  </CardContent>
                </Card>

                <Card className={importResult.errors > 0 ? 'border-red-900 bg-red-950/30' : 'border-gray-800 bg-gray-900'}>
                  <CardContent className="p-6 text-center">
                    <p className={`text-4xl font-bold mb-2 ${importResult.errors > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                      {importResult.errors}
                    </p>
                    <p className={`text-sm font-medium ${importResult.errors > 0 ? 'text-red-300' : 'text-gray-500'}`}>
                      Errors
                    </p>
                  </CardContent>
                </Card>
              </div>

              {importResult.errors > 0 && (
                <Alert className="bg-red-950/30 border-red-900">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    {importResult.errors} tasks failed to import. Check console for details.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-4 py-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-center mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                <p className="font-medium text-white">Importing tasks...</p>
                <p className="text-sm text-gray-400">Please wait while we process your file</p>
              </div>
              <Progress value={importProgress} className="w-full bg-gray-800" />
              <p className="text-center text-sm text-gray-400">
                {importProgress}% complete
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-800 pt-4 px-6 pb-4 flex justify-between bg-gray-900">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white"
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
                  className="border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isProcessing || previewData.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Importing...' : `Import ${previewData.length} Tasks`}
                </Button>
              </>
            )}

            {activeTab === 'result' && (
              <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white">
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