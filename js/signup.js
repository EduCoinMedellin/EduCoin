// Registro básico MVP con localStorage


const signupBtn = document.getElementById('signupBtn');


signupBtn.onclick = () => {
const name = document.getElementById('name').value;
const email = document.getElementById('email').value;
const pass = document.getElementById('password').value;
const role = document.getElementById('role').value;


if (!name || !email || !pass) {
alert('Completa todos los campos');
return;
}


const users = JSON.parse(localStorage.getItem('edu_users') || '[]');


if (users.some(u => u.email === email)) {
alert('Este correo ya está registrado');
return;
}


users.push({ name, email, pass, role });
localStorage.setItem('edu_users', JSON.stringify(users));


alert('Cuenta creada con éxito');
window.location.href = 'index.html';
};