import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - Tez Social</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary-600">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="mt-2 text-lg text-gray-600">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-8 space-y-4">
            <Link 
              href="/"
              className="block w-full sm:w-auto sm:inline-block px-5 py-3 rounded-md bg-primary-600 text-white text-center font-medium hover:bg-primary-700"
            >
              Go back home
            </Link>
            
            <Link 
              href="/dashboard"
              className="block w-full sm:w-auto sm:inline-block sm:ml-4 px-5 py-3 rounded-md border border-gray-300 text-gray-700 text-center font-medium hover:bg-gray-50"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 