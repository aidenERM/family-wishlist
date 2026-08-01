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

function computeStatuses(deseosPendientes, totalDisponible, ahorroMensual) {
  const ordered = [...deseosPendientes].sort((a, b) => a.orden - b.orden);
  let acumulado = 0;
  const statuses = [];

  for (const deseo of ordered) {
    acumulado += deseo.precio;
    const faltante = acumulado - totalDisponible;
    let status;
    if (faltante <= 0) {
      status = 'verde';
    } else if (ahorroMensual > 0 && faltante / ahorroMensual < 1) {
      status = 'naranja';
    } else {
      status = 'rojo';
    }
    statuses.push({ _id: deseo._id.toString(), status });
  }

  return statuses;
}

module.exports = { buildPlan, computeStatuses };
