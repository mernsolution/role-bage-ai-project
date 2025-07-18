import React, { useState, useEffect } from "react";
import { User, Shield, Edit3, Eye } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, checkSession } from "../store/slices/slices";

// Import all the components
import DashboardHeader from '../components/DashboardHeader';
import UserInfoCard from '../components/UserInfoCard';
import RolePermissionsNotice from '../components/RolePermissionsNotice';
import NavigationTabs from '../components/NavigationTabs';
import SummaryList from '../components/SummaryList';
import UserManagementTable from '../components/UserManagementTable';
import AddSummaryModal from '../components/AddSummaryModal';
import EditSummaryModal from '../components/EditSummaryModal';
import LoadingState from '../components/LoadingState';
import NoUserState from '../components/NoUserState';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  
  // Check session on component mount
  // useEffect(() => {
  //   dispatch(checkSession());
  // }, [dispatch]);

  // State management
  const [summaries, setSummaries] = useState([

  ]);

  const [users, setUsers] = useState([
  
  ]);

  const [activeTab, setActiveTab] = useState("summaries");
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSummary, setNewSummary] = useState({ title: "", content: "", status: "draft" });

  // Permissions configuration
  const permissions = {
    user: {
      canViewOwnSummaries: true,
      canEditOwnSummaries: true,
      canDeleteOwnSummaries: true,
      canCreateSummaries: true,
      canViewAllSummaries: false,
      canEditAllSummaries: false, // Fixed: was true for user
      canManageUsers: false,
      canRechargeCredits: false
    },
    admin: {
      canViewOwnSummaries: true,
      canEditOwnSummaries: true,
      canDeleteOwnSummaries: true,
      canCreateSummaries: true,
      canViewAllSummaries: true,
      canEditAllSummaries: true,
      canManageUsers: true,
      canRechargeCredits: true
    },
    editor: {
      canViewOwnSummaries: true,
      canEditOwnSummaries: true,
      canDeleteOwnSummaries: true,
      canCreateSummaries: true,
      canViewAllSummaries: true,
      canEditAllSummaries: true,
      canManageUsers: false,
      canRechargeCredits: false
    },
    reviewer: {
      canViewOwnSummaries: true,
      canEditOwnSummaries: true,
      canDeleteOwnSummaries: true,
      canCreateSummaries: true,
      canViewAllSummaries: true,
      canEditAllSummaries: false,
      canManageUsers: false,
      canRechargeCredits: false
    }
  };

  // Utility functions
  const hasPermission = (permission) => {
    return user ? permissions[user.role]?.[permission] || false : false;
  };

  const getFilteredSummaries = () => {
    if (hasPermission('canViewAllSummaries')) {
      return summaries;
    }
    return summaries.filter(summary => summary.userId === user?.id);
  };

  const canEditSummary = (summary) => {
    if (summary.userId === user?.id) return true;
    return hasPermission('canEditAllSummaries');
  };

  const canDeleteSummary = (summary) => {
    console.log(summary)
    if (summary.userId === user?.id) return true;
    return hasPermission('canEditAllSummaries');
  };

  const getRoleColor = (role) => {
    const colors = {
      user: "bg-blue-100 text-blue-800",
      admin: "bg-red-100 text-red-800",
      editor: "bg-green-100 text-green-800",
      reviewer: "bg-yellow-100 text-yellow-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleIcon = (role) => {
    const icons = {
      user: <User className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />,
      editor: <Edit3 className="w-4 h-4" />,
      reviewer: <Eye className="w-4 h-4" />
    };
    return icons[role] || <User className="w-4 h-4" />;
  };

  const getUserNameById = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User ${userId}`;
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Event handlers
  const handleDeleteSummary = (id) => {
    console.log("hello id", id)
    const summary = summaries.find(s => s.id === id);
    if (canDeleteSummary(summary)) {
      setSummaries(summaries.filter(s => s.id !== id));
    }
  };

  const handleEditSummary = (summary) => {
    if (canEditSummary(summary)) {
      setEditingItem(summary);
    }
  };

  // Updated handleSaveSummary to handle both ID types (_id and id)
  const handleSaveSummary = (updatedSummary) => {
    setSummaries(prevSummaries => 
      prevSummaries.map(summary => {
        // Handle both _id (from MongoDB) and id (local state)
        const summaryId = summary._id || summary.id;
        const updatedId = updatedSummary._id || updatedSummary.id;
        
        if (summaryId === updatedId) {
          // Merge the updated data with existing summary
          return {
            ...summary,
            ...updatedSummary,
            // Ensure we keep the correct ID format
            id: summary.id || updatedSummary.id,
            _id: summary._id || updatedSummary._id
          };
        }
        return summary;
      })
    );
    setEditingItem(null);
  };

  const handleAddSummary = () => {
    if (hasPermission('canCreateSummaries')) {
      const newId = Math.max(...summaries.map(s => s.id)) + 1;
      const summaryToAdd = {
        id: newId,
        title: newSummary.title,
        content: newSummary.content,
        userId: user.id,
        createdAt: new Date().toISOString().split('T')[0],
        status: newSummary.status
      };
      setSummaries([...summaries, summaryToAdd]);
      setNewSummary({ title: "", content: "", status: "draft" });
      setShowAddForm(false);
    }
  };

  const handleDeleteUser = (userId) => {
    console.log(userId)
    if (hasPermission('canManageUsers')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleRechargeCredits = (userId, amount) => {
    if (hasPermission('canRechargeCredits')) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, credits: u.credits + amount } : u
      ));
    }
  };

  // Conditional rendering
  if (loading) {
    return <LoadingState />;
  }

  if (!isAuthenticated || !user) {
    return <NoUserState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user} 
        logout={handleLogout}  // Fixed: now properly defined
        getRoleColor={getRoleColor} 
        getRoleIcon={getRoleIcon} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <UserInfoCard user={user} />
        
        <RolePermissionsNotice userRole={user.role} />

        <div className="bg-white rounded-lg shadow mb-6">
          <NavigationTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            hasPermission={hasPermission} 
          />

          <div className="p-6">
            {activeTab === 'summaries' && (
              <SummaryList 
                summaries={getFilteredSummaries()}
                hasPermission={hasPermission}
                canEditSummary={canEditSummary}
                canDeleteSummary={canDeleteSummary}
                handleEditSummary={handleEditSummary}
                handleDeleteSummary={handleDeleteSummary}
                getUserNameById={getUserNameById}
                setShowAddForm={setShowAddForm}
              />
            )}

            {activeTab === 'users' && hasPermission('canManageUsers') && (
              <UserManagementTable 
                users={users}
                getRoleColor={getRoleColor}
                hasPermission={hasPermission}
                handleRechargeCredits={handleRechargeCredits}
                handleDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <AddSummaryModal 
          newSummary={newSummary}
          setNewSummary={setNewSummary}
          onAdd={handleAddSummary}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingItem && (
        <EditSummaryModal 
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onSave={handleSaveSummary}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
