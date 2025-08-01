// Main JavaScript for First Emporium Supermarket
// Core application logic and initialization with enhanced UI features

// Global variables
var currentFilter = 'all';
var lastScrollTop = 0;
var floatingVisible = false;
var isLoading = false;
var toastQueue = [];
var cart = []; // Initialize cart array

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

// Create floating action buttons - FIXED: Now properly visible with correct styling
function createFloatingActionButtons() {
    // Remove existing buttons to prevent duplicates
    var existingScrollBtn = document.getElementById('scrollTopBtn');
    var existingCartBtn = document.getElementById('quickCartBtn');
    if (existingScrollBtn) existingScrollBtn.remove();
    if (existingCartBtn) existingCartBtn.remove();
    
    // Scroll to top button with improved styling
    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.className = 'floating-action-btn scroll-top-btn';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.title = 'Scroll to top';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #86BE4E, #6a9938);
        color: white;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: scale(0);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
    `;
    scrollTopBtn.onclick = scrollToTop;
    document.body.appendChild(scrollTopBtn);
    
    // Quick cart access button with improved styling
    var quickCartBtn = document.createElement('button');
    quickCartBtn.id = 'quickCartBtn';
    quickCartBtn.className = 'floating-action-btn quick-cart-btn';
    quickCartBtn.title = 'Quick cart access';
    quickCartBtn.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        opacity: 1;
        transform: scale(1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: all;
    `;
    
    // Cart icon and count
    quickCartBtn.innerHTML = `
        🛒
        <span class="quick-cart-count" style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #EA3B52;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        ">0</span>
    `;
    
    quickCartBtn.onclick = function() { 
        openCart();
        showToast('Cart opened', 'info');
    };
    document.body.appendChild(quickCartBtn);
}

// Enhanced toast notification system - FIXED: Now replaces alert() calls
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type + ' toast-enter';
    
    var icon = getToastIcon(type);
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-message">' + message + '</span>';
    
    var container = document.getElementById('toastContainer');
    if (!container) {
        createToastContainer();
        container = document.getElementById('toastContainer');
    }
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

// Enhanced loading states with skeleton CSS integration
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

// FIXED: Add skeleton loading for products grid
function showProductsLoading() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    var skeletonHTML = '';
    for (var i = 0; i < 8; i++) {
        skeletonHTML += `
            <div class="product-card skeleton-card">
                <div class="skeleton" style="height: 200px; margin-bottom: 15px; border-radius: 8px;"></div>
                <div class="skeleton" style="height: 20px; margin-bottom: 10px; width: 80%; border-radius: 4px;"></div>
                <div class="skeleton" style="height: 16px; margin-bottom: 15px; width: 100%; border-radius: 4px;"></div>
                <div class="skeleton" style="height: 40px; border-radius: 6px;"></div>
            </div>
        `;
    }
    
    grid.innerHTML = skeletonHTML;
    grid.classList.add('loading');
}

function hideProductsLoading() {
    var grid = document.getElementById('productsGrid');
    if (grid) {
        grid.classList.remove('loading');
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
    
    // Search input with debouncing and result notifications
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
                
                // FIXED: Show search result notifications with count
                if (searchTerm.trim()) {
                    var resultsCount = document.querySelectorAll('.product-card:not(.skeleton-card)').length;
                    showToast(`Found ${resultsCount} product${resultsCount !== 1 ? 's' : ''} matching "${searchTerm}"`, 'search', 2000);
                } else {
                    var totalProducts = getFilteredProducts().length;
                    showToast(`Showing all ${totalProducts} products`, 'info', 1500);
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
    
    // FIXED: Show/hide scroll to top button with proper visibility
    if (scrollTopBtn) {
        if (scrollTop > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.transform = 'scale(1)';
            scrollTopBtn.style.pointerEvents = 'all';
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.transform = 'scale(0)';
            scrollTopBtn.style.pointerEvents = 'none';
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
    // FIXED: Provide fallback if products array doesn't exist
    if (typeof products === 'undefined') {
        console.warn('Products array not found. Using sample data.');
        return getSampleProducts();
    }
    
    if (currentFilter === 'all') {
        return products;
    }
    return products.filter(function(product) {
        return product.category === currentFilter;
    });
}

// FIXED: Provide sample products as fallback
function getSampleProducts() {
    return [
        {id: 1, name: 'Fresh Apples', description: 'Crisp red apples', category: 'fresh', image: 'https://via.placeholder.com/200x150?text=Apples'},
        {id: 2, name: 'Whole Milk', description: 'Fresh dairy milk', category: 'dairy', image: 'https://via.placeholder.com/200x150?text=Milk'},
        {id: 3, name: 'Chicken Breast', description: 'Premium chicken', category: 'meat', image: 'https://via.placeholder.com/200x150?text=Chicken'},
        {id: 4, name: 'Bread Loaf', description: 'Fresh baked bread', category: 'pantry', image: 'https://via.placeholder.com/200x150?text=Bread'}
    ];
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

// FIXED: Complete cart functionality with proper add/remove feedback
function addToCartWithFeedback(productId) {
    var product = findProductById(productId);
    if (!product) {
        showToast('Product not found!', 'error');
        return;
    }
    
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
    
    // Add to cart with proper quantity
    addToCart(productId, quantity);
    
    // Update quick cart count
    updateQuickCartCount();
    
    // Show success toast with proper feedback
    showToast(`Added ${quantity}x ${product.name} to cart!`, 'cart', 2000);
}

// FIXED: Proper addToCart implementation
function addToCart(productId, quantity) {
    quantity = quantity || 1;
    var product = findProductById(productId);
    if (!product) return;
    
    // Check if item already exists in cart
    var existingItem = cart.find(function(item) {
        return item.id === productId;
    });
    
    if (existingItem) {
        existingItem.quantity += quantity;
        showToast(`Updated ${product.name} quantity in cart`, 'cart', 1500);
    } else {
        cart.push({
            id: productId,
            name: product.name,
            description: product.description,
            quantity: quantity,
            price: product.price || 0
        });
    }
    
    updateCartCount();
    updateCartDisplay();
}

// FIXED: Proper removeFromCart implementation with visual feedback
function removeFromCart(productId) {
    var product = findProductById(productId);
    var itemIndex = cart.findIndex(function(item) {
        return item.id === productId;
    });
    
    if (itemIndex !== -1) {
        var removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        
        // Add removal animation to cart item
        var cartItem = document.querySelector(`[data-cart-item-id="${productId}"]`);
        if (cartItem) {
            cartItem.classList.add('item-removed');
            setTimeout(function() {
                updateCartDisplay();
            }, 300);
        } else {
            updateCartDisplay();
        }
        
        updateCartCount();
        updateQuickCartCount();
        
        showToast(`Removed ${product ? product.name : 'item'} from cart`, 'warning', 2000);
    }
}

// Clear entire cart
function clearCart() {
    cart = [];
    updateCartCount();
    updateQuickCartCount();
    updateCartDisplay();
    showToast('Cart cleared', 'info', 1500);
}

// Update cart display in modal
function updateCartDisplay() {
    var cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Your cart is empty</p>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += `
            <div class="cart-item" data-cart-item-id="${item.id}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
                        <span>Qty: ${item.quantity}</span>
                        <button onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }
    
    cartItems.innerHTML = html;
}

// Update cart item quantity
function updateCartItemQuantity(productId, change) {
    var item = cart.find(function(cartItem) {
        return cartItem.id === productId;
    });
    
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        
        // Add visual feedback
        var cartItem = document.querySelector(`[data-cart-item-id="${productId}"]`);
        if (cartItem) {
            cartItem.classList.add('item-added');
            setTimeout(function() {
                cartItem.classList.remove('item-added');
            }, 300);
        }
        
        updateCartDisplay();
        updateCartCount();
        updateQuickCartCount();
        
        var product = findProductById(productId);
        if (change > 0) {
            showToast(`Increased ${product.name} quantity`, 'cart', 1000);
        } else {
            showToast(`Decreased ${product.name} quantity`, 'cart', 1000);
        }
    }
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
    if (!quickCartBtn) return;
    
    var countSpan = quickCartBtn.querySelector('.quick-cart-count');
    
    if (countSpan) {
        var totalItems = getTotalCartItems();
        countSpan.textContent = totalItems;
        
        if (totalItems > 0) {
            countSpan.style.opacity = '1';
            countSpan.style.transform = 'scale(1)';
            quickCartBtn.classList.add('has-items');
            countSpan.classList.add('bounce-in');
            setTimeout(function() {
                countSpan.classList.remove('bounce-in');
            }, 300);
        } else {
            countSpan.style.opacity = '0';
            countSpan.style.transform = 'scale(0)';
            quickCartBtn.classList.remove('has-items');
        }
    }
}

// Filter products by category with feedback
function filterProducts(category) {
    currentFilter = category;
    
    // Show loading state with skeleton
    showProductsLoading();
    
    setTimeout(function() {
        renderProducts();
        updateActiveCategory(false);
        hideProductsLoading();
        
        var categoryName = category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
        var productCount = getFilteredProducts().length;
        showToast(`Showing ${productCount} ${categoryName}`, 'info', 2000);
    }, 300);
}

// Filter products from floating categories
function filterProductsFloating(category) {
    currentFilter = category;
    renderProducts();
    updateActiveCategory(true);
    
    var categoryName = category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
    showToast(`Filtered by ${categoryName}`, 'info', 2000);
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
    var productList = typeof products !== 'undefined' ? products : getSampleProducts();
    for (var i = 0; i < productList.length; i++) {
        if (productList[i].id === productId) {
            return productList[i];
        }
    }
    return null;
}

// FIXED: Check if cart has items before proceeding to order
function proceedToOrder() {
    if (cart.length === 0) {
        showToast('Your cart is empty! Add some items before placing an order.', 'warning', 3000);
        return;
    }
    
    // Close cart modal
    var cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
    
    // Show order form
    var orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.style.display = 'block';
        orderForm.scrollIntoView({ behavior: 'smooth' });
        showToast('Please fill in your details to complete the order', 'info', 3000);
    }
}

// Enhanced order form submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    // FIXED: Validate cart has items
    if (cart.length === 0) {
        showToast('Cannot submit order: Your cart is empty!', 'error', 3000);
        return;
    }
    
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
        clearCart();
        
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

// Generate WhatsApp message (placeholder - implement as needed)
function generateWhatsAppMessage(orderData) {
    var message = "New Order Inquiry:\n\n";
    message += "Customer: " + orderData.name + "\n";
    message += "Phone: " + orderData.phone + "\n";
    message += "Address: " + orderData.address + "\n\n";
    message += "Items:\n";
    
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        message += "- " + item.name + " (Qty: " + item.quantity + ")\n";
    }
    
    return message;
}

// Enhanced cart functions
function openCart() {
    var cartModal = document.getElementById('cartModal');
    if (cartModal) {
        updateCartDisplay(); // Update cart display before showing
        cartModal.style.display = 'block';
        // Trigger animation
        setTimeout(function() {
            cartModal.classList.add('show');
        }, 10);
    }
}

function closeCart() {
    var cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.remove('show');
        setTimeout(function() {
            cartModal.style.display = 'none';
        }, 300);
        showToast('Cart closed', 'info', 1000);
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
    if (cart && cart.length) {
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

// Additional utility functions for enhanced user experience

// Validate form fields
function validateForm(formElement) {
    var isValid = true;
    var formGroups = formElement.querySelectorAll('.form-group');
    
    formGroups.forEach(function(group) {
        var input = group.querySelector('input, select, textarea');
        var errorMsg = group.querySelector('.error-message');
        
        if (input && input.hasAttribute('required') && !input.value.trim()) {
            group.classList.add('error');
            group.classList.remove('success');
            if (errorMsg) {
                errorMsg.textContent = 'This field is required';
                errorMsg.style.display = 'block';
            }
            isValid = false;
        } else if (input && input.value.trim()) {
            group.classList.remove('error');
            group.classList.add('success');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
        }
    });
    
    return isValid;
}

// Format currency (if needed for pricing)
function formatCurrency(amount) {
    return ' + amount.toFixed(2);
}

// Check if element is in viewport
function isInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate elements when they come into view
function animateOnScroll() {
    var elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(function(element) {
        if (isInViewport(element)) {
            element.classList.add('revealed');
        }
    });
}

// Add scroll animation listener
window.addEventListener('scroll', animateOnScroll);

// Initialize scroll animations on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animateOnScroll, 100);
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    var mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
        showToast('Menu toggled', 'info', 1000);
    }
}

// Local storage helpers (for preferences, not cart data)
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem('firstEmporium_' + key, JSON.stringify(value));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function getFromLocalStorage(key) {
    try {
        var item = localStorage.getItem('firstEmporium_' + key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn('Could not read from localStorage:', e);
        return null;
    }
}

// Save user preferences
function saveUserPreferences() {
    var preferences = {
        lastFilter: currentFilter,
        timestamp: new Date().getTime()
    };
    saveToLocalStorage('preferences', preferences);
}

// Load user preferences
function loadUserPreferences() {
    var preferences = getFromLocalStorage('preferences');
    if (preferences) {
        currentFilter = preferences.lastFilter || 'all';
    }
}

// Enhanced initialization with preferences
function initializePageWithPreferences() {
    loadUserPreferences();
    initializePage();
    
    // Save preferences when filter changes
    var originalFilterProducts = filterProducts;
    filterProducts = function(category) {
        originalFilterProducts(category);
        saveUserPreferences();
    };
}

// Replace the original initialization
document.addEventListener('DOMContentLoaded', function() {
    initializePageWithPreferences();
    setupEventListeners();
    createToastContainer();
    createFloatingActionButtons();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        var cartModal = document.getElementById('cartModal');
        if (cartModal && cartModal.style.display === 'block') {
            closeCart();
        }
    }
    
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        var searchInput = document.querySelector('.search-bar');
        if (searchInput) {
            searchInput.focus();
            showToast('Search focused', 'info', 1000);
        }
    }
});

// Print order summary (if needed)
function printOrderSummary() {
    if (cart.length === 0) {
        showToast('No items in cart to print', 'warning', 2000);
        return;
    }
    
    var printWindow = window.open('', '_blank');
    var html = '<html><head><title>Order Summary - First Emporium</title></head><body>';
    html += '<h1>First Emporium - Order Summary</h1>';
    html += '<p>Date: ' + formatDate(new Date()) + '</p>';
    html += '<table border="1" style="width:100%; border-collapse: collapse;">';
    html += '<tr><th>Item</th><th>Description</th><th>Quantity</th></tr>';
    
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += '<tr>';
        html += '<td>' + item.name + '</td>';
        html += '<td>' + item.description + '</td>';
        html += '<td>' + item.quantity + '</td>';
        html += '</tr>';
    }
    
    html += '</table>';
    html += '</body></html>';
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    
    showToast('Order summary opened for printing', 'info', 2000);
}

// Export functionality
window.FirstEmporium = {
    // Public API
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    openCart: openCart,
    closeCart: closeCart,
    filterProducts: filterProducts,
    searchProducts: searchProducts,
    showToast: showToast,
    proceedToOrder: proceedToOrder,
    
    // Getters
    getCart: function() { return cart; },
    getCurrentFilter: function() { return currentFilter; },
    getTotalItems: getTotalCartItems,
    
    // Utilities
    scrollToTop: scrollToTop,
    printOrderSummary: printOrderSummary
};