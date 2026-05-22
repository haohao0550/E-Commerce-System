export const formatUserName = (name?: string | null, email?: string) => {
  return name?.trim() || email || 'Unknown user';
};

export const formatMoney = (
  amount: number | string,
  currency: 'VND' | 'vnd' = 'vnd'
) => {
  const value = Number(amount || 0);

  return `${new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value)} ${currency}`;
};

export const formatCompactMoney = (amount: number | string) => {
  const value = Number(amount || 0);

  if (Math.abs(value) >= 1_000_000) {
    return `${new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 1,
    }).format(value / 1_000_000)}tr`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0,
    }).format(value / 1_000)}K`;
  }

  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value);
};
