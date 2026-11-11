// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://nfnybvlsejhggxedwcui.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2czz9zmhkMBIia59KNpz_g_I75s9ML8';

// Inicialización del cliente evitando colisiones globales
const dbClient = (window.supabase && SUPABASE_URL.includes('supabase.co'))
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// BASE DE DATOS LOCAL (FALLBACK EN CASO DE NO CONECTAR A SUPABASE)
let localDB = {
  employees: [
    { empleado_id: 'EMP-1001', nombre: 'Carlos Mendoza', correo: 'admin@sofema.com', telefono: '555-0101', password: 'admin123', rol: 'Administrador' },
    { empleado_id: 'EMP-1002', nombre: 'Sofía Ramírez', correo: 'sofia@sofema.com', telefono: '555-0102', password: 'emp123', rol: 'Empleado' },
    { empleado_id: 'EMP-1003', nombre: 'Mateo López', correo: 'mateo@sofema.com', telefono: '555-0103', password: 'emp123', rol: 'Empleado' }
  ],
  customers: [
    { alias: 'CaféAdicto', nombre: 'Alejandro Silva', telefono: '555-8001', puntos: 120 },
    { alias: 'Maru', nombre: 'María Gutiérrez', telefono: '555-8002', puntos: 45 },
    { alias: 'Chema', nombre: 'José María León', telefono: '555-8008', puntos: 60 }
  ],
  inventory: [
    { id: 1, producto: 'Espresso Doble', categoria: 'Bebidas Calientes', precio: 45.00, stock: 150 },
    { id: 2, producto: 'Cappuccino Tradicional', categoria: 'Bebidas Calientes', precio: 55.00, stock: 120 },
    { id: 3, producto: 'Latte Vainilla', categoria: 'Bebidas Calientes', precio: 60.00, stock: 100 },
    { id: 4, producto: 'Croissant de Mantequilla', categoria: 'Repostería', precio: 40.00, stock: 45 },
    { id: 5, producto: 'Panini de Jamón Serrano', categoria: 'Alimentos', precio: 95.00, stock: 25 }
  ],
  sales: [
    { cliente_alias: 'CaféAdicto', vendedor_nombre: 'Sofía Ramírez', total: 90.00, created_at: new Date().toISOString() },
    { cliente_alias: 'Maru', vendedor_nombre: 'Mateo López', total: 100.00, created_at: new Date().toISOString() }
  ]
};

let currentUser = null;
let currentCart = [];
let salesChart = null;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupForms();
  
  if (dbClient) {
    document.getElementById('connection-status').textContent = '● Conectado a Supabase';
    document.getElementById('connection-status').style.color = 'green';
  } else {
    document.getElementById('connection-status').textContent = '● Modo Simulación Local';
    document.getElementById('connection-status').style.color = '#d4a373';
  }
});

// NAVEGACIÓN Y VISTAS
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`sec-${targetView}`).classList.add('active');
      document.getElementById('page-title').textContent = item.textContent.trim();

      if (targetView === 'stats') renderStats();
    });
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    currentUser = null;
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('view-login').style.display = 'flex';
  });
}

// FORMULARIOS Y LOGICA
function setupForms() {
  // Login
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('login-role').value;
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    let user = null;

    if (dbClient) {
      const { data, error } = await dbClient
      .from('employees')
      .select('*')
      .eq('correo', email)
      .eq('password', pass)
      .single(); // <--- Si no existe el usuario o la consulta falla, Supabase devuelve HTTP 406
      user = data;
    } else {
      user = localDB.employees.find(e => e.correo === email && e.password === pass && e.rol === role);
    }

    if (user) {
      currentUser = user;
      initApp();
    } else {
      alert('Credenciales incorrectas o el rol seleccionado no coincide.');
    }
  });

  // Registro de Cliente
  document.getElementById('form-customer').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newCust = {
      alias: document.getElementById('cust-alias').value,
      nombre: document.getElementById('cust-name').value,
      telefono: document.getElementById('cust-phone').value,
      puntos: 0
    };

    if (dbClient) {
      await dbClient.from('customers').insert([newCust]);
    } else {
      localDB.customers.push(newCust);
    }

    alert('Cliente registrado exitosamente');
    document.getElementById('form-customer').reset();
    loadCustomers();
  });

  // Registro de Empleado
  document.getElementById('form-employee').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newEmp = {
      empleado_id: document.getElementById('emp-id').value,
      nombre: document.getElementById('emp-name').value,
      correo: document.getElementById('emp-email').value,
      telefono: document.getElementById('emp-phone').value,
      password: document.getElementById('emp-pass').value,
      rol: document.getElementById('emp-role').value
    };

    if (dbClient) {
      await dbClient.from('employees').insert([newEmp]);
    } else {
      localDB.employees.push(newEmp);
    }

    alert('Empleado registrado exitosamente');
    document.getElementById('form-employee').reset();
    generateEmpId();
    loadEmployees();
  });

  // Completar Venta
  document.getElementById('btn-complete-sale').addEventListener('click', async () => {
    const alias = document.getElementById('pos-customer').value;
    if (!alias) return alert('Selecciona un alias de cliente');
    if (currentCart.length === 0) return alert('El carrito está vacío');

    const total = currentCart.reduce((sum, item) => sum + (item.precio * item.cant), 0);
    const saleData = {
      cliente_alias: alias,
      vendedor_nombre: currentUser.nombre,
      items: currentCart,
      total: total
    };

    if (dbClient) {
      await dbClient.from('sales').insert([saleData]);
    } else {
      localDB.sales.push(saleData);
    }

    alert('Venta realizada con éxito');
    currentCart = [];
    renderCart();
    loadInventory();
  });
}

// CARGA INICIAL TRAS LOGIN
function initApp() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('app-container').style.display = 'flex';

  document.getElementById('display-user-name').textContent = currentUser.nombre;
  document.getElementById('display-user-role').textContent = currentUser.rol;

  // Filtrado de Vistas por Rol
  if (currentUser.rol !== 'Administrador') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    generateEmpId();
  }

  loadPOS();
  loadInventory();
  loadCustomers();
  if (currentUser.rol === 'Administrador') loadEmployees();
}

// MÓDULOS DE DATOS
async function loadPOS() {
  let inv = dbClient ? (await dbClient.from('inventory').select('*')).data : localDB.inventory;
  let cust = dbClient ? (await dbClient.from('customers').select('*')).data : localDB.customers;

  // Render Productos
  const container = document.getElementById('pos-products');
  container.innerHTML = inv.map(p => `
    <div class="product-card" onclick="addToCart('${p.producto}', ${p.precio})">
      <div style="font-weight: 600;">${p.producto}</div>
      <div class="product-price">$${p.precio.toFixed(2)}</div>
    </div>
  `).join('');

  // Select Clientes
  const select = document.getElementById('pos-customer');
  select.innerHTML = '<option value="">Selecciona un cliente...</option>' + 
    cust.map(c => `<option value="${c.alias}">${c.alias} (${c.nombre})</option>`).join('');
}

window.addToCart = function(producto, precio) {
  const existing = currentCart.find(i => i.producto === producto);
  if (existing) {
    existing.cant++;
  } else {
    currentCart.push({ producto, precio, cant: 1 });
  }
  renderCart();
};

function renderCart() {
  const container = document.getElementById('pos-cart-items');
  if (currentCart.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Carrito vacío</p>';
    document.getElementById('pos-total').textContent = '$0.00';
    return;
  }

  let total = 0;
  container.innerHTML = currentCart.map(item => {
    const subtotal = item.precio * item.cant;
    total += subtotal;
    return `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span>${item.producto} x${item.cant}</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
    `;
  }).join('');

  document.getElementById('pos-total').textContent = `$${total.toFixed(2)}`;
}

async function loadInventory() {
  let data = dbClient ? (await dbClient.from('inventory').select('*')).data : localDB.inventory;
  document.getElementById('tbl-inventory').innerHTML = data.map(i => `
    <tr>
      <td>#${i.id || 0}</td>
      <td>${i.producto}</td>
      <td>${i.categoria}</td>
      <td>$${Number(i.precio).toFixed(2)}</td>
      <td>${i.stock} un.</td>
    </tr>
  `).join('');
}

async function loadCustomers() {
  let data = dbClient ? (await dbClient.from('customers').select('*')).data : localDB.customers;
  document.getElementById('tbl-customers').innerHTML = data.map(c => `
    <tr>
      <td><strong>@${c.alias}</strong></td>
      <td>${c.nombre}</td>
      <td>${c.telefono || 'N/A'}</td>
      <td>${c.puntos || 0} pts</td>
    </tr>
  `).join('');
}

async function loadEmployees() {
  let data = dbClient ? (await dbClient.from('employees').select('*')).data : localDB.employees;
  document.getElementById('tbl-employees').innerHTML = data.map(e => `
    <tr>
      <td>${e.empleado_id}</td>
      <td>${e.nombre}</td>
      <td>${e.correo}</td>
      <td><span class="badge ${e.rol === 'Administrador' ? 'badge-admin' : 'badge-emp'}">${e.rol}</span></td>
    </tr>
  `).join('');
}

function generateEmpId() {
  document.getElementById('emp-id').value = 'EMP-' + Math.floor(1000 + Math.random() * 9000);
}

async function renderStats() {
  let sales = dbClient ? (await dbClient.from('sales').select('*')).data : localDB.sales;
  
  const total = sales.reduce((sum, s) => sum + Number(s.total), 0);
  document.getElementById('stat-total-sales').textContent = `$${total.toFixed(2)}`;
  document.getElementById('stat-count-sales').textContent = sales.length;

  const ctx = document.getElementById('chartSales').getContext('2d');
  if (salesChart) salesChart.destroy();

  salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sales.map((_, i) => `Venta ${i + 1}`),
      datasets: [{
        label: 'Monto de Venta ($)',
        data: sales.map(s => s.total),
        backgroundColor: '#5c3a21'
      }]
    }
  });
}