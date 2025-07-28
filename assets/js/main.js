// Main JavaScript for First Emporium Supermarket
// Core application logic and initialization

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
        var cartModal = document.getElementById('cartModal');
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

// Create HTML for a product card
function createProductCard(product) {
    var html = '<div class="product-card">';
    html += '<div class="product-image">';
    html += '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\'">';
    html += '<div class="placeholder" style="display: none; flex-direction: column;">';
    html += '<div>📦</div>';
    html += '<div class="placeholder-text">img</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="product-info">';
    html += '<div class="product-name">' + product.name + '</div>';
    html += '<div class="product-description">' + product.description + '</div>';
    html += '<div class="product-actions">';
    html += '<button class="add-to-cart" onclick="addToCart(' + product.id + ')">Add to Cart</button>';
    html += '<div class="quantity-selector">';
    html += '<button class="quantity-btn" onclick="changeQuantity(' + product.id + ', -1)">−</button>';
    html += '<div class="quantity-display" id="qty-' + product.id + '">1</div>';
    html += '<button class="quantity-btn" onclick="changeQuantity(' + product.id + ', 1)">+</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
}

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
    // Update main categories
    var mainCards = document.querySelectorAll('.category-card');
    for (var i = 0; i < mainCards.length; i++) {
        mainCards[i].classList.remove('active');
    }

    // Update floating categories
    var floatingPills = document.querySelectorAll('.floating-category-pill');
    for (var i = 0; i < floatingPills.length; i++) {
        floatingPills[i].classList.remove('active');
    }

    // Find and activate the correct category
    var categoryIndex = ['all', 'fresh', 'dairy', 'meat', 'pantry', 'frozen', 'snacks', 'household'].indexOf(currentFilter);
    
    if (categoryIndex !== -1) {
        if (mainCards[categoryIndex]) {
            mainCards[categoryIndex].classList.add('active');
        }
        if (floatingPills[categoryIndex]) {
            floatingPills[categoryIndex].classList.add('active');
        }
    }
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

// Change quantity for a product
function changeQuantity(productId, change) {
    var qtyDisplay = document.getElementById('qty-' + productId);
    if (!qtyDisplay) return;

    var currentQty = parseInt(qtyDisplay.textContent);
    var newQty = Math.max(1, currentQty + change);
    qtyDisplay.textContent = newQty;
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

// Handle order form submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    var formData = new FormData(e.target);
    var orderData = {};
    
    // Convert FormData to regular object
    for (var pair of formData.entries()) {
        orderData[pair[0]] = pair[1];
    }

    // Generate WhatsApp message
    var whatsappMessage = generateWhatsAppMessage(orderData);
    
    // Show success message
    alert('Order inquiry submitted! You will receive a WhatsApp message shortly with your order details.');
    
    // Reset form and cart
    e.target.reset();
    clearCart();
    
    // Hide order form and scroll to top
    document.getElementById('orderForm').style.display = 'none';
    document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });
}

// Utility function to format date
function formatDate(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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

// Show loading state
function showLoading() {
    // Implementation for loading states
    console.log('Loading...');
}

// Hide loading state
function hideLoading() {
    // Implementation for hiding loading states
    console.log('Loading complete');
}

// Error handling
function handleError(error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
}

// Debug function for development
function debugLog(message, data) {
    if (typeof console !== 'undefined') {
        console.log('[First Emporium Debug]', message, data || '');
    }
}