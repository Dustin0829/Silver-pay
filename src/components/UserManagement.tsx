import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { usePermissions } from './RoleBasedAccess';
import { supabase } from '../supabaseClient';
import Toast from './Toast';
import ConfirmationModal from './ConfirmationModal';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'agent' | 'encoder';
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { user, createUser, updateUserRole } = useAuth();
  const { canCreateUsers, canManageUsers, canDeleteUsers } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as 'admin' | 'moderator' | 'agent' | 'encoder'
  });

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'agent' as 'admin' | 'moderator' | 'agent' | 'encoder'
  });

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId: string | null; name?: string; email?: string }>({ open: false, userId: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setToast({ show: true, message: 'Failed to fetch users', type: 'error' });
        return;
      }

      // Check for and log any duplicate user_ids
      if (data) {
        const userCounts = data.reduce((acc: { [key: string]: number }, user) => {
          acc[user.user_id] = (acc[user.user_id] || 0) + 1;
          return acc;
        }, {});
        
        const duplicates = Object.entries(userCounts).filter(([_, count]) => count > 1);
        if (duplicates.length > 0) {
          console.warn('Found duplicate user profiles:', duplicates);
        }
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      setToast({ show: true, message: 'Unexpected error fetching users', type: 'error' });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await createUser(newUser);
      
      if (success) {
        setToast({ show: true, message: 'User created successfully!', type: 'success' });
        setShowCreateForm(false);
        setNewUser({ name: '', email: '', password: '', role: 'agent' });
        fetchUsers();
      } else {
        setToast({ show: true, message: 'Failed to create user', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setToast({ show: true, message: 'Error creating user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);

    try {
      const success = await updateUserRole(editingUser.user_id, editForm.role);
      
      if (success) {
        // Update the name in the profile
        const { error } = await supabase
          .from('user_profiles')
          .update({ name: editForm.name })
          .eq('user_id', editingUser.user_id);

        if (error) {
          console.error('Error updating user name:', error);
        }

        setToast({ show: true, message: 'User updated successfully!', type: 'success' });
        setEditingUser(null);
        setEditForm({ name: '', role: 'agent' });
        fetchUsers();
      } else {
        setToast({ show: true, message: 'Failed to update user', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setToast({ show: true, message: 'Error updating user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicateProfiles = async (userId: string) => {
    try {
      // Get all profiles for this user
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching profiles for cleanup:', error);
        return;
      }

      if (profiles && profiles.length > 1) {
        console.log(`Found ${profiles.length} profiles for user ${userId}, keeping the oldest one`);
        
        // Keep the first (oldest) profile, delete the rest
        const profilesToDelete = profiles.slice(1);
        
        for (const profile of profilesToDelete) {
          const { error: deleteError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', profile.id);
          
          if (deleteError) {
            console.error('Error deleting duplicate profile:', deleteError);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate profiles:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);

    try {
      console.log('Deleting user:', userId);
      
      // First, clean up any duplicate profiles for this user
      await cleanupDuplicateProfiles(userId);
      
      // Get the user's email for logging
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('user_id', userId)
        .maybeSingle();
      
      const userEmail = userData?.email || 'unknown';
      console.log('Deleting user directly with Supabase:', userEmail);

      // Delete ALL matching entries from user_profiles (in case of duplicates)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        setToast({ show: true, message: 'Failed to delete user profile', type: 'error' });
        return;
      }

      // Try to delete from auth.users (this requires admin privileges)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error('Error deleting auth user:', authError);
          // Don't fail here - the profile is already deleted
          setToast({ show: true, message: 'User profile deleted successfully. Auth user deletion may require admin privileges.', type: 'success' });
        } else {
          setToast({ show: true, message: 'User deleted successfully!', type: 'success' });
        }
      } catch (authError) {
        console.error('Auth deletion error (may be permission issue):', authError);
        setToast({ show: true, message: 'User profile deleted successfully. Auth user deletion may require admin privileges.', type: 'success' });
      }

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({ show: true, message: 'Error deleting user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role });
  };

  if (!canManageUsers()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        {canCreateUsers() && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </button>
        )}
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="agent">Agent</option>
                  <option value="encoder">Encoder</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Edit User</h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="agent">Agent</option>
                  <option value="encoder">Encoder</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((userProfile) => (
                <tr key={userProfile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{userProfile.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userProfile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      userProfile.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      userProfile.role === 'moderator' ? 'bg-orange-100 text-orange-800' :
                      userProfile.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {userProfile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(userProfile.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(userProfile)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {canDeleteUsers() && userProfile.user_id !== user?.id && (
                        <button
                          onClick={() => setDeleteModal({ open: true, userId: userProfile.user_id, name: userProfile.name, email: userProfile.email })}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, userId: null })}
        onConfirm={() => deleteModal.userId && handleDeleteUser(deleteModal.userId)}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.name || ''} ${deleteModal.email ? `(${deleteModal.email})` : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UserManagement; 