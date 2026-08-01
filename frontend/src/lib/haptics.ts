export function haptic(pattern: number | number[] = 15) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // algunos navegadores lanzan si se llama fuera de un gesto del usuario - ignorar
    }
  }
}
