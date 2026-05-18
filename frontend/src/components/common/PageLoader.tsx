interface PageLoaderProps {
  label?: string;
}

export const PageLoader = ({ label = 'Loading' }: PageLoaderProps) => {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6">
      <div className="grid w-full max-w-sm justify-items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#cacacb] border-t-[#111111]" />
        <p className="text-sm font-medium text-[#707072]">{label}</p>
        <div className="grid w-full gap-2">
          <span className="skeleton-line h-3 w-full" />
          <span className="skeleton-line h-3 w-4/5" />
          <span className="skeleton-line h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
};

