import { RefObject } from 'react';
import { Toast } from 'primereact/toast';

let toastRef: RefObject<Toast | null> | null = null;  // ← Toast | null

export function registerToast(ref: RefObject<Toast | null>) {
  toastRef = ref;
}

export const toast = {
  success: (detail: string, summary = 'Éxito') =>
    toastRef?.current?.show({ severity: 'success', summary, detail, life: 3500 }),
  error: (detail: string, summary = 'Error') =>
    toastRef?.current?.show({ severity: 'error', summary, detail, life: 4000 }),
  warn: (detail: string, summary = 'Atención') =>
    toastRef?.current?.show({ severity: 'warn', summary, detail, life: 3500 }),
  info: (detail: string, summary = 'Info') =>
    toastRef?.current?.show({ severity: 'info', summary, detail, life: 3000 }),
};