import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Book, MessageSquare } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useConversations } from '../hooks/useConversations';
import { MyBookings } from './student/MyBookings';

function StudentDashboard() {
  const { profile } = useProfile();
  const { conversations, loading: conversationsLoading } = useConversations();

  const recentConversations = conversations.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <UserCircle className="h-12 w-12 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome, {profile?.firstName} {profile?.lastName}
              </h2>
              <Link to="/profile" className="text-indigo-600 hover:text-indigo-700">
                View or edit your profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                <Link 
                  to="/messages"
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : recentConversations.length > 0 ? (
                recentConversations.map(conversation => (
                  <Link
                    key={conversation.id}
                    to={`/messages/${conversation.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{conversation.otherPartyName}</p>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No messages yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>
              <Link 
                to="/student/bookings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                <Book className="h-4 w-4 mr-2" />
                View All Classes
              </Link>
            </div>
            <MyBookings />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;