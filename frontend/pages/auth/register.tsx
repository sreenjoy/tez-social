import React from 'react';
import Head from 'next/head';
import RegisterForm from '../../components/RegisterForm';
import AuthLayout from '../../components/AuthLayout';

const Register = () => {
  return (
    <>
      <Head>
        <title>Create Account | Tez Social</title>
        <meta name="description" content="Create your Tez Social account" />
      </Head>
      <AuthLayout initialTab="signup">
        <RegisterForm />
      </AuthLayout>
    </>
  );
};

export default Register; 