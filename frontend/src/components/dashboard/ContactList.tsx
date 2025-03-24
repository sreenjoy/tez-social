'use client';

import { useState } from 'react';

// Mock data for contacts
const mockContacts = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    phoneNumber: '+12345678901',
    lastMessage: 'Hey, how are you doing?',
    lastMessageDate: '2023-03-24T10:30:00.000Z',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    phoneNumber: '+12345678902',
    lastMessage: "Let me know when you're available",
    lastMessageDate: '2023-03-23T15:45:00.000Z',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Alex Johnson',
    username: 'alexj',
    phoneNumber: '+12345678903',
    lastMessage: 'Thanks for your help!',
    lastMessageDate: '2023-03-22T09:15:00.000Z',
    unreadCount: 1,
  },
];

export default function ContactList() {
  const [contacts] = useState(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phoneNumber.includes(searchTerm)
  );

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If yesterday, show "Yesterday"
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Otherwise show date
    else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="divide-y">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <span className="text-primary-700 font-medium">
                      {contact.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                    <p className="text-xs text-gray-500">@{contact.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {formatDate(contact.lastMessageDate)}
                  </span>
                  {contact.unreadCount > 0 && (
                    <div className="mt-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                      {contact.unreadCount}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 truncate">
                {contact.lastMessage}
              </p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
} 