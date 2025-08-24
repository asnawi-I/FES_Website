//cart.js
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

    // Add animation
    var button = event.target.closest('.add-to-cart');
    if (button) {
        button.classList.add('clicked');
        setTimeout(function() {
            button.classList.remove('clicked');
        }, 2000);
    }

    updateCartCount();
    renderCartItems();
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
    var cartCount = document.getElementById('cartCount');
    var cartTotal = document.getElementById('cartTotal');
    var checkoutBtn = document.getElementById('checkoutBtn');
    
    var totalItems = getTotalCartItems();
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.style.display = 'flex';
        cartCount.classList.add('updated');
        
        // Remove animation class after animation
        setTimeout(function() {
            cartCount.classList.remove('updated');
        }, 600);
        
        if (checkoutBtn) checkoutBtn.disabled = false;
    } else {
        cartCount.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = true;
    }
    
    // Update cart total in sidebar
    if (cartTotal) {
        cartTotal.textContent = totalItems;
    }
}

function toggleCart() {
 const sidebar = document.getElementById('cartSidebar');
 const overlay = document.getElementById('cartOverlay');
 const isOpening = !sidebar.classList.contains('open');
 
 if (isOpening) {
   // OPENING the cart
   sidebar.classList.add('opening');
   sidebar.classList.add('open');
   overlay.classList.add('active');
   renderCartItems();
   
   setTimeout(() => {
     sidebar.classList.remove('opening');
   }, 400);
 } else {
   // CLOSING the cart
   sidebar.classList.add('closing');
   sidebar.classList.remove('open');
   overlay.classList.remove('active');
   
   setTimeout(() => {
     sidebar.classList.remove('closing');
   }, 400);
 }

 // Close when clicking overlay
 overlay.onclick = function() {
   if (sidebar.classList.contains('open')) {
     sidebar.classList.add('closing');
     sidebar.classList.remove('open');
     overlay.classList.remove('active');
     
     setTimeout(() => {
       sidebar.classList.remove('closing');
     }, 400);
   }
 };
}




// renderCartItems function to show empty state properly
function renderCartItems() {
    var cartItemsContainer = document.getElementById('cartItems');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart"><div style="text-align: center; padding: 40px 20px; color: #718096;"><div style="font-size: 48px; margin-bottom: 250px;"></div><div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Your cart is empty</div><div style="font-size: 14px;">Add some products to get started</div></div></div>';
        return;
    }

    // MODIFIED: This function is completely updated to generate the new compact HTML structure.
    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += '<div class="cart-item">';
        html += '<div class="cart-item-image">';
        html += '   <img src="' + item.image + '" alt="' + item.name + '" onerror="this.style.display=\'none\'; this.parentElement.innerHTML = \'📦\';">';
        html += '</div>';
        html += '<div class="cart-item-details">';
        html += '   <div class="cart-item-info">';
        html += '       <div class="cart-item-name">' + item.name + '</div>';
        html += '   </div>';
        html += '   <div class="cart-item-actions">';
        html += '       <div class="quantity-controls">';
        html += '           <button class="quantity-btn" onclick="updateCartQuantity(' + item.id + ', -1)">−</button>';
        html += '           <span class="quantity">' + item.quantity + '</span>';
        html += '           <button class="quantity-btn" onclick="updateCartQuantity(' + item.id + ', 1)">+</button>';
        html += '       </div>';
        html += '       <button class="remove-item" onclick="removeFromCart(' + item.id + ')" title="Remove item">&times;</button>';
        html += '   </div>';
        html += '</div>';
        html += '</div>';
    }
    
    cartItemsContainer.innerHTML = html;
}

// clear the cart
function clearCart() {
    cart = [];
    updateCartCount();
    renderCartItems();
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
            description: item.description,
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
    
    // Hide cart sidebar
    toggleCart();
    
    // Show order form
    var orderModal = document.getElementById('orderModal');
    orderModal.style.display = 'flex';
    
    renderOrderSummary();
    
    debugLog('Proceeding to checkout with cart:', cart);
}