// Shared Product Image Store
// Centralized image management that syncs between admin and frontend pages
// This file should be loaded BEFORE products.js, image-management.js, and main.js

(function(window) {
    'use strict';

    // ============================================================================
    // SHARED IMAGE STORAGE - Single source of truth
    // ============================================================================
    
    const SharedImageStore = {
        // Internal storage for product images
        _images: {},
        
        // Event listeners for sync notifications
        _listeners: [],
        
        // Initialize the store with product data
        init: function(products) {
            console.log('🔄 Initializing Shared Image Store...');
            
            // Load existing images from products array
            if (products && Array.isArray(products)) {
                products.forEach(product => {
                    if (product.image) {
                        this._images[product.id] = product.image;
                    }
                });
            }
            
            console.log(`✅ Loaded ${Object.keys(this._images).length} product images`);
            return this;
        },
        
        // Get image for a product
        getImage: function(productId) {
            return this._images[productId] || null;
        },
        
        // Set image for a product
        setImage: function(productId, imageData) {
            const oldImage = this._images[productId];
            this._images[productId] = imageData;
            
            console.log(`📸 Image set for product ${productId}`);
            
            // Notify all listeners
            this._notifyListeners({
                type: 'image-updated',
                productId: productId,
                imageData: imageData,
                oldImage: oldImage
            });
            
            return true;
        },
        
        // Delete image for a product
        deleteImage: function(productId) {
            const oldImage = this._images[productId];
            
            if (oldImage) {
                delete this._images[productId];
                console.log(`🗑️ Image deleted for product ${productId}`);
                
                // Notify all listeners
                this._notifyListeners({
                    type: 'image-deleted',
                    productId: productId,
                    oldImage: oldImage
                });
                
                return true;
            }
            
            return false;
        },
        
        // Check if product has an image
        hasImage: function(productId) {
            return !!this._images[productId];
        },
        
        // Get all images
        getAllImages: function() {
            return { ...this._images };
        },
        
        // Get statistics
        getStats: function() {
            return {
                totalImages: Object.keys(this._images).length,
                images: this._images
            };
        },
        
        // Subscribe to image changes
        subscribe: function(callback) {
            if (typeof callback === 'function') {
                this._listeners.push(callback);
                console.log('👂 New listener subscribed. Total listeners:', this._listeners.length);
            }
        },
        
        // Unsubscribe from image changes
        unsubscribe: function(callback) {
            const index = this._listeners.indexOf(callback);
            if (index > -1) {
                this._listeners.splice(index, 1);
                console.log('👋 Listener unsubscribed. Total listeners:', this._listeners.length);
            }
        },
        
        // Notify all listeners of changes
        _notifyListeners: function(event) {
            this._listeners.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in listener callback:', error);
                }
            });
        },
        
        // Sync images to products array
        syncToProducts: function(products) {
            if (!products || !Array.isArray(products)) return;
            
            let syncCount = 0;
            products.forEach(product => {
                const storedImage = this._images[product.id];
                if (storedImage) {
                    product.image = storedImage;
                    syncCount++;
                } else if (this._images[product.id] === null) {
                    // Image was explicitly deleted
                    product.image = product.image; // Keep original fallback path
                }
            });
            
            console.log(`🔄 Synced ${syncCount} images to products array`);
            return syncCount;
        },
        
        // Export data for debugging
        export: function() {
            return {
                images: this.getAllImages(),
                stats: this.getStats(),
                listenerCount: this._listeners.length
            };
        }
    };
    
    // ============================================================================
    // CROSS-PAGE SYNC SYSTEM
    // ============================================================================
    
    const CrossPageSync = {
        // Channel name for BroadcastChannel (if supported)
        channelName: 'first-emporium-image-sync',
        channel: null,
        
        // Initialize cross-page sync
        init: function() {
            // Check if BroadcastChannel is supported
            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    this.channel = new BroadcastChannel(this.channelName);
                    
                    this.channel.onmessage = (event) => {
                        this.handleMessage(event.data);
                    };
                    
                    console.log('📡 BroadcastChannel initialized for cross-page sync');
                } catch (error) {
                    console.warn('BroadcastChannel not available:', error);
                }
            } else {
                console.warn('BroadcastChannel not supported in this browser');
            }
            
            return this;
        },
        
        // Send sync message to other pages
        broadcast: function(message) {
            if (this.channel) {
                try {
                    this.channel.postMessage(message);
                    console.log('📤 Broadcast sent:', message.type);
                } catch (error) {
                    console.error('Error broadcasting:', error);
                }
            }
        },
        
        // Handle incoming sync messages
        handleMessage: function(data) {
            console.log('📥 Received broadcast:', data.type);
            
            switch (data.type) {
                case 'image-updated':
                    SharedImageStore.setImage(data.productId, data.imageData);
                    break;
                    
                case 'image-deleted':
                    SharedImageStore.deleteImage(data.productId);
                    break;
                    
                case 'sync-request':
                    // Another page is requesting current state
                    this.broadcast({
                        type: 'sync-response',
                        images: SharedImageStore.getAllImages()
                    });
                    break;
                    
                case 'sync-response':
                    // Received state from another page
                    if (data.images) {
                        Object.keys(data.images).forEach(productId => {
                            SharedImageStore.setImage(parseInt(productId), data.images[productId]);
                        });
                    }
                    break;
            }
        },
        
        // Request sync from other open pages
        requestSync: function() {
            this.broadcast({ type: 'sync-request' });
        },
        
        // Close the channel
        close: function() {
            if (this.channel) {
                this.channel.close();
            }
        }
    };
    
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    window.SharedImageStore = SharedImageStore;
    window.CrossPageSync = CrossPageSync;
    
    // Auto-initialize cross-page sync
    CrossPageSync.init();
    
    console.log('✅ Shared Image Store module loaded');
    
})(window);


// ============================================================================
// HELPER FUNCTIONS FOR EASY INTEGRATION
// ============================================================================

// Helper to update product image (use this in admin interface)
function updateProductImage(productId, imageData) {
    const success = window.SharedImageStore.setImage(productId, imageData);
    
    if (success) {
        // Broadcast to other pages
        window.CrossPageSync.broadcast({
            type: 'image-updated',
            productId: productId,
            imageData: imageData
        });
        
        // Update products array if it exists
        if (typeof products !== 'undefined') {
            const product = products.find(p => p.id === productId);
            if (product) {
                product.image = imageData;
            }
        }
        
        // Update productDatabase if it exists (for image-management.js)
        if (typeof productDatabase !== 'undefined' && productDatabase.products) {
            const product = productDatabase.products.find(p => p.id === productId);
            if (product) {
                product.image = imageData;
            }
        }
    }
    
    return success;
}

// Helper to delete product image (use this in admin interface)
function deleteProductImage(productId) {
    const success = window.SharedImageStore.deleteImage(productId);
    
    if (success) {
        // Broadcast to other pages
        window.CrossPageSync.broadcast({
            type: 'image-deleted',
            productId: productId
        });
        
        // Update products array if it exists
        if (typeof products !== 'undefined') {
            const product = products.find(p => p.id === productId);
            if (product) {
                product.image = null;
            }
        }
        
        // Update productDatabase if it exists (for image-management.js)
        if (typeof productDatabase !== 'undefined' && productDatabase.products) {
            const product = productDatabase.products.find(p => p.id === productId);
            if (product) {
                product.image = null;
            }
        }
    }
    
    return success;
}

// Helper to get product image
function getProductImage(productId) {
    return window.SharedImageStore.getImage(productId);
}

// Helper to check if product has image
function hasProductImage(productId) {
    return window.SharedImageStore.hasImage(productId);
}