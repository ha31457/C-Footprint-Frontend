export const getAvatarUrl = (avatarKey, gender = 'Male', username = 'User') => {
  const rawName = username || avatarKey || 'User';

  // Compute a unique salt character (A-Z) from username string char codes
  const charSum = rawName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const saltChar = String.fromCharCode(65 + (charSum % 26));
  const uniqueSeed = `${rawName}_${saltChar}`;

  return `https://api.dicebear.com/10.x/initial-face/svg?seed=${encodeURIComponent(uniqueSeed)}`;
};
