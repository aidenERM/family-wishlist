function buildPlan(deseosPendientes, totalDisponible, ahorroMensual) {
  const ordered = [...deseosPendientes].sort((a, b) => a.orden - b.orden);
  let acumulado = 0;
  const plan = [];

  for (const deseo of ordered) {
    acumulado += deseo.precio;
    const faltante = Math.max(0, acumulado - totalDisponible);
    const mesesFaltantes = faltante <= 0 ? 0 : ahorroMensual > 0 ? Math.ceil(faltante / ahorroMensual) : null;
    plan.push({
      articulo: deseo.articulo,
      precio: deseo.precio,
      acumulado,
      faltante,
      mesesFaltantes,
      alcanzaAhora: faltante <= 0,
    });
  }

  return plan;
}

module.exports = { buildPlan };
