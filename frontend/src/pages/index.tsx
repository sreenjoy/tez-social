import Link from 'next/link'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Tez Social - Connect with your audience</title>
        <meta name="description" content="Tez Social helps you manage your Telegram contacts and communications." />
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Tez Social</h1>
            <div className="flex gap-4">
              <Link href="/auth/login" className="px-4 py-2 rounded-md text-primary-600 border border-primary-600 hover:bg-primary-50">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                Register
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Connect with your audience on Telegram
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                Tez Social helps you manage your Telegram contacts and communications.
              </p>
              <div className="mt-8">
                <Link href="/auth/register" className="px-5 py-3 rounded-md bg-primary-600 text-white text-lg hover:bg-primary-700">
                  Get Started
                </Link>
              </div>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Manage Contacts</h3>
                <p className="text-gray-600">Organize your Telegram contacts with tags and custom notes.</p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Send Messages</h3>
                <p className="text-gray-600">Send personalized messages to your contacts directly from the platform.</p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Track Conversations</h3>
                <p className="text-gray-600">Keep track of all your conversations in one place.</p>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500">© {new Date().getFullYear()} Tez Social. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
} 