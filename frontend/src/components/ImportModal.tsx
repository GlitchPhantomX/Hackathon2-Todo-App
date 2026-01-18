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
          const dueDate = row.dueDate || row.due_date || row.DueDate || null;
          
          // ✅ Check if due date is in the past
          const isPastDate = dueDate ? new Date(dueDate) < new Date() : false;
          
          // ✅ Build minimal task data - only required fields
          const taskData: any = {
            id: `temp-${Date.now()}-${Math.random()}`,
            title: row.title || row.Title || 'Untitled Task',
            description: row.description || row.Description || '',
            status: 'pending',
            priority: (typeof priorityValue === 'string' && ['low', 'medium', 'high', 'urgent'].includes(priorityValue.toLowerCase())) 
                      ? priorityValue.toLowerCase() 
                      : 'medium',
            due_date: dueDate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId,
            
            // ✅ Set these explicitly to false for imports (no recurring, no reminders)
            is_recurring: false,
            reminder_enabled: false, // ✅ Always false during import
            completed: false,
          };
  
          console.log('➕ Creating task:', taskData.title, isPastDate ? '(past date)' : '');
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
      <DialogContent 
        className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <DialogHeader 
          className="pb-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle 
                className="text-2xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Import Tasks
              </DialogTitle>
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Upload CSV or JSON files to bulk import tasks
              </p>
            </div>
            <Badge 
              variant={activeTab === 'result' ? 'default' : 'secondary'} 
              className="text-xs border"
              style={{
                backgroundColor: activeTab === 'result' ? 'var(--primary)' : 'var(--muted)',
                color: activeTab === 'result' ? 'white' : 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            >
              {activeTab === 'upload' && '📁 Upload'}
              {activeTab === 'preview' && '👁️ Preview'}
              {activeTab === 'result' && '✅ Complete'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div 
          className="flex items-center justify-center py-4 border-b"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--muted)'
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2"
              style={{ 
                color: activeTab === 'upload' ? 'var(--primary)' : 'var(--muted-foreground)' 
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor: activeTab === 'upload' ? 'var(--primary)' : 
                              ['preview', 'result'].includes(activeTab) ? '#10b981' : 'var(--border)',
                  backgroundColor: activeTab === 'upload' ? 'var(--primary)' : 
                                  ['preview', 'result'].includes(activeTab) ? '#10b981' : 'transparent',
                  color: ['upload', 'preview', 'result'].includes(activeTab) ? 'white' : 'var(--muted-foreground)'
                }}
              >
                {['preview', 'result'].includes(activeTab) ? <CheckCircle2 className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            
            <ArrowRight 
              className="h-4 w-4 mx-2"
              style={{ color: 'var(--muted-foreground)' }}
            />
            
            <div 
              className="flex items-center gap-2"
              style={{ 
                color: activeTab === 'preview' ? 'var(--primary)' : 'var(--muted-foreground)' 
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor: activeTab === 'preview' ? 'var(--primary)' : 
                              activeTab === 'result' ? '#10b981' : 'var(--border)',
                  backgroundColor: activeTab === 'preview' ? 'var(--primary)' : 
                                  activeTab === 'result' ? '#10b981' : 'transparent',
                  color: ['preview', 'result'].includes(activeTab) ? 'white' : 'var(--muted-foreground)'
                }}
              >
                {activeTab === 'result' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Preview</span>
            </div>
            
            <ArrowRight 
              className="h-4 w-4 mx-2"
              style={{ color: 'var(--muted-foreground)' }}
            />
            
            <div 
              className="flex items-center gap-2"
              style={{ 
                color: activeTab === 'result' ? 'var(--primary)' : 'var(--muted-foreground)' 
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor: activeTab === 'result' ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: activeTab === 'result' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'result' ? 'white' : 'var(--muted-foreground)'
                }}
              >
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
                  dragActive ? 'scale-[1.02]' : ''
                }`}
                style={{
                  borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: dragActive ? 'var(--muted)' : 'var(--background)'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                  }
                }}
              >
                <div className={`transition-transform ${dragActive ? 'scale-110' : ''}`}>
                  <FileUp 
                    className="mx-auto h-16 w-16 mb-4"
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                  <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    <span style={{ color: 'var(--primary)' }}>Click to upload</span> or drag and drop
                  </p>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    CSV or JSON files (max 10MB)
                  </p>
                  <Badge 
                    variant="outline" 
                    className="text-xs border"
                    style={{
                      backgroundColor: 'var(--muted)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  >
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
                <Card 
                  className="border"
                  style={{
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--muted)'
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText 
                          className="h-8 w-8 mt-1"
                          style={{ color: 'var(--primary)' }}
                        />
                        <div>
                          <p 
                            className="font-medium"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p 
                              className="text-sm"
                              style={{ color: 'var(--primary)' }}
                            >
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <Badge 
                              variant="default" 
                              className="text-xs"
                              style={{
                                background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                                color: 'white'
                              }}
                            >
                              {fileType ? fileType.toUpperCase() : ''}
                            </Badge>
                            {previewData.length > 0 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs border"
                                style={{
                                  backgroundColor: 'var(--muted)',
                                  color: 'var(--foreground)',
                                  borderColor: 'var(--border)'
                                }}
                              >
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
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--muted)';
                          e.currentTarget.style.color = 'var(--foreground)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--muted-foreground)';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sample Format */}
              <Card 
                className="border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <CardHeader>
                  <CardTitle 
                    className="text-sm flex items-center gap-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Table2 className="h-4 w-4" />
                    Expected Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="rounded-lg p-4 font-mono text-xs border"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div 
                      className="mb-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      CSV Example:
                    </div>
                    <div style={{ color: 'var(--foreground)' }}>
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
              <Alert 
                className="border"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--primary)'
                }}
              >
                <Eye 
                  className="h-4 w-4"
                  style={{ color: 'var(--primary)' }}
                />
                <AlertDescription style={{ color: 'var(--primary)' }}>
                  Review your data before importing. {previewData.length} tasks will be created.
                </AlertDescription>
              </Alert>

              <Card 
                className="border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <CardHeader 
                  className="border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ color: 'var(--foreground)' }}>
                      Data Preview
                    </CardTitle>
                    <Badge 
                      className="border"
                      style={{
                        backgroundColor: 'var(--muted)',
                        color: 'var(--foreground)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      {previewData.length} rows
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead 
                        className="sticky top-0 border-b"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <tr>
                          <th 
                            className="text-left p-3 text-xs font-semibold"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            #
                          </th>
                          {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                            <th 
                              key={key} 
                              className="text-left p-3 text-xs font-semibold"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'var(--card)' }}>
                        {previewData.map((row, index) => (
                          <tr 
                            key={index} 
                            className="border-b transition-colors"
                            style={{ borderColor: 'var(--border)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--muted)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <td 
                              className="p-3 text-sm font-medium"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {index + 1}
                            </td>
                            {Object.values(row).map((value: any, idx) => (
                              <td 
                                key={idx} 
                                className="p-3 text-sm"
                                style={{ color: 'var(--foreground)' }}
                              >
                                {value || <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
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
                  <div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                    style={{ backgroundColor: '#065f4620' }}
                  >
                    <CheckCircle2 className="h-10 w-10" style={{ color: '#10b981' }} />
                  </div>
                ) : (
                  <div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                    style={{ backgroundColor: '#f59e0b20' }}
                  >
                    <AlertCircle className="h-10 w-10" style={{ color: '#f59e0b' }} />
                  </div>
                )}
                
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Import Complete!
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  Your tasks have been imported to your workspace
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Card 
                  className="border"
                  style={{
                    borderColor: '#10b981',
                    backgroundColor: '#10b98120'
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <p className="text-4xl font-bold mb-2" style={{ color: '#10b981' }}>
                      {importResult.imported}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                      Tasks Imported
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="border"
                  style={{
                    borderColor: importResult.errors > 0 ? '#ef4444' : 'var(--border)',
                    backgroundColor: importResult.errors > 0 ? '#ef444420' : 'var(--card)'
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <p 
                      className="text-4xl font-bold mb-2"
                      style={{ color: importResult.errors > 0 ? '#ef4444' : 'var(--muted-foreground)' }}
                    >
                      {importResult.errors}
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: importResult.errors > 0 ? '#ef4444' : 'var(--muted-foreground)' }}
                    >
                      Errors
                    </p>
                  </CardContent>
                </Card>
              </div>

              {importResult.errors > 0 && (
                <Alert 
                  className="border"
                  style={{
                    backgroundColor: '#ef444420',
                    borderColor: '#ef4444'
                  }}
                >
                  <AlertCircle className="h-4 w-4" style={{ color: '#ef4444' }} />
                  <AlertDescription style={{ color: '#ef4444' }}>
                    {importResult.errors} tasks failed to import. Check console for details.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div 
              className="space-y-4 py-8 rounded-lg p-6 border"
              style={{
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="text-center mb-4">
                <div 
                  className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
                  style={{ borderColor: 'var(--primary)' }}
                ></div>
                <p 
                  className="font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  Importing tasks...
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Please wait while we process your file
                </p>
              </div>
              <Progress 
                value={importProgress} 
                className="w-full"
                style={{ backgroundColor: 'var(--border)' }}
              />
              <p 
                className="text-center text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {importProgress}% complete
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div 
          className="border-t pt-4 px-6 pb-4 flex justify-between"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--muted)'
          }}
        >
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
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
                  className="border"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isProcessing || previewData.length === 0}
                  className="shadow-lg text-white"
                  style={{
                    background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Importing...' : `Import ${previewData.length} Tasks`}
                </Button>
              </>
            )}

            {activeTab === 'result' && (
              <Button 
                onClick={handleClose} 
                className="text-white"
                style={{ backgroundColor: '#10b981' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
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