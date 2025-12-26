import { toast } from 'sonner';

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  toast.error(message);
};

export const showInfoToast = (message: string) => {
  toast(message);
};

export const showWarningToast = (message: string) => {
  toast(message, {
    style: { background: '#FBBF24', color: 'white' },
  });
};

export const showOfflineToast = () => {
  toast('You\'re offline. Changes will sync when reconnected.', {
    duration: 5000,
    position: 'top-right',
  });
};