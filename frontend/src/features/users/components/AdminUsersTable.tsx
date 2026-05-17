'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusMessage } from '@/components/common/StatusMessage';
import { userService } from '@/features/users/services/user.service';
import { formatUserName } from '@/utils/format';
import type { User, UserRole } from '@/types/user';
import { useToast } from '@/contexts/ToastContext';

export const AdminUsersTable = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isDeleted, setIsDeleted] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await userService.getUsers({
        limit: 20,
        search: search || undefined,
        role: role || undefined,
        isDeleted: isDeleted === '' ? undefined : isDeleted === 'true',
      });
      setUsers(data.users);
    } catch {
      setError('Cannot load users. Make sure your account has ADMIN role.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadUsers();
  };

  const updateRole = async (user: User) => {
    try {
      setActiveUserId(user.id);
      await userService.updateUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN');
      showToast('User role updated', 'success');
      await loadUsers();
    } catch {
      showToast('Cannot update user role', 'error');
    } finally {
      setActiveUserId('');
    }
  };

  const toggleDeleted = async (user: User) => {
    try {
      setActiveUserId(user.id);
      if (user.isDeleted) {
        await userService.restoreUser(user.id);
        showToast('User restored', 'success');
      } else {
        await userService.deleteUser(user.id);
        showToast('User deleted', 'success');
      }
      await loadUsers();
    } catch {
      showToast('Cannot update user status', 'error');
    } finally {
      setActiveUserId('');
    }
  };

  if (isLoading) {
    return <p className="muted">Loading users...</p>;
  }

  return (
    <section className="table-panel">
      <form className="mb-6 grid gap-3 md:grid-cols-[1fr_160px_160px_auto]" onSubmit={handleFilter}>
        <Input
          label="Search"
          name="search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Email, name, phone"
        />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#111111]">Role</span>
          <select
            className="min-h-11 rounded-full border border-transparent bg-[#f5f5f5] px-4 py-2.5"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole | '')}
          >
            <option value="">All</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#111111]">Status</span>
          <select
            className="min-h-11 rounded-full border border-transparent bg-[#f5f5f5] px-4 py-2.5"
            value={isDeleted}
            onChange={(event) => setIsDeleted(event.target.value)}
          >
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Deleted</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </div>
      </form>
      <StatusMessage message={error} tone="error" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{formatUserName(user.name, user.email)}</strong>
                  <span>{user.email}</span>
                </td>
                <td>{user.phone || '-'}</td>
                <td>{user.role}</td>
                <td>{user.isDeleted ? 'Deleted' : 'Active'}</td>
                <td className="table-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={activeUserId === user.id}
                    onClick={() => void updateRole(user)}
                  >
                    {activeUserId === user.id ? 'Updating...' : 'Toggle role'}
                  </Button>
                  <Button
                    type="button"
                    variant={user.isDeleted ? 'secondary' : 'danger'}
                    disabled={activeUserId === user.id}
                    onClick={() => void toggleDeleted(user)}
                  >
                    {activeUserId === user.id ? 'Working...' : user.isDeleted ? 'Restore' : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
