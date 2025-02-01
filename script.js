// Variables globales para los parámetros del muro
let filas;
let columnas;
const filasAgujeros = 3;
const agujerosPorFila = [9, 8, 9]; // Superior, media, inferior

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let anchoLadrillo;
let altoLadrillo;

document.getElementById('generar').addEventListener('click', function () {
  // Obtener valores de los inputs
  columnas = parseInt(document.getElementById('ladrillosHorizontales').value);
  filas = parseInt(document.getElementById('ladrillosVerticales').value);
  const cantidadPuntos = parseInt(document.getElementById('puntos').value);

  if (cantidadPuntos >= 1 && cantidadPuntos <= 10) {
    // Recalcular dimensiones de los ladrillos
    anchoLadrillo = canvas.width / columnas;
    altoLadrillo = canvas.height / filas;

    generarMuro();
    const puntosSeleccionados = obtenerPuntosAleatorios(cantidadPuntos);
    dibujarPuntos(puntosSeleccionados);
  } else {
    alert('Por favor, ingrese un número de puntos entre 1 y 10.');
  }
});

function generarMuro() {
  // Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Crear un patrón de ladrillo con degradado
  const patronCanvas = document.createElement('canvas');
  patronCanvas.width = anchoLadrillo;
  patronCanvas.height = altoLadrillo;
  const patronContext = patronCanvas.getContext('2d');

  // Dibujar ladrillo con degradado
  const gradiente = patronContext.createLinearGradient(0, 0, anchoLadrillo, altoLadrillo);
  gradiente.addColorStop(0, '#B22222'); // Rojo ladrillo
  gradiente.addColorStop(1, '#8B0000'); // Rojo ladrillo más oscuro
  patronContext.fillStyle = gradiente;
  patronContext.fillRect(0, 0, anchoLadrillo, altoLadrillo);

  // Dibujar líneas del ladrillo
  patronContext.strokeStyle = '#000000'; // Contorno negro
  patronContext.lineWidth = 1;
  patronContext.strokeRect(0, 0, anchoLadrillo, altoLadrillo);

  // Crear el patrón
  const patron = ctx.createPattern(patronCanvas, 'repeat');

  // Usar el patrón para rellenar el muro
  ctx.fillStyle = patron;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar líneas horizontales del mortero
  ctx.strokeStyle = '#CCCCCC'; // Color del mortero
  ctx.lineWidth = 2; // Grosor de las líneas del mortero

  for (let i = 0; i <= filas; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * altoLadrillo);
    ctx.lineTo(canvas.width, i * altoLadrillo);
    ctx.stroke();
  }

  // Dibujar líneas verticales del mortero
  for (let i = 0; i <= columnas; i++) {
    ctx.beginPath();
    ctx.moveTo(i * anchoLadrillo, 0);
    ctx.lineTo(i * anchoLadrillo, canvas.height);
    ctx.stroke();
  }

  // Dibujar agujeros en cada ladrillo
  ctx.fillStyle = 'black';
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const x = col * anchoLadrillo;
      const y = fila * altoLadrillo;

      for (let f = 0; f < filasAgujeros; f++) {
        const numAgujeros = agujerosPorFila[f];
        for (let a = 0; a < numAgujeros; a++) {
          const xAgujero = x + ((a + 1) * anchoLadrillo) / (numAgujeros + 1);
          const yAgujero = y + ((f + 1) * altoLadrillo) / (filasAgujeros + 1);
          ctx.beginPath();
          ctx.arc(xAgujero, yAgujero, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

// Resto del código permanece igual...

// Función para dividir los agujeros en sectores
function dividirEnSectores(agujeros, numeroSectores) {
  const sectores = [];
  for (let i = 0; i < numeroSectores; i++) {
    sectores.push([]);
  }

  agujeros.forEach((agujero) => {
    const col = agujero.columnaLadrillo; // Columna del ladrillo
    const sectorAncho = columnas / numeroSectores;
    const indiceSector = Math.floor(col / sectorAncho);
    sectores[Math.min(indiceSector, numeroSectores - 1)].push(agujero);
  });

  return sectores;
}

function obtenerPuntosAleatorios(cantidad) {
  // Generar lista de todos los agujeros posibles
  const totalLadrillos = filas * columnas;
  const agujeros = [];
  for (let ladrillo = 0; ladrillo < totalLadrillos; ladrillo++) {
    for (let f = 0; f < filasAgujeros; f++) {
      const numAgujeros = agujerosPorFila[f];
      for (let a = 0; a < numAgujeros; a++) {
        // Calcular coordenadas del agujero
        const col = ladrillo % columnas;
        const filaLadrillo = Math.floor(ladrillo / columnas);
        const x = col * anchoLadrillo + ((a + 1) * anchoLadrillo) / (numAgujeros + 1);
        const y = filaLadrillo * altoLadrillo + ((f + 1) * altoLadrillo) / (filasAgujeros + 1);

        // Crear objeto del agujero con información adicional
        agujeros.push({
          ladrillo,
          fila: f,
          agujero: a,
          x,
          y,
          columnaLadrillo: col,
          numeroAgujero: a + 1,
          numeroFila: f + 1,
        });
      }
    }
  }

  // Ajustar la distancia mínima en función de la cantidad de puntos
  let distanciaMinima;

  if (cantidad >= 4) {
    distanciaMinima = 0.7 * Math.min(anchoLadrillo, altoLadrillo);
  } else {
    // Aumentar la distancia mínima cuando la cantidad es menor a 4
    const factor = 5 - cantidad; // Cuanto menor es la cantidad, mayor es el factor
    distanciaMinima = (0.7 + 0.15 * factor) * Math.min(anchoLadrillo, altoLadrillo);
  }

  // Calcular el número de sectores
  let numeroSectores = 3; // Valor mínimo de sectores
  if (columnas > 6) {
    numeroSectores = Math.ceil(columnas / 2);
  }

  // Dividir los agujeros en sectores
  const sectores = dividirEnSectores(agujeros, numeroSectores);

  // Seleccionar puntos asegurando que provengan de sectores diferentes
  const seleccionados = [];
  const ladrillosUsados = new Set();
  const sectoresUsados = new Set();

  while (seleccionados.length < cantidad && sectores.some((s) => s.length > 0)) {
    // Elegir un sector no vacío y no usado
    const sectoresDisponibles = sectores
      .map((s, index) => ({ sector: s, indice: index }))
      .filter((s) => s.sector.length > 0 && !sectoresUsados.has(s.indice));
    if (sectoresDisponibles.length === 0) {
      // Si todos los sectores han sido usados, permitir reutilizarlos
      sectoresUsados.clear();
      continue;
    }
    const randomSectorObj = sectoresDisponibles[Math.floor(Math.random() * sectoresDisponibles.length)];
    const sector = randomSectorObj.sector;
    const indiceSector = randomSectorObj.indice;

    // Seleccionar un agujero aleatorio dentro del sector
    const index = Math.floor(Math.random() * sector.length);
    const candidato = sector[index];

    // Verificar que el ladrillo no ha sido usado y que mantiene la distancia mínima
    if (
      !ladrillosUsados.has(candidato.ladrillo) &&
      cumpleDistancia(candidato, seleccionados, distanciaMinima)
    ) {
      seleccionados.push(candidato);
      ladrillosUsados.add(candidato.ladrillo);
      sectoresUsados.add(indiceSector);
    }

    // Eliminar el candidato de la lista
    sector.splice(index, 1);
  }

  return seleccionados;
}

// Función para verificar si un candidato cumple con la distancia mínima respecto a los puntos seleccionados
function cumpleDistancia(candidato, seleccionados, distanciaMinima) {
  for (const punto of seleccionados) {
    if (distancia(candidato, punto) < distanciaMinima) {
      return false;
    }
  }
  return true;
}

// Función para calcular la distancia entre dos puntos
function distancia(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function dibujarPuntos(puntos) {
  puntos.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Configurar estilo del texto
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dibujar el número del agujero en el punto
    ctx.fillText(p.numeroAgujero, p.x, p.y);
  });
}

// Generar el muro inicial cuando la página carga
window.onload = function () {
  columnas = parseInt(document.getElementById('ladrillosHorizontales').value);
  filas = parseInt(document.getElementById('ladrillosVerticales').value);
  anchoLadrillo = canvas.width / columnas;
  altoLadrillo = canvas.height / filas;

  generarMuro();
  const cantidadPuntos = parseInt(document.getElementById('puntos').value);
  const puntosSeleccionados = obtenerPuntosAleatorios(cantidadPuntos);
  dibujarPuntos(puntosSeleccionados);
};
