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
let ventasGlobal = [];
let carrito = [];

let piezaSeleccionada = null;
let turnoBlancas = true;

function obtenerToken() {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
}

function obtenerUsuarioGuardado() {
    const usuario =
        localStorage.getItem("usuario") ||
        sessionStorage.getItem("usuario");

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch {
        return null;
    }
}

function obtenerRolGuardado() {
    const rol =
        localStorage.getItem("rol") ||
        sessionStorage.getItem("rol");

    if (rol === null) {
        return null;
    }

    return Number(rol);
}

function limpiarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("rol");
}

function cerrarSesion() {
    limpiarSesion();
    window.location.href = "/";
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function obtenerRutaImagen(imagen) {
    if (
        typeof imagen !== "string" ||
        imagen.trim() === ""
    ) {
        return "/IMG/producto-default.png";
    }

    const ruta = imagen.trim();

    if (ruta.startsWith("/IMG/")) {
        return escaparHtml(ruta);
    }

    if (ruta.startsWith("IMG/")) {
        return escaparHtml(`/${ruta}`);
    }

    return "/IMG/producto-default.png";
}

async function obtenerJsonSeguro(respuesta) {
    try {
        return await respuesta.json();
    } catch {
        return {};
    }
}

async function apiFetch(url, opciones = {}) {
    const token = obtenerToken();

    if (!token) {
        cerrarSesion();

        throw new Error(
            "No existe una sesión activa."
        );
    }

    const headers = new Headers(
        opciones.headers || {}
    );

    headers.set(
        "Authorization",
        `Bearer ${token}`
    );

    const respuesta = await fetch(
        url,
        {
            ...opciones,
            headers
        }
    );

    if (respuesta.status === 401) {
        limpiarSesion();

        alert(
            "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        window.location.href = "/";

        throw new Error(
            "Sesión expirada."
        );
    }

    if (respuesta.status === 403) {
        throw new Error(
            "No tienes permisos para realizar esta acción."
        );
    }

    return respuesta;
}

async function verificarTrabajador() {
    const token = obtenerToken();

    if (!token) {
        cerrarSesion();
        return false;
    }

    if (!navigator.onLine) {
        const rol = obtenerRolGuardado();

        if (rol === 0) {
            return true;
        }

        if (rol === 1) {
            window.location.href = "/admin";
            return false;
        }

        cerrarSesion();
        return false;
    }

    try {
        const respuesta = await fetch(
            "/auth/verificar",
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!respuesta.ok) {
            limpiarSesion();

            alert(
                "Debes iniciar sesión nuevamente."
            );

            window.location.href = "/";

            return false;
        }

        const datos =
            await obtenerJsonSeguro(
                respuesta
            );

        const rol =
            Number(
                datos.usuario?.rol
            );

        if (rol === 1) {
            window.location.href = "/admin";
            return false;
        }

        if (rol !== 0) {
            limpiarSesion();
            window.location.href = "/";
            return false;
        }

        return true;

    } catch (error) {
        console.error(
            "Error verificando sesión:",
            error
        );

        if (!navigator.onLine) {
            return obtenerRolGuardado() === 0;
        }

        alert(
            "No se pudo verificar tu sesión."
        );

        return false;
    }
}

function productoDisponible(producto) {
    const stock =
        Number(producto.stock);

    const estado =
        String(
            producto.estado || ""
        )
            .trim()
            .toLowerCase();

    if (
        !Number.isFinite(stock) ||
        stock <= 0
    ) {
        return false;
    }

    if (
        estado === "agotado" ||
        estado === "inactivo"
    ) {
        return false;
    }

    return true;
}

function normalizarEstadoProducto(producto) {
    const stock =
        Number(producto.stock);

    const estado =
        String(
            producto.estado || ""
        ).trim();

    if (
        !Number.isFinite(stock) ||
        stock <= 0
    ) {
        return "Agotado";
    }

    if (!estado) {
        return "Disponible";
    }

    return estado;
}

function estadoProductoClase(producto) {
    const estado =
        normalizarEstadoProducto(
            producto
        )
            .toLowerCase();

    if (
        estado === "activo" ||
        estado === "disponible"
    ) {
        return "producto-activo";
    }

    if (estado === "agotado") {
        return "producto-agotado";
    }

    return "producto-inactivo";
}

function fechaEsHoy(fecha) {
    if (!fecha) {
        return false;
    }

    const fechaVenta =
        new Date(fecha);

    if (
        Number.isNaN(
            fechaVenta.getTime()
        )
    ) {
        return false;
    }

    const hoy =
        new Date();

    return (
        fechaVenta.getFullYear() ===
            hoy.getFullYear() &&
        fechaVenta.getMonth() ===
            hoy.getMonth() &&
        fechaVenta.getDate() ===
            hoy.getDate()
    );
}

function mostrarModoOffline() {
    if (contenidoPrincipal) {
        contenidoPrincipal.style.display =
            "none";
    }

    if (modoOffline) {
        modoOffline.style.display =
            "flex";
    }

    if (estadoConexionTexto) {
        estadoConexionTexto.textContent =
            navigator.onLine
                ? "Modo offline de prueba"
                : "Sin conexión";
    }

    iniciarAjedrez();
}

function ocultarModoOffline() {
    if (modoOffline) {
        modoOffline.style.display =
            "none";
    }

    if (contenidoPrincipal) {
        contenidoPrincipal.style.display =
            "block";
    }
}

function iniciarAjedrez() {
    piezaSeleccionada = null;
    turnoBlancas = true;

    if (turnoAjedrez) {
        turnoAjedrez.textContent =
            "Turno: blancas";
    }

    const casillas =
        document.querySelectorAll(
            ".casilla"
        );

    casillas.forEach(
        casilla => {
            casilla.classList.remove(
                "seleccionada"
            );

            casilla.onclick =
                manejarClickCasilla;
        }
    );
}

function manejarClickCasilla() {
    const pieza =
        this.textContent.trim();

    if (!piezaSeleccionada) {
        if (pieza === "") {
            return;
        }

        piezaSeleccionada =
            this;

        this.classList.add(
            "seleccionada"
        );

        return;
    }

    if (
        piezaSeleccionada ===
        this
    ) {
        this.classList.remove(
            "seleccionada"
        );

        piezaSeleccionada =
            null;

        return;
    }

    this.textContent =
        piezaSeleccionada.textContent;

    piezaSeleccionada.textContent =
        "";

    piezaSeleccionada.classList.remove(
        "seleccionada"
    );

    piezaSeleccionada =
        null;

    turnoBlancas =
        !turnoBlancas;

    if (turnoAjedrez) {
        turnoAjedrez.textContent =
            turnoBlancas
                ? "Turno: blancas"
                : "Turno: negras";
    }
}

function reiniciarAjedrez() {
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

    document
        .querySelectorAll(
            ".casilla"
        )
        .forEach(
            (
                casilla,
                index
            ) => {
                casilla.textContent =
                    piezasIniciales[index] ||
                    "";

                casilla.classList.remove(
                    "seleccionada"
                );
            }
        );

    iniciarAjedrez();
}

function ocultarSecciones() {
    if (seccionDashboard) {
        seccionDashboard.style.display =
            "none";
    }

    if (seccionCatalogo) {
        seccionCatalogo.style.display =
            "none";
    }

    if (seccionVenta) {
        seccionVenta.style.display =
            "none";
    }

    if (seccionInventario) {
        seccionInventario.style.display =
            "none";
    }

    if (seccionEntregas) {
        seccionEntregas.style.display =
            "none";
    }
}

function desactivarMenu() {
    document
        .querySelectorAll(
            ".menu a"
        )
        .forEach(
            boton => {
                boton.classList.remove(
                    "activo"
                );
            }
        );
}

function mostrarSeccion(seccion) {
    ocultarSecciones();
    desactivarMenu();

    if (seccion === "dashboard") {
        if (seccionDashboard) {
            seccionDashboard.style.display =
                "block";
        }

        if (tituloPagina) {
            tituloPagina.textContent =
                "Dashboard";
        }

        if (descripcionPagina) {
            descripcionPagina.textContent =
                "Resumen operativo del trabajador";
        }

        btnDashboard?.classList.add(
            "activo"
        );

        return;
    }

    if (seccion === "catalogo") {
        if (seccionCatalogo) {
            seccionCatalogo.style.display =
                "block";
        }

        if (tituloPagina) {
            tituloPagina.textContent =
                "Catálogo";
        }

        if (descripcionPagina) {
            descripcionPagina.textContent =
                "Consulta productos disponibles";
        }

        btnCatalogo?.classList.add(
            "activo"
        );

        return;
    }

    if (seccion === "venta") {
        if (seccionVenta) {
            seccionVenta.style.display =
                "block";
        }

        if (tituloPagina) {
            tituloPagina.textContent =
                "Registrar venta";
        }

        if (descripcionPagina) {
            descripcionPagina.textContent =
                "Selecciona productos y calcula el total";
        }

        btnVenta?.classList.add(
            "activo"
        );

        return;
    }

    if (seccion === "inventario") {
        if (seccionInventario) {
            seccionInventario.style.display =
                "block";
        }

        if (tituloPagina) {
            tituloPagina.textContent =
                "Inventario";
        }

        if (descripcionPagina) {
            descripcionPagina.textContent =
                "Consulta el stock actual de productos";
        }

        btnInventario?.classList.add(
            "activo"
        );

        return;
    }

    if (seccion === "entregas") {
        if (seccionEntregas) {
            seccionEntregas.style.display =
                "block";
        }

        if (tituloPagina) {
            tituloPagina.textContent =
                "Próximas entregas";
        }

        if (descripcionPagina) {
            descripcionPagina.textContent =
                "Consulta proveedores y entregas programadas";
        }

        btnEntregas?.classList.add(
            "activo"
        );
    }
}

async function obtenerProductos() {
    const respuesta =
        await apiFetch(
            "/productos"
        );

    const datos =
        await obtenerJsonSeguro(
            respuesta
        );

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            "No se pudieron obtener los productos."
        );
    }

    productosGlobal =
        Array.isArray(datos)
            ? datos
            : [];

    return productosGlobal;
}

async function obtenerProveedores() {
    const respuesta =
        await apiFetch(
            "/proveedores"
        );

    const datos =
        await obtenerJsonSeguro(
            respuesta
        );

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            "No se pudieron obtener los proveedores."
        );
    }

    proveedoresGlobal =
        Array.isArray(datos)
            ? datos
            : [];

    return proveedoresGlobal;
}

async function obtenerVentas() {
    const respuesta =
        await apiFetch(
            "/ventas"
        );

    const datos =
        await obtenerJsonSeguro(
            respuesta
        );

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            "No se pudieron obtener las ventas."
        );
    }

    ventasGlobal =
        Array.isArray(datos)
            ? datos
            : [];

    return ventasGlobal;
}

async function cargarDashboard() {
    try {
        await Promise.all([
            obtenerProductos(),
            obtenerProveedores(),
            obtenerVentas()
        ]);

        const ventasHoy =
            ventasGlobal.filter(
                venta =>
                    fechaEsHoy(
                        venta.fecha_venta
                    )
            );

        const totalVentasHoy =
            ventasHoy.reduce(
                (
                    total,
                    venta
                ) => {
                    return (
                        total +
                        Number(
                            venta.total ||
                            0
                        )
                    );
                },
                0
            );

        const disponibles =
            productosGlobal.filter(
                producto =>
                    productoDisponible(
                        producto
                    )
            );

        const stockBajo =
            productosGlobal.filter(
                producto => {
                    const stock =
                        Number(
                            producto.stock
                        );

                    return (
                        Number.isFinite(
                            stock
                        ) &&
                        stock <= 10
                    );
                }
            );

        if (ventasDia) {
            ventasDia.textContent =
                `S/ ${totalVentasHoy.toFixed(2)}`;
        }

        if (productosDisponibles) {
            productosDisponibles.textContent =
                String(
                    disponibles.length
                );
        }

        if (productosStockBajo) {
            productosStockBajo.textContent =
                String(
                    stockBajo.length
                );
        }

        if (proximasEntregas) {
            proximasEntregas.textContent =
                String(
                    proveedoresGlobal.length
                );
        }

        if (dashboardStockBajo) {
            dashboardStockBajo.innerHTML =
                "";

            if (
                stockBajo.length === 0
            ) {
                dashboardStockBajo.innerHTML = `
                    <div class="stock-ok">
                        ✅ No hay productos con stock bajo
                    </div>
                `;
            } else {
                stockBajo.forEach(
                    producto => {
                        dashboardStockBajo.innerHTML += `
                            <div class="stock-alerta">

                                <div class="stock-alerta-icono">
                                    ⚠️
                                </div>

                                <div>

                                    <h4>
                                        ${escaparHtml(producto.nombre)}
                                    </h4>

                                    <p>
                                        ${escaparHtml(producto.categoria)}
                                        |
                                        Stock:
                                        ${escaparHtml(producto.stock)}
                                    </p>

                                </div>

                            </div>
                        `;
                    }
                );
            }
        }

        if (dashboardEntregas) {
            dashboardEntregas.innerHTML =
                "";

            if (
                proveedoresGlobal.length === 0
            ) {
                dashboardEntregas.innerHTML = `
                    <div class="producto-vacio">
                        No hay entregas registradas
                    </div>
                `;
            } else {
                const proveedoresOrdenados =
                    [...proveedoresGlobal]
                        .sort(
                            (
                                proveedorA,
                                proveedorB
                            ) => {
                                const fechaA =
                                    proveedorA.proxima_entrega
                                        ? new Date(
                                            proveedorA.proxima_entrega
                                        ).getTime()
                                        : Number.MAX_SAFE_INTEGER;

                                const fechaB =
                                    proveedorB.proxima_entrega
                                        ? new Date(
                                            proveedorB.proxima_entrega
                                        ).getTime()
                                        : Number.MAX_SAFE_INTEGER;

                                return (
                                    fechaA -
                                    fechaB
                                );
                            }
                        );

                proveedoresOrdenados
                    .slice(0, 5)
                    .forEach(
                        proveedor => {
                            const fecha =
                                proveedor.proxima_entrega
                                    ? new Date(
                                        proveedor.proxima_entrega
                                    ).toLocaleDateString(
                                        "es-PE"
                                    )
                                    : "Sin fecha";

                            dashboardEntregas.innerHTML += `
                                <div class="entrega-item">

                                    <div>

                                        <h4>
                                            ${escaparHtml(proveedor.nombre)}
                                        </h4>

                                        <p>
                                            ${escaparHtml(proveedor.categoria)}
                                        </p>

                                    </div>

                                    <strong>
                                        ${escaparHtml(fecha)}
                                    </strong>

                                </div>
                            `;
                        }
                    );
            }
        }

    } catch (error) {
        console.error(
            "Error cargando dashboard:",
            error
        );

        if (
            error.message !==
            "Sesión expirada."
        ) {
            if (!navigator.onLine) {
                mostrarModoOffline();
            } else {
                alert(
                    error.message ||
                    "Error al cargar dashboard."
                );
            }
        }
    }
}

async function cargarCatalogo() {
    if (!listaCatalogo) {
        return;
    }

    try {
        listaCatalogo.innerHTML = `
            <div class="producto-vacio">
                Cargando productos...
            </div>
        `;

        await obtenerProductos();

        mostrarCatalogo();

    } catch (error) {
        console.error(
            "Error cargando catálogo:",
            error
        );

        listaCatalogo.innerHTML = `
            <div class="producto-vacio">
                Error al cargar catálogo
            </div>
        `;
    }
}

function mostrarCatalogo() {
    if (!listaCatalogo) {
        return;
    }

    const categoria =
        filtroCategoriaCatalogo?.value ||
        "Todos";

    const busqueda =
        buscadorGeneral?.value
            .trim()
            .toLowerCase() ||
        "";

    let productos =
        [...productosGlobal];

    if (
        categoria !== "Todos"
    ) {
        productos =
            productos.filter(
                producto =>
                    String(
                        producto.categoria
                    ) ===
                    categoria
            );
    }

    if (busqueda !== "") {
        productos =
            productos.filter(
                producto => {
                    const nombre =
                        String(
                            producto.nombre ||
                            ""
                        ).toLowerCase();

                    const categoriaProducto =
                        String(
                            producto.categoria ||
                            ""
                        ).toLowerCase();

                    return (
                        nombre.includes(
                            busqueda
                        ) ||
                        categoriaProducto.includes(
                            busqueda
                        )
                    );
                }
            );
    }

    listaCatalogo.innerHTML =
        "";

    if (
        productos.length === 0
    ) {
        listaCatalogo.innerHTML = `
            <div class="producto-vacio">
                No se encontraron productos
            </div>
        `;

        return;
    }

    productos.forEach(
        producto => {
            listaCatalogo.innerHTML +=
                crearCardProducto(
                    producto
                );
        }
    );
}

function crearCardProducto(producto) {
    const imagen =
        obtenerRutaImagen(
            producto.imagen
        );

    const estado =
        normalizarEstadoProducto(
            producto
        );

    const estadoClase =
        estadoProductoClase(
            producto
        );

    const stock =
        Number(
            producto.stock
        );

    const stockClase =
        stock <= 10
            ? "stock-bajo-texto"
            : "";

    const precio =
        Number(
            producto.precio
        );

    return `
        <div class="producto-card">

            <img
                src="${imagen}"
                alt="${escaparHtml(producto.nombre)}"
                onerror="this.src='/IMG/producto-default.png'"
            >

            <div class="producto-info">

                <div class="producto-top">

                    <h3>
                        ${escaparHtml(producto.nombre)}
                    </h3>

                    <span class="${estadoClase}">
                        ${escaparHtml(estado)}
                    </span>

                </div>

                <p class="producto-categoria">
                    ${escaparHtml(producto.categoria)}
                </p>

                <div class="producto-datos">

                    <p>
                        <b>Precio:</b>
                        S/ ${
                            Number.isFinite(precio)
                                ? precio.toFixed(2)
                                : "0.00"
                        }
                    </p>

                    <p class="${stockClase}">
                        <b>Stock:</b>
                        ${
                            Number.isFinite(stock)
                                ? stock
                                : 0
                        }
                    </p>

                </div>

            </div>

        </div>
    `;
}

async function cargarProductosVenta() {
    if (!productoVenta) {
        return;
    }

    try {
        await obtenerProductos();

        productoVenta.innerHTML = `
            <option value="">
                Seleccione producto
            </option>
        `;

        productosGlobal.forEach(
            producto => {
                if (
                    productoDisponible(
                        producto
                    )
                ) {
                    const precio =
                        Number(
                            producto.precio
                        );

                    productoVenta.innerHTML += `
                        <option value="${escaparHtml(producto.id)}">
                            ${escaparHtml(producto.nombre)}
                            -
                            S/ ${
                                Number.isFinite(precio)
                                    ? precio.toFixed(2)
                                    : "0.00"
                            }
                            -
                            Stock:
                            ${escaparHtml(producto.stock)}
                        </option>
                    `;
                }
            }
        );

        mostrarCarrito();

    } catch (error) {
        console.error(
            "Error cargando productos para venta:",
            error
        );

        alert(
            error.message ||
            "Error al cargar productos para venta."
        );
    }
}

function agregarProductoCarrito(
    idProducto,
    cantidad
) {
    const producto =
        productosGlobal.find(
            item =>
                Number(item.id) ===
                Number(idProducto)
        );

    if (!producto) {
        alert(
            "Selecciona un producto válido."
        );

        return false;
    }

    if (
        !Number.isInteger(
            cantidad
        ) ||
        cantidad <= 0
    ) {
        alert(
            "La cantidad debe ser mayor a 0."
        );

        return false;
    }

    if (
        !productoDisponible(
            producto
        )
    ) {
        alert(
            "El producto no está disponible para venta."
        );

        return false;
    }

    const stockDisponible =
        Number(
            producto.stock
        );

    const productoEnCarrito =
        carrito.find(
            item =>
                Number(item.id) ===
                Number(idProducto)
        );

    const cantidadActual =
        productoEnCarrito
            ? Number(
                productoEnCarrito.cantidad
            )
            : 0;

    const cantidadFinal =
        cantidadActual +
        cantidad;

    if (
        cantidadFinal >
        stockDisponible
    ) {
        alert(
            `No hay suficiente stock. Disponible: ${stockDisponible}.`
        );

        return false;
    }

    if (productoEnCarrito) {
        productoEnCarrito.cantidad =
            cantidadFinal;

        productoEnCarrito.subtotal =
            Number(
                (
                    productoEnCarrito.cantidad *
                    productoEnCarrito.precio
                ).toFixed(2)
            );

    } else {
        const precio =
            Number(
                producto.precio
            );

        carrito.push({
            id:
                Number(
                    producto.id
                ),

            nombre:
                String(
                    producto.nombre
                ),

            precio,

            cantidad,

            subtotal:
                Number(
                    (
                        precio *
                        cantidad
                    ).toFixed(2)
                )
        });
    }

    mostrarCarrito();

    return true;
}

function mostrarCarrito() {
    if (
        !tablaCarrito ||
        !totalVenta
    ) {
        return;
    }

    tablaCarrito.innerHTML =
        "";

    if (
        carrito.length === 0
    ) {
        tablaCarrito.innerHTML = `
            <tr>
                <td colspan="4">
                    No hay productos agregados
                </td>
            </tr>
        `;

        totalVenta.textContent =
            "S/ 0.00";

        return;
    }

    carrito.forEach(
        item => {
            tablaCarrito.innerHTML += `
                <tr>

                    <td>
                        ${escaparHtml(item.nombre)}
                    </td>

                    <td>
                        ${escaparHtml(item.cantidad)}
                    </td>

                    <td>
                        S/ ${Number(item.precio).toFixed(2)}
                    </td>

                    <td>
                        S/ ${Number(item.subtotal).toFixed(2)}
                    </td>

                </tr>
            `;
        }
    );

    const total =
        carrito.reduce(
            (
                suma,
                item
            ) => {
                return (
                    suma +
                    Number(
                        item.subtotal ||
                        0
                    )
                );
            },
            0
        );

    totalVenta.textContent =
        `S/ ${total.toFixed(2)}`;
}

async function validarCarritoConStockActual() {
    await obtenerProductos();

    for (
        const item
        of carrito
    ) {
        const producto =
            productosGlobal.find(
                productoActual =>
                    Number(
                        productoActual.id
                    ) ===
                    Number(
                        item.id
                    )
            );

        if (!producto) {
            throw new Error(
                `El producto ${item.nombre} ya no existe.`
            );
        }

        if (
            !productoDisponible(
                producto
            )
        ) {
            throw new Error(
                `El producto ${item.nombre} ya no está disponible.`
            );
        }

        if (
            Number(
                producto.stock
            ) <
            Number(
                item.cantidad
            )
        ) {
            throw new Error(
                `Stock insuficiente para ${item.nombre}. Stock actual: ${producto.stock}.`
            );
        }
    }
}

async function guardarVenta() {
    if (
        carrito.length === 0
    ) {
        alert(
            "No hay productos en el carrito."
        );

        return;
    }

    if (!navigator.onLine) {
        mostrarModoOffline();

        alert(
            "No puedes registrar una venta sin conexión."
        );

        return;
    }

    const textoOriginal =
        btnGuardarVenta?.textContent ||
        "Guardar venta";

    if (btnGuardarVenta) {
        btnGuardarVenta.disabled =
            true;

        btnGuardarVenta.textContent =
            "Registrando...";
    }

    try {
        await validarCarritoConStockActual();

        const productosRegistrados =
            [];

        for (
            const item
            of carrito
        ) {
            const respuesta =
                await apiFetch(
                    "/ventas",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                producto_id:
                                    item.id,

                                cantidad:
                                    item.cantidad
                            })
                    }
                );

            const datos =
                await obtenerJsonSeguro(
                    respuesta
                );

            if (!respuesta.ok) {
                carrito =
                    carrito.filter(
                        productoCarrito =>
                            !productosRegistrados.includes(
                                productoCarrito.id
                            )
                    );

                mostrarCarrito();

                throw new Error(
                    datos.mensaje ||
                    `No se pudo registrar ${item.nombre}.`
                );
            }

            productosRegistrados.push(
                item.id
            );
        }

        carrito = [];

        mostrarCarrito();

        alert(
            "Venta registrada correctamente."
        );

        await cargarProductosVenta();

        await cargarDashboard();

    } catch (error) {
        console.error(
            "Error registrando venta:",
            error
        );

        if (
            error.message !==
            "Sesión expirada."
        ) {
            alert(
                error.message ||
                "Error al registrar venta."
            );
        }

        try {
            await cargarProductosVenta();
        } catch {
        }

    } finally {
        if (btnGuardarVenta) {
            btnGuardarVenta.disabled =
                false;

            btnGuardarVenta.textContent =
                textoOriginal;
        }
    }
}

async function cargarInventario() {
    if (!tablaInventario) {
        return;
    }

    try {
        tablaInventario.innerHTML = `
            <tr>
                <td colspan="6">
                    Cargando inventario...
                </td>
            </tr>
        `;

        await obtenerProductos();

        tablaInventario.innerHTML =
            "";

        if (
            productosGlobal.length === 0
        ) {
            tablaInventario.innerHTML = `
                <tr>
                    <td colspan="6">
                        No hay productos registrados
                    </td>
                </tr>
            `;

            return;
        }

        productosGlobal.forEach(
            producto => {
                const imagen =
                    obtenerRutaImagen(
                        producto.imagen
                    );

                const stock =
                    Number(
                        producto.stock
                    );

                const stockClase =
                    stock <= 10
                        ? "stock-bajo-texto"
                        : "";

                const precio =
                    Number(
                        producto.precio
                    );

                const estado =
                    normalizarEstadoProducto(
                        producto
                    );

                tablaInventario.innerHTML += `
                    <tr>

                        <td>

                            <img
                                src="${imagen}"
                                class="img-tabla"
                                alt="${escaparHtml(producto.nombre)}"
                                onerror="this.src='/IMG/producto-default.png'"
                            >

                        </td>

                        <td>
                            ${escaparHtml(producto.nombre)}
                        </td>

                        <td>
                            ${escaparHtml(producto.categoria)}
                        </td>

                        <td>
                            S/ ${
                                Number.isFinite(precio)
                                    ? precio.toFixed(2)
                                    : "0.00"
                            }
                        </td>

                        <td class="${stockClase}">
                            ${
                                Number.isFinite(stock)
                                    ? stock
                                    : 0
                            }
                        </td>

                        <td>
                            ${escaparHtml(estado)}
                        </td>

                    </tr>
                `;
            }
        );

    } catch (error) {
        console.error(
            "Error cargando inventario:",
            error
        );

        tablaInventario.innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar inventario
                </td>
            </tr>
        `;
    }
}

async function cargarEntregas() {
    if (!tablaEntregas) {
        return;
    }

    try {
        tablaEntregas.innerHTML = `
            <tr>
                <td colspan="6">
                    Cargando entregas...
                </td>
            </tr>
        `;

        await obtenerProveedores();

        tablaEntregas.innerHTML =
            "";

        if (
            proveedoresGlobal.length === 0
        ) {
            tablaEntregas.innerHTML = `
                <tr>
                    <td colspan="6">
                        No hay entregas registradas
                    </td>
                </tr>
            `;

            return;
        }

        const proveedoresOrdenados =
            [...proveedoresGlobal]
                .sort(
                    (
                        proveedorA,
                        proveedorB
                    ) => {
                        const fechaA =
                            proveedorA.proxima_entrega
                                ? new Date(
                                    proveedorA.proxima_entrega
                                ).getTime()
                                : Number.MAX_SAFE_INTEGER;

                        const fechaB =
                            proveedorB.proxima_entrega
                                ? new Date(
                                    proveedorB.proxima_entrega
                                ).getTime()
                                : Number.MAX_SAFE_INTEGER;

                        return (
                            fechaA -
                            fechaB
                        );
                    }
                );

        proveedoresOrdenados.forEach(
            proveedor => {
                const fecha =
                    proveedor.proxima_entrega
                        ? new Date(
                            proveedor.proxima_entrega
                        ).toLocaleDateString(
                            "es-PE"
                        )
                        : "Sin fecha";

                tablaEntregas.innerHTML += `
                    <tr>

                        <td>
                            ${escaparHtml(proveedor.nombre)}
                        </td>

                        <td>
                            ${escaparHtml(proveedor.categoria)}
                        </td>

                        <td>

                            ${escaparHtml(
                                proveedor.contacto ||
                                "Sin contacto"
                            )}

                            <br>

                            <small>
                                ${escaparHtml(
                                    proveedor.telefono ||
                                    ""
                                )}
                            </small>

                            <br>

                            <small>
                                ${escaparHtml(
                                    proveedor.correo ||
                                    ""
                                )}
                            </small>

                        </td>

                        <td>
                            ${escaparHtml(
                                proveedor.entregas_2026 ??
                                0
                            )}
                        </td>

                        <td>
                            ${escaparHtml(fecha)}
                        </td>

                        <td>
                            ${escaparHtml(
                                proveedor.estado ||
                                ""
                            )}
                        </td>

                    </tr>
                `;
            }
        );

    } catch (error) {
        console.error(
            "Error cargando entregas:",
            error
        );

        tablaEntregas.innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar entregas
                </td>
            </tr>
        `;
    }
}

function registrarEventos() {
    btnCerrarSesion?.addEventListener(
        "click",
        evento => {
            evento.preventDefault();
            cerrarSesion();
        }
    );

    btnModoOffline?.addEventListener(
        "click",
        evento => {
            evento.preventDefault();
            mostrarModoOffline();
        }
    );

    btnVolverPanel?.addEventListener(
        "click",
        () => {
            ocultarModoOffline();
        }
    );

    btnSimularConexion?.addEventListener(
        "click",
        async () => {
            ocultarModoOffline();

            if (estadoConexionTexto) {
                estadoConexionTexto.textContent =
                    "Conexión restaurada";
            }

            if (navigator.onLine) {
                mostrarSeccion(
                    "dashboard"
                );

                await cargarDashboard();
            }
        }
    );

    btnReiniciarAjedrez?.addEventListener(
        "click",
        reiniciarAjedrez
    );

    btnDashboard?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            mostrarSeccion(
                "dashboard"
            );

            await cargarDashboard();
        }
    );

    btnCatalogo?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            mostrarSeccion(
                "catalogo"
            );

            await cargarCatalogo();
        }
    );

    btnVenta?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            mostrarSeccion(
                "venta"
            );

            await cargarProductosVenta();
        }
    );

    btnInventario?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            mostrarSeccion(
                "inventario"
            );

            await cargarInventario();
        }
    );

    btnEntregas?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            mostrarSeccion(
                "entregas"
            );

            await cargarEntregas();
        }
    );

    filtroCategoriaCatalogo?.addEventListener(
        "change",
        mostrarCatalogo
    );

    buscadorGeneral?.addEventListener(
        "input",
        () => {
            if (
                seccionCatalogo &&
                seccionCatalogo.style.display !==
                    "none"
            ) {
                mostrarCatalogo();
            }
        }
    );

    formAgregarVenta?.addEventListener(
        "submit",
        evento => {
            evento.preventDefault();

            const idProducto =
                Number(
                    productoVenta?.value
                );

            const cantidad =
                Number(
                    cantidadVenta?.value
                );

            const agregado =
                agregarProductoCarrito(
                    idProducto,
                    cantidad
                );

            if (!agregado) {
                return;
            }

            formAgregarVenta.reset();

            if (cantidadVenta) {
                cantidadVenta.value =
                    "1";
            }
        }
    );

    btnVaciarCarrito?.addEventListener(
        "click",
        () => {
            carrito = [];
            mostrarCarrito();
        }
    );

    btnGuardarVenta?.addEventListener(
        "click",
        guardarVenta
    );

    btnActualizarInventario?.addEventListener(
        "click",
        cargarInventario
    );

    btnActualizarEntregas?.addEventListener(
        "click",
        cargarEntregas
    );

    window.addEventListener(
        "offline",
        () => {
            mostrarModoOffline();
        }
    );

    window.addEventListener(
        "online",
        async () => {
            if (estadoConexionTexto) {
                estadoConexionTexto.textContent =
                    "Conexión restaurada";
            }

            const autorizado =
                await verificarTrabajador();

            if (!autorizado) {
                return;
            }
        }
    );
}

async function iniciarPanelTrabajador() {
    const autorizado =
        await verificarTrabajador();

    if (!autorizado) {
        return;
    }

    registrarEventos();

    iniciarAjedrez();

    mostrarSeccion(
        "dashboard"
    );

    const usuario =
        obtenerUsuarioGuardado();

    if (usuario) {
        console.log(
            `Trabajador conectado: ${usuario.correo}`
        );
    }

    if (!navigator.onLine) {
        mostrarModoOffline();
        return;
    }

    await cargarDashboard();
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarPanelTrabajador
);

if (
    "serviceWorker" in
    navigator
) {
    window.addEventListener(
        "load",
        async () => {
            try {
                await navigator
                    .serviceWorker
                    .register(
                        "/service-worker.js"
                    );

                console.log(
                    "Service Worker registrado"
                );

            } catch (error) {
                console.error(
                    "Error Service Worker:",
                    error
                );
            }
        }
    );
}