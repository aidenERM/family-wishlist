const KEY = 'wishlist_quien_soy';

export function getIdentity(): string {
  return localStorage.getItem(KEY) || '';
}

export function setIdentity(nombre: string) {
  if (nombre) localStorage.setItem(KEY, nombre);
  else localStorage.removeItem(KEY);
}
