const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const btnDashboard = document.getElementById("btnDashboard");
const btnCatalogo = document.getElementById("btnCatalogo");
const btnVenta = document.getElementById("btnVenta");
const btnInventario = document.getElementById("btnInventario");
const btnEntregas = document.getElementById("btnEntregas");
const btnModoOffline = document.getElementById("btnModoOffline");

const seccionDashboard = document.getElementById("seccionDashboard");
const seccionCatalogo = document.getElementById("seccionCatalogo");
const seccionVenta = document.getElementById("seccionVenta");
const seccionInventario = document.getElementById("seccionInventario");
const seccionEntregas = document.getElementById("seccionEntregas");

const contenidoPrincipal = document.getElementById("contenidoPrincipal");
const modoOffline = document.getElementById("modoOffline");
const btnVolverPanel = document.getElementById("btnVolverPanel");
const btnSimularConexion = document.getElementById("btnSimularConexion");
const btnReiniciarAjedrez = document.getElementById("btnReiniciarAjedrez");
const turnoAjedrez = document.getElementById("turnoAjedrez");
const estadoConexionTexto = document.getElementById("estadoConexionTexto");

const tituloPagina = document.getElementById("tituloPagina");
const descripcionPagina = document.getElementById("descripcionPagina");

const ventasDia = document.getElementById("ventasDia");
const productosDisponibles = document.getElementById("productosDisponibles");
const productosStockBajo = document.getElementById("productosStockBajo");
const proximasEntregas = document.getElementById("proximasEntregas");

const dashboardStockBajo = document.getElementById("dashboardStockBajo");
const dashboardEntregas = document.getElementById("dashboardEntregas");

const listaCatalogo = document.getElementById("listaCatalogo");
const filtroCategoriaCatalogo = document.getElementById("filtroCategoriaCatalogo");
const buscadorGeneral = document.getElementById("buscadorGeneral");

const productoVenta = document.getElementById("productoVenta");
const cantidadVenta = document.getElementById("cantidadVenta");
const formAgregarVenta = document.getElementById("formAgregarVenta");
const tablaCarrito = document.getElementById("tablaCarrito");
const totalVenta = document.getElementById("totalVenta");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const btnGuardarVenta = document.getElementById("btnGuardarVenta");

const tablaInventario = document.getElementById("tablaInventario");
const btnActualizarInventario = document.getElementById("btnActualizarInventario");

const tablaEntregas = document.getElementById("tablaEntregas");
const btnActualizarEntregas = document.getElementById("btnActualizarEntregas");

let productosGlobal = [];
let proveedoresGlobal = [];
let carrito = [];

let piezaSeleccionada = null;
let turnoBlancas = true;

btnCerrarSesion.addEventListener("click", () => {
    window.location.href = "/";
});

btnModoOffline.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarModoOffline();
});

btnVolverPanel.addEventListener("click", () => {
    ocultarModoOffline();
});

btnSimularConexion.addEventListener("click", () => {
    ocultarModoOffline();
});

window.addEventListener("offline", () => {
    mostrarModoOffline();
});

window.addEventListener("online", () => {
    estadoConexionTexto.textContent = "Conexión restaurada";
});

function mostrarModoOffline() {
    contenidoPrincipal.style.display = "none";
    modoOffline.style.display = "flex";
    estadoConexionTexto.textContent = "Modo offline de prueba";
    iniciarAjedrez();
}

function ocultarModoOffline() {
    modoOffline.style.display = "none";
    contenidoPrincipal.style.display = "block";
}

function iniciarAjedrez() {
    piezaSeleccionada = null;
    turnoBlancas = true;
    turnoAjedrez.textContent = "Turno: blancas";

    const casillas = document.querySelectorAll(".casilla");

    casillas.forEach((casilla) => {
        casilla.classList.remove("seleccionada");
        casilla.onclick = manejarClickCasilla;
    });
}

function manejarClickCasilla() {
    const pieza = this.textContent.trim();

    if (!piezaSeleccionada) {
        if (pieza === "") {
            return;
        }

        piezaSeleccionada = this;
        this.classList.add("seleccionada");
        return;
    }

    if (piezaSeleccionada === this) {
        this.classList.remove("seleccionada");
        piezaSeleccionada = null;
        return;
    }

    this.textContent = piezaSeleccionada.textContent;
    piezaSeleccionada.textContent = "";
    piezaSeleccionada.classList.remove("seleccionada");
    piezaSeleccionada = null;

    turnoBlancas = !turnoBlancas;

    turnoAjedrez.textContent = turnoBlancas
        ? "Turno: blancas"
        : "Turno: negras";
}

btnReiniciarAjedrez.addEventListener("click", () => {
    const piezasIniciales = [
        "♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜",
        "♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙",
        "♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"
    ];

    document.querySelectorAll(".casilla").forEach((casilla, index) => {
        casilla.textContent = piezasIniciales[index];
        casilla.classList.remove("seleccionada");
    });

    iniciarAjedrez();
});

btnDashboard.addEventListener("click", async (e) => {
    e.preventDefault();
    mostrarSeccion("dashboard");
    await cargarDashboard();
});

btnCatalogo.addEventListener("click", async (e) => {
    e.preventDefault();
    mostrarSeccion("catalogo");
    await cargarCatalogo();
});

btnVenta.addEventListener("click", async (e) => {
    e.preventDefault();
    mostrarSeccion("venta");
    await cargarProductosVenta();
});

btnInventario.addEventListener("click", async (e) => {
    e.preventDefault();
    mostrarSeccion("inventario");
    await cargarInventario();
});

btnEntregas.addEventListener("click", async (e) => {
    e.preventDefault();
    mostrarSeccion("entregas");
    await cargarEntregas();
});

function mostrarSeccion(seccion) {
    seccionDashboard.style.display = "none";
    seccionCatalogo.style.display = "none";
    seccionVenta.style.display = "none";
    seccionInventario.style.display = "none";
    seccionEntregas.style.display = "none";

    document.querySelectorAll(".menu a").forEach((btn) => {
        btn.classList.remove("activo");
    });

    if (seccion === "dashboard") {
        seccionDashboard.style.display = "block";
        tituloPagina.textContent = "Dashboard";
        descripcionPagina.textContent = "Resumen operativo del trabajador";
        btnDashboard.classList.add("activo");
    }

    if (seccion === "catalogo") {
        seccionCatalogo.style.display = "block";
        tituloPagina.textContent = "Catálogo";
        descripcionPagina.textContent = "Consulta productos disponibles";
        btnCatalogo.classList.add("activo");
    }

    if (seccion === "venta") {
        seccionVenta.style.display = "block";
        tituloPagina.textContent = "Registrar venta";
        descripcionPagina.textContent = "Selecciona productos y calcula el total";
        btnVenta.classList.add("activo");
    }

    if (seccion === "inventario") {
        seccionInventario.style.display = "block";
        tituloPagina.textContent = "Inventario";
        descripcionPagina.textContent = "Consulta el stock actual de productos";
        btnInventario.classList.add("activo");
    }

    if (seccion === "entregas") {
        seccionEntregas.style.display = "block";
        tituloPagina.textContent = "Próximas entregas";
        descripcionPagina.textContent = "Consulta proveedores y entregas programadas";
        btnEntregas.classList.add("activo");
    }
}

async function obtenerProductos() {
    const res = await fetch("/productos");
    productosGlobal = await res.json();
    return productosGlobal;
}

async function obtenerProveedores() {
    const res = await fetch("/proveedores");
    proveedoresGlobal = await res.json();
    return proveedoresGlobal;
}

async function cargarDashboard() {
    try {
        await obtenerProductos();
        await obtenerProveedores();

        const ventasGuardadas = JSON.parse(localStorage.getItem("ventasMakro")) || [];

        const totalVentas = ventasGuardadas.reduce((total, venta) => {
            return total + Number(venta.total);
        }, 0);

        const disponibles = productosGlobal.filter((p) => Number(p.stock) > 0);
        const stockBajo = productosGlobal.filter((p) => Number(p.stock) <= 10);

        ventasDia.textContent = `S/ ${totalVentas.toFixed(2)}`;
        productosDisponibles.textContent = disponibles.length;
        productosStockBajo.textContent = stockBajo.length;
        proximasEntregas.textContent = proveedoresGlobal.length;

        dashboardStockBajo.innerHTML = "";

        if (stockBajo.length === 0) {
            dashboardStockBajo.innerHTML = `
                <div class="stock-ok">✅ No hay productos con stock bajo</div>
            `;
        } else {
            stockBajo.forEach((producto) => {
                dashboardStockBajo.innerHTML += `
                    <div class="stock-alerta">
                        <div class="stock-alerta-icono">⚠️</div>
                        <div>
                            <h4>${producto.nombre}</h4>
                            <p>${producto.categoria} | Stock: ${producto.stock}</p>
                        </div>
                    </div>
                `;
            });
        }

        dashboardEntregas.innerHTML = "";

        if (proveedoresGlobal.length === 0) {
            dashboardEntregas.innerHTML = `
                <div class="producto-vacio">No hay entregas registradas</div>
            `;
        } else {
            proveedoresGlobal.slice(0, 5).forEach((proveedor) => {
                dashboardEntregas.innerHTML += `
                    <div class="entrega-item">
                        <div>
                            <h4>${proveedor.nombre}</h4>
                            <p>${proveedor.categoria}</p>
                        </div>
                        <strong>
                            ${proveedor.proxima_entrega
                                ? new Date(proveedor.proxima_entrega).toLocaleDateString()
                                : "Sin fecha"}
                        </strong>
                    </div>
                `;
            });
        }

    } catch (error) {
        console.log(error);
        alert("Error al cargar dashboard");
    }
}

async function cargarCatalogo() {
    try {
        await obtenerProductos();
        mostrarCatalogo();

    } catch (error) {
        console.log(error);
        listaCatalogo.innerHTML = `
            <div class="producto-vacio">Error al cargar catálogo</div>
        `;
    }
}

function mostrarCatalogo() {
    const categoria = filtroCategoriaCatalogo.value;
    const busqueda = buscadorGeneral.value.toLowerCase();

    let productos = [...productosGlobal];

    if (categoria !== "Todos") {
        productos = productos.filter((p) => p.categoria === categoria);
    }

    if (busqueda.trim() !== "") {
        productos = productos.filter((p) =>
            p.nombre.toLowerCase().includes(busqueda) ||
            p.categoria.toLowerCase().includes(busqueda)
        );
    }

    listaCatalogo.innerHTML = "";

    if (productos.length === 0) {
        listaCatalogo.innerHTML = `
            <div class="producto-vacio">No se encontraron productos</div>
        `;
        return;
    }

    productos.forEach((producto) => {
        listaCatalogo.innerHTML += crearCardProducto(producto);
    });
}

function crearCardProducto(producto) {
    const imagen = producto.imagen || "/IMG/producto-default.png";

    const estadoClase =
        producto.estado === "Activo"
            ? "producto-activo"
            : producto.estado === "Agotado"
                ? "producto-agotado"
                : "producto-inactivo";

    const stockClase =
        Number(producto.stock) <= 10
            ? "stock-bajo-texto"
            : "";

    return `
        <div class="producto-card">
            <img src="${imagen}" alt="${producto.nombre}">

            <div class="producto-info">
                <div class="producto-top">
                    <h3>${producto.nombre}</h3>
                    <span class="${estadoClase}">
                        ${producto.estado}
                    </span>
                </div>

                <p class="producto-categoria">${producto.categoria}</p>

                <div class="producto-datos">
                    <p><b>Precio:</b> S/ ${Number(producto.precio).toFixed(2)}</p>
                    <p class="${stockClase}"><b>Stock:</b> ${producto.stock}</p>
                </div>
            </div>
        </div>
    `;
}

filtroCategoriaCatalogo.addEventListener("change", mostrarCatalogo);
buscadorGeneral.addEventListener("input", mostrarCatalogo);

async function cargarProductosVenta() {
    try {
        await obtenerProductos();

        productoVenta.innerHTML = `
            <option value="">Seleccione producto</option>
        `;

        productosGlobal.forEach((producto) => {
            if (Number(producto.stock) > 0 && producto.estado === "Activo") {
                productoVenta.innerHTML += `
                    <option value="${producto.id}">
                        ${producto.nombre} - S/ ${Number(producto.precio).toFixed(2)} - Stock: ${producto.stock}
                    </option>
                `;
            }
        });

        mostrarCarrito();

    } catch (error) {
        console.log(error);
        alert("Error al cargar productos para venta");
    }
}

formAgregarVenta.addEventListener("submit", (e) => {
    e.preventDefault();

    const idProducto = Number(productoVenta.value);
    const cantidad = Number(cantidadVenta.value);

    const producto = productosGlobal.find((p) => Number(p.id) === idProducto);

    if (!producto) {
        alert("Seleccione un producto válido");
        return;
    }

    if (cantidad <= 0) {
        alert("La cantidad debe ser mayor a 0");
        return;
    }

    if (cantidad > Number(producto.stock)) {
        alert("No hay suficiente stock disponible");
        return;
    }

    const productoEnCarrito = carrito.find((item) => item.id === idProducto);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidad;
        productoEnCarrito.subtotal = productoEnCarrito.cantidad * productoEnCarrito.precio;
    } else {
        carrito.push({
            id: Number(producto.id),
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad,
            subtotal: Number(producto.precio) * cantidad
        });
    }

    formAgregarVenta.reset();
    cantidadVenta.value = 1;

    mostrarCarrito();
});

function mostrarCarrito() {
    tablaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        tablaCarrito.innerHTML = `
            <tr>
                <td colspan="4">No hay productos agregados</td>
            </tr>
        `;

        totalVenta.textContent = "S/ 0.00";
        return;
    }

    carrito.forEach((item) => {
        tablaCarrito.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>S/ ${item.precio.toFixed(2)}</td>
                <td>S/ ${item.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    const total = carrito.reduce((suma, item) => suma + item.subtotal, 0);

    totalVenta.textContent = `S/ ${total.toFixed(2)}`;
}

btnVaciarCarrito.addEventListener("click", () => {
    carrito = [];
    mostrarCarrito();
});

btnGuardarVenta.addEventListener("click", async () => {
    if (carrito.length === 0) {
        alert("No hay productos en el carrito");
        return;
    }

    try {
        for (const item of carrito) {
            const res = await fetch("/ventas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    producto_id: item.id,
                    cantidad: item.cantidad
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.mensaje);
                return;
            }
        }

        alert("Venta registrada correctamente");

        carrito = [];
        mostrarCarrito();

        await cargarProductosVenta();
        await cargarDashboard();

    } catch (error) {
        console.log(error);
        alert("Error al registrar venta");
    }
});

async function cargarInventario() {
    try {
        await obtenerProductos();

        tablaInventario.innerHTML = "";

        if (productosGlobal.length === 0) {
            tablaInventario.innerHTML = `
                <tr>
                    <td colspan="6">No hay productos registrados</td>
                </tr>
            `;
            return;
        }

        productosGlobal.forEach((producto) => {
            const imagen = producto.imagen || "/IMG/producto-default.png";

            const stockClase =
                Number(producto.stock) <= 10
                    ? "stock-bajo-texto"
                    : "";

            tablaInventario.innerHTML += `
                <tr>
                    <td>
                        <img src="${imagen}" class="img-tabla" alt="${producto.nombre}">
                    </td>
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria}</td>
                    <td>S/ ${Number(producto.precio).toFixed(2)}</td>
                    <td class="${stockClase}">${producto.stock}</td>
                    <td>${producto.estado}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.log(error);

        tablaInventario.innerHTML = `
            <tr>
                <td colspan="6">Error al cargar inventario</td>
            </tr>
        `;
    }
}

btnActualizarInventario.addEventListener("click", cargarInventario);

async function cargarEntregas() {
    try {
        await obtenerProveedores();

        tablaEntregas.innerHTML = "";

        if (proveedoresGlobal.length === 0) {
            tablaEntregas.innerHTML = `
                <tr>
                    <td colspan="6">No hay entregas registradas</td>
                </tr>
            `;
            return;
        }

        proveedoresGlobal.forEach((proveedor) => {
            const fecha = proveedor.proxima_entrega
                ? new Date(proveedor.proxima_entrega).toLocaleDateString()
                : "Sin fecha";

            tablaEntregas.innerHTML += `
                <tr>
                    <td>${proveedor.nombre}</td>
                    <td>${proveedor.categoria}</td>
                    <td>
                        ${proveedor.contacto || "Sin contacto"}<br>
                        <small>${proveedor.telefono || ""}</small><br>
                        <small>${proveedor.correo || ""}</small>
                    </td>
                    <td>${proveedor.entregas_2026}</td>
                    <td>${fecha}</td>
                    <td>${proveedor.estado}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.log(error);

        tablaEntregas.innerHTML = `
            <tr>
                <td colspan="6">Error al cargar entregas</td>
            </tr>
        `;
    }
}

btnActualizarEntregas.addEventListener("click", cargarEntregas);

document.addEventListener("DOMContentLoaded", async () => {
    await cargarDashboard();
    iniciarAjedrez();
});

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            await navigator.serviceWorker.register("/service-worker.js");

            console.log("Service Worker registrado");

        } catch (error) {

            console.log("Error Service Worker", error);

        }

    });

}   