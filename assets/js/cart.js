//cart.js
// Cart Management for First Emporium Supermarket
// Handles all cart-related functionality

// Global cart variable
var cart = [];

// Add item to cart - LOGIC MOVED TO MAIN.JS for better state management

// Find cart item by product ID
function findCartItem(productId) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            return cart[i];
        }
    }
    return null;
}

// === MODIFIED: `updateCartQuantity` now syncs back to the product card on the main page ===
function updateCartQuantity(productId, change) {
    var item = findCartItem(productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        updateCartCount();
        renderCartItems();
        // Sync change with the main product card display
        if (typeof updateProductCardDisplay === 'function') {
            updateProductCardDisplay(productId);
        }
    }
}
// === END OF MODIFICATION ===

// === MODIFIED: `removeFromCart` now syncs back to the product card on the main page ===
function removeFromCart(productId) {
    cart = cart.filter(function(item) {
        return item.id !== productId;
    });
    
    updateCartCount();
    renderCartItems();
    // Sync change with the main product card display
    if (typeof updateProductCardDisplay === 'function') {
        updateProductCardDisplay(productId);
    }
}
// === END OF MODIFICATION ===

// === MODIFIED: `clearCart` now re-renders the product grid to reset all cards ===
function clearCart() {
    cart = [];
    updateCartCount();
    renderCartItems();
    // Re-render all products to show "Add to Cart" buttons again
    if (typeof renderProducts === 'function') {
        renderProducts();
    }
}
// === END OF MODIFICATION ===

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
        
        setTimeout(function() {
            cartCount.classList.remove('updated');
        }, 600);
        
        if (checkoutBtn) checkoutBtn.disabled = false;
    } else {
        cartCount.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = true;
    }
    
    if (cartTotal) {
        cartTotal.textContent = totalItems;
    }
}

function toggleCart() {
 const sidebar = document.getElementById('cartSidebar');
 const overlay = document.getElementById('cartOverlay');
 const isOpening = !sidebar.classList.contains('open');
 
 if (isOpening) {
   sidebar.classList.add('open');
   overlay.classList.add('active');
   renderCartItems();
 } else {
   sidebar.classList.remove('open');
   overlay.classList.remove('active');
 }

 overlay.onclick = function() {
   if (sidebar.classList.contains('open')) {
     sidebar.classList.remove('open');
     overlay.classList.remove('active');
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

// Get cart summary for order
function getCartSummary() {
    return {
        items: cart.slice(), // Create a copy
        totalItems: getTotalCartItems(),
        itemCount: cart.length
    };
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
    
    toggleCart();
    
    var orderModal = document.getElementById('orderModal');
    orderModal.style.display = 'flex';
    
    renderOrderSummary();
}