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

// Create HTML for a product card
function createProductCard(product) {
    var html = '<div class="product-card">';
    html += '<div class="product-image">';
    html += '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\'">';
    html += '<div class="placeholder" style="display: none;">';
    html += '<div>📦</div>';
    html += '<div>img</div>';
    html += '</div>';
    html += '<div class="price-badge">Price on Inquiry</div>';
    html += '</div>';
    html += '<div class="product-info">';
    html += '<h3 class="product-name">' + product.name + '</h3>';
    html += '<p class="product-description">' + product.description + '</p>';
    html += '<div class="product-actions">';
    html += '<button class="add-to-cart" onclick="addToCart(' + product.id + ')" data-product-id="' + product.id + '">';
    html += '<span class="cart-text add-text">Add to Cart</span>';
    html += '<span class="cart-text added-text">Added!</span>';
    html += '<i class="fas fa-shopping-cart"></i>';
    html += '<i class="fas fa-box"></i>';
    html += '</button>';
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


function animateAddToCart(button, product, quantity, originalText) {
    // Phase 1: Loading state
    button.classList.add('loading', 'ripple');
    button.textContent = '';
    
    // Create floating item effect
    createFloatingItem(button, product.name, quantity);
    
    setTimeout(function() {
        // Phase 2: Success state
        button.classList.remove('loading', 'ripple');
        button.classList.add('success', 'pulse');
        button.textContent = 'Added!';
        
        // Animate cart button
        animateCartButton();
        
    }, 800);
    
    setTimeout(function() {
        // Phase 3: Reset to original state
        button.classList.remove('success', 'pulse');
        button.textContent = originalText;
        
    }, 2000);
}

function createFloatingItem(button, productName, quantity) {
    var rect = button.getBoundingClientRect();
    var floatingItem = document.createElement('div');
    floatingItem.className = 'floating-item';
    floatingItem.textContent = '+' + quantity;
    floatingItem.style.left = rect.left + rect.width / 2 + 'px';
    floatingItem.style.top = rect.top + 'px';
    
    document.body.appendChild(floatingItem);
    
    // Remove after animation
    setTimeout(function() {
        if (floatingItem.parentNode) {
            floatingItem.parentNode.removeChild(floatingItem);
        }
    }, 1000);
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