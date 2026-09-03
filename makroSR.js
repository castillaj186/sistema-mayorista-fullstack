require("dotenv").config();

const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.disable("x-powered-by");

const PORT = Number(process.env.PORT) || 3003;

app.use(express.json({
    limit: "2mb"
}));

app.use(express.urlencoded({
    extended: true
}));

const origenesPermitidos = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(origen => origen.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {

            if (!origin) {
                return callback(null, true);
            }

            if (origenesPermitidos.length === 0) {
                return callback(null, true);
            }

            if (origenesPermitidos.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Origen no permitido por CORS")
            );
        }
    })
);

app.use(
    "/CSS",
    express.static(
        path.join(__dirname, "CSS")
    )
);

app.use(
    "/JS",
    express.static(
        path.join(__dirname, "JS")
    )
);

app.use(
    "/IMG",
    express.static(
        path.join(__dirname, "IMG")
    )
);

app.use(
    "/ICON",
    express.static(
        path.join(__dirname, "ICON")
    )
);

app.use(
    "/HTML",
    express.static(
        path.join(__dirname, "HTML")
    )
);

app.get("/service-worker.js", (req, res) => {

    res.setHeader(
        "Service-Worker-Allowed",
        "/"
    );

    res.sendFile(
        path.join(
            __dirname,
            "service-worker.js"
        )
    );
});

const variablesObligatorias = [
    "DB_SERVER",
    "DB_DATABASE",
    "DB_USER",
    "DB_PASSWORD"
];

const variablesFaltantes =
    variablesObligatorias.filter(
        variable => !process.env[variable]
    );

if (variablesFaltantes.length > 0) {

    console.error(
        "❌ Faltan variables en .env:"
    );

    console.error(
        variablesFaltantes.join(", ")
    );

    process.exit(1);
}

const config = {

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    server: process.env.DB_SERVER,

    database: process.env.DB_DATABASE,

    port: Number(
        process.env.DB_PORT || 1433
    ),

    options: {

        encrypt:
            process.env.DB_ENCRYPT === "true",

        trustServerCertificate:
            process.env.DB_TRUST_CERT !== "false"
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },

    requestTimeout: 30000,

    connectionTimeout: 30000
};

const pool = new sql.ConnectionPool(config);

const poolConnect = pool.connect();

pool.on("error", error => {

    console.error(
        "❌ ERROR DEL POOL SQL:",
        error
    );
});

function limpiarTexto(valor) {

    if (typeof valor !== "string") {
        return "";
    }

    return valor.trim();
}


function correoValido(correo) {

    const expresion =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresion.test(correo);
}


function obtenerMensajeError(error) {

    if (
        process.env.NODE_ENV ===
        "production"
    ) {
        return undefined;
    }

    return error.message;
}


function responderErrorServidor(
    res,
    mensaje,
    error
) {

    console.error(
        `❌ ${mensaje}:`,
        error
    );

    return res.status(500).json({

        mensaje,

        error:
            obtenerMensajeError(error)
    });
}

const carpetaProductos =
    path.join(
        __dirname,
        "IMG",
        "productos"
    );


if (!fs.existsSync(carpetaProductos)) {

    fs.mkdirSync(
        carpetaProductos,
        {
            recursive: true
        }
    );
}

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                carpetaProductos
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {

            const extension =
                path
                    .extname(
                        file.originalname
                    )
                    .toLowerCase();

            const nombreArchivo =
                `${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${extension}`;

            cb(
                null,
                nombreArchivo
            );
        }
    });


const tiposImagenPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


const upload = multer({

    storage,

    limits: {
        fileSize:
            5 * 1024 * 1024
    },

    fileFilter: (
        req,
        file,
        cb
    ) => {

        if (
            tiposImagenPermitidos.includes(
                file.mimetype
            )
        ) {

            return cb(
                null,
                true
            );
        }

        return cb(
            new Error(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            )
        );
    }
});

app.get("/health", async (req, res) => {

    try {

        await poolConnect;

        await pool
            .request()
            .query("SELECT 1 AS ok");

        res.json({

            estado: "OK",

            servidor:
                "MakroServer",

            baseDatos:
                "Conectada"
        });

    } catch (error) {

        console.error(error);

        res.status(503).json({

            estado:
                "ERROR",

            baseDatos:
                "No disponible"
        });
    }
});

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "HTML",
            "LoginMO.html"
        )
    );
});

app.post("/login", async (req, res) => {

    let {
        correo,
        contrasena
    } = req.body;


    correo =
        limpiarTexto(correo)
            .toLowerCase();


    if (
        !correo ||
        !contrasena
    ) {

        return res.status(400).json({

            mensaje:
                "Correo y contraseña son obligatorios."
        });
    }


    if (!correoValido(correo)) {

        return res.status(400).json({

            mensaje:
                "El correo electrónico no es válido."
        });
    }


    try {

        await poolConnect;


        const result =
            await pool
                .request()
                .input(
                    "correo",
                    sql.VarChar(100),
                    correo
                )
                .query(`
                    SELECT
                        id,
                        correo,
                        contrasena,
                        rol,
                        fecha_creacion
                    FROM cuentasMakro
                    WHERE correo = @correo
                `);


        if (
            result.recordset.length === 0
        ) {

            return res.status(401).json({

                mensaje:
                    "Correo o contraseña incorrectos."
            });
        }


        const usuario =
            result.recordset[0];


        const contrasenaCorrecta =
            await bcrypt.compare(
                contrasena,
                usuario.contrasena
            );


        if (!contrasenaCorrecta) {

            return res.status(401).json({

                mensaje:
                    "Correo o contraseña incorrectos."
            });
        }


        const rol =
            Number(usuario.rol);


        return res.json({

            mensaje:
                "Login correcto",

            usuario: {
                id:
                    usuario.id,

                correo:
                    usuario.correo,

                rol
            },

            rol,

            redireccion:
                rol === 1
                    ? "/admin"
                    : "/trabajador"
        });

    } catch (error) {

        return responderErrorServidor(
            res,
            "Error al iniciar sesión",
            error
        );
    }
});

app.post("/registro", async (req, res) => {

    let {
        correo,
        contrasena
    } = req.body;


    correo =
        limpiarTexto(correo)
            .toLowerCase();


    if (
        !correo ||
        !contrasena
    ) {

        return res.status(400).json({

            mensaje:
                "Correo y contraseña son obligatorios."
        });
    }


    if (!correoValido(correo)) {

        return res.status(400).json({

            mensaje:
                "Correo electrónico no válido."
        });
    }


    if (contrasena.length < 6) {

        return res.status(400).json({

            mensaje:
                "La contraseña debe tener como mínimo 6 caracteres."
        });
    }


    try {

        await poolConnect;


        const existe =
            await pool
                .request()
                .input(
                    "correo",
                    sql.VarChar(100),
                    correo
                )
                .query(`
                    SELECT id
                    FROM cuentasMakro
                    WHERE correo = @correo
                `);


        if (
            existe.recordset.length > 0
        ) {

            return res.status(409).json({

                mensaje:
                    "Ese correo ya está registrado."
            });
        }


        const contrasenaEncriptada =
            await bcrypt.hash(
                contrasena,
                10
            );

        const rol = 0;


        await pool
            .request()
            .input(
                "correo",
                sql.VarChar(100),
                correo
            )
            .input(
                "contrasena",
                sql.VarChar(100),
                contrasenaEncriptada
            )
            .input(
                "rol",
                sql.Int,
                rol
            )
            .query(`
                INSERT INTO cuentasMakro
                (
                    correo,
                    contrasena,
                    rol
                )
                VALUES
                (
                    @correo,
                    @contrasena,
                    @rol
                )
            `);


        return res.status(201).json({

            mensaje:
                "Cuenta creada correctamente."
        });

    } catch (error) {

        if (
            error.number === 2627 ||
            error.number === 2601
        ) {

            return res.status(409).json({

                mensaje:
                    "Ese correo ya existe."
            });
        }


        return responderErrorServidor(
            res,
            "Error al registrar la cuenta",
            error
        );
    }
});

app.get("/usuarios", async (req, res) => {

    try {

        await poolConnect;


        const result =
            await pool
                .request()
                .query(`
                    SELECT
                        id,
                        correo,
                        rol,
                        fecha_creacion
                    FROM cuentasMakro
                    ORDER BY id DESC
                `);


        return res.json(
            result.recordset
        );

    } catch (error) {

        return responderErrorServidor(
            res,
            "Error al obtener usuarios",
            error
        );
    }
});


app.post("/usuarios", async (req, res) => {

    let {
        correo,
        contrasena,
        rol
    } = req.body;


    correo =
        limpiarTexto(correo)
            .toLowerCase();


    rol =
        Number(rol);


    if (
        !correo ||
        !contrasena
    ) {

        return res.status(400).json({

            mensaje:
                "Correo y contraseña son obligatorios."
        });
    }


    if (!correoValido(correo)) {

        return res.status(400).json({

            mensaje:
                "Correo electrónico no válido."
        });
    }


    if (contrasena.length < 6) {

        return res.status(400).json({

            mensaje:
                "La contraseña debe tener al menos 6 caracteres."
        });
    }


    if (
        rol !== 0 &&
        rol !== 1
    ) {

        return res.status(400).json({

            mensaje:
                "El rol debe ser 0 o 1."
        });
    }


    try {

        await poolConnect;


        const existe =
            await pool
                .request()
                .input(
                    "correo",
                    sql.VarChar(100),
                    correo
                )
                .query(`
                    SELECT id
                    FROM cuentasMakro
                    WHERE correo = @correo
                `);


        if (
            existe.recordset.length > 0
        ) {

            return res.status(409).json({

                mensaje:
                    "Ese correo ya existe."
            });
        }


        const contrasenaEncriptada =
            await bcrypt.hash(
                contrasena,
                10
            );


        await pool
            .request()
            .input(
                "correo",
                sql.VarChar(100),
                correo
            )
            .input(
                "contrasena",
                sql.VarChar(100),
                contrasenaEncriptada
            )
            .input(
                "rol",
                sql.Int,
                rol
            )
            .query(`
                INSERT INTO cuentasMakro
                (
                    correo,
                    contrasena,
                    rol
                )
                VALUES
                (
                    @correo,
                    @contrasena,
                    @rol
                )
            `);


        return res.status(201).json({

            mensaje:
                "Usuario creado correctamente."
        });

    } catch (error) {

        if (
            error.number === 2627 ||
            error.number === 2601
        ) {

            return res.status(409).json({

                mensaje:
                    "Ese correo ya existe."
            });
        }


        return responderErrorServidor(
            res,
            "Error al crear usuario",
            error
        );
    }
});

app.get("/productos", async (req, res) => {

    try {

        await poolConnect;


        const result =
            await pool
                .request()
                .query(`
                    SELECT
                        id,
                        nombre,
                        categoria,
                        precio,
                        stock,
                        imagen,
                        estado,
                        fecha_creacion
                    FROM productosMakro
                    ORDER BY id DESC
                `);


        return res.json(
            result.recordset
        );

    } catch (error) {

        return responderErrorServidor(
            res,
            "Error al obtener productos",
            error
        );
    }
});


app.post(
    "/productos",
    upload.single("imagen"),
    async (req, res) => {

        let {
            nombre,
            categoria,
            precio,
            stock,
            estado
        } = req.body;


        nombre =
            limpiarTexto(nombre);

        categoria =
            limpiarTexto(categoria);

        estado =
            limpiarTexto(estado);


        precio =
            Number(precio);

        stock =
            Number(stock);


        if (
            !nombre ||
            !categoria
        ) {

            return res.status(400).json({

                mensaje:
                    "Nombre y categoría son obligatorios."
            });
        }


        if (
            !Number.isFinite(precio) ||
            precio < 0
        ) {

            return res.status(400).json({

                mensaje:
                    "El precio no es válido."
            });
        }


        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            return res.status(400).json({

                mensaje:
                    "El stock no es válido."
            });
        }


        if (!estado) {

            estado =
                stock === 0
                    ? "Agotado"
                    : "Disponible";
        }


        try {

            await poolConnect;


            const imagen =
                req.file
                    ? `/IMG/productos/${req.file.filename}`
                    : null;


            await pool
                .request()
                .input(
                    "nombre",
                    sql.NVarChar(150),
                    nombre
                )
                .input(
                    "categoria",
                    sql.NVarChar(100),
                    categoria
                )
                .input(
                    "precio",
                    sql.Decimal(10, 2),
                    precio
                )
                .input(
                    "stock",
                    sql.Int,
                    stock
                )
                .input(
                    "imagen",
                    sql.NVarChar(500),
                    imagen
                )
                .input(
                    "estado",
                    sql.NVarChar(30),
                    estado
                )
                .query(`
                    INSERT INTO productosMakro
                    (
                        nombre,
                        categoria,
                        precio,
                        stock,
                        imagen,
                        estado
                    )
                    VALUES
                    (
                        @nombre,
                        @categoria,
                        @precio,
                        @stock,
                        @imagen,
                        @estado
                    )
                `);


            return res.status(201).json({

                mensaje:
                    "Producto creado correctamente."
            });

        } catch (error) {

            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch (
                    errorEliminar
                ) {

                    console.error(
                        "No se pudo eliminar imagen:",
                        errorEliminar
                    );
                }
            }


            return responderErrorServidor(
                res,
                "Error al crear producto",
                error
            );
        }
    }
);

app.get("/proveedores", async (req, res) => {

    try {

        await poolConnect;


        const result =
            await pool
                .request()
                .query(`
                    SELECT
                        id,
                        nombre,
                        categoria,
                        contacto,
                        telefono,
                        correo,
                        entregas_2026,
                        proxima_entrega,
                        estado,
                        fecha_creacion
                    FROM proveedoresMakro
                    ORDER BY id DESC
                `);


        return res.json(
            result.recordset
        );

    } catch (error) {

        return responderErrorServidor(
            res,
            "Error al obtener proveedores",
            error
        );
    }
});


app.post("/proveedores", async (req, res) => {

    let {
        nombre,
        categoria,
        contacto,
        telefono,
        correo,
        entregas_2026,
        proxima_entrega,
        estado
    } = req.body;


    nombre =
        limpiarTexto(nombre);

    categoria =
        limpiarTexto(categoria);

    contacto =
        limpiarTexto(contacto);

    telefono =
        limpiarTexto(telefono);

    correo =
        limpiarTexto(correo);

    estado =
        limpiarTexto(estado);


    entregas_2026 =
        Number(entregas_2026);


    if (
        !nombre ||
        !categoria
    ) {

        return res.status(400).json({

            mensaje:
                "Nombre y categoría son obligatorios."
        });
    }


    if (
        !Number.isInteger(entregas_2026) ||
        entregas_2026 < 0
    ) {

        entregas_2026 = 0;
    }


    if (!estado) {
        estado = "Activo";
    }


    if (!proxima_entrega) {

        return res.status(400).json({

            mensaje:
                "La próxima entrega es obligatoria."
        });
    }


    try {

        await poolConnect;


        await pool
            .request()
            .input(
                "nombre",
                sql.NVarChar(150),
                nombre
            )
            .input(
                "categoria",
                sql.NVarChar(100),
                categoria
            )
            .input(
                "contacto",
                sql.NVarChar(150),
                contacto || null
            )
            .input(
                "telefono",
                sql.NVarChar(30),
                telefono || null
            )
            .input(
                "correo",
                sql.NVarChar(150),
                correo || null
            )
            .input(
                "entregas",
                sql.Int,
                entregas_2026
            )
            .input(
                "proximaEntrega",
                sql.Date,
                proxima_entrega
            )
            .input(
                "estado",
                sql.NVarChar(30),
                estado
            )
            .query(`
                INSERT INTO proveedoresMakro
                (
                    nombre,
                    categoria,
                    contacto,
                    telefono,
                    correo,
                    entregas_2026,
                    proxima_entrega,
                    estado
                )
                VALUES
                (
                    @nombre,
                    @categoria,
                    @contacto,
                    @telefono,
                    @correo,
                    @entregas,
                    @proximaEntrega,
                    @estado
                )
            `);


        return res.status(201).json({

            mensaje:
                "Proveedor registrado correctamente."
        });

    } catch (error) {

        return responderErrorServidor(
            res,
            "Error al registrar proveedor",
            error
        );
    }
});

app.get("/ventas", async (req, res) => {

    try {

        await poolConnect;


        const result =
            await pool
                .request()
                .query(`
                    SELECT
                        id,
                        producto_id,
                        producto_nombre,
                        cantidad,
                        precio_unitario,
                        total,
                        fecha_venta
                    FROM ventasMakro
                    ORDER BY id DESC
                `);


        return res.json(
            result.recordset
        );

    } catch (error) {

        return responderErrorServidor(
            res,
            "Error al obtener ventas",
            error
        );
    }
});


app.post("/ventas", async (req, res) => {

    const productoId =
        Number(req.body.producto_id);

    const cantidad =
        Number(req.body.cantidad);


    if (
        !Number.isInteger(productoId) ||
        productoId <= 0
    ) {

        return res.status(400).json({

            mensaje:
                "Producto inválido."
        });
    }


    if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {

        return res.status(400).json({

            mensaje:
                "La cantidad debe ser mayor a cero."
        });
    }


    let transaction;


    try {

        await poolConnect;


        transaction =
            new sql.Transaction(pool);


        await transaction.begin(
            sql.ISOLATION_LEVEL.SERIALIZABLE
        );

        const productoResult =
            await new sql.Request(transaction)
                .input(
                    "productoId",
                    sql.Int,
                    productoId
                )
                .query(`
                    SELECT
                        id,
                        nombre,
                        precio,
                        stock,
                        estado
                    FROM productosMakro
                    WITH (UPDLOCK, ROWLOCK)
                    WHERE id = @productoId
                `);


        if (
            productoResult.recordset.length === 0
        ) {

            await transaction.rollback();

            return res.status(404).json({

                mensaje:
                    "Producto no encontrado."
            });
        }


        const producto =
            productoResult.recordset[0];


        const stockActual =
            Number(producto.stock);


        if (
            stockActual < cantidad
        ) {

            await transaction.rollback();

            return res.status(400).json({

                mensaje:
                    "Stock insuficiente."
            });
        }


        const precioUnitario =
            Number(producto.precio);


        const total =
            Number(
                (
                    precioUnitario *
                    cantidad
                ).toFixed(2)
            );


        const nuevoStock =
            stockActual -
            cantidad;


        const nuevoEstado =
            nuevoStock === 0
                ? "Agotado"
                : producto.estado;


        await new sql.Request(transaction)
            .input(
                "productoId",
                sql.Int,
                producto.id
            )
            .input(
                "productoNombre",
                sql.NVarChar(150),
                producto.nombre
            )
            .input(
                "cantidad",
                sql.Int,
                cantidad
            )
            .input(
                "precioUnitario",
                sql.Decimal(10, 2),
                precioUnitario
            )
            .input(
                "total",
                sql.Decimal(10, 2),
                total
            )
            .query(`
                INSERT INTO ventasMakro
                (
                    producto_id,
                    producto_nombre,
                    cantidad,
                    precio_unitario,
                    total
                )
                VALUES
                (
                    @productoId,
                    @productoNombre,
                    @cantidad,
                    @precioUnitario,
                    @total
                )
            `);


        await new sql.Request(transaction)
            .input(
                "productoId",
                sql.Int,
                producto.id
            )
            .input(
                "nuevoStock",
                sql.Int,
                nuevoStock
            )
            .input(
                "nuevoEstado",
                sql.NVarChar(30),
                nuevoEstado
            )
            .query(`
                UPDATE productosMakro
                SET
                    stock = @nuevoStock,
                    estado = @nuevoEstado
                WHERE id = @productoId
            `);


        await transaction.commit();


        return res.status(201).json({

            mensaje:
                "Venta registrada correctamente.",

            venta: {

                producto:
                    producto.nombre,

                cantidad,

                precioUnitario,

                total,

                stockRestante:
                    nuevoStock
            }
        });

    } catch (error) {

        if (transaction) {

            try {

                await transaction.rollback();

            } catch (
                rollbackError
            ) {

                console.error(
                    "Error haciendo rollback:",
                    rollbackError
                );
            }
        }


        return responderErrorServidor(
            res,
            "Error al registrar venta",
            error
        );
    }
});

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "HTML",
            "MakroAN.html"
        )
    );
});


app.get("/trabajador", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "HTML",
            "MakroPL.html"
        )
    );
});

app.get("/login", (req, res) => {

    res.redirect("/");
});

app.use((req, res) => {

    res.status(404).json({

        mensaje:
            "Ruta no encontrada."
    });
});

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ ERROR GLOBAL:",
            error
        );


        if (
            error instanceof
            multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    mensaje:
                        "La imagen supera el límite de 5 MB."
                });
            }


            return res.status(400).json({

                mensaje:
                    "Error al subir la imagen."
            });
        }


        if (
            error.message ===
            "Solo se permiten imágenes JPG, PNG o WEBP."
        ) {

            return res.status(400).json({

                mensaje:
                    error.message
            });
        }


        if (
            error.message ===
            "Origen no permitido por CORS"
        ) {

            return res.status(403).json({

                mensaje:
                    "Origen no permitido."
            });
        }


        return res.status(500).json({

            mensaje:
                "Error interno del servidor."
        });
    }
);

async function iniciarServidor() {

    try {

        console.log(
            "\nConectando a SQL Server..."
        );


        await poolConnect;


        console.log(
            "✅ SQL Server conectado correctamente."
        );


        app.listen(
            PORT,
            () => {

                console.log(`
========================================
      SERVIDOR MAKRO INICIADO
========================================

LOCAL:
http://localhost:${PORT}

LOGIN:
http://localhost:${PORT}

ADMIN:
http://localhost:${PORT}/admin

TRABAJADOR:
http://localhost:${PORT}/trabajador

----------------------------------------

API USUARIOS:
http://localhost:${PORT}/usuarios

API PRODUCTOS:
http://localhost:${PORT}/productos

API PROVEEDORES:
http://localhost:${PORT}/proveedores

API VENTAS:
http://localhost:${PORT}/ventas

----------------------------------------

HEALTH:
http://localhost:${PORT}/health

========================================
                `);
            }
        );

    } catch (error) {

        console.error(`
========================================
❌ NO SE PUDO INICIAR MAKROSERVER
========================================
        `);

        console.error(
            error
        );

        process.exit(1);
    }
}


iniciarServidor();

async function cerrarServidor(
    señal
) {

    console.log(
        `\n${señal} recibido. Cerrando servidor...`
    );


    try {

        await pool.close();

        console.log(
            "✅ Conexión SQL cerrada."
        );

    } catch (error) {

        console.error(
            "Error cerrando SQL:",
            error
        );
    }


    process.exit(0);
}


process.on(
    "SIGINT",
    () =>
        cerrarServidor("SIGINT")
);


process.on(
    "SIGTERM",
    () =>
        cerrarServidor("SIGTERM")
);