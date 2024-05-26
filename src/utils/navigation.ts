export function getNavigateBackPath(path: string): string | undefined {
  const parts = path.split('/');

  if (parts[1] != 'c') return;
  if (!parts[2].startsWith('0x')) return;
  if (!parts[3]) return;

  return `/c/${parts[2]}`;
}
