import React from 'react';
import AuthLayout from '../../components/AuthLayout';
import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout initialTab="signup">
      <RegisterForm />
    </AuthLayout>
  );
} 