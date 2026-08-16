export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'ai';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export function showToast(
  message: string,
  type: ToastType = 'success',
  title?: string,
  duration: number = 3800
) {
  if (typeof window === 'undefined') return;
  const defaultTitles: Record<ToastType, string> = {
    success: 'Aksi Berhasil',
    info: 'Pemberitahuan Sistem',
    warning: 'Perhatian',
    error: 'Terjadi Kesalahan',
    ai: 'AI Generator Studio',
  };

  const event = new CustomEvent('show-school-toast', {
    detail: {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      message,
      type,
      title: title || defaultTitles[type] || 'Notifikasi',
      duration,
    },
  });
  window.dispatchEvent(event);
}
