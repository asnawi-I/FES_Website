// Order Processing (orders.js)
// Handles order form, WhatsApp integration, and order management

// Render order summary in the order form
function renderOrderSummary() {
    var summaryContainer = document.getElementById('orderSummary');
    if (!summaryContainer || cart.length === 0) {
        if (summaryContainer) {
            summaryContainer.innerHTML = '<div>No items in cart</div>';
        }
        return;
    }

    var html = '';

    // List all cart items
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += '<div class="summary-item">';
        html += '<span>' + item.name + '</span>';
        html += '<span>Qty: ' + item.quantity + '</span>';
        html += '</div>';
    }

    // Add total items count
    var totalItems = getTotalCartItems();
    html += '<div class="summary-item summary-total">';
    html += '<span>Total Items:</span>';
    html += '<span>' + totalItems + '</span>';
    html += '</div>';

    summaryContainer.innerHTML = html;
}

// Back to shopping function
function backToShopping() {
    document.getElementById('orderForm').style.display = 'none';
    document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
}


// format date for whatsapp message generation
function formatDate(date){
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}


// Generate WhatsApp message from order data
function generateWhatsAppMessage(orderData) {
    var message = ' *NEW ORDER INQUIRY* \n\n';

    // Customer details
    message += '*Customer Details:*\n';
    message += 'Name: ' + orderData.customerName + '\n';
    message += 'Phone: ' + orderData.customerPhone + '\n';
    message += 'Pickup Location: ' + orderData.customerAddress + '\n';
    message += 'Collection Method: ' + orderData.deliveryMethod + '\n';
    message += 'Preferred Pickup Time: ' + orderData.preferredTime + '\n';
    message += 'Order Priority: ' + orderData.urgencyLevel + '\n';

    // Order items
    message += '\n*Order Items:*\n';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        message += '• ' + item.name + ' - Qty: ' + item.quantity + '\n';
    }

    // Total items
    var totalItems = getTotalCartItems();
    message += '\n*Total Items:* ' + totalItems + '\n';

    // Special requests
    if (orderData.specialRequests && orderData.specialRequests.trim() !== '') {
        message += '\n*Special Requests:*\n' + orderData.specialRequests + '\n';
    }

    // Order timestamp
    message += '\n*Order Time:* ' + formatDate(new Date()) + '\n';

    // Priority flags
    if (orderData.urgencyLevel === 'urgent') {
        message += '\n *URGENT ORDER* - Customer requests 1 hour preparation time';
    } else if (orderData.urgencyLevel === 'express') {
        message += '\n *EXPRESS ORDER* - Customer requests 30 minutes preparation time';
    }

    message += '\n\n Please check availability and pricing for store pickup.';
    message += '\n\n---\n*First Emporium Supermarket*\nFresh • Quality • Fast Service';

    return message;
}


// Validate order form
function validateOrderForm(formData) {
    var errors = [];

    // Required fields validation
    if (!formData.customerName || formData.customerName.trim() === '') {
        errors.push('Customer name is required');
    }

    if (!formData.customerPhone || formData.customerPhone.trim() === '') {
        errors.push('WhatsApp number is required');
    }

    if (!formData.customerAddress || formData.customerAddress === '') {
        errors.push('Pickup location is required');
    }

    if (!formData.deliveryMethod) {
        formData.deliveryMethod = 'pickup';
    }
    if (!formData.preferredTime || formData.preferredTime === '') {
        errors.push('Preferred pickup time is required');
    }

    if (!formData.urgencyLevel || formData.urgencyLevel === '') {
        errors.push('Order priority is required');
    }

    // Phone number format validation
    if (formData.customerPhone && !isValidPhoneNumber(formData.customerPhone)) {
        errors.push('Please enter a valid WhatsApp number (e.g., +673 1234567)');
    }

    // Cart validation
    if (cart.length === 0) {
        errors.push('Your cart is empty. Please add items before submitting order.');
    }

    return errors;
}

// Validate phone number format
function isValidPhoneNumber(phone) {
    // Basic validation for Brunei phone numbers
    var phoneRegex = /^(\+673)?[\s-]?[2-8]\d{6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Submit order
function submitOrder(orderData) {
    // Validate form
    var errors = validateOrderForm(orderData);
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n• ' + errors.join('\n• '));
        return false;
    }

    // Generate WhatsApp message
    var whatsappMessage = generateWhatsAppMessage(orderData);

    // Store order data for potential future use
    var orderRecord = createOrderRecord(orderData);

    // Log order for debugging
    debugLog('Order submitted:', orderRecord);

    return true;
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

// Create order record
function createOrderRecord(orderData) {
    return {
        id: generateOrderId(),
        timestamp: new Date().toISOString(),
        customer: {
            name: orderData.customerName,
            phone: orderData.customerPhone,
            pickupLocation: orderData.customerAddress,
            collectionMethod: orderData.deliveryMethod,
            preferredTime: orderData.preferredTime,
            priority: orderData.urgencyLevel,
            specialRequests: orderData.specialRequests || ''
        },
        items: exportCartForOrder(),
        summary: {
            totalItems: getTotalCartItems(),
            itemCount: cart.length
        },
        status: 'pending'
    };
}

// Generate unique order ID
function generateOrderId() {
    var timestamp = Date.now();
    var random = Math.floor(Math.random() * 1000);
    return 'FE' + timestamp.toString().slice(-6) + random.toString().padStart(3, '0');
}

// Send WhatsApp message (opens WhatsApp with pre-filled message)
function sendWhatsAppMessage(phoneNumber, message) {
    // Format phone number for WhatsApp
    var formattedPhone = formatPhoneForWhatsApp(phoneNumber);

    // Create WhatsApp URL
    var encodedMessage = encodeURIComponent(message);
    var whatsappUrl = 'https://wa.me/' + formattedPhone + '?text=' + encodedMessage;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
}

// Format phone number for WhatsApp
function formatPhoneForWhatsApp(phone) {

    var cleaned = phone.replace(/[^\d+]/g, '');


    if (!cleaned.startsWith('+673') && !cleaned.startsWith('673')) {
        cleaned = '673' + cleaned;
    }

    // Remove + sign for WhatsApp URL
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }

    return cleaned;
}

// Handle urgent order notifications
function handleUrgentOrder(priority) {
    if (priority === 'urgent' || priority === 'express') {
        var warningMessage = priority === 'express' ?
            'Express orders (30 min) may have additional fees. Continue?' :
            'Urgent orders (1 hour) may have additional fees. Continue?';

        return confirm(warningMessage);
    }
    return true;
}

// Order status tracking
function trackOrder(orderId) {
    // for backend
    console.log('Tracking order:', orderId);
}

// Get order history
function getOrderHistory() {
    // for backend/localStorage
    try {
        var history = localStorage.getItem('firstEmporiumOrderHistory');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.warn('Could not load order history:', error);
        return [];
    }
}

// Save order to history 
function saveOrderToHistory(orderRecord) {
    try {
        var history = getOrderHistory();
        history.push(orderRecord);

        // Keep only last 10 orders
        if (history.length > 10) {
            history = history.slice(-10);
        }

        localStorage.setItem('firstEmporiumOrderHistory', JSON.stringify(history));
        debugLog('Order saved to history');
    } catch (error) {
        console.warn('Could not save order to history:', error);
    }
}

// estimated preparation time
function getEstimatedPrepTime(priority, itemCount) {
    var baseTime = 30; // minutes
    var itemTime = itemCount * 2; // 2 minutes per item

    switch (priority) {
        case 'express':
            return Math.max(30, baseTime);
        case 'urgent':
            return Math.max(60, baseTime + itemTime * 0.5);
        case 'standard':
        default:
            return Math.max(120, baseTime + itemTime);
    }
}

// pickup time recommendations
function getPickupTimeRecommendations(priority) {
    var now = new Date();
    var prepTime = getEstimatedPrepTime(priority, getTotalCartItems());
    var earliestPickup = new Date(now.getTime() + prepTime * 60000);

    return {
        earliest: earliestPickup,
        recommended: new Date(earliestPickup.getTime() + 30 * 60000), // 30 min buffer
        prepTimeMinutes: prepTime
    };
}

// Format time for display
function formatTimeForDisplay(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Show order confirmation modal 
function showOrderConfirmation(orderRecord) {
    var confirmationHtml = `
        <div class="order-confirmation-modal">
            <div class="confirmation-content">
                <h3>Order Submitted Successfully!</h3>
                <p><strong>Order ID:</strong> ${orderRecord.id}</p>
                <p><strong>Estimated Preparation:</strong> ${getEstimatedPrepTime(orderRecord.customer.priority, orderRecord.summary.totalItems)} minutes</p>
                <p>You will receive pricing and availability via WhatsApp shortly.</p>
                <button onclick="closeConfirmation()">Close</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmationHtml);
}

// Close confirmation modal
function closeConfirmation() {
    var modal = document.querySelector('.order-confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

// Export order data for admin system 
function exportOrderForAdmin(orderRecord) {
    return {
        orderId: orderRecord.id,
        timestamp: orderRecord.timestamp,
        customer: orderRecord.customer,
        items: orderRecord.items,
        summary: orderRecord.summary,
        estimatedPrepTime: getEstimatedPrepTime(
            orderRecord.customer.priority,
            orderRecord.summary.totalItems
        ),
        status: orderRecord.status
    };
}

// Handle order form submission with validation
function processOrderSubmission(formData) {

    if (!validateCart()) {
        return false;
    }

    
    if (!handleUrgentOrder(formData.urgencyLevel)) {
        return false;
    }

    // Submit order
    if (submitOrder(formData)) {

        var orderRecord = createOrderRecord(formData);

        saveOrderToHistory(orderRecord);

        // Generate and send WhatsApp message
        var whatsappMessage = generateWhatsAppMessage(formData);
        sendWhatsAppMessage('673123456', whatsappMessage); 

        console.log('WhatsApp message generated:', whatsappMessage);

        return true;
    }

    return false;
}

// Initialize order form with dynamic content
function initializeOrderForm() {

    populatePickupLocations();
    populateTimeSlots();
    setupOrderFormListeners();
}

// Populate pickup locations dropdown
function populatePickupLocations() {
    var locationSelect = document.getElementById('customerAddress');
    if (!locationSelect) return;

    // Clear existing options except first
    var firstOption = locationSelect.querySelector('option[value=""]');
    locationSelect.innerHTML = '';
    if (firstOption) {
        locationSelect.appendChild(firstOption);
    }

    // Add store locations
    for (var i = 0; i < storeLocations.length; i++) {
        var location = storeLocations[i];
        var option = document.createElement('option');
        option.value = location.name;
        option.textContent = location.name;
        locationSelect.appendChild(option);
    }
}

// Populate time slots dropdown
function populateTimeSlots() {
    var timeSelect = document.getElementById('preferredTime');
    if (!timeSelect) return;

}

// Setup dynamic form listeners
function setupOrderFormListeners() {
    var prioritySelect = document.getElementById('urgencyLevel');
    if (prioritySelect) {
        prioritySelect.addEventListener('change', function() {
            updateTimeRecommendations(this.value);
        });
    }
}

// Update time recommendations based on priority
function updateTimeRecommendations(priority) {
    var recommendations = getPickupTimeRecommendations(priority);
    var timeSelect = document.getElementById('preferredTime');

    if (timeSelect) {
        // highlight recommended times or add notes
        var note = document.getElementById('time-recommendation-note');
        if (!note) {
            note = document.createElement('small');
            note.id = 'time-recommendation-note';
            note.style.cssText = 'color: #666; font-size: 12px; margin-top: 5px; display: block;';
            timeSelect.parentNode.appendChild(note);
        }

        note.textContent = `Estimated preparation: ${recommendations.prepTimeMinutes} minutes. Earliest pickup: ${formatTimeForDisplay(recommendations.earliest)}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeOrderForm();
});


function hideOrderForm(){
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
}