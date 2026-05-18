export const formatUserName = (name?: string | null, email?: string) => {
  return name?.trim() || email || 'Unknown user';
};

