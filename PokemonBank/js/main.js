// ========================================================
// USUARIO BASE
// ========================================================
// Aquí se crea el objeto principal del usuario.
// Este objeto sirve como plantilla inicial para la app.
// Cuando alguien inicia sesión por primera vez, estos datos
// se guardan en localStorage para simular una cuenta bancaria.
const usuarioBase = {
  // Nombre del usuario que se mostrará en la pantalla principal.
  nombre: "Ash Ketchum",

  // Número de cuenta que también se mostrará en la interfaz.
  cuenta: "0987654321",

  // PIN correcto que permitirá iniciar sesión.
  pin: "1234",

  // Saldo inicial con el que empieza la cuenta.
  saldo: 500,

  // Arreglo vacío donde se guardarán las transacciones.
  historial: []
};

// ========================================================
// FUNCIÓN: INICIAR SESIÓN
// ========================================================
// Esta función se ejecuta cuando el usuario presiona
// el botón "Ingresar" en el login.
function iniciarSesion() {
  // Busca en el HTML el input que tiene el id "pin".
  const pinInput = document.getElementById("pin");

  // Si el input no existe, la función se detiene.
  // Esto evita errores si se ejecuta en otra página.
  if (!pinInput) return;

  // Toma el valor escrito en el input
  // y elimina espacios al inicio o al final.
  const pinIngresado = pinInput.value.trim();

  // Compara el PIN ingresado con el PIN del usuario base.
  if (pinIngresado === usuarioBase.pin) {
    // Busca si ya existe un usuario guardado en localStorage.
    const usuarioGuardado = localStorage.getItem("usuarioPokemonBank");

    // Si todavía no hay un usuario guardado,
    // se guarda por primera vez el usuarioBase.
    if (!usuarioGuardado) {
      localStorage.setItem("usuarioPokemonBank", JSON.stringify(usuarioBase));
    }

    // Muestra un mensaje de acceso correcto.
    swal({
      title: "Bienvenido",
      text: "Acceso concedido a Pokémon Bank",
      icon: "success",
      button: "Continuar"
    }).then(() => {
      // Después de cerrar la alerta,
      // redirige al usuario a la página principal.
      window.location.href = "acciones.html";
    });
  } else {
    // Si el PIN es incorrecto, muestra un error.
    swal({
      title: "PIN incorrecto",
      text: "Verifica tus datos e intenta nuevamente.",
      icon: "error",
      button: "Aceptar"
    });
  }
}

// ========================================================
// FUNCIÓN: OBTENER USUARIO
// ========================================================
// Esta función lee el usuario guardado en localStorage.
// localStorage guarda texto, por eso se usa JSON.parse
// para convertirlo nuevamente en objeto.
function obtenerUsuario() {
  return JSON.parse(localStorage.getItem("usuarioPokemonBank"));
}

// ========================================================
// FUNCIÓN: GUARDAR USUARIO
// ========================================================
// Esta función recibe un objeto actualizado
// y lo guarda otra vez en localStorage.
function guardarUsuario(usuarioActualizado) {
  localStorage.setItem("usuarioPokemonBank", JSON.stringify(usuarioActualizado));
}

// ========================================================
// FUNCIÓN: CERRAR SESIÓN
// ========================================================
// Esta función se ejecuta cuando el usuario presiona
// el botón "Cerrar sesión".
function cerrarSesion() {
  // Si algún botón o elemento quedó seleccionado,
  // se le quita el foco para evitar efectos visuales raros.
  if (document.activeElement) {
    document.activeElement.blur();
  }

  // Muestra una alerta de confirmación.
  swal({
    title: "¿Está seguro de cerrar sesión?",
    text: "Se cerrará la sesión actual de Pokémon Bank.",
    icon: "warning",
    buttons: {
      confirm: {
        text: "Aceptar",
        value: true,
        visible: true
      },
      cancel: {
        text: "Cancelar",
        value: false,
        visible: true
      }
    },
    // dangerMode hace que la alerta tenga aspecto más delicado.
    dangerMode: true
  }).then((confirmado) => {
    // Si el usuario acepta cerrar sesión...
    if (confirmado) {
      // ...se elimina la sesión guardada.
      localStorage.removeItem("usuarioPokemonBank");

      // Luego regresa al login.
      window.location.href = "index.html";
    }
  });
}

// ========================================================
// FUNCIÓN: PROCESAR DEPÓSITO
// ========================================================
// Esta función se usa cuando el usuario confirma
// un depósito desde el modal.
function procesarDeposito() {
  // Obtiene el usuario guardado.
  const usuario = obtenerUsuario();

  // Si por alguna razón no existe usuario, detiene la función.
  if (!usuario) return;

  // Busca el valor del input del depósito
  // y lo convierte a número decimal.
  const monto = parseFloat(document.getElementById("montoDeposito").value);

  // Valida que el monto sea un número válido
  // y que sea mayor que cero.
  if (isNaN(monto) || monto <= 0) {
    swal("Monto inválido", "Ingresa un monto válido para realizar el depósito.", "warning");
    return;
  }

  // Pide confirmación antes de ejecutar la operación.
  swal({
    title: "¿Está seguro de querer realizar esta operación?",
    text: 'Una vez presionado "Aceptar" no podrá revertir esta operación.',
    icon: "warning",
    buttons: {
      confirm: {
        text: "Aceptar",
        value: true,
        visible: true
      },
      cancel: {
        text: "Cancelar",
        value: false,
        visible: true
      }
    },
    dangerMode: true
  }).then((confirmado) => {
    // Si el usuario confirma...
    if (confirmado) {
      // ...el saldo aumenta.
      usuario.saldo += monto;

      // Luego se registra la transacción en el historial.
      usuario.historial.push({
        tipo: "Depósito",
        monto: monto
      });

      // Se guarda el usuario actualizado.
      guardarUsuario(usuario);

      // Se limpia el formulario del modal.
      document.getElementById("formDepositar").reset();

      // Se cierra el modal.
      $("#modalDepositar").modal("hide");

      // Muestra un mensaje de éxito.
      swal("Depósito realizado", "Se depositó $" + monto.toFixed(2) + " correctamente.", "success");
    }
  });
}

// ========================================================
// FUNCIÓN: PROCESAR RETIRO
// ========================================================
// Esta función se usa para retirar dinero del saldo.
function procesarRetiro() {
  // Obtiene el usuario actual.
  const usuario = obtenerUsuario();

  // Si no existe usuario, se detiene.
  if (!usuario) return;

  // Obtiene el monto escrito y lo convierte a decimal.
  const monto = parseFloat(document.getElementById("montoRetiro").value);

  // Valida que el monto sea correcto.
  if (isNaN(monto) || monto <= 0) {
    swal("Monto inválido", "Ingresa un monto válido para realizar el retiro.", "warning");
    return;
  }

  // Verifica que haya suficiente saldo.
  if (monto > usuario.saldo) {
    swal("Fondos insuficientes", "No tienes saldo suficiente para realizar este retiro.", "error");
    return;
  }

  // Muestra confirmación antes de retirar.
  swal({
    title: "¿Está seguro de querer realizar esta operación?",
    text: 'Una vez presionado "Aceptar" no podrá revertir esta operación.',
    icon: "warning",
    buttons: {
      confirm: {
        text: "Aceptar",
        value: true,
        visible: true
      },
      cancel: {
        text: "Cancelar",
        value: false,
        visible: true
      }
    },
    dangerMode: true
  }).then((confirmado) => {
    // Si confirma...
    if (confirmado) {
      // ...se descuenta el monto del saldo.
      usuario.saldo -= monto;

      // Se guarda la transacción en historial.
      usuario.historial.push({
        tipo: "Retiro",
        monto: monto
      });

      // Se actualiza localStorage.
      guardarUsuario(usuario);

      // Se limpia el formulario del modal.
      document.getElementById("formRetirar").reset();

      // Se cierra el modal.
      $("#modalRetirar").modal("hide");

      // Se informa que el retiro fue exitoso.
      swal("Retiro realizado", "Se retiró $" + monto.toFixed(2) + " correctamente.", "success");
    }
  });
}

// ========================================================
// FUNCIÓN: CONSULTAR SALDO
// ========================================================
// Esta función solo muestra el saldo actual en una alerta.
function consultarSaldo() {
  // Obtiene el usuario guardado.
  const usuario = obtenerUsuario();

  // Si no existe usuario, se detiene.
  if (!usuario) return;

  // Muestra el saldo con dos decimales.
  swal("Saldo actual", "$" + usuario.saldo.toFixed(2), "info");
}

// ========================================================
// FUNCIÓN: PROCESAR PAGO DE SERVICIO
// ========================================================
// Esta función descuenta dinero por el pago de un servicio
// y guarda esa operación en el historial.
function procesarPagoServicio() {
  // Obtiene el usuario guardado.
  const usuario = obtenerUsuario();

  // Si no hay usuario, detiene la función.
  if (!usuario) return;

  // Obtiene el servicio elegido en el select.
  const servicio = document.getElementById("tipoServicio").value;

  // Obtiene el monto escrito y lo convierte a decimal.
  const monto = parseFloat(document.getElementById("montoServicio").value);

  // Valida que haya un servicio seleccionado
  // y que el monto sea correcto.
  if (!servicio || isNaN(monto) || monto <= 0) {
    swal("Datos inválidos", "Selecciona un servicio e ingresa un monto válido.", "warning");
    return;
  }

  // Verifica si hay saldo suficiente.
  if (monto > usuario.saldo) {
    swal("Fondos insuficientes", "No tienes saldo suficiente para pagar este servicio.", "error");
    return;
  }

  // Muestra confirmación antes del pago.
  swal({
    title: "¿Está seguro de querer realizar esta operación?",
    text: 'Una vez presionado "Aceptar" no podrá revertir esta operación.',
    icon: "warning",
    buttons: {
      confirm: {
        text: "Aceptar",
        value: true,
        visible: true
      },
      cancel: {
        text: "Cancelar",
        value: false,
        visible: true
      }
    },
    dangerMode: true
  }).then((confirmado) => {
    // Si el usuario confirma...
    if (confirmado) {
      // ...se resta el monto al saldo.
      usuario.saldo -= monto;

      // Luego se agrega la transacción al historial.
      usuario.historial.push({
        tipo: "Pago de servicio - " + servicio,
        monto: monto
      });

      // Se guarda el usuario actualizado.
      guardarUsuario(usuario);

      // Se reinicia el formulario del modal.
      document.getElementById("formPagoServicio").reset();

      // Se cierra el modal.
      $("#modalPagoServicio").modal("hide");

      // Muestra mensaje de éxito.
      swal("Pago exitoso", "Se pagó " + servicio + " por $" + monto.toFixed(2), "success");
    }
  });
}

// ========================================================
// FUNCIÓN: CARGAR DATOS DEL USUARIO EN PANTALLA
// ========================================================
// Esta función coloca el nombre y la cuenta
// en la pantalla principal de acciones.
function cargarDatosUsuario() {
  // Obtiene el usuario guardado.
  const usuario = obtenerUsuario();

  // Busca el elemento del nombre.
  const nombreUsuario = document.getElementById("nombreUsuario");

  // Busca el elemento del número de cuenta.
  const numeroCuenta = document.getElementById("numeroCuenta");

  // Si existe la zona donde deberían mostrarse datos
  // pero no existe usuario, regresa al login.
  if ((nombreUsuario || numeroCuenta) && !usuario) {
    window.location.href = "index.html";
    return;
  }

  // Si existe el span del nombre y sí hay usuario,
  // coloca el nombre.
  if (nombreUsuario && usuario) {
    nombreUsuario.textContent = usuario.nombre;
  }

  // Si existe el span de cuenta y sí hay usuario,
  // coloca el número de cuenta.
  if (numeroCuenta && usuario) {
    numeroCuenta.textContent = usuario.cuenta;
  }
}

// ========================================================
// FUNCIÓN: MOSTRAR HISTORIAL
// ========================================================
// Esta función llena la tabla de historial.
function mostrarHistorial() {
  // Busca el body de la tabla.
  const tablaHistorial = document.getElementById("tablaHistorial");

  // Busca el mensaje que indica que no hay movimientos.
  const mensajeVacio = document.getElementById("mensajeVacio");

  // Si no existe la tabla en la página, se detiene.
  if (!tablaHistorial) return;

  // Obtiene el usuario guardado.
  const usuario = JSON.parse(localStorage.getItem("usuarioPokemonBank"));

  // Si no existe usuario, vuelve al login.
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  // Limpia la tabla antes de volver a llenarla.
  tablaHistorial.innerHTML = "";

  // Si el historial no existe o está vacío,
  // muestra un mensaje de vacío.
  if (!usuario.historial || usuario.historial.length === 0) {
    mensajeVacio.classList.remove("d-none");
    return;
  }

  // Si sí hay transacciones, oculta el mensaje vacío.
  mensajeVacio.classList.add("d-none");

  // Recorre el historial una por una.
  usuario.historial.forEach((transaccion, index) => {
    // Va agregando una fila nueva por cada movimiento.
    tablaHistorial.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${transaccion.tipo}</td>
        <td>$${Number(transaccion.monto).toFixed(2)}</td>
      </tr>
    `;
  });
}

// ========================================================
// FUNCIÓN: MOSTRAR GRÁFICO
// ========================================================
// Esta función cuenta cuántos depósitos, retiros y pagos
// existen en el historial y luego crea un gráfico.
function mostrarGrafico() {
  // Busca el canvas donde se dibuja el gráfico.
  const canvas = document.getElementById("graficoTransacciones");

  // Si el canvas no existe, se detiene.
  if (!canvas) return;

  // Obtiene el usuario actual.
  const usuario = obtenerUsuario();

  // Si no existe usuario, vuelve al login.
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  // Variables para contar cuántas transacciones hay
  // de cada tipo.
  let depositos = 0;
  let retiros = 0;
  let pagos = 0;

  // Recorre cada transacción del historial.
  usuario.historial.forEach((transaccion) => {
    // Si el tipo es depósito, suma uno.
    if (transaccion.tipo === "Depósito") {
      depositos++;

    // Si el tipo es retiro, suma uno.
    } else if (transaccion.tipo === "Retiro") {
      retiros++;

    // Si el texto inicia con "Pago de servicio",
    // cuenta esa transacción como pago.
    } else if (transaccion.tipo.startsWith("Pago de servicio")) {
      pagos++;
    }
  });

  // Estos arreglos serán usados por Chart.js.
  const labels = [];
  const data = [];
  const backgroundColor = [];
  const borderColor = [];

  // Si hubo depósitos, agrega esa categoría.
  if (depositos > 0) {
    labels.push("Depósitos");
    data.push(depositos);
    backgroundColor.push("#198754");
    borderColor.push("#157347");
  }

  // Si hubo retiros, agrega esa categoría.
  if (retiros > 0) {
    labels.push("Retiros");
    data.push(retiros);
    backgroundColor.push("#ffc107");
    borderColor.push("#e0a800");
  }

  // Si hubo pagos, agrega esa categoría.
  if (pagos > 0) {
    labels.push("Pagos de servicios");
    data.push(pagos);
    backgroundColor.push("#0dcaf0");
    borderColor.push("#0aa2c0");
  }

  // Si no hay datos, no se crea el gráfico.
  if (data.length === 0) {
    return;
  }

  // Se crea el gráfico de dona.
  new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        label: "Cantidad de transacciones",
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        },
        title: {
          display: true
        }
      }
    }
  });
}

// ========================================================
// CUANDO LA PÁGINA TERMINA DE CARGAR
// ========================================================
// Este evento espera a que el HTML esté listo
// y luego ejecuta las funciones necesarias.
document.addEventListener("DOMContentLoaded", () => {
  // Carga nombre y cuenta si esos elementos existen.
  cargarDatosUsuario();

  // Muestra historial si la tabla está en esa página.
  mostrarHistorial();

  // Muestra gráfico si existe el canvas.
  mostrarGrafico();
});

// ========================================================
// EVENTOS DE LOS MODALES
// ========================================================
// Cuando se abre cada modal, el cursor se coloca
// automáticamente en el campo más útil.

// Al abrir el modal de depósito...
$('#modalDepositar').on('shown.bs.modal', function () {
  // ...enfoca el input del monto.
  $('#montoDeposito').trigger('focus');
});

// Al abrir el modal de retiro...
$('#modalRetirar').on('shown.bs.modal', function () {
  // ...enfoca el input del monto.
  $('#montoRetiro').trigger('focus');
});

// Al abrir el modal de pago de servicios...
$('#modalPagoServicio').on('shown.bs.modal', function () {
  // ...enfoca el select del servicio.
  $('#tipoServicio').trigger('focus');
});
// Fin main.js