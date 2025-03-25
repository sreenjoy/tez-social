import React from 'react';
import AuthLayout from '../../components/AuthLayout';
import RegisterForm from '../../components/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthLayout initialTab="signup">
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage; 