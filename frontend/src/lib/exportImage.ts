import { formatMoney } from './format';
import type { Deseo } from '../types';

export function generarImagenResumen(total: number, pendientes: Deseo[]): Promise<Blob> {
  const width = 800;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(width * 0.35, height * 0.2, 0, width * 0.35, height * 0.2, width);
  gradient.addColorStop(0, '#2a3a7a');
  gradient.addColorStop(0.55, '#1a2456');
  gradient.addColorStop(1, '#0a0e27');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillText('Lista de deseos de la familia', 50, 90);

  ctx.fillStyle = '#e8ecff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('Total ahorrado', 50, 160);
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillStyle = '#22c55e';
  ctx.fillText(formatMoney(total), 50, 230);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Proximos en la lista:', 50, 300);

  let y = 350;
  const ordered = [...pendientes].sort((a, b) => a.orden - b.orden).slice(0, 8);
  for (const deseo of ordered) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(50, y - 40, width - 100, 70, 20);
    ctx.fill();

    ctx.fillStyle = '#e8ecff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(deseo.articulo, 75, y + 2);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '22px system-ui, sans-serif';
    const precioText = formatMoney(deseo.precio);
    const textWidth = ctx.measureText(precioText).width;
    ctx.fillText(precioText, width - 75 - textWidth, y + 2);

    y += 90;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), 50, height - 40);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('No se pudo generar la imagen'));
    }, 'image/png');
  });
}
