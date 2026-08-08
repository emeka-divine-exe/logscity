const PLATFORM_URL_BUILDERS: Record<string, (username: string) => string> = {
  facebook: (username) => `https://facebook.com/${username}`,
  instagram: (username) => `https://instagram.com/${username}`,
  twitter: (username) => `https://x.com/${username}`,
  x: (username) => `https://x.com/${username}`,
  tiktok: (username) => `https://tiktok.com/@${username.replace(/^@/, '')}`,
};

export function buildProfileUrl(platform: string, username: string | null | undefined): string | null {
  if (!username) return null;
  const builder = PLATFORM_URL_BUILDERS[platform.toLowerCase()];
  if (!builder) return null;
  return builder(username.trim());
}
