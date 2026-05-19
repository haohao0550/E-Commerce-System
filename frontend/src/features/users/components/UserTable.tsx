import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, ShieldAlert, RefreshCw, Trash2, ArrowUpRight } from 'lucide-react';
import type { User } from '@/features/users/types/user';
import { formatUserName } from '@/utils/format';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  activeUserId: string;
  onToggleRole: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

/**
 * UserTable Component
 * Renders user accounts list in a premium dashboard layout.
 * Toggles user states, roles, and provides shimmering skeleton blocks during loading.
 */
export const UserTable = ({
  users,
  isLoading,
  activeUserId,
  onToggleRole,
  onToggleStatus,
}: UserTableProps) => {
  const defaultAvatar = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop';

  // --- Shimmer Loading Skeletons ---
  if (isLoading) {
    return (
      <div className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl animate-pulse">
        <div className="bg-brand-primary h-14 w-full" />
        <div className="divide-y divide-surface-container-high">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-8 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-1/3">
                <div className="w-16 h-16 bg-surface-container rounded-full shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-6 bg-surface-container rounded w-3/4" />
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                </div>
              </div>
              <div className="h-5 bg-surface-container rounded w-28" />
              <div className="h-6 bg-surface-container rounded w-16" />
              <div className="h-8 bg-surface-container rounded w-24" />
              <div className="h-10 bg-surface-container rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Empty Users Block ---
  if (users.length === 0) {
    return (
      <div className="text-center py-24 bg-white border border-surface-container-highest rounded-2xl shadow-xl p-10">
        <p className="text-xl font-bold text-on-surface mb-2 uppercase tracking-wide">No users found</p>
        <p className="text-sm text-on-surface-variant/70 font-medium">Verify your filter settings to search again.</p>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-brand-primary text-brand-on-primary">
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">User Profile</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Phone</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Role</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Status</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-surface-container-high">
            <AnimatePresence>
              {users.map((user) => {
                const userAvatar = user.avatar || defaultAvatar;
                const status = user.isDeleted ? 'Deleted' : 'Active';
                const formattedName = formatUserName(user.name, user.email);

                return (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-surface-base/50 transition-colors cursor-pointer"
                  >
                    {/* User Info Column */}
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-full overflow-hidden shrink-0 border border-surface-container-highest transition-transform group-hover:scale-105 duration-500 shadow-sm ${user.isDeleted ? 'grayscale opacity-50' : ''}`}>
                          <img 
                            src={userAvatar} 
                            alt={formattedName} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-lg font-display font-bold text-on-surface leading-tight">{formattedName}</p>
                          <p className="text-xs font-semibold text-on-surface-variant/60 mt-1 lowercase font-mono">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone Column */}
                    <td className="py-5 px-8">
                      <span className="text-sm font-semibold text-on-surface-variant font-mono">{user.phone || '-'}</span>
                    </td>

                    {/* Role Badge Column */}
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-50 text-red-700 border-red-200 font-extrabold' 
                          : 'bg-surface-container text-on-surface-variant border-surface-container-high'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status Badge Column */}
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        status === 'Active' 
                          ? 'bg-brand-primary text-brand-on-primary border-brand-primary shadow-sm' 
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-white blink' : 'bg-red-500'}`} />
                        {status}
                      </span>
                    </td>

                    {/* Action Triggers Column */}
                    <td className="py-5 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        {/* Toggle Role Button */}
                        <button 
                          type="button"
                          disabled={activeUserId === user.id}
                          onClick={() => onToggleRole(user)}
                          className="bg-white border border-surface-container-highest py-2 px-4 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-1.5 text-xs font-extrabold text-on-surface shadow-sm disabled:opacity-40 cursor-pointer active:scale-95 shrink-0"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${activeUserId === user.id ? 'animate-spin' : ''}`} />
                          <span>{user.role === 'ADMIN' ? 'Demote' : 'Promote'}</span>
                        </button>

                        {/* Toggle Account Status Button */}
                        <button 
                          type="button"
                          disabled={activeUserId === user.id}
                          onClick={() => onToggleStatus(user)}
                          className={`p-2.5 rounded-xl transition-all disabled:opacity-40 cursor-pointer active:scale-90 border ${
                            user.isDeleted 
                              ? 'text-brand-primary hover:bg-surface-container border-surface-container-highest bg-white' 
                              : 'text-red-600 hover:bg-red-50 border-red-100 bg-red-50/20'
                          }`}
                        >
                          {user.isDeleted ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.section>
  );
};

