import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserPaginationProps {
  currentPage: number;
  totalUsers: number;
  usersPerPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

/**
 * UserPagination Component
 * Responsive pagination footers specifically designed for the admin users directory.
 */
export const UserPagination = ({
  currentPage,
  totalUsers,
  usersPerPage,
  onPrevPage,
  onNextPage,
}: UserPaginationProps) => {
  const startItem = (currentPage - 1) * usersPerPage + 1;
  const endItem = Math.min(currentPage * usersPerPage, totalUsers);
  const totalPages = Math.ceil(totalUsers / usersPerPage) || 1;

  return (
    <footer className="px-8 py-5 border-t border-surface-container-high bg-surface-container-low flex items-center justify-between">
      <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
        Showing {totalUsers === 0 ? 0 : startItem} to {endItem} of {totalUsers} accounts
      </p>
      <div className="flex items-center gap-2">
        <button 
          type="button"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-surface-container-highest text-on-surface hover:bg-surface-container disabled:opacity-30 transition-all shadow-sm bg-white active:scale-90 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-surface-container-highest text-on-surface hover:bg-surface-container disabled:opacity-30 transition-all shadow-sm bg-white active:scale-90 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};

