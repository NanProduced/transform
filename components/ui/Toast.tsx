import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";
import { CheckIcon, AlertTriangleIcon, XIcon } from "./Icons";

type ToastType = "success" | "danger" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  success: (message: string, id?: string) => void;
  danger: (message: string, id?: string) => void;
  warning: (message: string, id?: string) => void;
  info: (message: string, id?: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType, id?: string) => {
      const toastId = id || `toast-${Date.now()}`;

      setToasts(prev => {
        const existingIndex = prev.findIndex(t => t.id === toastId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { id: toastId, message, type };
          return updated;
        }
        return [...prev, { id: toastId, message, type }];
      });

      if (!id) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 3000);
      }
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, id?: string) => addToast(message, "success", id),
    [addToast]
  );

  const danger = useCallback(
    (message: string, id?: string) => addToast(message, "danger", id),
    [addToast]
  );

  const warning = useCallback(
    (message: string, id?: string) => addToast(message, "warning", id),
    [addToast]
  );

  const info = useCallback(
    (message: string, id?: string) => addToast(message, "info", id),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, success, danger, warning, info, remove }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => remove(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const typeConfig = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: <CheckIcon className="w-5 h-5" />
    },
    danger: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: <AlertTriangleIcon className="w-5 h-5" />
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: <AlertTriangleIcon className="w-5 h-5" />
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: <CheckIcon className="w-5 h-5" />
    }
  };

  const config = typeConfig[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${config.bg} ${config.border} animate-in slide-up fade-in duration-200`}
    >
      <span className={config.text}>{config.icon}</span>
      <span className={`text-sm font-medium ${config.text}`}>
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        className={`ml-2 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${config.text}`}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
