export function imageUrl(path: string): string {
  return `${import.meta.env.BASE_URL}images/${path}`;
}
