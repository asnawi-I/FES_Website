// Product Database for First Emporium Supermarket
var products = [
    // Fresh Produce
    { 
        id: 1, 
        name: "Fresh Bananas", 
        description: "Sweet and ripe bananas, perfect for breakfast", 
        category: "fresh", 
        image: "assets/images/products/fresh/bananas.jpg" 
    },
    { 
        id: 2, 
        name: "Red Apples", 
        description: "Crisp and juicy red apples", 
        category: "fresh", 
        image: "assets/images/products/fresh/apples.jpg" 
    },
    { 
        id: 3, 
        name: "Fresh Spinach", 
        description: "Organic spinach leaves", 
        category: "fresh", 
        image: "assets/images/products/fresh/spinach.jpg" 
    },
    { 
        id: 4, 
        name: "Carrots", 
        description: "Fresh orange carrots", 
        category: "fresh", 
        image: "assets/images/products/fresh/carrots.jpg" 
    },
    { 
        id: 5, 
        name: "Tomatoes", 
        description: "Ripe red tomatoes", 
        category: "fresh", 
        image: "assets/images/products/fresh/tomatoes.jpg" 
    },
    { 
        id: 31, 
        name: "Green Lettuce", 
        description: "Fresh crisp lettuce leaves", 
        category: "fresh", 
        image: "assets/images/products/fresh/lettuce.jpg" 
    },
    { 
        id: 32, 
        name: "Broccoli", 
        description: "Fresh green broccoli crowns", 
        category: "fresh", 
        image: "assets/images/products/fresh/broccoli.jpg" 
    },
    { 
        id: 33, 
        name: "Onions", 
        description: "Yellow cooking onions", 
        category: "fresh", 
        image: "assets/images/products/fresh/onions.jpg" 
    },

    // Dairy & Eggs
    { 
        id: 6, 
        name: "Fresh Milk", 
        description: "Full cream milk 1L", 
        category: "dairy", 
        image: "assets/images/products/dairy/milk.jpg" 
    },
    { 
        id: 7, 
        name: "Free Range Eggs", 
        description: "Fresh eggs 12 pieces", 
        category: "dairy", 
        image: "assets/images/products/dairy/eggs.jpg" 
    },
    { 
        id: 8, 
        name: "Cheddar Cheese", 
        description: "Aged cheddar cheese block", 
        category: "dairy", 
        image: "assets/images/products/dairy/cheese.jpg" 
    },
    { 
        id: 9, 
        name: "Greek Yogurt", 
        description: "Creamy Greek yogurt", 
        category: "dairy", 
        image: "assets/images/products/dairy/yogurt.jpg" 
    },
    { 
        id: 34, 
        name: "Butter", 
        description: "Salted butter 250g", 
        category: "dairy", 
        image: "assets/images/products/dairy/butter.jpg" 
    },
    { 
        id: 35, 
        name: "Mozzarella Cheese", 
        description: "Fresh mozzarella cheese", 
        category: "dairy", 
        image: "assets/images/products/dairy/mozzarella.jpg" 
    },

    // Meat & Seafood
    { 
        id: 10, 
        name: "Chicken Breast", 
        description: "Fresh chicken breast fillets", 
        category: "meat", 
        image: "assets/images/products/meat/chicken.jpg" 
    },
    { 
        id: 11, 
        name: "Ground Beef", 
        description: "Fresh ground beef", 
        category: "meat", 
        image: "assets/images/products/meat/beef.jpg" 
    },
    { 
        id: 12, 
        name: "Salmon Fillet", 
        description: "Fresh salmon fillet", 
        category: "meat", 
        image: "assets/images/products/meat/salmon.jpg" 
    },
    { 
        id: 13, 
        name: "Prawns", 
        description: "Fresh prawns", 
        category: "meat", 
        image: "assets/images/products/meat/prawns.jpg" 
    },
    { 
        id: 36, 
        name: "Pork Chops", 
        description: "Fresh pork chops", 
        category: "meat", 
        image: "assets/images/products/meat/pork.jpg" 
    },
    { 
        id: 37, 
        name: "Tuna Steaks", 
        description: "Fresh tuna steaks", 
        category: "meat", 
        image: "assets/images/products/meat/tuna.jpg" 
    },

    // Pantry Items
    { 
        id: 14, 
        name: "Jasmine Rice", 
        description: "Premium jasmine rice 5kg", 
        category: "pantry", 
        image: "assets/images/products/pantry/rice.jpg" 
    },
    { 
        id: 15, 
        name: "Olive Oil", 
        description: "Extra virgin olive oil", 
        category: "pantry", 
        image: "assets/images/products/pantry/olive-oil.jpg" 
    },
    { 
        id: 16, 
        name: "Pasta", 
        description: "Italian pasta 500g", 
        category: "pantry", 
        image: "assets/images/products/pantry/pasta.jpg" 
    },
    { 
        id: 17, 
        name: "Canned Tomatoes", 
        description: "Peeled tomatoes in juice", 
        category: "pantry", 
        image: "assets/images/products/pantry/canned-tomatoes.jpg" 
    },
    { 
        id: 18, 
        name: "Bread", 
        description: "Fresh white bread loaf", 
        category: "pantry", 
        image: "assets/images/products/pantry/bread.jpg" 
    },
    { 
        id: 38, 
        name: "Flour", 
        description: "All-purpose flour 2kg", 
        category: "pantry", 
        image: "assets/images/products/pantry/flour.jpg" 
    },
    { 
        id: 39, 
        name: "Sugar", 
        description: "White granulated sugar 1kg", 
        category: "pantry", 
        image: "assets/images/products/pantry/sugar.jpg" 
    },
    { 
        id: 40, 
        name: "Cooking Salt", 
        description: "Iodized cooking salt", 
        category: "pantry", 
        image: "assets/images/products/pantry/salt.jpg" 
    },

    // Frozen Foods
    { 
        id: 19, 
        name: "Frozen Vegetables", 
        description: "Mixed frozen vegetables", 
        category: "frozen", 
        image: "assets/images/products/frozen/frozen-vegetables.jpg" 
    },
    { 
        id: 20, 
        name: "Ice Cream", 
        description: "Vanilla ice cream 1L", 
        category: "frozen", 
        image: "assets/images/products/frozen/ice-cream.jpg" 
    },
    { 
        id: 21, 
        name: "Frozen Pizza", 
        description: "Margherita frozen pizza", 
        category: "frozen", 
        image: "assets/images/products/frozen/pizza.jpg" 
    },
    { 
        id: 41, 
        name: "Frozen Fish Fillets", 
        description: "Assorted frozen fish fillets", 
        category: "frozen", 
        image: "assets/images/products/frozen/fish-fillets.jpg" 
    },
    { 
        id: 42, 
        name: "Frozen Berries", 
        description: "Mixed frozen berries", 
        category: "frozen", 
        image: "assets/images/products/frozen/berries.jpg" 
    },

    // Snacks & Beverages
    { 
        id: 22, 
        name: "Coca Cola", 
        description: "Coca Cola 1.5L", 
        category: "snacks", 
        image: "assets/images/products/snacks/coca-cola.jpg" 
    },
    { 
        id: 23, 
        name: "Potato Chips", 
        description: "Crispy potato chips", 
        category: "snacks", 
        image: "assets/images/products/snacks/chips.jpg" 
    },
    { 
        id: 24, 
        name: "Chocolate Bar", 
        description: "Milk chocolate bar", 
        category: "snacks", 
        image: "assets/images/products/snacks/chocolate.jpg" 
    },
    { 
        id: 25, 
        name: "Coffee Beans", 
        description: "Premium coffee beans", 
        category: "snacks", 
        image: "assets/images/products/snacks/coffee.jpg" 
    },
    { 
        id: 43, 
        name: "Orange Juice", 
        description: "Fresh orange juice 1L", 
        category: "snacks", 
        image: "assets/images/products/snacks/orange-juice.jpg" 
    },
    { 
        id: 44, 
        name: "Cookies", 
        description: "Chocolate chip cookies", 
        category: "snacks", 
        image: "assets/images/products/snacks/cookies.jpg" 
    },
    { 
        id: 45, 
        name: "Energy Drink", 
        description: "Energy drink 250ml", 
        category: "snacks", 
        image: "assets/images/products/snacks/energy-drink.jpg" 
    },

    // Household Items
    { 
        id: 26, 
        name: "Laundry Detergent", 
        description: "Liquid laundry detergent", 
        category: "household", 
        image: "assets/images/products/household/detergent.jpg" 
    },
    { 
        id: 27, 
        name: "Toilet Paper", 
        description: "Soft toilet paper 12 rolls", 
        category: "household", 
        image: "assets/images/products/household/toilet-paper.jpg" 
    },
    { 
        id: 28, 
        name: "Dish Soap", 
        description: "Lemon dish soap", 
        category: "household", 
        image: "assets/images/products/household/dish-soap.jpg" 
    },
    { 
        id: 29, 
        name: "Paper Towels", 
        description: "Absorbent paper towels", 
        category: "household", 
        image: "assets/images/products/household/paper-towels.jpg" 
    },
    { 
        id: 30, 
        name: "Trash Bags", 
        description: "Heavy duty trash bags", 
        category: "household", 
        image: "assets/images/products/household/trash-bags.jpg" 
    },
    { 
        id: 46, 
        name: "Shampoo", 
        description: "Daily care shampoo 400ml", 
        category: "household", 
        image: "assets/images/products/household/shampoo.jpg" 
    },
    { 
        id: 47, 
        name: "Toothpaste", 
        description: "Fluoride toothpaste", 
        category: "household", 
        image: "assets/images/products/household/toothpaste.jpg" 
    },
    { 
        id: 48, 
        name: "Hand Sanitizer", 
        description: "Antibacterial hand sanitizer", 
        category: "household", 
        image: "assets/images/products/household/hand-sanitizer.jpg" 
    }
];

// Category definitions
var categories = [
    { id: 'all', name: 'All Products', icon: '' },
    { id: 'fresh', name: 'Fresh Produce', icon: '' },
    { id: 'dairy', name: 'Dairy & Eggs', icon: '' },
    { id: 'meat', name: 'Meat & Seafood', icon: '' },
    { id: 'pantry', name: 'Pantry', icon: '' },
    { id: 'frozen', name: 'Frozen', icon: '' },
    { id: 'snacks', name: 'Snacks', icon: '' },
    { id: 'household', name: 'Household', icon: '' }
];

// Store locations
var storeLocations = [
    { id: 'batu-satu', name: 'Batu Satu Branch', address: 'Batu Satu, Brunei' },
    { id: 'madang', name: 'Madang Branch', address: 'Madang, Brunei' }
];

// Time slots for pickup
var timeSlots = {
    morning: [
        "9:30 AM - 10:00 AM",
        "10:00 AM - 10:30 AM",
        "10:30 AM - 11:00 AM",
        "11:00 AM - 11:30 AM",
        "11:30 AM - 12:00 PM"
    ],
    afternoon: [
        "12:00 PM - 12:30 PM",
        "12:30 PM - 1:00 PM",
        "1:00 PM - 1:30 PM",
        "1:30 PM - 2:00 PM",
        "2:00 PM - 2:30 PM",
        "2:30 PM - 3:00 PM",
        "3:00 PM - 3:30 PM",
        "3:30 PM - 4:00 PM",
        "4:00 PM - 4:30 PM",
        "4:30 PM - 5:00 PM",
        "5:00 PM - 5:30 PM",
        "5:30 PM - 6:00 PM"
    ],
    evening: [
        "6:00 PM - 6:30 PM",
        "6:30 PM - 7:00 PM",
        "7:00 PM - 7:30 PM",
        "7:30 PM - 8:00 PM",
        "8:00 PM - 8:30 PM",
        "8:30 PM - 9:00 PM",
        "9:00 PM - 9:30 PM"
    ]
};

// Priority levels
var priorityLevels = [
    { id: 'standard', name: 'Standard (2-3 hours preparation)', description: 'Regular processing time' },
    { id: 'urgent', name: 'Urgent (1 hour preparation) - Priority handling', description: 'Faster processing with possible additional fees' },
    { id: 'express', name: 'Express (30 minutes preparation) - Immediate priority', description: 'Immediate processing with additional fees' }
];