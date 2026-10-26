import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, type LucideIcon } from "lucide-react";

const buttonClassName =
  "min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1.5 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-180 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed";

type PageButtonProps = {
  label: string;
  icon: LucideIcon;
  disabled: boolean;
  onClick: () => void;
};

function PageButton({ label, icon: Icon, disabled, onClick }: PageButtonProps) {
  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationControls({ currentPage, totalPages, onPageChange, className = "" }: Props) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <PageButton label="最初のページ" icon={ChevronsLeft} disabled={isFirstPage} onClick={() => onPageChange(1)} />
      <PageButton
        label="前のページ"
        icon={ChevronLeft}
        disabled={isFirstPage}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      />
      <span className="text-xs text-gray-500 min-w-12 text-center font-medium">
        {currentPage} / {totalPages}
      </span>
      <PageButton
        label="次のページ"
        icon={ChevronRight}
        disabled={isLastPage}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      />
      <PageButton label="最後のページ" icon={ChevronsRight} disabled={isLastPage} onClick={() => onPageChange(totalPages)} />
    </div>
  );
}
