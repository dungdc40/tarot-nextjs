'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useToast, type Toast } from '@/lib/contexts/ToastContext'

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 md:items-center md:justify-start md:p-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const { hideToast } = useToast()

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  return (
    <div
      className={`pointer-events-auto flex min-w-[300px] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ${getBackgroundColor()}`}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
      <button
        onClick={() => hideToast(toast.id)}
        className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Close notification"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}
