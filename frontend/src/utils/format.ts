export const formatUserName = (name?: string | null, email?: string) => {
  return name?.trim() || email || 'Unknown user';
};

export const formatMoney = (
  amount: number | string,
  currency: 'VND' | 'đ' = 'đ'
) => {
  const value = Number(amount || 0);

  return `${value.toLocaleString('vi-VN')} ${currency}`;
};
