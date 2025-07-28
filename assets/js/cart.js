// Cart Management for First Emporium Supermarket
// Handles all cart-related functionality

// Global cart variable
var cart = [];

// Add item to cart
function addToCart(productId) {
    var product = findProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    var qtyElement = document.getElementById('qty-' + productId);
    var quantity = qtyElement ? parseInt(qtyElement.textContent) : 1;

    // Check if item already exists in cart
    var existingItem = findCartItem(productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            description: product.description,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    // Reset quantity selector back to 1
    if (qtyElement) {
        qtyElement.textContent = '1';
    }

    updateCartCount();
    showAddToCartFeedback(product.name);
    
    debugLog('Added to cart:', { productId: productId, quantity: quantity });
}

// Find cart item by product ID
function findCartItem(productId) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            return cart[i];
        }
    }
    return null;
}

// Update cart item quantity
function updateCartQuantity(productId, change) {
    var item = findCartItem(productId);
    if (!item) return;

    item.quantity = Math.max(1, item.quantity + change);
    updateCartCount();
    renderCartItems();
    
    debugLog('Updated cart quantity:', { productId: productId, newQuantity: item.quantity });
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(function(item) {
        return item.id !== productId;
    });
    
    updateCartCount();
    renderCartItems();
    
    debugLog('Removed from cart:', productId);
}

// Clear entire cart
function clearCart() {
    cart = [];
    updateCartCount();
    renderCartItems();
    
    debugLog('Cart cleared');
}

// Update cart count display
function updateCartCount() {
    var cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    var totalItems = getTotalCartItems();
    cartCountElement.textContent = totalItems;

    // Update checkout button state
    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Toggle cart modal visibility
function toggleCart() {
    var modal = document.getElementById('cartModal');
    if (!modal) return;

    var isVisible = modal.style.display === 'block';
    modal.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        renderCartItems();
    }
}

// Render cart items in the modal
function renderCartItems() {
    var cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += createCartItemHTML(item);
    }
    
    cartItemsContainer.innerHTML = html;
}

// Create HTML for cart item
function createCartItemHTML(item) {
    var html = '<div class="cart-item">';
    html += '<div class="cart-item-info">';
    html += '<div class="cart-item-name">' + item.name + '</div>';
    html += '<div style="font-size: 12px; color: #666;">Quantity: ' + item.quantity + '</div>';
    html += '</div>';
    html += '<div class="cart-item-actions">';
    html += '<button class="quantity-btn" onclick="updateCartQuantity(' + item.id + ', -1)">−</button>';
    html += '<span style="margin: 0 8px; font-size: 12px;">' + item.quantity + '</span>';
    html += '<button class="quantity-btn" onclick="updateCartQuantity(' + item.id + ', 1)">+</button>';
    html += '<button class="remove-item" onclick="removeFromCart(' + item.id + ')">Remove</button>';
    html += '</div>';
    html += '</div>';
    return html;
}

// Show feedback when item is added to cart
function showAddToCartFeedback(productName) {
    // Create a simple toast notification
    var toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #86BE4E;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1001;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        transform: translateX(100%);
    `;
    toast.textContent = productName + ' added to cart!';
    document.body.appendChild(toast);

    // Animate in
    setTimeout(function() {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(function() {
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// Get cart summary for order
function getCartSummary() {
    return {
        items: cart.slice(), // Create a copy
        totalItems: getTotalCartItems(),
        itemCount: cart.length
    };
}

// Save cart to localStorage (for future enhancement)
function saveCartToStorage() {
    try {
        localStorage.setItem('firstEmporiumCart', JSON.stringify(cart));
        debugLog('Cart saved to storage');
    } catch (error) {
        console.warn('Could not save cart to storage:', error);
    }
}

// Load cart from localStorage (for future enhancement)
function loadCartFromStorage() {
    try {
        var savedCart = localStorage.getItem('firstEmporiumCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
            debugLog('Cart loaded from storage');
        }
    } catch (error) {
        console.warn('Could not load cart from storage:', error);
        cart = [];
    }
}

// Export cart data for order processing
function exportCartForOrder() {
    return cart.map(function(item) {
        return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            category: item.category
        };
    });
}

// Validate cart before checkout
function validateCart() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add some items before proceeding.');
        return false;
    }
    
    // Check for any invalid items
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].quantity <= 0) {
            alert('Invalid quantity detected. Please check your cart.');
            return false;
        }
    }
    
    return true;
}

// Proceed to checkout
function showOrderForm() {
    if (!validateCart()) {
        return;
    }
    
    // Hide cart modal
    document.getElementById('cartModal').style.display = 'none';
    
    // Show order form
    var orderForm = document.getElementById('orderForm');
    orderForm.style.display = 'block';
    
    // Render order summary
    renderOrderSummary();
    
    // Scroll to order form
    orderForm.scrollIntoView({ behavior: 'smooth' });
    
    debugLog('Proceeding to checkout with cart:', cart);
}