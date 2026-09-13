function getBuyPage() {
    return `
        <h1>Browse products</h1>
        <div id='products'></div>
    `;
}

function getSellPage() { 
    return `<h1>Sell your stuff</h1>`;
}

function getCartPage() {
    return `<h1>Your cart</h1>`;
}

function getOrdersPage() {
    return `<h1>My orders</h1>`;
}

function getSalesPage() {
    return `<h1>My Sales</h1>`;
}

function getAccountPage() {
    return `<h1>Manage account</h1>`;
}

async function loadProducts() {
    const div = document.getElementById('products');

    try {
        const response = await fetch('/api/products');

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();

        div.innerHTML = products.map(product => `
            <div class='product'>
                <h2>${product.name}</h2>
                <p>R$ ${product.price}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p>failed to load products</p>'
    }
}

async function loadOrders() {
    const div = document.getElementById('orders');

    try {
        const response = await fetch('/api/orders');

        if (!response.ok) {
            throw new Error('failed to laod orders');
        }

        const orders = await response.json();

        div.innerHTML = orders.map(order => `
            <div class='order'>
                <h2>${order.name}</h2>
                <p>Quantidade: ${order.quantity}</p>
                <p>R$ ${order.price}
            </div>
        `);
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p>failed to load orders</p>'
    }
}

const routes = {
    '/': {page: getBuyPage, init: loadProducts},
    '/buy': {page: getBuyPage, init: loadProducts},
    '/sell': {page: getSellPage},
    '/cart': {page: getCartPage},
    '/orders': {page: getOrdersPage},
    '/sales': {page: getSalesPage},
    '/account': {page: getAccountPage}
};

async function renderContent() {
    const div = document.getElementById('app');
    const path = window.location.pathname;
    const route = routes[path];

    if (!route) {
        div.innerHTML = '<h1>Page not found</h1>';
        return;
    }

    div.innerHTML = route.page();

    if (route.init) {
        await route.init();
    }
}

function navigate(path) {
    window.history.pushState({}, '', path);
    renderContent();
}

document.addEventListener('click', (e) => {
    if (e.target.matches('a[data-link]')) {
        e.preventDefault();
        navigate(e.target.getAttribute('href'));
    }
});

window.addEventListener('popstate', renderContent);
window.addEventListener('load', renderContent);

const state = {
    users: [],
    currentPage: 'buy',
    isLoading: false
}

function updateState(newState) {
    Object.assign(state, newState);
    renderContent();
}