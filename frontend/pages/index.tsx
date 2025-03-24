import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Tez Social</title>
        <meta name="description" content="Tez Social Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Tez Social
        </h1>
        <p className="mb-4">
          Your Telegram connection platform
        </p>
        <div className="mt-8">
          <a 
            href="/auth/login" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            Login
          </a>
          <a 
            href="/auth/register" 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Register
          </a>
        </div>
      </main>

      <footer className="flex justify-center items-center border-t border-gray-200 py-4 mt-8">
        <p>Powered by Tez</p>
      </footer>
    </div>
  );
} 