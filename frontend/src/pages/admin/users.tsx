import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { UserHeader } from '@/features/users/components/UserHeader';
import { UserFilters } from '@/features/users/components/UserFilters';
import { UserTable } from '@/features/users/components/UserTable';
import { UserPagination } from '@/features/users/components/UserPagination';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/features/users/services/user.service';
import { ROUTES } from '@/routes';
import type { User, UserRole } from '@/features/users/types/user';

/**
 * AdminUsersPage Component
 * Main orchestrator page for User Accounts directory within the Admin Panel.
 * Deconstructs logic into Sidebar, Header, Filters, Table, and Pagination.
 */
export default function AdminUsersPage() {
  const { user: currentAdmin, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // --- Users Directory State ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUserId, setActiveUserId] = useState('');

  // --- Filtering & Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const usersPerPage = 10;

  // --- Fetch Users Registry ---
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await userService.getUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        isDeleted: selectedStatus === '' ? undefined : selectedStatus === 'true',
      });

      if (response && response.users) {
        setUsers(response.users);
        setTotalUsers(response.pagination?.total || response.users.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      showToast('Failed to load user accounts from database', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentPage, searchQuery, selectedRole, selectedStatus, showToast]);

  // Refetch when filtering properties or page changes
  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Reset pagination to page 1 upon new search filters
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole | '');
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // --- Action Handlers ---
  const handleToggleRole = async (targetUser: User) => {
    // Prevent admin from demoting themselves!
    if (targetUser.id === currentAdmin?.id) {
      showToast('Demoting yourself is forbidden!', 'error');
      return;
    }

    try {
      setActiveUserId(targetUser.id);
      const nextRole: UserRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
      await userService.updateUserRole(targetUser.id, nextRole);
      
      showToast(
        `Successfully ${nextRole === 'ADMIN' ? 'promoted' : 'demoted'} ${targetUser.name || targetUser.email}!`, 
        'success'
      );
      void fetchUsers();
    } catch (err) {
      console.error('Error toggling user role:', err);
      showToast('Failed to change user authorization role', 'error');
    } finally {
      setActiveUserId('');
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    // Prevent admin from deleting themselves!
    if (targetUser.id === currentAdmin?.id) {
      showToast('Deleting yourself is forbidden!', 'error');
      return;
    }

    try {
      setActiveUserId(targetUser.id);
      if (targetUser.isDeleted) {
        await userService.restoreUser(targetUser.id);
        showToast(`Restored account ${targetUser.name || targetUser.email} successfully!`, 'success');
      } else {
        if (!window.confirm(`Are you sure you want to deactivate ${targetUser.name || targetUser.email}?`)) return;
        await userService.deleteUser(targetUser.id);
        showToast(`Deactivated account ${targetUser.name || targetUser.email}!`, 'success');
      }
      void fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      showToast('Failed to change user status', 'error');
    } finally {
      setActiveUserId('');
    }
  };

  const handleExport = () => {
    showToast('Exporting secured users registry spreadsheet...', 'success');
  };

  // --- Session Authorization Security Guard ---
  if (isAuthLoading) {
    return <PageLoader label="Validating administrator session" />;
  }

  if (currentAdmin?.role !== 'ADMIN') {
    return (
      <main className="page py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="page-title text-red-600">Admin access required</h1>
        <p className="page-subtitle text-center">Please authenticate with an admin account to manage details.</p>
        <Link className="pill-link bg-primary text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-base font-sans selection:bg-brand-primary selection:text-brand-on-primary">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace */}
      <main className="flex-1 ml-64 p-10 mx-auto w-full">
        {/* Dynamic Responsive User Header */}
        <UserHeader onExportClick={handleExport} />

        {/* Search and Dropdowns Filter Deck */}
        <UserFilters 
          search={searchQuery}
          onSearchChange={handleSearchChange}
          role={selectedRole}
          onRoleChange={handleRoleChange}
          isDeleted={selectedStatus}
          onStatusChange={handleStatusChange}
        />

        {/* Dynamic Secured Users Table */}
        <UserTable 
          users={users}
          isLoading={isLoadingUsers}
          activeUserId={activeUserId}
          onToggleRole={handleToggleRole}
          onToggleStatus={handleToggleStatus}
        />

        {/* Bottom Pagination Footnotes */}
        <UserPagination 
          currentPage={currentPage}
          totalUsers={totalUsers}
          usersPerPage={usersPerPage}
          onPrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNextPage={() => setCurrentPage((prev) => prev + 1)}
        />
      </main>

      {/* Dynamic Keyframes inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .blink {
          animation: blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}

