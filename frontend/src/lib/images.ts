export function imageUrl(path: string): string {
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${import.meta.env.BASE_URL}images/deseos/${path}`;
}
