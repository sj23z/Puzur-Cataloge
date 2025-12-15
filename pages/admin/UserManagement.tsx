import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { MockAPI } from '../../services/mockDb';
import { Button, Input, Modal, Badge } from '../../components/UI';
import { v4 as uuidv4 } from 'uuid';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [password, setPassword] = useState('');

  const loadUsers = () => MockAPI.getUsers().then(setUsers);
  useEffect(() => { loadUsers(); }, []);

  const handleSave = async () => {
    if (!editingUser.username || !editingUser.fullName) return;

    const newUser: User = {
      id: editingUser.id || uuidv4(),
      username: editingUser.username,
      fullName: editingUser.fullName,
      role: editingUser.role || UserRole.USER,
      clinicName: editingUser.clinicName || '',
      discountTier: editingUser.discountTier || 1,
      isActive: editingUser.isActive ?? true,
      accessExpiresAt: editingUser.accessExpiresAt,
    };

    await MockAPI.saveUser({ ...newUser, ...(password ? { password } : {}) });
    setIsModalOpen(false);
    loadUsers();
  };

  const openNew = () => {
    setEditingUser({ role: UserRole.USER, discountTier: 1, isActive: true });
    setPassword('');
    setIsModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setPassword('');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <Button onClick={openNew} size="sm">+ Add User</Button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{u.fullName}</div>
                    <div className="text-sm text-slate-500">{u.username} • {u.clinicName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {Math.round((1 - u.discountTier) * 100)}% Off
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <Badge color={u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                       {u.isActive ? 'Active' : 'Inactive'}
                     </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEdit(u)} className="text-teal-600 hover:text-teal-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser.id ? 'Edit User' : 'Create User'}>
        <div className="space-y-4">
           <Input label="Full Name" value={editingUser.fullName || ''} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} />
           <Input label="Username" value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
           <Input label="Clinic Name" value={editingUser.clinicName || ''} onChange={e => setEditingUser({...editingUser, clinicName: e.target.value})} />
           
           <Input 
             type="password" 
             label={editingUser.id ? "New Password (leave blank to keep)" : "Password"} 
             value={password} 
             onChange={e => setPassword(e.target.value)} 
           />

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
               <select 
                 className="w-full border border-slate-300 rounded-lg p-3 text-base sm:text-sm bg-white"
                 value={editingUser.role} 
                 onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
               >
                 <option value={UserRole.USER}>User</option>
                 <option value={UserRole.ADMIN}>Admin</option>
               </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pricing Tier (Multiplier)</label>
                <input 
                  type="number" step="0.05" max="1" min="0.1"
                  className="w-full border border-slate-300 rounded-lg p-3 text-base sm:text-sm"
                  value={editingUser.discountTier}
                  onChange={e => setEditingUser({...editingUser, discountTier: parseFloat(e.target.value)})}
                />
                <span className="text-xs text-slate-400">0.9 = 10% discount</span>
             </div>
           </div>
           
           <div className="flex items-center gap-2 mt-2">
             <input 
               type="checkbox" 
               checked={editingUser.isActive} 
               onChange={e => setEditingUser({...editingUser, isActive: e.target.checked})}
               className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
             />
             <label className="text-sm text-slate-700">Account Active</label>
           </div>
           
           <div className="pt-4 flex gap-3">
             <Button className="flex-1" onClick={handleSave}>Save User</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;