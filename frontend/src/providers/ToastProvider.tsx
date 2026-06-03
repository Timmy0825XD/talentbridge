'use client';

import { useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { registerToast } from '../lib/toast';

export default function ToastProvider() {
  const ref = useRef<Toast>(null!);
  useEffect(() => { registerToast(ref); }, []);
  return <Toast ref={ref} position="top-right" />;
}