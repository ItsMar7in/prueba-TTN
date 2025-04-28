// Seleccionamos los elementos principales del DOM
const productList = document.getElementById('product-list');
const carritoItems = document.getElementById('carrito-items');
const subtotalElement = document.getElementById('subtotal');
const carritoCount = document.getElementById('carrito-count');
const header = document.querySelector('header');

// Variables de control
let carrito = []; // Carrito de compras
let lastScrollTop = 0; // Última posición de scroll

/**
 * Actualiza la visualización del carrito, subtotal y conteo de ítems.
 */
function updateCarrito() {
  carritoItems.innerHTML = '';
  let subtotal = 0;

  carrito.forEach(item => {
    subtotal += item.price * item.quantity;

    // Crear contenedor del item en el carrito
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-start mb-4';
    div.innerHTML = `
      <div>
        <div class="d-flex align-items-center mb-2">
          <img src="${item.image || 'fallback-image.jpg'}" class="carrito-item-img me-2" alt="${item.title}">
          <div>
            <strong>${item.title}</strong><br>
            <small>$${item.price.toFixed(2)} c/u</small>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column align-items-center">
        <div class="d-flex align-items-center mb-2">
          <button class="btn btn-sm btn-outline-primary me-2" onclick="decreaseQuantity(${item.id})" aria-label="Reducir cantidad de ${item.title}">–</button>
          <span>${item.quantity}</span>
          <button class="btn btn-sm btn-outline-primary mx-2" onclick="increaseQuantity(${item.id})" aria-label="Aumentar cantidad de ${item.title}">+</button>
        </div>
        <div class="text-end">
          <button class="btn btn-sm btn-danger mt-2" onclick="removeFromCarrito(${item.id})" aria-label="Quitar ${item.title} del carrito">Quitar</button>
        </div>
      </div>
    `;
    carritoItems.appendChild(div);
  });

  // Actualizar subtotal y contador
  subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
  const totalQuantity = carrito.reduce((sum, item) => sum + item.quantity, 0);
  carritoCount.textContent = totalQuantity;

  // Mostrar/ocultar contador
  carritoCount.classList.toggle('d-none', totalQuantity === 0);
}

/**
 * Agrega un producto al carrito.
 * @param {Object} product - Producto a agregar.
 */
function addToCarrito(product) {
  if (!product || typeof product.price !== 'number' || product.price <= 0) return;

  const existing = carrito.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    carrito.push({ id: product.id, title: product.title, price: product.price, quantity: 1, image: product.image });
  }
  updateCarrito();
  showMessage('¡Producto añadido al carrito!');
}

/**
 * Aumenta la cantidad de un producto en el carrito.
 * @param {number} productId - ID del producto.
 */
function increaseQuantity(productId) {
  const item = carrito.find(p => p.id === productId);
  if (item) {
    item.quantity++;
    updateCarrito();
  }
}

/**
 * Disminuye la cantidad de un producto o lo elimina si llega a 1.
 * @param {number} productId - ID del producto.
 */
function decreaseQuantity(productId) {
  const item = carrito.find(p => p.id === productId);
  if (item && item.quantity > 1) {
    item.quantity--;
    updateCarrito();
  } else {
    removeFromCarrito(productId);
  }
}

/**
 * Elimina un producto del carrito.
 * @param {number} productId - ID del producto.
 */
function removeFromCarrito(productId) {
  carrito = carrito.filter(p => p.id !== productId);
  updateCarrito();
}

/**
 * Vacía todo el carrito previa confirmación.
 */
function clearCarrito() {
  if (confirm('¿Estás seguro que deseas vaciar el carrito?')) {
    carrito = [];
    updateCarrito();
  }
}

/**
 * Muestra/oculta el panel lateral del carrito.
 */
function toggleCarrito() {
  const panel = document.getElementById('carrito-panel');
  const backdrop = document.getElementById('carrito-backdrop');
  panel.classList.toggle('open');
  backdrop.classList.toggle('open');
}

/**
 * Muestra un mensaje tipo "toast" de manera temporal.
 * @param {string} message - Mensaje a mostrar.
 */
function showMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 2000);
}

/**
 * Muestra un modal con la imagen y descripción del producto.
 * @param {Object} product - Producto a mostrar.
 */
function showProductModal(product) {
  const modalImage = document.getElementById('modalProductImage');
  const modalDescription = document.getElementById('modalProductDescription');
  const modalTitle = document.getElementById('productModalLabel');

  modalTitle.textContent = product.title;
  modalImage.src = product.image || 'fallback-image.jpg';
  modalImage.alt = product.title;
  modalDescription.textContent = product.description || 'Descripción no disponible.';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

/**
 * Carga los productos desde una API externa.
 */
function loadProducts() {
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');

  loading.classList.remove('d-none');
  errorMessage.classList.add('d-none');
  productList.innerHTML = '';

  fetch('https://fakestoreapi.com/products')
    .then(res => res.json())
    .then(products => {
      loading.classList.add('d-none');
      products.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

        col.innerHTML = `
          <div class="card h-100">
            <div class="card-img-container">
              <img src="${product.image || 'fallback-image.jpg'}" class="card-img-top" alt="${product.title}">
            </div>
            <div class="card-body d-flex flex-column">
              <span class="badge bg-secondary mb-2 text-capitalize">${product.category}</span>
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
              <button class="btn btn-primary mt-auto" aria-label="Agregar ${product.title} al carrito">Agregar al carrito</button>
            </div>
          </div>
        `;

        col.querySelector('button').addEventListener('click', () => addToCarrito(product));
        col.querySelector('.card-img-top').addEventListener('click', () => showProductModal(product));
        productList.appendChild(col);
      });
    })
    .catch(err => {
      console.error('Error al cargar productos:', err);
      loading.classList.add('d-none');
      errorMessage.classList.remove('d-none');
    });
}

/**
 * Maneja el scroll de la página para ocultar o mostrar el header.
 */
window.addEventListener('scroll', () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScrollTop > lastScrollTop) {
    header.classList.add('header-hidden');
  } else {
    header.classList.remove('header-hidden');
  }

  lastScrollTop = Math.max(0, currentScrollTop);
});

// Asociar eventos a botones principales
document.getElementById('clear-carrito-button').addEventListener('click', clearCarrito);
document.getElementById('toggle-carrito').addEventListener('click', toggleCarrito);
document.getElementById('carrito-backdrop').addEventListener('click', toggleCarrito);

// Cargar los productos al iniciar
loadProducts();