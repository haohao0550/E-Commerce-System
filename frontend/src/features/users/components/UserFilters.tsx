import { Search, ChevronDown } from 'lucide-react';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  isDeleted: string;
  onStatusChange: (value: string) => void;
}

/**
 * UserFilters Component
 * Advanced search filters for the administrator users collection panel.
 */
export const UserFilters = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  isDeleted,
  onStatusChange,
}: UserFiltersProps) => {
  return (
    <section className="bg-surface-container border border-surface-container-highest rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
      {/* Search Bar Input */}
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-brand-primary transition-colors w-5 h-5" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full bg-white border border-surface-container-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all outline-none py-3 pl-12 pr-4 rounded-lg shadow-sm placeholder:text-on-surface-variant/50 text-sm text-on-surface"
        />
      </div>

      {/* Select Dropdown Filters */}
      <div className="flex gap-3 w-full md:w-auto">
        {/* Role Selection */}
        <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3">
          <select 
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer"
          >
            <option value="">Role: All</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
        </div>

        {/* Status Selection */}
        <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3">
          <select 
            value={isDeleted}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer"
          >
            <option value="">Status: All</option>
            <option value="false">Active</option>
            <option value="true">Deleted</option>
          </select>
          <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
        </div>
      </div>
    </section>
  );
};

