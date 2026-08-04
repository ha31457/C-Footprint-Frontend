import apiClient from '../api/apiClient';

export const getAvatarUrl = (avatarUrl, avatarKey, gender = 'Male', username = 'User') => {
  if (avatarUrl) {
    const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
    if (avatarUrl.startsWith('/api')) {
      return `${baseUrl}${avatarUrl}`;
    }
    return avatarUrl;
  }

  const rawName = username || avatarKey || 'User';

  // Compute a unique salt character (A-Z) from username string char codes
  const charSum = rawName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const saltChar = String.fromCharCode(65 + (charSum % 26));
  const uniqueSeed = `${rawName}_${saltChar}`;

  return `https://api.dicebear.com/10.x/sprouts/svg?seed=${encodeURIComponent(uniqueSeed)}`;
};
