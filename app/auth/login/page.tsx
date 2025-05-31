'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
