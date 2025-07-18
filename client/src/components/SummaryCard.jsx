import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const SummaryCard = ({ 
  summary, 
  canEdit, 
  canDelete, 
  onEdit, 
  onDelete, 
  getUserNameById, 
  hasPermission 
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{summary.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{summary.content}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Created: {summary.createdAt}</span>
            <span>Total Word: {summary.wordCount}</span>
            <span>Status: {summary.status}</span>
            {hasPermission('canViewAllSummaries') && (
              <span>Author: {getUserNameById(summary.userId)}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          {canEdit && (
            <button
              onClick={() => onEdit(summary)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Edit summary"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(summary._id)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete summary"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;

