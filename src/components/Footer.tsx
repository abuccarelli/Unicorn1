import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About EduConnect</h3>
            <p className="text-gray-400">Connecting students with expert teachers for personalized online learning experiences.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Find Teachers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Become a Teacher</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">How it Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@educonnect.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Fri 9am-6pm EST</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 EduConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}