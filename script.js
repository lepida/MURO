// Esperar a que el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', function () {
  // Variables globales para los parámetros del muro
  let filas;
  let columnas;
  let lineasPorLadrillo;
  let agujerosPorLinea = [];

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let anchoLadrillo;
  let altoLadrillo;

  // Función para cargar parámetros desde el Local Storage
  function cargarParametros() {
    // Obtener valores del Local Storage
    const columnasGuardadas = localStorage.getItem('ladrillosHorizontales');
    const filasGuardadas = localStorage.getItem('ladrillosVerticales');
    const lineasPorLadrilloGuardadas = localStorage.getItem('lineasPorLadrillo');
    const agujerosPorLineaGuardadas = JSON.parse(localStorage.getItem('agujerosPorLinea'));
    const cantidadPuntosGuardada = localStorage.getItem('puntos');

    // Asignar valores a los inputs si existen
    if (columnasGuardadas !== null) {
      document.getElementById('ladrillosHorizontales').value = columnasGuardadas;
    }
    if (filasGuardadas !== null) {
      document.getElementById('ladrillosVerticales').value = filasGuardadas;
    }
    if (lineasPorLadrilloGuardadas !== null) {
      document.getElementById('lineasPorLadrillo').value = lineasPorLadrilloGuardadas;
    }
    if (cantidadPuntosGuardada !== null) {
      document.getElementById('puntos').value = cantidadPuntosGuardada;
    }

    // Si tenemos líneas de agujeros guardadas, las cargamos
    if (lineasPorLadrilloGuardadas !== null && agujerosPorLineaGuardadas !== null) {
      lineasPorLadrillo = parseInt(lineasPorLadrilloGuardadas);
      generarInputsAgujerosPorLinea();
      for (let i = 0; i < lineasPorLadrillo; i++) {
        document.getElementById(`agujerosLinea${i}`).value = agujerosPorLineaGuardadas[i];
      }
      actualizarAgujerosPorLinea();
    } else {
      // Si no hay valores guardados, generamos los inputs con valores por defecto
      lineasPorLadrillo = parseInt(document.getElementById('lineasPorLadrillo').value);
      generarInputsAgujerosPorLinea();
      actualizarAgujerosPorLinea();
    }
  }

  // Función para guardar parámetros en el Local Storage
  function guardarParametros() {
    // Guardar valores en el Local Storage
    localStorage.setItem('ladrillosHorizontales', document.getElementById('ladrillosHorizontales').value);
    localStorage.setItem('ladrillosVerticales', document.getElementById('ladrillosVerticales').value);
    localStorage.setItem('lineasPorLadrillo', document.getElementById('lineasPorLadrillo').value);
    localStorage.setItem('agujerosPorLinea', JSON.stringify(agujerosPorLinea));
    localStorage.setItem('puntos', document.getElementById('puntos').value);
  }

  // Función para generar inputs para el número de agujeros por línea
  function generarInputsAgujerosPorLinea() {
    const container = document.getElementById('lineaAgujerosInputs');
    container.innerHTML = ''; // Limpiar el contenido previo
    agujerosPorLinea = []; // Reiniciar el arreglo

    for (let i = 0; i < lineasPorLadrillo; i++) {
      const label = document.createElement('label');
      label.textContent = `Agujeros en la línea ${i + 1}: `;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '1';
      input.value = '5'; // Valor por defecto
      input.id = `agujerosLinea${i}`;

      // Agrega el evento para actualizar y guardar
      input.addEventListener('change', function() {
        actualizarAgujerosPorLinea();
        guardarParametros();
      });

      container.appendChild(label);
      container.appendChild(input);
      container.appendChild(document.createElement('br'));

      // Inicializar el arreglo con los valores por defecto
      agujerosPorLinea.push(parseInt(input.value));
    }
  }

  // Función para actualizar el arreglo de agujerosPorLinea
  function actualizarAgujerosPorLinea() {
    agujerosPorLinea = [];
    for (let i = 0; i < lineasPorLadrillo; i++) {
      const value = parseInt(document.getElementById(`agujerosLinea${i}`).value);
      agujerosPorLinea.push(value);
    }
    guardarParametros();
  }

  document.getElementById('actualizarLineas').addEventListener('click', function () {
    lineasPorLadrillo = parseInt(document.getElementById('lineasPorLadrillo').value);
    guardarParametros();
    generarInputsAgujerosPorLinea();
  });

  document.getElementById('generar').addEventListener('click', function () {
    // Obtener valores de los inputs
    columnas = parseInt(document.getElementById('ladrillosHorizontales').value);
    filas = parseInt(document.getElementById('ladrillosVerticales').value);
    lineasPorLadrillo = parseInt(document.getElementById('lineasPorLadrillo').value);
    actualizarAgujerosPorLinea(); // Asegurarnos de tener los últimos valores

    guardarParametros();

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

  // Agregar eventos de cambio a los inputs para guardar parámetros
  document.getElementById('ladrillosHorizontales').addEventListener('change', function() {
    guardarParametros();
  });
  document.getElementById('ladrillosVerticales').addEventListener('change', function() {
    guardarParametros();
  });
  document.getElementById('lineasPorLadrillo').addEventListener('change', function() {
    guardarParametros();
    generarInputsAgujerosPorLinea();
  });
  document.getElementById('puntos').addEventListener('change', function() {
    guardarParametros();
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

        for (let l = 0; l < lineasPorLadrillo; l++) {
          const numAgujeros = agujerosPorLinea[l];
          for (let a = 0; a < numAgujeros; a++) {
            const xAgujero = x + ((a + 1) * anchoLadrillo) / (numAgujeros + 1);
            const yAgujero = y + ((l + 1) * altoLadrillo) / (lineasPorLadrillo + 1);
            ctx.beginPath();
            ctx.arc(xAgujero, yAgujero, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

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
      for (let l = 0; l < lineasPorLadrillo; l++) {
        const numAgujeros = agujerosPorLinea[l];
        for (let a = 0; a < numAgujeros; a++) {
          // Calcular coordenadas del agujero
          const col = ladrillo % columnas;
          const filaLadrillo = Math.floor(ladrillo / columnas);
          const x =
            col * anchoLadrillo +
            ((a + 1) * anchoLadrillo) / (numAgujeros + 1);
          const y =
            filaLadrillo * altoLadrillo +
            ((l + 1) * altoLadrillo) / (lineasPorLadrillo + 1);

          // Calcular línea global del agujero
          const lineaGlobal = filaLadrillo * lineasPorLadrillo + l;

          // Crear objeto del agujero con información adicional
          agujeros.push({
            ladrillo,
            linea: l,
            agujero: a,
            x,
            y,
            columnaLadrillo: col,
            filaLadrillo: filaLadrillo,
            numeroAgujero: a + 1,
            numeroLinea: l + 1,
            lineaGlobal: lineaGlobal, // Añadimos la línea global
          });
        }
      }
    }

    // Ajustar la distancia mínima en función de la cantidad de puntos
    let distanciaMinima;
    if (cantidad >= 4) {
      distanciaMinima = 0.7 * Math.min(anchoLadrillo, altoLadrillo);
    } else {
      const factor = 5 - cantidad;
      distanciaMinima = (0.7 + 0.15 * factor) * Math.min(anchoLadrillo, altoLadrillo);
    }

    // Calcular el número de sectores
    let numeroSectores = 3;
    if (columnas > 6) {
      numeroSectores = Math.ceil(columnas / 2);
    }

    // Dividir los agujeros en sectores
    const sectores = dividirEnSectores(agujeros, numeroSectores);

    // Seleccionar puntos asegurando que provengan de sectores diferentes
    const seleccionados = [];
    const ladrillosUsados = new Set();
    const sectoresUsados = new Set();
    const lineasUsadas = new Set(); // Conjunto para rastrear las líneas de agujeros usadas

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

      const randomSectorObj =
        sectoresDisponibles[Math.floor(Math.random() * sectoresDisponibles.length)];
      const sector = randomSectorObj.sector;
      const indiceSector = randomSectorObj.indice;

      // Seleccionar un agujero aleatorio dentro del sector
      const index = Math.floor(Math.random() * sector.length);
      const candidato = sector[index];

      // Verificar que el ladrillo no ha sido usado, cumple la distancia mínima,
      // y que no se repite en la misma línea de agujeros
      if (
        !ladrillosUsados.has(candidato.ladrillo) &&
        cumpleDistancia(candidato, seleccionados, distanciaMinima) &&
        !lineasUsadas.has(candidato.lineaGlobal)
      ) {
        seleccionados.push(candidato);
        ladrillosUsados.add(candidato.ladrillo);
        sectoresUsados.add(indiceSector);
        lineasUsadas.add(candidato.lineaGlobal); // Marcar la línea de agujeros como usada
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

  // Iniciar la aplicación
  cargarParametros();

  columnas = parseInt(document.getElementById('ladrillosHorizontales').value);
  filas = parseInt(document.getElementById('ladrillosVerticales').value);
  lineasPorLadrillo = parseInt(document.getElementById('lineasPorLadrillo').value);

  anchoLadrillo = canvas.width / columnas;
  altoLadrillo = canvas.height / filas;

  generarMuro();
  const cantidadPuntos = parseInt(document.getElementById('puntos').value);
  const puntosSeleccionados = obtenerPuntosAleatorios(cantidadPuntos);
  dibujarPuntos(puntosSeleccionados);
});
