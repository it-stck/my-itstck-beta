"use client";

import { useState, useEffect, useCallback } from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastInput = Omit<Toast, "id">;

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastQueue: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastQueue]));
}

export function toast(input: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, duration: 4000, ...input };
  toastQueue = [...toastQueue, newToast];
  notifyListeners();

  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    notifyListeners();
  }, newToast.duration);

  return id;
}

export function dismissToast(id: string) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastQueue);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
}
