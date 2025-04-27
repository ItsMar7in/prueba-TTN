const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const subtotalElement = document.getElementById('subtotal');
const cartCount = document.getElementById('cart-count');
const header = document.querySelector('header');

let cart = [];
let lastScrollTop = 0;

/**
 * Actualiza la visualización del carrito, subtotal y conteo de ítems
 */
function updateCart() {
  cartItems.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center mb-3';
  
    div.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.image || 'fallback-image.jpg'}" class="cart-item-img" alt="${item.title}">
        <div>
          <strong>${item.title}</strong><br>
          <small>$${item.price.toFixed(2)} c/u</small>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-sm btn-outline-secondary me-2" onclick="decreaseQuantity(${item.id})" aria-label="Reducir cantidad de ${item.title}">–</button>
        <span>${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary mx-2" onclick="increaseQuantity(${item.id})" aria-label="Aumentar cantidad de ${item.title}">+</button>
        <button class="btn btn-sm btn-danger ms-2" onclick="removeFromCart(${item.id})" aria-label="Quitar ${item.title} del carrito">Quitar</button>
      </div>
    `;
  
    cartItems.appendChild(div);
  });

  subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalQuantity;

  // Mostrar u ocultar badge
  cartCount.classList.toggle('d-none', totalQuantity === 0);
}

/**
 * Agrega un producto al carrito
 */
function addToCart(product) {
  if (!product || typeof product.price !== 'number' || product.price <= 0) return;

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, quantity: 1, image: product.image });
  }
  updateCart();
  showMessage('¡Producto añadido al carrito!');
}

/**
 * Aumenta la cantidad de un producto
 */
function increaseQuantity(productId) {
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity++;
    updateCart();
  }
}

/**
 * Disminuye la cantidad o elimina el producto si es 1
 */
function decreaseQuantity(productId) {
  const item = cart.find(p => p.id === productId);
  if (item && item.quantity > 1) {
    item.quantity--;
    updateCart();
  } else {
    removeFromCart(productId);
  }
}

/**
 * Elimina un producto del carrito
 */
function removeFromCart(productId) {
  cart = cart.filter(p => p.id !== productId);
  updateCart();
}

/**
 * Vacía todo el carrito
 */
function clearCart() {
  if (confirm('¿Estás seguro que deseas vaciar el carrito?')) {
    cart = [];
    updateCart();
  }
}

/**
 * Muestra u oculta el panel del carrito
 */
function toggleCart() {
  const panel = document.getElementById('cart-panel');
  const backdrop = document.getElementById('cart-backdrop');
  panel.classList.toggle('open');
  backdrop.classList.toggle('open');
}

/**
 * Muestra un mensaje tipo toast
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
 * Muestra el modal con la imagen y descripción del producto
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
 * Carga productos desde la API
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
        col.querySelector('button').addEventListener('click', () => addToCart(product));
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

// Manejar el desplazamiento para ocultar/mostrar el header
window.addEventListener('scroll', () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScrollTop > lastScrollTop) {
    // Desplazamiento hacia abajo
    header.classList.add('header-hidden');
  } else {
    // Desplazamiento hacia arriba
    header.classList.remove('header-hidden');
  }

  lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // Evitar valores negativos
});

document.getElementById('clear-cart-button').addEventListener('click', clearCart);
document.getElementById('toggle-cart').addEventListener('click', toggleCart);
document.getElementById('cart-backdrop').addEventListener('click', toggleCart);

// Cargar productos al cargar la página
loadProducts();