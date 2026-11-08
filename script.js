import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const roleSelectBtn = document.getElementById('roleSelectBtn');
  const roleDropdown = document.getElementById('roleDropdown');
  const selectedRoleInput = document.getElementById('selectedRole');
  const roleLabel = document.getElementById('roleLabel');

  roleSelectBtn.addEventListener('click', () => {
    roleDropdown.style.display = roleDropdown.style.display === 'none' ? 'block' : 'none';
  });

  document.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const value = e.target.getAttribute('data-value');
      roleLabel.textContent = value;
      selectedRoleInput.value = value;
      roleDropdown.style.display = 'none';
    });
  });

  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = selectedRoleInput.value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!role) {
      alert('Por favor selecciona un rol');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('correo', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        alert('Credenciales incorrectas o usuario no encontrado.');
        return;
      }

      alert(`Bienvenido de nuevo, ${data.nombre} (${role})`);
    } catch (err) {
      console.error('Error en el login:', err.message);
      alert('Ocurrió un error al intentar iniciar sesión.');
    }
  });
});
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('employeeForm');
  const closeNoticeBtn = document.getElementById('closeNoticeBtn');
  const autoIdInput = document.getElementById('empleadoId');

  autoIdInput.value = 'EMP-' + Math.floor(1000 + Math.random() * 9000);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const employeeData = {
      nombre: document.getElementById('nombre').value,
      correo: document.getElementById('correo').value,
      telefono: document.getElementById('telefono').value,
      password: document.getElementById('password').value,
    };

    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData]);

      if (error) throw error;

      alert('Empleado registrado exitosamente');
      // Redirigir de regreso al login tras guardar
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Error guardando en Supabase:', err.message);
      alert('Error al guardar el registro. Revisa la consola o credenciales.');
    }
  });

  closeNoticeBtn?.addEventListener('click', () => {
    document.querySelector('.info-notice').style.display = 'none';
  });
});