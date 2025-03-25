import React from 'react';
import Head from 'next/head';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

export default function Home() {
  return (
    <AuthLayout initialTab="signin">
      <LoginForm />
    </AuthLayout>
  );
} 