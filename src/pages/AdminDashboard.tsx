import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../data/models/User';
import { UserRepository } from '../data/repositories/UserRepository';
import { useAuth } from '../context/AuthContext';

const roles: UserRole[] = ['admin', 'manager', 'cashier'];

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('cashier');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchUsers = async () => {
    setUsers(await UserRepository.getAllUsers());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await UserRepository.createUser(username, password, role);
      setUsername(''); setPassword(''); setRole('cashier');
      fetchUsers();
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await UserRepository.deleteUser(id, user?.id);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditRole(user.role);
  };

  const handleUpdate = async (id: number) => {
    await UserRepository.updateUser(id, { role: editRole });
    setEditingId(null);
    fetchUsers();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <form onSubmit={handleCreate} className="mb-8 flex gap-2 items-end">
        <div>
          <label className="block mb-1">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} className="border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block mb-1">Role</label>
          <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="border px-2 py-1 rounded">
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">
                {editingId === u.id ? (
                  <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)} className="border px-2 py-1 rounded">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  u.role
                )}
              </td>
              <td className="p-2 border">
                {editingId === u.id ? (
                  <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleUpdate(u.id)}>Save</button>
                ) : (
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(u)}>Edit</button>
                )}
                <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard; 