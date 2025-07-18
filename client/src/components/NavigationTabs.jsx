import React from 'react';

const NavigationTabs = ({ activeTab, setActiveTab, hasPermission }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'summaries'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Summaries
        </button>
        {hasPermission('canManageUsers') && (
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
        )}
      </nav>
    </div>
  );
};

export default NavigationTabs;