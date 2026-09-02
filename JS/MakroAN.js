const btnCerrarSesion = document.getElementById("btnCerrarSesion");

btnCerrarSesion.addEventListener("click", () => {
    window.location.href = "/";
});

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

let productosGlobal = [];

const formCrearProveedor = document.getElementById("formCrearProveedor");
const tablaProveedores = document.getElementById("tablaProveedores");
const btnActualizarProveedores = document.getElementById("btnActualizarProveedores");

const totalProveedores = document.getElementById("totalProveedores");
const totalEntregas2026 = document.getElementById("totalEntregas2026");
const totalProximasEntregas = document.getElementById("totalProximasEntregas");

btnDashboard.addEventListener("click", (e) => {
    e.preventDefault();

    ocultarSecciones();

    seccionDashboard.style.display = "block";

    tituloPagina.textContent = "Dashboard";
    descripcionPagina.textContent =
        "Bienvenido al panel de administración de Makro";

    activarMenu(btnDashboard);
});

btnUsuarios.addEventListener("click", async (e) => {
    e.preventDefault();

    ocultarSecciones();

    seccionUsuarios.style.display = "block";

    tituloPagina.textContent = "Usuarios";
    descripcionPagina.textContent =
        "Administración de usuarios del sistema";

    activarMenu(btnUsuarios);

    await cargarUsuarios();
});

btnProductos.addEventListener("click", async (e) => {
    e.preventDefault();

    ocultarSecciones();

    seccionProductos.style.display = "block";

    tituloPagina.textContent = "Productos";
    descripcionPagina.textContent =
        "Gestión y registro de productos Makro";

    activarMenu(btnProductos);

    await cargarProductos();
});

btnCategorias.addEventListener("click", async (e) => {
    e.preventDefault();

    ocultarSecciones();

    seccionCategorias.style.display = "block";

    tituloPagina.textContent = "Categorías";
    descripcionPagina.textContent =
        "Filtrado de productos por categoría y alertas de stock bajo";

    activarMenu(btnCategorias);

    await cargarCategorias();
});

btnProveedores.addEventListener("click", async (e) => {
    e.preventDefault();

    ocultarSecciones();

    seccionProveedores.style.display = "block";

    tituloPagina.textContent = "Proveedores";
    descripcionPagina.textContent =
        "Gestión de empresas proveedoras y próximas entregas";

    activarMenu(btnProveedores);

    await cargarProveedores();
});

function ocultarSecciones() {
    seccionDashboard.style.display = "none";
    seccionUsuarios.style.display = "none";
    seccionProductos.style.display = "none";
    seccionCategorias.style.display = "none";
    seccionProveedores.style.display = "none";
}

function activarMenu(botonActivo) {
    document.querySelectorAll(".menu a").forEach((btn) => {
        btn.classList.remove("activo");
    });

    botonActivo.classList.add("activo");
}

async function cargarUsuarios() {
    try {
        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="4">Cargando usuarios...</td>
            </tr>
        `;

        const res = await fetch("/usuarios");
        const usuarios = await res.json();

        tablaUsuarios.innerHTML = "";

        if (usuarios.length === 0) {
            tablaUsuarios.innerHTML = `
                <tr>
                    <td colspan="4">No hay usuarios registrados</td>
                </tr>
            `;
            return;
        }

        usuarios.forEach((usuario) => {
            const rolTexto = usuario.rol == 1 ? "Administrador" : "Trabajador";
            const claseRol = usuario.rol == 1 ? "rol-admin" : "rol-trabajador";

            tablaUsuarios.innerHTML += `
                <tr>
                    <td>${usuario.id}</td>
                    <td>${usuario.correo}</td>
                    <td>
                        <span class="${claseRol}">
                            ${rolTexto}
                        </span>
                    </td>
                    <td>${new Date(usuario.fecha_creacion).toLocaleString()}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.log(error);

        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="4">Error al cargar usuarios</td>
            </tr>
        `;
    }
}

formCrearUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correoUsuario").value;
    const contrasena = document.getElementById("passUsuario").value;
    const rol = document.getElementById("rolUsuario").value;

    try {
        const res = await fetch("/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                contrasena,
                rol
            })
        });

        const data = await res.json();

        alert(data.mensaje);

        if (!res.ok) {
            return;
        }

        formCrearUsuario.reset();

        await cargarUsuarios();

    } catch (error) {
        console.log(error);
        alert("Error al crear usuario");
    }
});

btnActualizarUsuarios.addEventListener("click", async () => {
    await cargarUsuarios();
});

inputImagenProducto.addEventListener("change", () => {
    const archivo = inputImagenProducto.files[0];

    if (!archivo) {
        previewImagenProducto.src = "/IMG/producto-default.png";
        return;
    }

    previewImagenProducto.src = URL.createObjectURL(archivo);
});

async function cargarProductos() {
    try {
        listaProductos.innerHTML = `
            <div class="producto-vacio">
                Cargando productos...
            </div>
        `;

        const res = await fetch("/productos");
        const productos = await res.json();

        listaProductos.innerHTML = "";

        if (productos.length === 0) {
            listaProductos.innerHTML = `
                <div class="producto-vacio">
                    No hay productos registrados
                </div>
            `;
            return;
        }

        productos.forEach((producto) => {
            listaProductos.innerHTML += crearCardProducto(producto);
        });

    } catch (error) {
        console.log(error);

        listaProductos.innerHTML = `
            <div class="producto-vacio">
                Error al cargar productos
            </div>
        `;
    }
}

function crearCardProducto(producto) {
    const imagen = producto.imagen
        ? producto.imagen
        : "/IMG/producto-default.png";

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

                <p class="producto-categoria">
                    ${producto.categoria}
                </p>

                <div class="producto-datos">
                    <p>
                        <b>Precio:</b>
                        S/ ${Number(producto.precio).toFixed(2)}
                    </p>

                    <p class="${stockClase}">
                        <b>Stock:</b>
                        ${producto.stock}
                    </p>
                </div>

                <p class="producto-fecha">
                    Creado:
                    ${new Date(producto.fecha_creacion).toLocaleString()}
                </p>

            </div>

        </div>
    `;
}

formCrearProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreProducto").value;
    const categoria = document.getElementById("categoriaProducto").value;
    const precio = document.getElementById("precioProducto").value;
    const stock = document.getElementById("stockProducto").value;
    const estado = document.getElementById("estadoProducto").value;
    const imagen = document.getElementById("imagenProducto").files[0];

    const datos = new FormData();

    datos.append("nombre", nombre);
    datos.append("categoria", categoria);
    datos.append("precio", precio);
    datos.append("stock", stock);
    datos.append("estado", estado);
    datos.append("imagen", imagen);

    try {
        const res = await fetch("/productos", {
            method: "POST",
            body: datos
        });

        const data = await res.json();

        alert(data.mensaje);

        if (!res.ok) {
            return;
        }

        formCrearProducto.reset();
        previewImagenProducto.src = "/IMG/producto-default.png";

        await cargarProductos();

    } catch (error) {
        console.log(error);
        alert("Error al crear producto");
    }
});

btnActualizarProductos.addEventListener("click", async () => {
    await cargarProductos();
});

async function cargarCategorias() {
    try {
        productosPorCategoria.innerHTML = `
            <div class="producto-vacio">
                Cargando productos...
            </div>
        `;

        const res = await fetch("/productos");
        productosGlobal = await res.json();

        actualizarResumenCategorias();
        mostrarAlertasStockBajo();
        filtrarProductosCategoria();

    } catch (error) {
        console.log(error);

        productosPorCategoria.innerHTML = `
            <div class="producto-vacio">
                Error al cargar categorías
            </div>
        `;
    }
}

function actualizarResumenCategorias() {
    const alimentos = productosGlobal.filter(p => p.categoria === "Alimentos").length;
    const bebidas = productosGlobal.filter(p => p.categoria === "Bebidas").length;
    const limpieza = productosGlobal.filter(p => p.categoria === "Limpieza").length;
    const cuidado = productosGlobal.filter(p => p.categoria === "Cuidado personal").length;
    const otros = productosGlobal.filter(p => p.categoria === "Otros").length;

    totalAlimentos.textContent = `${alimentos} productos`;
    totalBebidas.textContent = `${bebidas} productos`;
    totalLimpieza.textContent = `${limpieza} productos`;
    totalCuidado.textContent = `${cuidado} productos`;
    totalOtros.textContent = `${otros} productos`;
}

function mostrarAlertasStockBajo() {
    const productosStockBajo = productosGlobal.filter(
        producto => Number(producto.stock) <= 10
    );

    if (productosStockBajo.length === 0) {
        alertasStockBajo.innerHTML = `
            <div class="stock-ok">
                ✅ No hay productos con stock bajo
            </div>
        `;
        return;
    }

    alertasStockBajo.innerHTML = "";

    productosStockBajo.forEach((producto) => {
        alertasStockBajo.innerHTML += `
            <div class="stock-alerta">
                <div class="stock-alerta-icono">⚠️</div>

                <div>
                    <h4>${producto.nombre}</h4>
                    <p>
                        Categoría: ${producto.categoria} |
                        Stock actual: ${producto.stock}
                    </p>
                </div>
            </div>
        `;
    });
}

function filtrarProductosCategoria() {
    const categoriaSeleccionada = filtroCategoria.value;
    const stockSeleccionado = filtroStock.value;

    let productosFiltrados = [...productosGlobal];

    if (categoriaSeleccionada !== "Todos") {
        productosFiltrados = productosFiltrados.filter(
            producto => producto.categoria === categoriaSeleccionada
        );
    }

    if (stockSeleccionado === "Bajo") {
        productosFiltrados = productosFiltrados.filter(
            producto => Number(producto.stock) <= 10 && Number(producto.stock) > 0
        );
    }

    if (stockSeleccionado === "SinStock") {
        productosFiltrados = productosFiltrados.filter(
            producto => Number(producto.stock) === 0
        );
    }

    contadorProductosCategoria.textContent =
        `${productosFiltrados.length} productos encontrados`;

    productosPorCategoria.innerHTML = "";

    if (productosFiltrados.length === 0) {
        productosPorCategoria.innerHTML = `
            <div class="producto-vacio">
                No hay productos con ese filtro
            </div>
        `;
        return;
    }

    productosFiltrados.forEach((producto) => {
        productosPorCategoria.innerHTML += crearCardProducto(producto);
    });
}

btnActualizarCategorias.addEventListener("click", async () => {
    await cargarCategorias();
});

filtroCategoria.addEventListener("change", () => {
    filtrarProductosCategoria();
});

filtroStock.addEventListener("change", () => {
    filtrarProductosCategoria();
});

async function cargarProveedores() {
    try {
        tablaProveedores.innerHTML = `
            <tr>
                <td colspan="6">Cargando proveedores...</td>
            </tr>
        `;

        const res = await fetch("/proveedores");
        const proveedores = await res.json();

        tablaProveedores.innerHTML = "";

        if (proveedores.length === 0) {
            tablaProveedores.innerHTML = `
                <tr>
                    <td colspan="6">No hay proveedores registrados</td>
                </tr>
            `;

            totalProveedores.textContent = "0";
            totalEntregas2026.textContent = "0";
            totalProximasEntregas.textContent = "0";

            return;
        }

        totalProveedores.textContent = proveedores.length;

        const entregasTotales = proveedores.reduce((total, proveedor) => {
            return total + Number(proveedor.entregas_2026);
        }, 0);

        totalEntregas2026.textContent = entregasTotales;

        const proximas = proveedores.filter((proveedor) => {
            return proveedor.proxima_entrega !== null;
        }).length;

        totalProximasEntregas.textContent = proximas;

        proveedores.forEach((proveedor) => {
            const estadoClase =
                proveedor.estado === "Activo"
                    ? "proveedor-activo"
                    : proveedor.estado === "Pendiente"
                        ? "proveedor-pendiente"
                        : "proveedor-inactivo";

            const fechaEntrega = proveedor.proxima_entrega
                ? new Date(proveedor.proxima_entrega).toLocaleDateString()
                : "Sin fecha";

            tablaProveedores.innerHTML += `
                <tr>
                    <td>${proveedor.nombre}</td>
                    <td>${proveedor.categoria}</td>
                    <td>
                        ${proveedor.contacto || "Sin contacto"}<br>
                        <small>${proveedor.telefono || ""}</small><br>
                        <small>${proveedor.correo || ""}</small>
                    </td>
                    <td>${proveedor.entregas_2026}</td>
                    <td>${fechaEntrega}</td>
                    <td>
                        <span class="${estadoClase}">
                            ${proveedor.estado}
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.log(error);

        tablaProveedores.innerHTML = `
            <tr>
                <td colspan="6">Error al cargar proveedores</td>
            </tr>
        `;
    }
}

formCrearProveedor.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreProveedor").value;
    const categoria = document.getElementById("categoriaProveedor").value;
    const contacto = document.getElementById("contactoProveedor").value;
    const telefono = document.getElementById("telefonoProveedor").value;
    const correo = document.getElementById("correoProveedor").value;
    const entregas_2026 = document.getElementById("entregasProveedor").value;
    const proxima_entrega = document.getElementById("proximaEntregaProveedor").value;
    const estado = document.getElementById("estadoProveedor").value;

    try {
        const res = await fetch("/proveedores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                categoria,
                contacto,
                telefono,
                correo,
                entregas_2026,
                proxima_entrega,
                estado
            })
        });

        const data = await res.json();

        alert(data.mensaje);

        if (!res.ok) {
            return;
        }

        formCrearProveedor.reset();

        await cargarProveedores();

    } catch (error) {
        console.log(error);
        alert("Error al registrar proveedor");
    }
});

btnActualizarProveedores.addEventListener("click", async () => {
    await cargarProveedores();
});