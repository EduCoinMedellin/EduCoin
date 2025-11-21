//* LOGIN SIMULADO PARA MVP

        const loginBtn = document.getElementById("loginBtn");


        loginBtn.onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;


        const users = JSON.parse(localStorage.getItem('edu_users') || '[]');
        const user = users.find(u => u.email === email && u.pass === pass);


        if (!user) {
        alert('Credenciales incorrectas');
        return;
        }


if (user.role === 'estudiante') {
window.location.href = 'estudiante.html';
} else {
window.location.href = 'profesor/profesor.html';
}
};

document.getElementById("loginBtn").addEventListener("click", function () {
  // Obtener el valor seleccionado del rol
  const role = document.getElementById("role").value;

  // Redirigir según el rol seleccionado
  if (role === "estudiante") {
    window.location.href = "estudiante.html";
  } else if (role === "profesor") {
    window.location.href = "profesor.html";
  } else {
    alert("Por favor, selecciona un rol válido.");
  }
});