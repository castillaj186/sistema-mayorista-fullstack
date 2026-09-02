const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");

const btnMostrarRegistro = document.getElementById("btnMostrarRegistro");
const btnMostrarLogin = document.getElementById("btnMostrarLogin");

btnMostrarRegistro.onclick = () => {

    formLogin.style.display = "none";
    formRegistro.style.display = "block";

};

btnMostrarLogin.onclick = () => {

    formRegistro.style.display = "none";
    formLogin.style.display = "block";

};

formLogin.addEventListener("submit", async (e) => {

    e.preventDefault();

    const correo = document.getElementById("correoLogin").value;
    const contrasena = document.getElementById("passLogin").value;

    try {

        const res = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                contrasena
            })
        });

        const data = await res.json();

        alert(data.mensaje);

        if (!res.ok) {
            return;
        }

        if (data.rol == 0) {

            window.location.href = "/HTML/MakroPL.html";

        } else if (data.rol == 1) {

            window.location.href = "/HTML/MakroAN.html";

        } else {

            alert("Rol no válido");

        }

    } catch (error) {

        console.log(error);

        alert("Error al conectar con el servidor");

    }

});

formRegistro.addEventListener("submit", async (e) => {

    e.preventDefault();

    const correo = document.getElementById("correoReg").value;
    const contrasena = document.getElementById("passReg").value;
    const rol = document.getElementById("rol").value;

    try {

        const res = await fetch("/registro", {
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

        if (res.ok) {

            formRegistro.reset();

            formRegistro.style.display = "none";
            formLogin.style.display = "block";

        }

    } catch (error) {

        console.log(error);

        alert("Error al registrar la cuenta");

    }

});