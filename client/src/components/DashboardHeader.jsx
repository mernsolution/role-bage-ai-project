import React from 'react';
import { CreditCard, LogOut } from 'lucide-react';

const DashboardHeader = ({ user, logout, getRoleColor, getRoleIcon }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user.role === "user" && (<>
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Credits: {user.credits}</span>
              </>)}

            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="capitalize">{user.role}</span>
            </div>
            <span className="text-sm text-gray-700">{user.name}</span>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;