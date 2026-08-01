import confetti from 'canvas-confetti';

export function celebrar() {
  const colors = ['#22c55e', '#a78bfa', '#f472b6', '#f59e0b'];
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors, zIndex: 9999 });
  setTimeout(() => {
    confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 }, colors, zIndex: 9999 });
  }, 200);
}
