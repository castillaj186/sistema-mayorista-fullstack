require("dotenv").config();
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const carpetaProductos = path.join(__dirname, "IMG", "productos");

if (!fs.existsSync(carpetaProductos)) {
    fs.mkdirSync(carpetaProductos, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, carpetaProductos);
    },
    filename: (req, file, cb) => {
        const nombreArchivo = Date.now() + path.extname(file.originalname);
        cb(null, nombreArchivo);
    }
});

const upload = multer({ storage });

const config = {
    connectionString:
        `Driver={${process.env.DB_DRIVER}};` +
        `Server=${process.env.DB_SERVER};` +
        `Database=${process.env.DB_DATABASE};` +
        `UID=${process.env.DB_USER};` +
        `PWD=${process.env.DB_PASSWORD};` +
        `TrustServerCertificate=Yes;`
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "HTML", "LoginMO.html"));
});

app.post("/login", async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`
            SELECT * FROM cuentasMakro
            WHERE correo = ${correo}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({
                mensaje: "Usuario no existe"
            });
        }

        const usuario = result.recordset[0];

        const contrasenaCorrecta = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if (!contrasenaCorrecta) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        res.json({
            mensaje: "Login correcto",
            rol: usuario.rol,
            redireccion:
                usuario.rol === 1
                    ? "/HTML/MakroAN.html"
                    : "/HTML/MakroPL.html"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error del servidor",
            error: error.message
        });
    }
});

app.post("/registro", async (req, res) => {
    const { correo, contrasena, rol } = req.body;

    try {
        await sql.connect(config);

        const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

        await sql.query`
            INSERT INTO cuentasMakro
            (
                correo,
                contrasena,
                rol
            )
            VALUES
            (
                ${correo},
                ${contrasenaEncriptada},
                ${rol}
            )
        `;

        res.json({
            mensaje: "Cuenta creada correctamente"
        });

    } catch (error) {
        console.log(error);

        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({
                mensaje: "Ese correo ya existe"
            });
        }

        res.status(500).json({
            mensaje: "Error al registrar la cuenta",
            error: error.message
        });
    }
});

app.get("/usuarios", async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query`
            SELECT
                id,
                correo,
                rol,
                fecha_creacion
            FROM cuentasMakro
            ORDER BY id DESC
        `;

        res.json(result.recordset);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener usuarios",
            error: error.message
        });
    }
});

app.post("/usuarios", async (req, res) => {
    const { correo, contrasena, rol } = req.body;

    try {
        await sql.connect(config);

        const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

        await sql.query`
            INSERT INTO cuentasMakro
            (
                correo,
                contrasena,
                rol
            )
            VALUES
            (
                ${correo},
                ${contrasenaEncriptada},
                ${rol}
            )
        `;

        res.json({
            mensaje: "Usuario creado correctamente"
        });

    } catch (error) {
        console.log(error);

        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({
                mensaje: "Ese correo ya existe"
            });
        }

        res.status(500).json({
            mensaje: "Error al crear usuario",
            error: error.message
        });
    }
});

app.get("/productos", async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query`
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
        `;

        res.json(result.recordset);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener productos",
            error: error.message
        });
    }
});

app.post("/productos", upload.single("imagen"), async (req, res) => {
    const { nombre, categoria, precio, stock, estado } = req.body;

    try {
        await sql.connect(config);

        const imagen = req.file
            ? `/IMG/productos/${req.file.filename}`
            : null;

        await sql.query`
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
                ${nombre},
                ${categoria},
                ${precio},
                ${stock},
                ${imagen},
                ${estado}
            )
        `;

        res.json({
            mensaje: "Producto creado correctamente"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al crear producto",
            error: error.message
        });
    }
});

app.get("/proveedores", async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query`
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
        `;

        res.json(result.recordset);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener proveedores",
            error: error.message
        });
    }
});

app.post("/proveedores", async (req, res) => {
    const {
        nombre,
        categoria,
        contacto,
        telefono,
        correo,
        entregas_2026,
        proxima_entrega,
        estado
    } = req.body;

    try {
        await sql.connect(config);

        await sql.query`
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
                ${nombre},
                ${categoria},
                ${contacto},
                ${telefono},
                ${correo},
                ${entregas_2026},
                ${proxima_entrega},
                ${estado}
            )
        `;

        res.json({
            mensaje: "Proveedor registrado correctamente"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al registrar proveedor",
            error: error.message
        });
    }
});

app.get("/ventas", async (req, res) => {
    try {
        await sql.connect(config);

        const result = await sql.query`
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
        `;

        res.json(result.recordset);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener ventas",
            error: error.message
        });
    }
});

app.post("/ventas", async (req, res) => {
    const { producto_id, cantidad } = req.body;

    try {
        await sql.connect(config);

        const productoResult = await sql.query`
            SELECT *
            FROM productosMakro
            WHERE id = ${producto_id}
        `;

        if (productoResult.recordset.length === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        const producto = productoResult.recordset[0];

        if (Number(producto.stock) < Number(cantidad)) {
            return res.status(400).json({
                mensaje: "Stock insuficiente"
            });
        }

        const total = Number(producto.precio) * Number(cantidad);

        await sql.query`
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
                ${producto.id},
                ${producto.nombre},
                ${cantidad},
                ${producto.precio},
                ${total}
            )
        `;

        const nuevoStock = Number(producto.stock) - Number(cantidad);

        let nuevoEstado = producto.estado;

        if (nuevoStock === 0) {
            nuevoEstado = "Agotado";
        }

        await sql.query`
            UPDATE productosMakro
            SET
                stock = ${nuevoStock},
                estado = ${nuevoEstado}
            WHERE id = ${producto.id}
        `;

        res.json({
            mensaje: "Venta registrada correctamente"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al registrar venta",
            error: error.message
        });
    }
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "HTML", "MakroAN.html"));
});

app.get("/trabajador", (req, res) => {
    res.sendFile(path.join(__dirname, "HTML", "MakroPL.html"));
});

const PORT = 3003;

app.listen(PORT, () => {
    console.log(`
====================================
SERVIDOR MAKRO INICIADO
====================================

Local:
http://localhost:${PORT}

LOGIN:
http://localhost:${PORT}

ADMIN:
http://localhost:${PORT}/admin

TRABAJADOR:
http://localhost:${PORT}/trabajador

USUARIOS:
http://localhost:${PORT}/usuarios

PRODUCTOS:
http://localhost:${PORT}/productos

PROVEEDORES:
http://localhost:${PORT}/proveedores

VENTAS:
http://localhost:${PORT}/ventas

CSS:
http://localhost:${PORT}/CSS/LoginMO.css

HTML:
http://localhost:${PORT}

====================================
    `);
});