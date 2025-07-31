// Main JavaScript for First Emporium Supermarket
// Core application logic and initialization with enhanced UI features

// Global variables
var currentFilter = 'all';
var lastScrollTop = 0;
var floatingVisible = false;
var isLoading = false;
var toastQueue = [];

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    createToastContainer();
    createFloatingActionButtons();
});

// Initialize the application
function initializePage() {
    showPageLoading();
    
    // Simulate loading time for demonstration
    setTimeout(function() {
        renderProducts();
        updateCartCount();
        hidePageLoading();
        showToast('Welcome to First Emporium!', 'success');
        console.log('First Emporium initialized successfully');
    }, 1500);
}

// Create toast notification container
function createToastContainer() {
    if (document.getElementById('toastContainer')) return;
    
    var container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
}

// Create floating action buttons
function createFloatingActionButtons() {
    // Scroll to top button
    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.className = 'floating-action-btn scroll-top-btn';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.title = 'Scroll to top';
    scrollTopBtn.onclick = scrollToTop;
    document.body.appendChild(scrollTopBtn);
    
    // Quick cart access button
    var quickCartBtn = document.createElement('button');
    quickCartBtn.id = 'quickCartBtn';
    quickCartBtn.className = 'floating-action-btn quick-cart-btn';
    quickCartBtn.innerHTML = '🛒<span class="quick-cart-count">0</span>';
    quickCartBtn.title = 'Quick cart access';
    quickCartBtn.onclick = function() { 
        openCart();
        showToast('Cart opened', 'info');
    };
    document.body.appendChild(quickCartBtn);
}

// Enhanced toast notification system
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type + ' toast-enter';
    
    var icon = getToastIcon(type);
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-message">' + message + '</span>';
    
    var container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Trigger entrance animation
    setTimeout(function() {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-show');
    }, 100);
    
    // Auto remove toast
    setTimeout(function() {
        removeToast(toast);
    }, duration);
    
    // Click to dismiss
    toast.onclick = function() {
        removeToast(toast);
    };
}

function getToastIcon(type) {
    var icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️',
        'cart': '🛒',
        'search': '🔍'
    };
    return icons[type] || icons.info;
}

function removeToast(toast) {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-exit');
    
    setTimeout(function() {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Enhanced loading states
function showPageLoading() {
    if (document.getElementById('pageLoader')) return;
    
    var loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">Loading First Emporium...</div>
        </div>
    `;
    document.body.appendChild(loader);
    isLoading = true;
}

function hidePageLoading() {
    var loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(function() {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 500);
    }
    isLoading = false;
}

function showSearchLoading() {
    var searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.classList.add('searching');
    }
}

function hideSearchLoading() {
    var searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.classList.remove('searching');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Scroll event for floating categories and scroll-to-top button
    window.addEventListener('scroll', handleScroll);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        var cartModal = document.getElementById('cartModal');
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
            showToast('Cart closed', 'info');
        }
    });

    // Form submission
    var orderForm = document.getElementById('orderFormElement');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
    
    // Search input with debouncing
    var searchInput = document.querySelector('.search-bar');
    if (searchInput) {
        var searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            showSearchLoading();
            
            searchTimeout = setTimeout(function() {
                var searchTerm = e.target.value;
                searchProducts(searchTerm);
                hideSearchLoading();
                
                if (searchTerm.trim()) {
                    var resultsCount = document.querySelectorAll('.product-card').length;
                    showToast('Found ' + resultsCount + ' products', 'search', 2000);
                }
            }, 500);
        });
    }
}

// Enhanced scroll handling
function handleScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var categoriesSection = document.querySelector('.categories');
    var categoriesBottom = categoriesSection ? categoriesSection.offsetTop + categoriesSection.offsetHeight : 0;
    var floatingCategories = document.getElementById('floatingCategories');
    var scrollTopBtn = document.getElementById('scrollTopBtn');

    // Show floating categories when scrolled past main categories
    if (scrollTop > categoriesBottom && !floatingVisible) {
        if (floatingCategories) {
            floatingCategories.classList.add('show');
        }
        floatingVisible = true;
    } else if (scrollTop <= categoriesBottom && floatingVisible) {
        if (floatingCategories) {
            floatingCategories.classList.remove('show');
        }
        floatingVisible = false;
    }
    
    // Show/hide scroll to top button
    if (scrollTopBtn) {
        if (scrollTop > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    lastScrollTop = scrollTop;
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    showToast('Scrolled to top', 'info', 1500);
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
    
    // Add staggered animation to new products
    var productCards = grid.querySelectorAll('.product-card');
    productCards.forEach(function(card, index) {
        card.style.animationDelay = (index * 0.1) + 's';
    });
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

// Create HTML for a product card with enhanced interactions
function createProductCard(product) {
    var html = '<div class="product-card" data-product-id="' + product.id + '">';
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
    html += '<button class="add-to-cart" onclick="addToCartWithFeedback(' + product.id + ')">Add to Cart</button>';
    html += '<div class="quantity-selector">';
    html += '<button class="quantity-btn" onclick="changeQuantityWithFeedback(' + product.id + ', -1)">−</button>';
    html += '<div class="quantity-display" id="qty-' + product.id + '">1</div>';
    html += '<button class="quantity-btn" onclick="changeQuantityWithFeedback(' + product.id + ', 1)">+</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
}

// Enhanced add to cart with visual feedback
function addToCartWithFeedback(productId) {
    var product = findProductById(productId);
    if (!product) return;
    
    var qtyDisplay = document.getElementById('qty-' + productId);
    var quantity = qtyDisplay ? parseInt(qtyDisplay.textContent) : 1;
    
    // Add visual feedback to the product card
    var productCard = document.querySelector('[data-product-id="' + productId + '"]');
    if (productCard) {
        productCard.classList.add('adding-to-cart');
        setTimeout(function() {
            productCard.classList.remove('adding-to-cart');
        }, 600);
    }
    
    // Call original addToCart function (assuming it exists)
    if (typeof addToCart === 'function') {
        addToCart(productId);
    }
    
    // Update quick cart count
    updateQuickCartCount();
    
    // Show success toast
    showToast('Added ' + product.name + ' to cart!', 'cart', 2000);
}

// Enhanced quantity change with feedback
function changeQuantityWithFeedback(productId, change) {
    var qtyDisplay = document.getElementById('qty-' + productId);
    if (!qtyDisplay) return;

    var currentQty = parseInt(qtyDisplay.textContent);
    var newQty = Math.max(1, currentQty + change);
    
    // Add bounce animation
    qtyDisplay.classList.add('quantity-updated');
    setTimeout(function() {
        qtyDisplay.classList.remove('quantity-updated');
    }, 300);
    
    qtyDisplay.textContent = newQty;
    
    // Show subtle feedback
    if (change > 0) {
        showToast('Quantity increased', 'info', 1000);
    } else if (newQty > 1) {
        showToast('Quantity decreased', 'info', 1000);
    }
}

// Update quick cart count
function updateQuickCartCount() {
    var quickCartBtn = document.getElementById('quickCartBtn');
    var countSpan = quickCartBtn ? quickCartBtn.querySelector('.quick-cart-count') : null;
    
    if (countSpan) {
        var totalItems = getTotalCartItems();
        countSpan.textContent = totalItems;
        
        if (totalItems > 0) {
            quickCartBtn.classList.add('has-items');
            countSpan.classList.add('bounce-in');
            setTimeout(function() {
                countSpan.classList.remove('bounce-in');
            }, 300);
        } else {
            quickCartBtn.classList.remove('has-items');
        }
    }
}

// Filter products by category with feedback
function filterProducts(category) {
    currentFilter = category;
    
    // Show loading state
    var grid = document.getElementById('productsGrid');
    if (grid) {
        grid.classList.add('loading');
    }
    
    setTimeout(function() {
        renderProducts();
        updateActiveCategory(false);
        
        if (grid) {
            grid.classList.remove('loading');
        }
        
        var categoryName = category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
        var productCount = getFilteredProducts().length;
        showToast('Showing ' + productCount + ' ' + categoryName, 'info', 2000);
    }, 300);
}

// Filter products from floating categories
function filterProductsFloating(category) {
    currentFilter = category;
    renderProducts();
    updateActiveCategory(true);
    
    var categoryName = category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
    showToast('Filtered by ' + categoryName, 'info', 2000);
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

// Enhanced search with feedback
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
    
    // Add search result highlighting
    if (searchTerm && searchTerm.trim() !== '') {
        highlightSearchResults(searchTerm);
    }
}

// Highlight search terms in results
function highlightSearchResults(searchTerm) {
    var productCards = document.querySelectorAll('.product-card');
    productCards.forEach(function(card) {
        var nameEl = card.querySelector('.product-name');
        var descEl = card.querySelector('.product-description');
        
        if (nameEl) {
            nameEl.innerHTML = highlightText(nameEl.textContent, searchTerm);
        }
        if (descEl) {
            descEl.innerHTML = highlightText(descEl.textContent, searchTerm);
        }
    });
}

function highlightText(text, searchTerm) {
    var regex = new RegExp('(' + searchTerm + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
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

// Enhanced order form submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    // Show loading state
    var submitBtn = e.target.querySelector('.submit-order');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        submitBtn.classList.add('loading');
    }
    
    var formData = new FormData(e.target);
    var orderData = {};
    
    // Convert FormData to regular object
    for (var pair of formData.entries()) {
        orderData[pair[0]] = pair[1];
    }

    // Simulate processing time
    setTimeout(function() {
        // Generate WhatsApp message
        var whatsappMessage = generateWhatsAppMessage(orderData);
        
        // Show success message
        showToast('Order inquiry submitted successfully! 🎉', 'success', 4000);
        
        // Reset form and cart
        e.target.reset();
        if (typeof clearCart === 'function') {
            clearCart();
        }
        
        // Reset submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Order';
            submitBtn.classList.remove('loading');
        }
        
        // Hide order form and scroll to top
        document.getElementById('orderForm').style.display = 'none';
        scrollToTop();
        
    }, 2000);
}

// Enhanced cart functions
function openCart() {
    var cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'block';
        // Trigger animation
        setTimeout(function() {
            cartModal.classList.add('show');
        }, 10);
    }
}

function updateCartCount() {
    var cartCount = document.querySelector('.cart-count');
    var totalItems = getTotalCartItems();
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.classList.add('updated');
        setTimeout(function() {
            cartCount.classList.remove('updated');
        }, 600);
    }
    
    updateQuickCartCount();
}

// Utility function to format date
function formatDate(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Utility function to get total cart items
function getTotalCartItems() {
    if (typeof cart !== 'undefined' && cart.length) {
        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].quantity;
        }
        return total;
    }
    return 0;
}

// Scroll to section smoothly
function scrollToSection(selector) {
    var element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        showToast('Navigated to section', 'info', 1500);
    }
}

// Enhanced loading states
function showLoading() {
    if (isLoading) return;
    
    var loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loader);
    isLoading = true;
}

function hideLoading() {
    var loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
    isLoading = false;
}

// Enhanced error handling
function handleError(error, context) {
    console.error('Error in ' + (context || 'application') + ':', error);
    showToast('Something went wrong. Please try again.', 'error', 4000);
}

// Debug function for development
function debugLog(message, data) {
    if (typeof console !== 'undefined') {
        console.log('[First Emporium Debug]', message, data || '');
    }
}

// Initialize performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        setTimeout(function() {
            var perfData = performance.timing;
            var loadTime = perfData.loadEventEnd - perfData.navigationStart;
            debugLog('Page load time:', loadTime + 'ms');
        }, 0);
    });
}