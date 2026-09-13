function getBuyPage() {
    return `<h1>Browse products</h1>`;
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

const routes = {
    '/': getBuyPage,
    '/buy': getBuyPage,
    '/sell': getSellPage,
    '/cart': getCartPage,
    '/orders': getOrdersPage,
    '/sales': getSalesPage,
    '/account': getAccountPage
};

function renderContent() {
    const div = document.getElementById('app');
    const path = window.location.pathname;
    div.innerHTML = routes[path] ? routes[path]() : '<h1>Page not found</h1>';
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