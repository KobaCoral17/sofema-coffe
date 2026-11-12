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
    { id: 4, producto: 'Café Americano', categoria: 'Bebidas Calientes', precio: 40.00, stock: 200 },
    { id: 5, producto: 'Frappé de Caramelo', categoria: 'Bebidas Frías', precio: 65.00, stock: 90 },
    { id: 6, producto: 'Iced Vanilla Latte', categoria: 'Bebidas Frías', precio: 60.00, stock: 110 },
    { id: 7, producto: 'Croissant de Mantequilla', categoria: 'Repostería', precio: 40.00, stock: 45 },
    { id: 8, producto: 'Panini de Jamón Serrano', categoria: 'Alimentos', precio: 95.00, stock: 25 }
  ],
  sales: [
    { cliente_alias: 'CaféAdicto', vendedor_nombre: 'Sofía Ramírez', total: 90.00, created_at: new Date().toISOString() },
    { cliente_alias: 'Maru', vendedor_nombre: 'Mateo López', total: 100.00, created_at: new Date().toISOString() }
  ]
};

// ESTRUCTURA DEL SISTEMA EXPERTO (ÁRBOL DE DECISIÓN)
const ARBOL_TEST = {
  id: 'q1', nivel: 1,
  pregunta: '1. ¿Cómo describirías tu ritmo natural en el día a día?',
  opcionA: { texto: 'A) Intenso, activo y en movimiento constante.', resumen: 'Intenso & Activo', siguiente: 'q2_A' },
  opcionB: { texto: 'B) Pausado, enfocado y constante.', resumen: 'Pausado & Enfocado', siguiente: 'q2_B' },
  ramas: {
    q2_A: {
      id: 'q2_A', nivel: 2,
      pregunta: '2. En tus decisiones y relaciones personales, tú:',
      opcionA: { texto: 'A) Voy directo al punto y priorizo efectividad.', resumen: 'Directo & Pragmático', siguiente: 'q3_AA' },
      opcionB: { texto: 'B) Busco la armonía y cuido el ambiente.', resumen: 'Armónico & Social', siguiente: 'q3_AB' },
      ramas: {
        q3_AA: {
          id: 'q3_AA', nivel: 3,
          pregunta: '3. Ante un cambio o reto imprevisto:',
          opcionA: { texto: 'A) Me motiva la adrenalina y el liderazgo.', resumen: 'Adrenalina', resultado: 'ESPRESSO' },
          opcionB: { texto: 'B) Improviso una solución funcional.', resumen: 'Improvisación', resultado: 'AMERICANO' }
        },
        q3_AB: {
          id: 'q3_AB', nivel: 3,
          pregunta: '3. Ante un cambio o reto imprevisto:',
          opcionA: { texto: 'A) Propongo algo alegre y divertido.', resumen: 'Alegre', resultado: 'FRAPPE' },
          opcionB: { texto: 'B) Mantengo la calma con soltura.', resumen: 'Calma fresca', resultado: 'ICED_LATTE' }
        }
      }
    },
    q2_B: {
      id: 'q2_B', nivel: 2,
      pregunta: '2. En tus relaciones personales y de trabajo te defines como:',
      opcionA: { texto: 'A) Cálido, empático y acogedor.', resumen: 'Cálido & Empático', siguiente: 'q3_BA' },
      opcionB: { texto: 'B) Reservado, analítico y observador.', resumen: 'Analítico & Observador', siguiente: 'q3_BB' },
      ramas: {
        q3_BA: {
          id: 'q3_BA', nivel: 3,
          pregunta: '3. En tus momentos de descanso prefieres:',
          opcionA: { texto: 'A) Una charla cálida con espuma abundante.', resumen: 'Charla cálida', resultado: 'CAPUCHINO' },
          opcionB: { texto: 'B) Momentos suaves y tranquilos.', resumen: 'Momento suave', resultado: 'LATTE' }
        },
        q3_BB: {
          id: 'q3_BB', nivel: 3,
          pregunta: '3. ¿Qué valoras más al trabajar o crear?',
          opcionA: { texto: 'A) La precisión del ritual y el detalle.', resumen: 'Detalle artesanal', resultado: 'AMERICANO' },
          opcionB: { texto: 'B) La extracción limpia e independiente.', resumen: 'Sabor independiente', resultado: 'ESPRESSO' }
        }
      }
    }
  }
};

const CATALAGO_CAFES = {
  ESPRESSO: { productoNombre: 'Espresso Doble', nombre: 'Espresso Doble ⚡', tagline: 'Energía pura, carácter directo y determinación.', notas: 'Amargo pronunciado, cuerpo denso y crema persistente.', psicologia: 'Alta Extraversión y Pragmatismo. Liderazgo directo sin rodeos.' },
  AMERICANO: { productoNombre: 'Café Americano', nombre: 'Café Americano ☕', tagline: 'Equilibrio, pragmatismo clásico y funcionalidad.', notas: 'Cuerpo ligero, sabor limpio a grano tostado.', psicologia: 'Responsabilidad y Estabilidad. Confiable y directo.' },
  FRAPPE: { productoNombre: 'Frappé de Caramelo', nombre: 'Frappé de Caramelo 🍧', tagline: 'Alegría, jovialidad y espíritu festivo.', notas: 'Granizado helado, dulce con toppings y crema batida.', psicologia: 'Extraversión Alta y optimismo. Celebras el presente.' },
  ICED_LATTE: { productoNombre: 'Iced Vanilla Latte', nombre: 'Iced Vanilla Latte 🧊', tagline: 'Frescura, versatilidad y soltura relajada.', notas: 'Leche fría sedosa, hielo y vainilla ligera.', psicologia: 'Amabilidad y Adaptabilidad. Fluyes con tranquilidad.' },
  CAPUCHINO: { productoNombre: 'Cappuccino Tradicional', nombre: 'Cappuccino Tradicional 🎨', tagline: 'Calidez, empatía y confort reconfortante.', notas: 'Abundante espuma cremosa vaporizada.', psicologia: 'Alta Amabilidad. Creas ambientes acogedores.' },
  LATTE: { productoNombre: 'Latte Vainilla', nombre: 'Latte Vainilla 🥛', tagline: 'Suavidad, equilibrio y estilo sereno.', notas: 'Predominancia de leche vaporizada y espresso suave.', psicologia: 'Personalidad pacífica y diplomática.' }
};

let currentUser = null;
let currentCart = [];
let salesChart = null;

// ESTADO DEL SISTEMA EXPERTO
let nodoActualTest = ARBOL_TEST;
let historialTest = [];
let ultimoResultadoCafe = null;

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

  // Inicializar el test experto
  renderizarPreguntaTest();
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

// FORMULARIOS Y LÓGICA
function setupForms() {
  // Login
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('login-role').value;
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    let user = null;

    if (dbClient) {
      const { data } = await dbClient
        .from('employees')
        .select('*')
        .eq('correo', email)
        .eq('password', pass)
        .single();
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

  // Botón: Pedir el café recomendado por el Sistema Experto
  document.getElementById('btn-order-recommended').addEventListener('click', pedirCafeRecomendado);
  //Cancelar Orden
  const cancelOrderBtn = document.getElementById('btn-cancel-order');
  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', () => {
      if (confirm("¿Estás seguro de que deseas cancelar la orden actual?")) {
        // 1. Vaciar el carrito en memoria
        currentCart = [];
        
        // 2. Volver a renderizar el carrito (lo pone en "Carrito vacío" y total $0.00)
        renderCart();
        
        // 3. Reiniciar el select del cliente
        const customerSelect = document.getElementById('pos-customer');
        if (customerSelect) customerSelect.value = "";
      }
    });
  }
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

// LÓGICA DEL SISTEMA EXPERTO (TEST)
function renderizarPreguntaTest() {
  document.getElementById('level-badge').innerText = `Nivel ${nodoActualTest.nivel} de 3`;
  document.getElementById('question-text').innerText = nodoActualTest.pregunta;

  const container = document.getElementById('options-container');
  container.innerHTML = `
    <button class="btn btn-secondary" style="text-align: left; padding: 0.8rem;" onclick="responderTest('A')">
      ${nodoActualTest.opcionA.texto}
    </button>
    <button class="btn btn-secondary" style="text-align: left; padding: 0.8rem;" onclick="responderTest('B')">
      ${nodoActualTest.opcionB.texto}
    </button>
  `;

  renderizarArbolTest();
}

function responderTest(opcion) {
  const infoOpcion = opcion === 'A' ? nodoActualTest.opcionA : nodoActualTest.opcionB;
  historialTest.push({ nivel: nodoActualTest.nivel, opcion, resumen: infoOpcion.resumen });

  if (infoOpcion.resultado) {
    ultimoResultadoCafe = CATALAGO_CAFES[infoOpcion.resultado];
    mostrarResultadoTest(ultimoResultadoCafe);
  } else if (infoOpcion.siguiente && nodoActualTest.ramas[infoOpcion.siguiente]) {
    nodoActualTest = nodoActualTest.ramas[infoOpcion.siguiente];
    renderizarPreguntaTest();
  }
}

function mostrarResultadoTest(cafe) {
  document.getElementById('quiz-view').style.display = 'none';
  document.getElementById('result-view').style.display = 'block';

  document.getElementById('coffee-name').innerText = cafe.nombre;
  document.getElementById('coffee-tagline').innerText = `"${cafe.tagline}"`;
  document.getElementById('coffee-notes').innerText = cafe.notas;
  document.getElementById('coffee-psych').innerText = cafe.psicologia;

  renderizarArbolTest();
}

function renderizarArbolTest() {
  const container = document.getElementById('tree-display');
  const estructura = [
    { nivel: 1, titulo: 'NIVEL 1: Ritmo y Energía', opA: 'A) Intenso & Activo', opB: 'B) Pausado & Enfocado' },
    { nivel: 2, titulo: 'NIVEL 2: Relaciones & Decisiones', opA: 'A) Directo / Pragmático', opB: 'B) Cálido / Empático' },
    { nivel: 3, titulo: 'NIVEL 3: Tolerancia al Riesgo / Estilo', opA: 'A) Adrenalina / Arte', opB: 'B) Funcional / Calma' }
  ];

  container.innerHTML = estructura.map(n => {
    const paso = historialTest.find(h => h.nivel === n.nivel);
    return `
      <div class="tree-node-item">
        <div class="tree-node-title">${n.titulo}</div>
        <div class="tree-branches-grid">
          <div class="branch-box ${paso && paso.opcion === 'A' ? 'active' : ''}">${n.opA}</div>
          <div class="branch-box ${paso && paso.opcion === 'B' ? 'active' : ''}">${n.opB}</div>
        </div>
      </div>
    `;
  }).join('');
}

function reiniciarTest() {
  nodoActualTest = ARBOL_TEST;
  historialTest = [];
  ultimoResultadoCafe = null;
  document.getElementById('result-view').style.display = 'none';
  document.getElementById('quiz-view').style.display = 'block';
  renderizarPreguntaTest();
}

// FUNCIÓN PARA AÑADIR LA BEBIDA RECOMENDADA AL CARRITO DE VENTAS
async function pedirCafeRecomendado() {
  if (!ultimoResultadoCafe) return;

  const nombreProducto = ultimoResultadoCafe.productoNombre;
  
  // Buscar el producto en la lista de inventario
  let inv = dbClient ? (await dbClient.from('inventory').select('*')).data : localDB.inventory;
  const prod = inv.find(i => i.producto.toLowerCase() === nombreProducto.toLowerCase());

  if (prod) {
    addToCart(prod.producto, prod.precio);
  } else {
    // Si no está exactamente nombrado en inventario, se agrega con un precio estándar de $50.00
    addToCart(nombreProducto, 50.00);
  }

  // Redirigir la vista al Punto de Venta (Sales)
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

  const navSales = document.querySelector('.nav-item[data-view="sales"]');
  if (navSales) navSales.classList.add('active');
  
  document.getElementById('sec-sales').classList.add('active');
  document.getElementById('page-title').textContent = 'Punto de Venta';

  alert(`¡${nombreProducto} agregado exitosamente a la orden actual!`);
}

// MÓDULOS DE DATOS DEL POS
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