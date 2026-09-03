document.addEventListener("DOMContentLoaded", () => {
    const obtenerElemento = (...selectores) => {
        for (const selector of selectores) {
            const elemento = document.querySelector(selector);

            if (elemento) {
                return elemento;
            }
        }

        return null;
    };

    const formularioLogin = obtenerElemento(
        "#formLogin",
        "#loginForm",
        "form"
    );

    const inputCorreo = obtenerElemento(
        "#correo",
        "#email",
        "#correoLogin",
        'input[type="email"]'
    );

    const inputContrasena = obtenerElemento(
        "#contrasena",
        "#password",
        "#passwordLogin",
        'input[type="password"]'
    );

    const botonLogin = obtenerElemento(
        "#btnLogin",
        "#loginBtn",
        "#btnEntrar",
        'button[type="submit"]'
    );

    const checkRecordarme = obtenerElemento(
        "#recordarme",
        "#remember",
        "#rememberMe",
        'input[type="checkbox"]'
    );

    const botonCrearCuenta = obtenerElemento(
        "#crearCuenta",
        "#btnCrearCuenta",
        "#registerBtn",
        ".crear-cuenta"
    );

    const botonMostrarContrasena = obtenerElemento(
        "#mostrarContrasena",
        "#togglePassword",
        ".toggle-password",
        ".password-toggle"
    );

    const mostrarMensaje = (mensaje, tipo = "error") => {
        let contenedor = document.querySelector("#mensajeLogin");

        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.id = "mensajeLogin";

            if (formularioLogin) {
                formularioLogin.appendChild(contenedor);
            } else {
                document.body.appendChild(contenedor);
            }
        }

        contenedor.textContent = mensaje;

        contenedor.style.marginTop = "15px";
        contenedor.style.padding = "12px";
        contenedor.style.borderRadius = "8px";
        contenedor.style.fontSize = "14px";
        contenedor.style.fontWeight = "600";
        contenedor.style.textAlign = "center";

        if (tipo === "ok") {
            contenedor.style.backgroundColor = "#dcfce7";
            contenedor.style.color = "#166534";
            contenedor.style.border = "1px solid #86efac";
        } else {
            contenedor.style.backgroundColor = "#fee2e2";
            contenedor.style.color = "#991b1b";
            contenedor.style.border = "1px solid #fecaca";
        }

        setTimeout(() => {
            if (contenedor) {
                contenedor.textContent = "";
                contenedor.removeAttribute("style");
            }
        }, 5000);
    };

    const limpiarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");
        sessionStorage.removeItem("rol");
    };

    const guardarSesion = (datos) => {
        const almacenamiento = checkRecordarme?.checked
            ? localStorage
            : sessionStorage;

        limpiarSesion();

        almacenamiento.setItem(
            "token",
            datos.token
        );

        almacenamiento.setItem(
            "usuario",
            JSON.stringify(datos.usuario)
        );

        almacenamiento.setItem(
            "rol",
            String(datos.rol)
        );
    };

    const obtenerTokenGuardado = () => {
        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    };

    const obtenerRolGuardado = () => {
        const rol =
            localStorage.getItem("rol") ||
            sessionStorage.getItem("rol");

        if (rol === null) {
            return null;
        }

        return Number(rol);
    };

    const verificarSesionExistente = async () => {
        const token = obtenerTokenGuardado();

        if (!token) {
            return;
        }

        try {
            const respuesta = await fetch(
                "/auth/verificar",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!respuesta.ok) {
                limpiarSesion();
                return;
            }

            const rol = obtenerRolGuardado();

            if (rol === 1) {
                window.location.href = "/admin";
                return;
            }

            if (rol === 0) {
                window.location.href = "/trabajador";
                return;
            }

            limpiarSesion();
        } catch (error) {
            console.error(
                "Error verificando sesión:",
                error
            );
        }
    };

    const iniciarSesion = async () => {
        if (!inputCorreo || !inputContrasena) {
            mostrarMensaje(
                "No se encontraron los campos del formulario."
            );

            return;
        }

        const correo =
            inputCorreo.value
                .trim()
                .toLowerCase();

        const contrasena =
            inputContrasena.value;

        if (!correo || !contrasena) {
            mostrarMensaje(
                "Ingresa tu correo y contraseña."
            );

            return;
        }

        if (botonLogin) {
            botonLogin.disabled = true;
            botonLogin.dataset.textoOriginal =
                botonLogin.textContent;

            botonLogin.textContent =
                "Ingresando...";
        }

        try {
            const respuesta = await fetch(
                "/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        correo,
                        contrasena
                    })
                }
            );

            let datos;

            try {
                datos = await respuesta.json();
            } catch {
                datos = {};
            }

            if (!respuesta.ok) {
                mostrarMensaje(
                    datos.mensaje ||
                        "No se pudo iniciar sesión."
                );

                return;
            }

            if (!datos.token) {
                mostrarMensaje(
                    "El servidor no devolvió el token de acceso."
                );

                return;
            }

            guardarSesion(datos);

            mostrarMensaje(
                "Inicio de sesión correcto.",
                "ok"
            );

            setTimeout(() => {
                if (Number(datos.rol) === 1) {
                    window.location.href =
                        "/admin";
                } else {
                    window.location.href =
                        "/trabajador";
                }
            }, 400);
        } catch (error) {
            console.error(
                "Error de login:",
                error
            );

            mostrarMensaje(
                "No se pudo conectar con el servidor."
            );
        } finally {
            if (botonLogin) {
                botonLogin.disabled = false;

                botonLogin.textContent =
                    botonLogin.dataset.textoOriginal ||
                    "Entrar";
            }
        }
    };

    const crearModalRegistro = () => {
        const modalAnterior =
            document.querySelector(
                "#modalRegistroMakro"
            );

        if (modalAnterior) {
            modalAnterior.remove();
        }

        const modal =
            document.createElement("div");

        modal.id =
            "modalRegistroMakro";

        modal.innerHTML = `
            <div class="registro-overlay">
                <div class="registro-contenedor">
                    <button
                        type="button"
                        id="cerrarRegistroMakro"
                        class="registro-cerrar"
                    >
                        ×
                    </button>

                    <h2>Crear cuenta</h2>

                    <p>
                        Registra una cuenta de trabajador
                    </p>

                    <form id="formRegistroMakro">
                        <div class="registro-grupo">
                            <label for="correoRegistroMakro">
                                Correo electrónico
                            </label>

                            <input
                                id="correoRegistroMakro"
                                type="email"
                                autocomplete="email"
                                placeholder="correo@ejemplo.com"
                                required
                            >
                        </div>

                        <div class="registro-grupo">
                            <label for="contrasenaRegistroMakro">
                                Contraseña
                            </label>

                            <input
                                id="contrasenaRegistroMakro"
                                type="password"
                                autocomplete="new-password"
                                placeholder="Mínimo 6 caracteres"
                                minlength="6"
                                required
                            >
                        </div>

                        <div class="registro-grupo">
                            <label for="confirmarRegistroMakro">
                                Confirmar contraseña
                            </label>

                            <input
                                id="confirmarRegistroMakro"
                                type="password"
                                autocomplete="new-password"
                                placeholder="Repite tu contraseña"
                                minlength="6"
                                required
                            >
                        </div>

                        <div id="mensajeRegistroMakro"></div>

                        <button
                            id="btnRegistrarMakro"
                            type="submit"
                            class="registro-boton"
                        >
                            Crear cuenta
                        </button>
                    </form>
                </div>
            </div>
        `;

        const estilo =
            document.createElement("style");

        estilo.textContent = `
            #modalRegistroMakro {
                position: fixed;
                inset: 0;
                z-index: 99999;
                font-family: inherit;
            }

            #modalRegistroMakro .registro-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 16, 65, 0.72);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            #modalRegistroMakro .registro-contenedor {
                width: min(440px, 100%);
                position: relative;
                background: white;
                border-radius: 22px;
                padding: 38px;
                box-sizing: border-box;
                box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
            }

            #modalRegistroMakro h2 {
                margin: 0;
                color: #062b78;
                font-size: 30px;
                text-align: center;
            }

            #modalRegistroMakro p {
                text-align: center;
                color: #64748b;
                margin: 10px 0 28px;
            }

            #modalRegistroMakro .registro-cerrar {
                position: absolute;
                right: 18px;
                top: 14px;
                border: none;
                background: transparent;
                font-size: 30px;
                cursor: pointer;
                color: #64748b;
            }

            #modalRegistroMakro .registro-grupo {
                margin-bottom: 18px;
            }

            #modalRegistroMakro label {
                display: block;
                margin-bottom: 7px;
                font-weight: 700;
                color: #062b78;
            }

            #modalRegistroMakro input {
                width: 100%;
                box-sizing: border-box;
                padding: 14px 15px;
                border-radius: 10px;
                border: 1px solid #cbd5e1;
                outline: none;
                font-size: 15px;
            }

            #modalRegistroMakro input:focus {
                border-color: #0655d9;
                box-shadow: 0 0 0 3px rgba(6, 85, 217, 0.12);
            }

            #modalRegistroMakro .registro-boton {
                width: 100%;
                border: none;
                border-radius: 10px;
                background: #0754d3;
                color: white;
                padding: 15px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                margin-top: 8px;
            }

            #modalRegistroMakro .registro-boton:disabled {
                opacity: 0.65;
                cursor: not-allowed;
            }

            #mensajeRegistroMakro {
                font-size: 14px;
                margin: 8px 0;
                text-align: center;
            }
        `;

        modal.appendChild(estilo);

        document.body.appendChild(modal);

        const cerrar =
            document.querySelector(
                "#cerrarRegistroMakro"
            );

        const overlay =
            modal.querySelector(
                ".registro-overlay"
            );

        const formulario =
            document.querySelector(
                "#formRegistroMakro"
            );

        cerrar?.addEventListener(
            "click",
            () => {
                modal.remove();
            }
        );

        overlay?.addEventListener(
            "click",
            event => {
                if (event.target === overlay) {
                    modal.remove();
                }
            }
        );

        formulario?.addEventListener(
            "submit",
            registrarCuenta
        );
    };

    const registrarCuenta = async event => {
        event.preventDefault();

        const correo =
            document
                .querySelector(
                    "#correoRegistroMakro"
                )
                ?.value
                .trim()
                .toLowerCase();

        const contrasena =
            document
                .querySelector(
                    "#contrasenaRegistroMakro"
                )
                ?.value;

        const confirmar =
            document
                .querySelector(
                    "#confirmarRegistroMakro"
                )
                ?.value;

        const mensaje =
            document.querySelector(
                "#mensajeRegistroMakro"
            );

        const boton =
            document.querySelector(
                "#btnRegistrarMakro"
            );

        const mostrarMensajeRegistro = (
            texto,
            correcto = false
        ) => {
            if (!mensaje) {
                return;
            }

            mensaje.textContent = texto;

            mensaje.style.color =
                correcto
                    ? "#15803d"
                    : "#dc2626";
        };

        if (
            !correo ||
            !contrasena ||
            !confirmar
        ) {
            mostrarMensajeRegistro(
                "Completa todos los campos."
            );

            return;
        }

        if (
            contrasena.length < 6
        ) {
            mostrarMensajeRegistro(
                "La contraseña debe tener al menos 6 caracteres."
            );

            return;
        }

        if (
            contrasena !== confirmar
        ) {
            mostrarMensajeRegistro(
                "Las contraseñas no coinciden."
            );

            return;
        }

        if (boton) {
            boton.disabled = true;
            boton.textContent =
                "Creando cuenta...";
        }

        try {
            const respuesta =
                await fetch(
                    "/registro",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                correo,
                                contrasena
                            })
                    }
                );

            let datos;

            try {
                datos =
                    await respuesta.json();
            } catch {
                datos = {};
            }

            if (!respuesta.ok) {
                mostrarMensajeRegistro(
                    datos.mensaje ||
                        "No se pudo crear la cuenta."
                );

                return;
            }

            mostrarMensajeRegistro(
                datos.mensaje ||
                    "Cuenta creada correctamente.",
                true
            );

            if (inputCorreo) {
                inputCorreo.value =
                    correo;
            }

            setTimeout(() => {
                document
                    .querySelector(
                        "#modalRegistroMakro"
                    )
                    ?.remove();

                inputContrasena?.focus();
            }, 1000);
        } catch (error) {
            console.error(
                "Error registrando cuenta:",
                error
            );

            mostrarMensajeRegistro(
                "No se pudo conectar con el servidor."
            );
        } finally {
            if (boton) {
                boton.disabled = false;
                boton.textContent =
                    "Crear cuenta";
            }
        }
    };

    formularioLogin?.addEventListener(
        "submit",
        event => {
            event.preventDefault();
            iniciarSesion();
        }
    );

    if (
        botonLogin &&
        botonLogin.type !== "submit"
    ) {
        botonLogin.addEventListener(
            "click",
            event => {
                event.preventDefault();
                iniciarSesion();
            }
        );
    }

    botonCrearCuenta?.addEventListener(
        "click",
        event => {
            event.preventDefault();
            crearModalRegistro();
        }
    );

    botonMostrarContrasena?.addEventListener(
        "click",
        event => {
            event.preventDefault();

            if (!inputContrasena) {
                return;
            }

            inputContrasena.type =
                inputContrasena.type ===
                "password"
                    ? "text"
                    : "password";
        }
    );

    inputContrasena?.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Enter" &&
                !formularioLogin
            ) {
                iniciarSesion();
            }
        }
    );

    verificarSesionExistente();
});