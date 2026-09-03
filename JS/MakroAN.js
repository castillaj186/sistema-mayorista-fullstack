const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const btnDashboard = document.getElementById("btnDashboard");
const btnUsuarios = document.getElementById("btnUsuarios");
const btnProductos = document.getElementById("btnProductos");
const btnCategorias = document.getElementById("btnCategorias");
const btnProveedores = document.getElementById("btnProveedores");

const seccionDashboard = document.getElementById("seccionDashboard");
const seccionUsuarios = document.getElementById("seccionUsuarios");
const seccionProductos = document.getElementById("seccionProductos");
const seccionCategorias = document.getElementById("seccionCategorias");
const seccionProveedores = document.getElementById("seccionProveedores");

const tituloPagina = document.getElementById("tituloPagina");
const descripcionPagina = document.getElementById("descripcionPagina");

const tablaUsuarios = document.getElementById("tablaUsuarios");
const formCrearUsuario = document.getElementById("formCrearUsuario");
const btnActualizarUsuarios = document.getElementById("btnActualizarUsuarios");

const formCrearProducto = document.getElementById("formCrearProducto");
const listaProductos = document.getElementById("listaProductos");
const btnActualizarProductos = document.getElementById("btnActualizarProductos");
const inputImagenProducto = document.getElementById("imagenProducto");
const previewImagenProducto = document.getElementById("previewImagenProducto");

const btnActualizarCategorias = document.getElementById("btnActualizarCategorias");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroStock = document.getElementById("filtroStock");
const alertasStockBajo = document.getElementById("alertasStockBajo");
const productosPorCategoria = document.getElementById("productosPorCategoria");
const contadorProductosCategoria = document.getElementById("contadorProductosCategoria");

const totalAlimentos = document.getElementById("totalAlimentos");
const totalBebidas = document.getElementById("totalBebidas");
const totalLimpieza = document.getElementById("totalLimpieza");
const totalCuidado = document.getElementById("totalCuidado");
const totalOtros = document.getElementById("totalOtros");

const formCrearProveedor = document.getElementById("formCrearProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const btnActualizarProveedores = document.getElementById("btnActualizarProveedores");

const totalProveedores = document.getElementById("totalProveedores");
const totalEntregas2026 = document.getElementById("totalEntregas2026");
const totalProximasEntregas = document.getElementById("totalProximasEntregas");

let productosGlobal = [];

function obtenerToken() {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
}

function obtenerUsuario() {
    const usuarioGuardado =
        localStorage.getItem("usuario") ||
        sessionStorage.getItem("usuario");

    if (!usuarioGuardado) {
        return null;
    }

    try {
        return JSON.parse(usuarioGuardado);
    } catch {
        return null;
    }
}

function limpiarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("rol");
}

function redirigirLogin() {
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

async function apiFetch(url, opciones = {}) {
    const token = obtenerToken();

    if (!token) {
        redirigirLogin();
        throw new Error("No existe una sesión activa.");
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
        alert(
            "No tienes permisos para realizar esta acción."
        );

        limpiarSesion();

        window.location.href = "/";

        throw new Error(
            "Acceso no autorizado."
        );
    }

    return respuesta;
}

async function obtenerJsonSeguro(respuesta) {
    try {
        return await respuesta.json();
    } catch {
        return {};
    }
}

async function verificarAdministrador() {
    const token = obtenerToken();

    if (!token) {
        redirigirLogin();
        return false;
    }

    try {
        const respuesta = await fetch(
            "/auth/admin",
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
                "Debes iniciar sesión como administrador."
            );

            window.location.href = "/";

            return false;
        }

        const datos =
            await obtenerJsonSeguro(
                respuesta
            );

        if (
            !datos.usuario ||
            Number(datos.usuario.rol) !== 1
        ) {
            limpiarSesion();

            window.location.href = "/";

            return false;
        }

        return true;

    } catch (error) {
        console.error(
            "Error verificando administrador:",
            error
        );

        alert(
            "No se pudo verificar tu sesión."
        );

        window.location.href = "/";

        return false;
    }
}

function ocultarSecciones() {
    if (seccionDashboard) {
        seccionDashboard.style.display =
            "none";
    }

    if (seccionUsuarios) {
        seccionUsuarios.style.display =
            "none";
    }

    if (seccionProductos) {
        seccionProductos.style.display =
            "none";
    }

    if (seccionCategorias) {
        seccionCategorias.style.display =
            "none";
    }

    if (seccionProveedores) {
        seccionProveedores.style.display =
            "none";
    }
}

function activarMenu(botonActivo) {
    document
        .querySelectorAll(".menu a")
        .forEach(boton => {
            boton.classList.remove(
                "activo"
            );
        });

    if (botonActivo) {
        botonActivo.classList.add(
            "activo"
        );
    }
}

async function cargarUsuarios() {
    if (!tablaUsuarios) {
        return;
    }

    try {
        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="4">
                    Cargando usuarios...
                </td>
            </tr>
        `;

        const respuesta =
            await apiFetch(
                "/usuarios"
            );

        const usuarios =
            await obtenerJsonSeguro(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                usuarios.mensaje ||
                "No se pudieron cargar los usuarios."
            );
        }

        tablaUsuarios.innerHTML = "";

        if (
            !Array.isArray(usuarios) ||
            usuarios.length === 0
        ) {
            tablaUsuarios.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay usuarios registrados
                    </td>
                </tr>
            `;

            return;
        }

        usuarios.forEach(usuario => {
            const rol =
                Number(usuario.rol);

            const rolTexto =
                rol === 1
                    ? "Administrador"
                    : "Trabajador";

            const claseRol =
                rol === 1
                    ? "rol-admin"
                    : "rol-trabajador";

            const fecha =
                usuario.fecha_creacion
                    ? new Date(
                        usuario.fecha_creacion
                    ).toLocaleString()
                    : "Sin fecha";

            tablaUsuarios.innerHTML += `
                <tr>
                    <td>
                        ${escaparHtml(usuario.id)}
                    </td>

                    <td>
                        ${escaparHtml(usuario.correo)}
                    </td>

                    <td>
                        <span class="${claseRol}">
                            ${rolTexto}
                        </span>
                    </td>

                    <td>
                        ${escaparHtml(fecha)}
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(
            "Error cargando usuarios:",
            error
        );

        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="4">
                    Error al cargar usuarios
                </td>
            </tr>
        `;
    }
}

async function crearUsuario(evento) {
    evento.preventDefault();

    const inputCorreo =
        document.getElementById(
            "correoUsuario"
        );

    const inputContrasena =
        document.getElementById(
            "passUsuario"
        );

    const inputRol =
        document.getElementById(
            "rolUsuario"
        );

    const correo =
        inputCorreo?.value
            .trim()
            .toLowerCase();

    const contrasena =
        inputContrasena?.value;

    const rol =
        Number(
            inputRol?.value
        );

    if (
        !correo ||
        !contrasena
    ) {
        alert(
            "Completa el correo y la contraseña."
        );

        return;
    }

    if (
        rol !== 0 &&
        rol !== 1
    ) {
        alert(
            "Selecciona un rol válido."
        );

        return;
    }

    try {
        const respuesta =
            await apiFetch(
                "/usuarios",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            correo,
                            contrasena,
                            rol
                        })
                }
            );

        const datos =
            await obtenerJsonSeguro(
                respuesta
            );

        alert(
            datos.mensaje ||
            (
                respuesta.ok
                    ? "Usuario creado correctamente."
                    : "No se pudo crear el usuario."
            )
        );

        if (!respuesta.ok) {
            return;
        }

        formCrearUsuario?.reset();

        await cargarUsuarios();

    } catch (error) {
        console.error(
            "Error creando usuario:",
            error
        );

        if (
            error.message !==
            "Sesión expirada."
        ) {
            alert(
                "Error al crear usuario."
            );
        }
    }
}

function previsualizarImagenProducto() {
    if (
        !inputImagenProducto ||
        !previewImagenProducto
    ) {
        return;
    }

    const archivo =
        inputImagenProducto.files?.[0];

    if (!archivo) {
        previewImagenProducto.src =
            "/IMG/producto-default.png";

        return;
    }

    if (
        ![
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(archivo.type)
    ) {
        alert(
            "Selecciona una imagen JPG, PNG o WEBP."
        );

        inputImagenProducto.value = "";

        previewImagenProducto.src =
            "/IMG/producto-default.png";

        return;
    }

    if (
        archivo.size >
        5 * 1024 * 1024
    ) {
        alert(
            "La imagen no puede superar los 5 MB."
        );

        inputImagenProducto.value = "";

        previewImagenProducto.src =
            "/IMG/producto-default.png";

        return;
    }

    previewImagenProducto.src =
        URL.createObjectURL(
            archivo
        );
}

async function cargarProductos() {
    if (!listaProductos) {
        return;
    }

    try {
        listaProductos.innerHTML = `
            <div class="producto-vacio">
                Cargando productos...
            </div>
        `;

        const respuesta =
            await apiFetch(
                "/productos"
            );

        const productos =
            await obtenerJsonSeguro(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                productos.mensaje ||
                "No se pudieron cargar los productos."
            );
        }

        listaProductos.innerHTML = "";

        if (
            !Array.isArray(productos) ||
            productos.length === 0
        ) {
            listaProductos.innerHTML = `
                <div class="producto-vacio">
                    No hay productos registrados
                </div>
            `;

            return;
        }

        productos.forEach(producto => {
            listaProductos.innerHTML +=
                crearCardProducto(
                    producto
                );
        });

    } catch (error) {
        console.error(
            "Error cargando productos:",
            error
        );

        listaProductos.innerHTML = `
            <div class="producto-vacio">
                Error al cargar productos
            </div>
        `;
    }
}

function crearCardProducto(producto) {
    const imagen =
        producto.imagen
            ? escaparHtml(
                producto.imagen
            )
            : "/IMG/producto-default.png";

    const estado =
        String(
            producto.estado || ""
        );

    const estadoNormalizado =
        estado.toLowerCase();

    const estadoClase =
        (
            estadoNormalizado ===
                "activo" ||
            estadoNormalizado ===
                "disponible"
        )
            ? "producto-activo"
            : estadoNormalizado ===
                "agotado"
                ? "producto-agotado"
                : "producto-inactivo";

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

    const fecha =
        producto.fecha_creacion
            ? new Date(
                producto.fecha_creacion
            ).toLocaleString()
            : "Sin fecha";

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

                <p class="producto-fecha">
                    Creado:
                    ${escaparHtml(fecha)}
                </p>

            </div>

        </div>
    `;
}

async function crearProducto(evento) {
    evento.preventDefault();

    const nombre =
        document.getElementById(
            "nombreProducto"
        )?.value.trim();

    const categoria =
        document.getElementById(
            "categoriaProducto"
        )?.value;

    const precio =
        document.getElementById(
            "precioProducto"
        )?.value;

    const stock =
        document.getElementById(
            "stockProducto"
        )?.value;

    const estado =
        document.getElementById(
            "estadoProducto"
        )?.value;

    const imagen =
        document.getElementById(
            "imagenProducto"
        )?.files?.[0];

    if (
        !nombre ||
        !categoria ||
        precio === "" ||
        stock === ""
    ) {
        alert(
            "Completa los datos obligatorios del producto."
        );

        return;
    }

    const datos =
        new FormData();

    datos.append(
        "nombre",
        nombre
    );

    datos.append(
        "categoria",
        categoria
    );

    datos.append(
        "precio",
        precio
    );

    datos.append(
        "stock",
        stock
    );

    datos.append(
        "estado",
        estado || ""
    );

    if (imagen) {
        datos.append(
            "imagen",
            imagen
        );
    }

    try {
        const respuesta =
            await apiFetch(
                "/productos",
                {
                    method: "POST",
                    body: datos
                }
            );

        const resultado =
            await obtenerJsonSeguro(
                respuesta
            );

        alert(
            resultado.mensaje ||
            (
                respuesta.ok
                    ? "Producto creado correctamente."
                    : "No se pudo crear el producto."
            )
        );

        if (!respuesta.ok) {
            return;
        }

        formCrearProducto?.reset();

        if (
            previewImagenProducto
        ) {
            previewImagenProducto.src =
                "/IMG/producto-default.png";
        }

        await cargarProductos();

    } catch (error) {
        console.error(
            "Error creando producto:",
            error
        );

        if (
            error.message !==
            "Sesión expirada."
        ) {
            alert(
                "Error al crear producto."
            );
        }
    }
}

async function cargarCategorias() {
    if (!productosPorCategoria) {
        return;
    }

    try {
        productosPorCategoria.innerHTML = `
            <div class="producto-vacio">
                Cargando productos...
            </div>
        `;

        const respuesta =
            await apiFetch(
                "/productos"
            );

        const productos =
            await obtenerJsonSeguro(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                productos.mensaje ||
                "No se pudieron cargar los productos."
            );
        }

        productosGlobal =
            Array.isArray(productos)
                ? productos
                : [];

        actualizarResumenCategorias();

        mostrarAlertasStockBajo();

        filtrarProductosCategoria();

    } catch (error) {
        console.error(
            "Error cargando categorías:",
            error
        );

        productosPorCategoria.innerHTML = `
            <div class="producto-vacio">
                Error al cargar categorías
            </div>
        `;
    }
}

function actualizarResumenCategorias() {
    const contarCategoria =
        nombre =>
            productosGlobal.filter(
                producto =>
                    String(
                        producto.categoria
                    ).toLowerCase() ===
                    nombre.toLowerCase()
            ).length;

    const alimentos =
        contarCategoria(
            "Alimentos"
        );

    const bebidas =
        contarCategoria(
            "Bebidas"
        );

    const limpieza =
        contarCategoria(
            "Limpieza"
        );

    const cuidado =
        contarCategoria(
            "Cuidado personal"
        );

    const otros =
        contarCategoria(
            "Otros"
        );

    if (totalAlimentos) {
        totalAlimentos.textContent =
            `${alimentos} productos`;
    }

    if (totalBebidas) {
        totalBebidas.textContent =
            `${bebidas} productos`;
    }

    if (totalLimpieza) {
        totalLimpieza.textContent =
            `${limpieza} productos`;
    }

    if (totalCuidado) {
        totalCuidado.textContent =
            `${cuidado} productos`;
    }

    if (totalOtros) {
        totalOtros.textContent =
            `${otros} productos`;
    }
}

function mostrarAlertasStockBajo() {
    if (!alertasStockBajo) {
        return;
    }

    const productosStockBajo =
        productosGlobal.filter(
            producto =>
                Number(
                    producto.stock
                ) <= 10
        );

    if (
        productosStockBajo.length === 0
    ) {
        alertasStockBajo.innerHTML = `
            <div class="stock-ok">
                ✅ No hay productos con stock bajo
            </div>
        `;

        return;
    }

    alertasStockBajo.innerHTML = "";

    productosStockBajo.forEach(
        producto => {
            alertasStockBajo.innerHTML += `
                <div class="stock-alerta">

                    <div class="stock-alerta-icono">
                        ⚠️
                    </div>

                    <div>

                        <h4>
                            ${escaparHtml(producto.nombre)}
                        </h4>

                        <p>
                            Categoría:
                            ${escaparHtml(producto.categoria)}
                            |
                            Stock actual:
                            ${escaparHtml(producto.stock)}
                        </p>

                    </div>

                </div>
            `;
        }
    );
}

function filtrarProductosCategoria() {
    if (!productosPorCategoria) {
        return;
    }

    const categoriaSeleccionada =
        filtroCategoria?.value ||
        "Todos";

    const stockSeleccionado =
        filtroStock?.value ||
        "Todos";

    let productosFiltrados =
        [...productosGlobal];

    if (
        categoriaSeleccionada !==
        "Todos"
    ) {
        productosFiltrados =
            productosFiltrados.filter(
                producto =>
                    producto.categoria ===
                    categoriaSeleccionada
            );
    }

    if (
        stockSeleccionado ===
        "Bajo"
    ) {
        productosFiltrados =
            productosFiltrados.filter(
                producto =>
                    Number(
                        producto.stock
                    ) <= 10 &&
                    Number(
                        producto.stock
                    ) > 0
            );
    }

    if (
        stockSeleccionado ===
        "SinStock"
    ) {
        productosFiltrados =
            productosFiltrados.filter(
                producto =>
                    Number(
                        producto.stock
                    ) === 0
            );
    }

    if (
        contadorProductosCategoria
    ) {
        contadorProductosCategoria.textContent =
            `${productosFiltrados.length} productos encontrados`;
    }

    productosPorCategoria.innerHTML =
        "";

    if (
        productosFiltrados.length === 0
    ) {
        productosPorCategoria.innerHTML = `
            <div class="producto-vacio">
                No hay productos con ese filtro
            </div>
        `;

        return;
    }

    productosFiltrados.forEach(
        producto => {
            productosPorCategoria.innerHTML +=
                crearCardProducto(
                    producto
                );
        }
    );
}

async function cargarProveedores() {
    if (!tablaProveedores) {
        return;
    }

    try {
        tablaProveedores.innerHTML = `
            <tr>
                <td colspan="6">
                    Cargando proveedores...
                </td>
            </tr>
        `;

        const respuesta =
            await apiFetch(
                "/proveedores"
            );

        const proveedores =
            await obtenerJsonSeguro(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                proveedores.mensaje ||
                "No se pudieron cargar los proveedores."
            );
        }

        tablaProveedores.innerHTML =
            "";

        if (
            !Array.isArray(proveedores) ||
            proveedores.length === 0
        ) {
            tablaProveedores.innerHTML = `
                <tr>
                    <td colspan="6">
                        No hay proveedores registrados
                    </td>
                </tr>
            `;

            if (totalProveedores) {
                totalProveedores.textContent =
                    "0";
            }

            if (totalEntregas2026) {
                totalEntregas2026.textContent =
                    "0";
            }

            if (
                totalProximasEntregas
            ) {
                totalProximasEntregas.textContent =
                    "0";
            }

            return;
        }

        if (totalProveedores) {
            totalProveedores.textContent =
                String(
                    proveedores.length
                );
        }

        const entregasTotales =
            proveedores.reduce(
                (
                    total,
                    proveedor
                ) => {
                    return (
                        total +
                        Number(
                            proveedor.entregas_2026 ||
                            0
                        )
                    );
                },
                0
            );

        if (
            totalEntregas2026
        ) {
            totalEntregas2026.textContent =
                String(
                    entregasTotales
                );
        }

        const proximas =
            proveedores.filter(
                proveedor =>
                    Boolean(
                        proveedor.proxima_entrega
                    )
            ).length;

        if (
            totalProximasEntregas
        ) {
            totalProximasEntregas.textContent =
                String(proximas);
        }

        proveedores.forEach(
            proveedor => {
                const estado =
                    String(
                        proveedor.estado ||
                        ""
                    );

                const estadoNormalizado =
                    estado.toLowerCase();

                const estadoClase =
                    estadoNormalizado ===
                    "activo"
                        ? "proveedor-activo"
                        : estadoNormalizado ===
                            "pendiente"
                            ? "proveedor-pendiente"
                            : "proveedor-inactivo";

                const fechaEntrega =
                    proveedor.proxima_entrega
                        ? new Date(
                            proveedor.proxima_entrega
                        ).toLocaleDateString()
                        : "Sin fecha";

                tablaProveedores.innerHTML += `
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
                            ${escaparHtml(fechaEntrega)}
                        </td>

                        <td>
                            <span class="${estadoClase}">
                                ${escaparHtml(estado)}
                            </span>
                        </td>

                    </tr>
                `;
            }
        );

    } catch (error) {
        console.error(
            "Error cargando proveedores:",
            error
        );

        tablaProveedores.innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar proveedores
                </td>
            </tr>
        `;
    }
}

async function crearProveedor(evento) {
    evento.preventDefault();

    const nombre =
        document.getElementById(
            "nombreProveedor"
        )?.value.trim();

    const categoria =
        document.getElementById(
            "categoriaProveedor"
        )?.value;

    const contacto =
        document.getElementById(
            "contactoProveedor"
        )?.value.trim();

    const telefono =
        document.getElementById(
            "telefonoProveedor"
        )?.value.trim();

    const correo =
        document.getElementById(
            "correoProveedor"
        )?.value.trim();

    const entregas_2026 =
        document.getElementById(
            "entregasProveedor"
        )?.value;

    const proxima_entrega =
        document.getElementById(
            "proximaEntregaProveedor"
        )?.value;

    const estado =
        document.getElementById(
            "estadoProveedor"
        )?.value;

    if (
        !nombre ||
        !categoria ||
        !proxima_entrega
    ) {
        alert(
            "Completa los datos obligatorios del proveedor."
        );

        return;
    }

    try {
        const respuesta =
            await apiFetch(
                "/proveedores",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            nombre,
                            categoria,
                            contacto,
                            telefono,
                            correo,
                            entregas_2026,
                            proxima_entrega,
                            estado
                        })
                }
            );

        const datos =
            await obtenerJsonSeguro(
                respuesta
            );

        alert(
            datos.mensaje ||
            (
                respuesta.ok
                    ? "Proveedor registrado correctamente."
                    : "No se pudo registrar el proveedor."
            )
        );

        if (!respuesta.ok) {
            return;
        }

        formCrearProveedor?.reset();

        await cargarProveedores();

    } catch (error) {
        console.error(
            "Error registrando proveedor:",
            error
        );

        if (
            error.message !==
            "Sesión expirada."
        ) {
            alert(
                "Error al registrar proveedor."
            );
        }
    }
}

function cerrarSesion() {
    limpiarSesion();

    window.location.href =
        "/";
}

function mostrarDashboard() {
    ocultarSecciones();

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
            "Bienvenido al panel de administración de Makro";
    }

    activarMenu(
        btnDashboard
    );
}

function registrarEventos() {
    btnCerrarSesion?.addEventListener(
        "click",
        evento => {
            evento.preventDefault();

            cerrarSesion();
        }
    );

    btnDashboard?.addEventListener(
        "click",
        evento => {
            evento.preventDefault();

            mostrarDashboard();
        }
    );

    btnUsuarios?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            ocultarSecciones();

            if (seccionUsuarios) {
                seccionUsuarios.style.display =
                    "block";
            }

            if (tituloPagina) {
                tituloPagina.textContent =
                    "Usuarios";
            }

            if (descripcionPagina) {
                descripcionPagina.textContent =
                    "Administración de usuarios del sistema";
            }

            activarMenu(
                btnUsuarios
            );

            await cargarUsuarios();
        }
    );

    btnProductos?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            ocultarSecciones();

            if (seccionProductos) {
                seccionProductos.style.display =
                    "block";
            }

            if (tituloPagina) {
                tituloPagina.textContent =
                    "Productos";
            }

            if (descripcionPagina) {
                descripcionPagina.textContent =
                    "Gestión y registro de productos Makro";
            }

            activarMenu(
                btnProductos
            );

            await cargarProductos();
        }
    );

    btnCategorias?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            ocultarSecciones();

            if (seccionCategorias) {
                seccionCategorias.style.display =
                    "block";
            }

            if (tituloPagina) {
                tituloPagina.textContent =
                    "Categorías";
            }

            if (descripcionPagina) {
                descripcionPagina.textContent =
                    "Filtrado de productos por categoría y alertas de stock bajo";
            }

            activarMenu(
                btnCategorias
            );

            await cargarCategorias();
        }
    );

    btnProveedores?.addEventListener(
        "click",
        async evento => {
            evento.preventDefault();

            ocultarSecciones();

            if (seccionProveedores) {
                seccionProveedores.style.display =
                    "block";
            }

            if (tituloPagina) {
                tituloPagina.textContent =
                    "Proveedores";
            }

            if (descripcionPagina) {
                descripcionPagina.textContent =
                    "Gestión de empresas proveedoras y próximas entregas";
            }

            activarMenu(
                btnProveedores
            );

            await cargarProveedores();
        }
    );

    formCrearUsuario?.addEventListener(
        "submit",
        crearUsuario
    );

    btnActualizarUsuarios?.addEventListener(
        "click",
        async () => {
            await cargarUsuarios();
        }
    );

    inputImagenProducto?.addEventListener(
        "change",
        previsualizarImagenProducto
    );

    formCrearProducto?.addEventListener(
        "submit",
        crearProducto
    );

    btnActualizarProductos?.addEventListener(
        "click",
        async () => {
            await cargarProductos();
        }
    );

    btnActualizarCategorias?.addEventListener(
        "click",
        async () => {
            await cargarCategorias();
        }
    );

    filtroCategoria?.addEventListener(
        "change",
        filtrarProductosCategoria
    );

    filtroStock?.addEventListener(
        "change",
        filtrarProductosCategoria
    );

    formCrearProveedor?.addEventListener(
        "submit",
        crearProveedor
    );

    btnActualizarProveedores?.addEventListener(
        "click",
        async () => {
            await cargarProveedores();
        }
    );
}

async function iniciarPanelAdministrador() {
    const autorizado =
        await verificarAdministrador();

    if (!autorizado) {
        return;
    }

    registrarEventos();

    mostrarDashboard();

    const usuario =
        obtenerUsuario();

    if (usuario) {
        console.log(
            `Administrador conectado: ${usuario.correo}`
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarPanelAdministrador
);