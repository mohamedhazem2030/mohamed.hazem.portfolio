document.addEventListener('DOMContentLoaded', () => {
    const currency = 'EGP';

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeToggle.classList.remove(theme === 'light' ? 'fa-moon' : 'fa-sun');
        themeToggle.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
    }

    // Helper Functions
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const showNotification = (message) => {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navRight = document.querySelector('.nav-right');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navRight.classList.toggle('active');
        hamburger.classList.toggle('active');
        const themeToggle = document.querySelector('.theme-toggle');
        if (navRight.classList.contains('active')) {
            themeToggle.style.display = 'inline-block';
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navRight.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
                history.pushState(null, null, href);
            }
        });
    });

    // Glitch Effect for Buttons
    document.querySelectorAll('.btn, .quantity-controls button').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.animation = 'glitch 0.3s';
            setTimeout(() => btn.style.animation = '', 300);
        });
    });

    // Scroll-Triggered Product Animations
    const productCards = document.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'perspective(1000px) rotateY(0deg)';
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'perspective(1000px) rotateY(15deg)';
        observer.observe(card);
    });

    // Add Trending Badges
    const trendingProducts = ['Graphic Tee', 'Urban Sneakers'];
    productCards.forEach(card => {
        const name = card.querySelector('h3').textContent;
        if (trendingProducts.includes(name)) {
            card.classList.add('trending');
        }
    });

    // Size Chart Modal
    const sizeChartBtn = document.querySelector('.size-chart-btn');
    const sizeChartModal = document.getElementById('size-chart-modal');
    const closeSizeChart = document.querySelector('.close-size-chart');

    sizeChartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sizeChartModal.style.display = 'flex';
    });

    closeSizeChart.addEventListener('click', () => {
        sizeChartModal.style.display = 'none';
    });

    sizeChartModal.addEventListener('click', (e) => {
        if (e.target === sizeChartModal) sizeChartModal.style.display = 'none';
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.size-chart-table').forEach(table => table.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).style.display = 'block';
        });
    });

    // Shopping Cart
    let cart = JSON.parse(localStorage.getItem('hustlz-cart')) || [];
    const cartIcon = document.querySelector('.fa-shopping-cart');

    const cartModal = document.createElement('div');
    cartModal.className = 'modal-overlay';
    cartModal.innerHTML = `
        <div class="modal-content cart-modal">
            <span class="close-modal">×</span>
            <h2>Your initializing</h2>
            <div class="cart-items"></div>
            <div class="cart-summary"></div>
        </div>
    `;
    document.body.appendChild(cartModal);
    cartModal.style.display = 'none';

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (btn) {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const name = card.querySelector('h3').textContent;
            const price = parseInt(card.querySelector('p').textContent);
            const image = card.querySelector('img').src;
            const category = card.dataset.category;
            addToCart(name, price, image, category);
        }
    });

    cartIcon.addEventListener('click', showCartModal);

    function addToCart(name, price, image, category) {
        const item = cart.find(i => i.name === name);
        if (item) {
            item.quantity += 1;
        } else {
            cart.push({ name, price, image, category, quantity: 1 });
        }
        updateCart();
        showNotification(`${name} added to your stash!`);
    }

    function updateCart() {
        localStorage.setItem('hustlz-cart', JSON.stringify(cart));
        updateCartCount();
        updateCheckoutSummary();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartIcon.classList.add('has-items');
            cartIcon.setAttribute('data-count', totalItems);
        } else {
            cartIcon.classList.remove('has-items');
            cartIcon.removeAttribute('data-count');
        }
    }

    function showCartModal() {
        cartModal.style.display = 'flex';
        const cartItems = cartModal.querySelector('.cart-items');
        const cartSummary = cartModal.querySelector('.cart-summary');
        cartModal.querySelector('.close-modal').onclick = () => {
            cartModal.style.display = 'none';
        };

        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your stash is empty 😎</p>';
            cartSummary.innerHTML = '';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>${currency} ${item.price}</p>
                        <div class="quantity-controls">
                            <button class="decrease-qty">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-qty">+</button>
                        </div>
                    </div>
                    <button class="remove-item"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');

            cartItems.querySelectorAll('.decrease-qty').forEach((btn, i) => {
                btn.onclick = () => {
                    cart[i].quantity -= 1;
                    if (cart[i].quantity <= 0) cart.splice(i, 1);
                    updateCart();
                    showCartModal();
                };
            });

            cartItems.querySelectorAll('.increase-qty').forEach((btn, i) => {
                btn.onclick = () => {
                    cart[i].quantity += 1;
                    updateCart();
                    showCartModal();
                };
            });

            cartItems.querySelectorAll('.remove-item').forEach((btn, i) => {
                btn.onclick = () => {
                    cart.splice(i, 1);
                    updateCart();
                    showCartModal();
                };
            });

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartSummary.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin:20px 0;padding-top:20px;border-top:2px solid var(--border-color)">
                    <span style="font-weight:600">Total:</span>
                    <span style="font-weight:700;color:var(--accent-color);font-size:20px">${currency} ${total}</span>
                </div>
                <button class="btn checkout-btn" style="width:100%" onclick="window.location.href='#checkout';document.querySelector('.modal-overlay').style.display='none'">Cop Now</button>
            `;
        }

        cartModal.onclick = (e) => {
            if (e.target === cartModal) cartModal.style.display = 'none';
        };
    }

    // Checkout Summary
    function updateCheckoutSummary() {
        const summaryItems = document.querySelector('.summary-items');
        const summaryTotal = document.querySelector('.summary-total');
        if (cart.length === 0) {
            summaryItems.innerHTML = '<p>No items in your stash 😎</p>';
            summaryTotal.innerHTML = '';
        } else {
            summaryItems.innerHTML = cart.map(item => `
                <div class="summary-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="summary-item-details">
                        <h3>${item.name} (x${item.quantity})</h3>
                        <p>${currency} ${item.price * item.quantity}</p>
                    </div>
                </div>
            `).join('');
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            summaryTotal.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:20px;border-top:2px solid var(--border-color)">
                    <span style="font-weight:600">Total:</span>
                    <span style="font-weight:700;color:var(--accent-color);font-size:20px">${currency} ${total}</span>
                </div>
            `;
        }
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showNotification('Your stash is empty! Add some heat 🔥');
            return;
        }

        const fullName = document.getElementById('full-name').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const phone = document.getElementById('phone').value;
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvc = document.getElementById('card-cvc').value;

        // Basic validation
        if (!fullName || !address || !city || !phone || !cardNumber || !cardExpiry || !cardCvc) {
            showNotification('Fill in all the deets, fam! 🙌');
            return;
        }

        // Simulate order processing
        showNotification('Order locked in! You’re a legend 🔥');
        cart = [];
        updateCart();
        checkoutForm.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateCartCount();
    updateCheckoutSummary();

    // Search Functionality
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    const searchProducts = debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const products = Array.from(document.querySelectorAll('.product-card')).map(card => ({
            name: card.querySelector('h3').textContent,
            price: parseInt(card.querySelector('p').textContent),
            image: card.querySelector('img').src,
            category: card.dataset.category
        }));

        const results = products.filter(p => p.name.toLowerCase().includes(query));
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No drip found 😢</p>';
        } else {
            results.forEach(p => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <img src="${p.image}" alt="${p.name}">
                    <div>
                        <h3>${p.name}</h3>
                        <p>${currency} ${p.price}</p>
                    </div>
                `;
                item.onclick = () => {
                    searchResults.style.display = 'none';
                    searchInput.value = '';
                    const section = p.category.includes('mens') ? '#mens-collection' :
                                   p.category.includes('womens') ? '#womens-collection' :
                                   '#accessories-collection';
                    document.querySelector(section).scrollIntoView({ behavior: 'smooth' });
                };
                searchResults.appendChild(item);
            });
        }
        searchResults.style.display = 'block';
    }, 300);

    searchInput.addEventListener('input', searchProducts);
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    // Product Filters
    document.querySelectorAll('.product-filters').forEach(filterContainer => {
        const categoryFilter = filterContainer.querySelector('.category-filter');
        const sortFilter = filterContainer.querySelector('.sort-filter');
        const productGrid = filterContainer.nextElementSibling;
        const originalCards = Array.from(productGrid.children);

        categoryFilter.addEventListener('change', applyFilters);
        sortFilter.addEventListener('change', applyFilters);

        function applyFilters() {
            const category = categoryFilter.value;
            const sort = sortFilter.value;
            let filteredCards = originalCards;

            if (category) {
                filteredCards = originalCards.filter(card => 
                    card.dataset.category === category || 
                    (category === 'mens' && ['tees', 'hoodies', 'jackets', 'pants', 'shorts'].includes(card.dataset.category)) ||
                    (category === 'womens' && ['hoodies', 'pants', 'dresses', 'tops', 'jeans'].includes(card.dataset.category)) ||
                    (category === 'accessories' && ['shoes', 'hats', 'bags', 'wallets', 'sunglasses'].includes(card.dataset.category))
                );
            }

            if (sort) {
                filteredCards = [...filteredCards].sort((a, b) => {
                    const priceA = parseInt(a.querySelector('p').textContent);
                    const priceB = parseInt(b.querySelector('p').textContent);
                    if (sort === 'price-low') return priceA - priceB;
                    if (sort === 'price-high') return priceB - priceA;
                    return 0;
                });
            }

            productGrid.innerHTML = '';
            filteredCards.forEach(card => productGrid.appendChild(card));
        }
    });
});