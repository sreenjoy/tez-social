import React, { useEffect, useState } from 'react';

const GoogleDebugPage = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testGoogleAuth = async () => {
    setStatus('loading');
    setMessage('Redirecting to Google OAuth...');
    
    // Open Google OAuth in a new window
    window.open('https://tez-social-production.up.railway.app/api/auth/google', '_blank');
  };

  useEffect(() => {
    // Display environment info
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    setMessage(`Current API URL: ${apiUrl || 'Not set'}. Using production endpoint.`);
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Google OAuth Debug</h1>
        
        <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
          <h2 className="font-bold text-blue-800">Important Information</h2>
          <p className="text-blue-700">
            To fix the Google OAuth "redirect_uri_mismatch" error, you need to update the authorized redirect URIs
            in your Google Cloud Console project.
          </p>
        </div>
        
        <p className="mb-4">
          The following URI must be added to the list of authorized redirect URIs in your Google Cloud Console:
        </p>
        
        <div className="bg-gray-100 p-3 rounded mb-6 border border-gray-300 break-all">
          <code>https://tez-social-production.up.railway.app/api/auth/google/callback</code>
        </div>
        
        <p className="mb-4">
          Steps to fix in Google Cloud Console:
        </p>
        
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console Credentials</a></li>
          <li>Find your OAuth 2.0 Client ID for this project (Client ID: 559553261529-3v55f17t9mu5hqhbbehlv2a2j56aia8n.apps.googleusercontent.com)</li>
          <li>Click "Edit" on the client</li>
          <li>Under "Authorized redirect URIs", add the exact URL shown above</li>
          <li>Ensure there are no trailing slashes or extra characters</li>
          <li>Click "Save"</li>
          <li>Wait 5-10 minutes for the changes to propagate through Google's systems</li>
        </ol>
        
        <div className="bg-yellow-50 p-4 rounded mb-6 border border-yellow-200">
          <h2 className="font-bold text-yellow-800">Common Issues</h2>
          <ul className="list-disc pl-6 text-yellow-700">
            <li>Mismatch in http vs https</li>
            <li>Missing or extra slashes at the end of the URL</li>
            <li>Incorrect port numbers</li>
            <li>Typographical errors in the domain or path</li>
            <li>Forgetting to include the global prefix 'api' in the path</li>
          </ul>
        </div>
        
        <p className="mb-6">{message}</p>
        
        <div className="flex justify-center">
          <button 
            onClick={testGoogleAuth}
            disabled={status === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {status === 'loading' ? 'Loading...' : 'Test Google OAuth'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDebugPage; 