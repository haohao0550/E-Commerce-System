interface StatusMessageProps {
  message?: string;
  tone?: 'success' | 'error' | 'info';
}

export const StatusMessage = ({ message, tone = 'info' }: StatusMessageProps) => {
  if (!message) return null;

  const tones = {
    success: 'text-[#007d48]',
    error: 'text-[#d30005]',
    info: 'text-[#707072]',
  };

  return <p className={`rounded-full px-4 py-2.5 text-sm font-medium ${tones[tone]}`}>{message}</p>;
};

