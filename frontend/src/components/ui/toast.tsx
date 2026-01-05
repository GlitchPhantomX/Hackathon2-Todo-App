import { Toaster } from 'sonner';

// Wrapper component for the sonner toast provider
const ToastProvider = () => {
  return <Toaster position="top-right" richColors />;
};

export { ToastProvider };