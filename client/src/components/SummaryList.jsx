import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import AddSummaryModal from './EditSummaryModal';
import SummaryCard from './SummaryCard';

import { fetchSummaries, deleteSummary } from '../store/slices/summarySlice';

const SummaryList = ({
  hasPermission,
  canEditSummary,
  canDeleteSummary,
  handleEditSummary,
  getUserNameById,
  setShowAddForm
}) => {
  const { user } = useSelector(state => state.auth);
  const { items: summaries, loading, error } = useSelector(state => state.summaries);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [newSummary, setNewSummary] = useState({
    title: '',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSummaries(user.id));
    }
  }, [user?.id, dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteSummary(id));
  };

  return (
    <div>
      {(user?.role === 'user') && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {hasPermission('canViewAllSummaries') ? 'All Summaries' : 'My Summaries'}
          </h2>

          {hasPermission('canCreateSummaries') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Summary</span>
            </button>
          )}
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4">
        {summaries && summaries.length > 0 ? (
          summaries.map(summary => (
            <SummaryCard
              key={summary.id || summary._id}
              summary={summary}
              canEdit={canEditSummary(summary)}
              canDelete={canDeleteSummary(summary)}
              onEdit={handleEditSummary}
              onDelete={handleDelete}
              getUserNameById={getUserNameById}
              hasPermission={hasPermission}
            />
          ))
        ) : (
          !loading && <p className="text-gray-500">No summaries found.</p>
        )}
      </div>

      {/* Add Summary Modal */}
      {showModal && (
        <AddSummaryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          summary={newSummary}
          setSummary={setNewSummary}
        />
      )}
    </div>
  );
};

export default SummaryList;
