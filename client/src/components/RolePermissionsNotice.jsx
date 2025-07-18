import React from 'react';
import { AlertCircle } from 'lucide-react';

const RolePermissionsNotice = ({ userRole }) => {
  const getPermissionText = (role) => {
    switch (role) {
      case 'user':
        return "You can only manage your own summaries.";
      case 'admin':
        return "You can manage all users, recharge credits, and edit all summaries.";
      case 'editor':
        return "You can edit and delete any summary.";
      case 'reviewer':
        return "You can view all summaries but only edit your own.";
      default:
        return "Unknown role permissions.";
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-blue-900">Role Permissions</h4>
      </div>
      <p className="text-sm text-blue-700 mt-2">
        {getPermissionText(userRole)}
      </p>
    </div>
  );
};

export default RolePermissionsNotice;