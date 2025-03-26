import React from 'react';
import Head from 'next/head';
import LoginForm from '../../components/LoginForm';
import AuthLayout from '../../components/AuthLayout';

const Login = () => {
  return (
    <>
      <Head>
        <title>Sign In | Tez Social</title>
        <meta name="description" content="Sign in to your Tez Social account" />
      </Head>
      <AuthLayout initialTab="signin">
        <LoginForm />
      </AuthLayout>
    </>
  );
};

export default Login; 