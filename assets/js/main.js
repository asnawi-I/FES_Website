// Main JavaScript for First Emporium Supermarket

// Global variables
var currentFilter = 'all';
var lastScrollTop = 0;
var floatingVisible = false;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

// Initialize the application
function initializePage() {
    renderProducts();
    updateCartCount();
    console.log('First Emporium initialized successfully');
}

// Setup event listeners
function setupEventListeners() {
    // Scroll event for floating categories
    window.addEventListener('scroll', handleScroll);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        var orderModal = document.getElementById('orderModal');
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Form submission
    var orderForm = document.getElementById('orderFormElement');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
}

// Handle scroll events for floating categories
function handleScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var categoriesSection = document.querySelector('.categories');
    var categoriesBottom = categoriesSection.offsetTop + categoriesSection.offsetHeight;
    var floatingCategories = document.getElementById('floatingCategories');

    // Show floating categories when scrolled past main categories
    if (scrollTop > categoriesBottom && !floatingVisible) {
        floatingCategories.classList.add('show');
        floatingVisible = true;
    } else if (scrollTop <= categoriesBottom && floatingVisible) {
        floatingCategories.classList.remove('show');
        floatingVisible = false;
    }

    lastScrollTop = scrollTop;
}

// Render products in the grid
function renderProducts() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    var filteredProducts = getFilteredProducts();
    var html = '';

    for (var i = 0; i < filteredProducts.length; i++) {
        var product = filteredProducts[i];
        html += createProductCard(product);
    }

    grid.innerHTML = html;
}

// Get filtered products based on current filter
function getFilteredProducts() {
    if (currentFilter === 'all') {
        return products;
    }
    return products.filter(function(product) {
        return product.category === currentFilter;
    });
}


// === MODIFIED: createProductCard function to handle conditional button/selector visibility ===
function createProductCard(product) {
    const existingItem = findCartItem(product.id);
    const quantity = existingItem ? existingItem.quantity : 1;
    
    // Conditionally show add button or quantity selector
    const actionButtonHtml = !existingItem
        ? `<button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>`
        : '';
        
    const quantitySelectorHtml = existingItem
        ? `<div class="quantity-selector" style="display: flex;">
               <button class="quantity-btn" onclick="updateQuantityOnCard(${product.id}, -1)">−</button>
               <div class="quantity-display" id="qty-${product.id}">${quantity}</div>
               <button class="quantity-btn" onclick="updateQuantityOnCard(${product.id}, 1)">+</button>
           </div>`
        : `<div class="quantity-selector">
               <button class="quantity-btn" onclick="updateQuantityOnCard(${product.id}, -1)">−</button>
               <div class="quantity-display" id="qty-${product.id}">${quantity}</div>
               <button class="quantity-btn" onclick="updateQuantityOnCard(${product.id}, 1)">+</button>
           </div>`; // Render hidden selector for smooth transition

    var html = `<div class="product-card" data-product-id="${product.id}">`;
    html += '<div class="product-image">';
    html += `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
    html += '<div class="placeholder" style="display: none;">';
    html += '<div>📦</div>';
    html += '<div>img</div>';
    html += '</div>';
    html += '<div class="price-badge">Price on Inquiry</div>';
    html += '</div>';
    html += '<div class="product-info">';
    html += `<h3 class="product-name">${product.name}</h3>`;
    html += `<p class="product-description">${product.description}</p>`;
    html += '<div class="product-actions">';
    html += actionButtonHtml;
    html += quantitySelectorHtml;
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
}
// === END OF MODIFICATION ===

// === MODIFIED: Function to update the display of a single product card ===
function updateProductCardDisplay(productId) {
    const product = findProductById(productId);
    if (!product) return;
    
    const cardElement = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (cardElement) {
        // Re-render only this card
        cardElement.outerHTML = createProductCard(product);
    }
}
// === END OF MODIFICATION ===

// === MODIFIED: `addToCart` now calls `updateProductCardDisplay` to swap the button ===
function addToCart(productId) {
    const product = findProductById(productId);
    if (!product) return;

    const existingItem = findCartItem(productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId, name: product.name, description: product.description,
            image: product.image, category: product.category, quantity: 1
        });
    }

    updateCartCount();
    renderCartItems();
    updateProductCardDisplay(productId); // Update the card to show the selector
    
    // Animate cart button
    animateCartButton();
}
// === END OF MODIFICATION ===

// === MODIFIED: A new function to handle quantity changes directly from the product card ===
function updateQuantityOnCard(productId, change) {
    const item = findCartItem(productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        // If quantity is zero or less, remove from cart
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        updateCartCount();
        renderCartItems();
        updateProductCardDisplay(productId);
    }
}
// === END OF MODIFICATION ===


// Filter products by category
function filterProducts(category) {
    currentFilter = category;
    renderProducts();
    updateActiveCategory(false);
}

// Filter products from floating categories
function filterProductsFloating(category) {
    currentFilter = category;
    renderProducts();
    updateActiveCategory(true);
}

// Update active category styling
function updateActiveCategory(isFloating) {
    var mainCards = document.querySelectorAll('.category-card');
    mainCards.forEach(card => card.classList.remove('active'));

    var floatingPills = document.querySelectorAll('.floating-category-pill');
    floatingPills.forEach(pill => pill.classList.remove('active'));

    const categorySelector = isFloating
        ? `.floating-category-pill[onclick*="('${currentFilter}')"]`
        : `.category-card[onclick*="('${currentFilter}')"]`;
        
    document.querySelector(`.category-card[onclick*="('${currentFilter}')"]`)?.classList.add('active');
    document.querySelector(`.floating-category-pill[onclick*="('${currentFilter}')"]`)?.classList.add('active');
}


// Search products
function searchProducts(searchTerm) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    var filteredProducts = getFilteredProducts();

    if (searchTerm && searchTerm.trim() !== '') {
        filteredProducts = filteredProducts.filter(function(product) {
            return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   product.description.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }

    var html = '';
    for (var i = 0; i < filteredProducts.length; i++) {
        var product = filteredProducts[i];
        html += createProductCard(product);
    }

    grid.innerHTML = html;
}

function animateCartButton() {
    var cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.classList.add('bounce');
        setTimeout(function() {
            cartButton.classList.remove('bounce');
        }, 800);
    }
}

// Find product by ID
function findProductById(productId) {
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
            return products[i];
        }
    }
    return null;
}

function focusSearch() {
    var searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.focus();
    }
}


// Utility function to get total cart items
function getTotalCartItems() {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].quantity;
    }
    return total;
}

// Scroll to section smoothly
function scrollToSection(selector) {
    var element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Get the button
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// When user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

// When user clicks on the button, scroll to the top of the document
scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});