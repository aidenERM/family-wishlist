require('dotenv').config();
const mongoose = require('mongoose');
const Deseo = require('../src/models/Deseo');

const DETALLES = [
  {
    match: /camaras? de vigilancia/i,
    descripcion:
      'Camara WiFi para interiores con giro de 360 grados horizontal y 114 vertical, grabacion en HD 1080p y vision nocturna hasta 12 metros. Se controla desde el celular, envia alertas de movimiento y tiene microfono y altavoz para hablar a distancia. Util para vigilar la casa, a los ninos o a las mascotas.',
    imagenes: ['camaras/1.jpg', 'camaras/2.jpg', 'camaras/3.jpg'],
  },
  {
    match: /malla de seguridad/i,
    descripcion:
      'Malla resistente que se instala en barandas de balcones, terrazas o escaleras para evitar caidas o que ninos y mascotas pasen entre los barrotes. Se sujeta con amarres y es discreta, sin afectar la vista del balcon.',
    imagenes: ['malla/1.jpg', 'malla/2.jpg', 'malla/3.jpg'],
  },
  {
    match: /xiaomi h40/i,
    descripcion:
      'Robot aspiradora y trapeador Xiaomi con succion de 10.000 Pa, bateria de 5200 mAh y hasta 180 minutos de autonomia. Se acopla a una base que lo carga y limpia el trapero automaticamente, con tecnologia antienredos para cables y pelo de mascotas.',
    imagenes: ['aspiradora/1.png', 'aspiradora/2.jpg', 'aspiradora/3.jpg'],
  },
  {
    match: /sofa/i,
    descripcion:
      'Sofa de tres puestos con estilo moderno de mediados de siglo, asientos profundos y estructura reforzada. Tapizado de lino y lineas rectas, versatil para salas modernas o clasicas.',
    imagenes: ['sofa/1.jpg', 'sofa/2.jpg', 'sofa/3.jpg'],
  },
  {
    match: /^espejo$/i,
    descripcion:
      'Espejo decorativo redondo con marco de madera y acabado dorado, pensado para pared de sala, comedor o recibidor. Diseno moderno y minimalista que aporta luminosidad y amplitud visual.',
    imagenes: ['espejo/1.jpg', 'espejo/2.jpg', 'espejo/3.jpg'],
  },
  {
    match: /^tapete$/i,
    descripcion:
      'Tapete de sala de tamano mediano con diseno abstracto moderno en tonos blanco, gris y azul, base antideslizante. Suave al tacto y facil de limpiar, ideal bajo la mesa de centro o el sofa.',
    imagenes: ['tapete/1.jpg', 'tapete/2.jpg', 'tapete/3.jpg'],
  },
  {
    match: /cuadros decorativos/i,
    descripcion:
      'Set de tres cuadros de lienzo con formas abstractas modernas en blanco y gris, listos para colgar juntos como una composicion en la pared de la sala o el comedor.',
    imagenes: ['cuadros/1.jpg', 'cuadros/2.jpg', 'cuadros/3.jpg'],
  },
  {
    match: /^ps5/i,
    rename: 'PS5 Slim',
    descripcion:
      'Version rediseñada y mas compacta de la consola PlayStation 5, con unidad de disco, SSD ultrarrapido y soporte para graficos en 4K con trazado de rayos. Mas pequena y liviana que el modelo original, con el mismo desempeno de juego.',
    imagenes: ['ps5/1.jpg', 'ps5/2.jpg', 'ps5/3.jpg'],
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const deseos = await Deseo.find({ estado: 'pendiente' }).sort({ orden: 1, _id: 1 });
  let orden = 1;

  for (const deseo of deseos) {
    const detalle = DETALLES.find((d) => d.match.test(deseo.articulo));
    if (detalle) {
      if (detalle.rename) deseo.articulo = detalle.rename;
      deseo.descripcion = detalle.descripcion;
      deseo.imagenes = detalle.imagenes;
    }
    deseo.orden = orden++;
    await deseo.save();
    console.log(`updated: ${deseo.articulo} (orden ${deseo.orden})`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
