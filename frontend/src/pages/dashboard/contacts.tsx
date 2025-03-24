import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Mock data for contacts
const MOCK_CONTACTS = [
  { id: '1', name: 'John Doe', username: '@johndoe', lastMessage: 'Hey, how are you?', lastActivity: '2 hours ago' },
  { id: '2', name: 'Jane Smith', username: '@janesmith', lastMessage: 'Can we meet tomorrow?', lastActivity: '5 hours ago' },
  { id: '3', name: 'Mike Johnson', username: '@mikej', lastMessage: 'Thanks for your help!', lastActivity: '1 day ago' },
  { id: '4', name: 'Sarah Williams', username: '@sarahw', lastMessage: "I'll send you the document later", lastActivity: '2 days ago' },
];

export default function ContactsPage() {
  const [contacts] = useState(MOCK_CONTACTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Contacts">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Telegram Contacts</h2>
          <button className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
            + Add Contact
          </button>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search contacts..."
            className="form-input w-full max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredContacts.length > 0 ? (
          <div className="space-y-4">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="card flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <p className="text-gray-500">{contact.username}</p>
                  <p className="text-sm text-gray-700 mt-1">{contact.lastMessage}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{contact.lastActivity}</p>
                  <div className="mt-2 space-x-2">
                    <button className="px-3 py-1 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">
                      Message
                    </button>
                    <button className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <h3 className="text-lg font-semibold text-gray-700">No contacts found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Try a different search term' : 'Connect to Telegram to import your contacts'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/telegram"
                className="mt-4 px-4 py-2 inline-block rounded-md bg-primary-600 text-white hover:bg-primary-700"
              >
                Connect to Telegram
              </Link>
            )}
          </div>
        )}
        
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold mb-3">Contact Management</h3>
          <p className="text-gray-600 mb-3">With Tez Social, you can:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Import contacts from Telegram</li>
            <li>Organize contacts with tags</li>
            <li>Add custom notes to each contact</li>
            <li>Track conversation history</li>
            <li>Set reminders for follow-ups</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
} 