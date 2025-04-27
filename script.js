const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const subtotalElement = document.getElementById('subtotal');
const cartCount = document.getElementById('cart-count');

let cart = [];

/**
 * Actualiza el carrito y muestra el subtotal y la cantidad total
 */
function updateCart() {
  cartItems.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center mb-3 cart-item-animated';
  
    div.innerHTML = `
      <div>
        <strong>${item.title}</strong><br>
        <small>$${item.price.toFixed(2)} c/u</small>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-sm btn-outline-secondary me-2" onclick="decreaseQuantity(${item.id})">–</button>
        <span>${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary mx-2" onclick="increaseQuantity(${item.id})">+</button>
        <button class="btn btn-sm btn-danger ms-2" onclick="removeFromCart(${item.id})">Quitar</button>
      </div>
    `;
  
    cartItems.appendChild(div);
  });
   cart.forEach(item => {
    subtotal += item.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center mb-3';

    div.innerHTML = `
      <div>
        <strong>${item.title}</strong><br>
        <small>$${item.price.toFixed(2)} c/u</small>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-sm btn-outline-secondary me-2" onclick="decreaseQuantity(${item.id})">–</button>
        <span>${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary mx-2" onclick="increaseQuantity(${item.id})">+</button>
        <button class="btn btn-sm btn-danger ms-2" onclick="removeFromCart(${item.id})">Quitar</button>
      </div>
    `;

    cartItems.appendChild(div);
  });

  subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalQuantity;
  


  // Mostrar u ocultar badge
  if (totalQuantity > 0) {
    cartCount.classList.remove('d-none');
  } else {
    cartCount.classList.add('d-none');
  }
}
/**
 * Muestra el modal de confirmación al agregar al carrito
 */
function showAddToCartModal() {
    const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
    modal.show();
  }
  
/**
 * Agrega un producto al carrito
 */
function addToCart(product) {
  if (!product || typeof product.price !== 'number') return;

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, quantity: 1 });
  }
  updateCart();
  showAddToCartModal();
}

/**
 * Aumenta cantidad de un producto
 */
function increaseQuantity(productId) {
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity++;
    updateCart();
  }
}

/**
 * Disminuye cantidad o elimina producto si es 1
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
 * Elimina completamente un producto del carrito
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
  panel.classList.toggle('open');
}

/**
 * Muestra mensaje tipo toast
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

document.getElementById('clear-cart-button').addEventListener('click', clearCart);
document.getElementById('toggle-cart').addEventListener('click', toggleCart);

// Cargar productos desde API
fetch('https://fakestoreapi.com/products')
  .then(res => res.json())
  .then(products => {
    products.forEach(product => {
      const col = document.createElement('div');
      col.className = 'product';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${product.image}" class="card-img-top p-4" alt="${product.title}" style="height: 250px; object-fit: contain;">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-secondary mb-2 text-capitalize">${product.category}</span>
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">$${product.price.toFixed(2)}</p>
            
            <button class="btn btn-primary mt-auto">Agregar al carrito</button>
          </div>
        </div>
      `;

      col.querySelector('button').addEventListener('click', () => addToCart(product));
      productList.appendChild(col);
    });
  })
  .catch(err => {
    console.error('Error al cargar productos:', err);
    productList.innerHTML = `<p class="text-danger">No se pudieron cargar los productos.</p>`;
  });
