function getLoginPage() {
    return `<div class='login'>
                <h1>login</h1>
                <input type='email' id='login_email' placeholder='email'>
                <input type='password' id='login_password' placeholder='password'>
                <button id='loginbtn'>login</button>
                <p id='login_error'></p>
            </div>`
}

function getRegisterPage() {
    return `<div class='register'>
                <h1>register</h1>
                <input type='text' id='register_name' placeholder='name'>
                <input type='email' id='register_email' placeholder='email'>
                <input type='password' id='register_password' placeholder='password'>
                <input type='password' id='register_confirm_password' placeholder='same password'>
                <button id='registerbtn'>register</button>
                <p id='register_error'></p>
            </div>`
}

function getBuyPage() {
    return `<div id='products'></div>`;
}

function getProductPage() {
    return `<div id='product'></div>`;
}

function getSellPage() { 
    return `<div class='sell'>
                <div class='create' id='create'>
                    <h1>create listing</h1>
                    <input type='text' class='name' id='listing_name' placeholder='name'>
                    <input type='text' class='description' id='listing_description' placeholder='description'>
                    <input type='number' class='stock' id='listing_stock' placeholder='stock'>
                    <input type='number' class='price' id='listing_price' placeholder='price'>
                    <select class='listing_category' id='listing_category'></select>
                    <input type='file' class='image' id='listing_images' accept='image/*' multiple> 
                    <button id='create_listing_btn'>create</button>
                </div>
                <div class='view' id='view'>
                    <h1>view listings</h1>
                    <div class='listings' id='listings'>
                </div>                                                                                                                                                                        
            </div>`;
}

function getCartPage() {
    return `<h1>my cart</h1>
            <div id='cart'></div>`;
}

function getOrdersPage() {
    return `<h1>my orders</h1>
            <div id='orders'></div>`;
}

function getOrderPage() {
    return `<div id='order'></div>`;
}

function getSalesPage() {
    return `<h1>my sales</h1>
            <div id='sales'></div>`;
}

function getAccountPage() {
    return `<h1>my account</h1>
            <div id='account'></div>`;
}

function getUserPage() {
    return `<div id='user'></div>`;
}

async function redirectIfLoggedIn() {
    try {
        const res = await fetch('/api/auth/me', {credentials: 'include'});
        if (res.ok) navigate('/buy');
    } catch (error) {}
}

async function loadProducts() {
    const div = document.getElementById('products');
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const page = params.get('page') || 1;

    try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&page=${page}`);

        if (!res.ok) throw new Error('Failed to fetch products');
        
        const products = await res.json();

        div.innerHTML = products.map(product => `
            <a href='/product/${product.id}' class='product'>
                <h2 class='name'>${product.name}</h2>
                <p class='price'>R$ ${product.price}</p>
            </a>
        `).join('');
    } catch (error) {
        div.innerHTML = '<p>failed to load products</p>'
    }
}

async function loadProduct(id) {
    const div = document.getElementById('product');

    try {
        const productRes = await fetch('/api/products/' + id);
        const questionsRes = await fetch('/api/questions/' + id);

        if (!productRes) throw new Error('failed to fetch products');

        const product = await productRes.json();
        const questions = await questionRes.json();

        div.innerHTML = `
            <h2>${product.name}</h2>
            <p class='description'>${product.description}</p>
            <p class='price'>$ ${product.price}</p>
            <p class='stock'>${product.stock}</p>
            <p class='created_at'>${product.created_at}</p>
            <a class='seller' href='users/${product.seller_id}'>${product.seller_name}</a>
            <h2 class='questions'>questions</h2>
            ${questions.map(question => `
                <a class='asker' href='/users/${question.asker_id}'>${question.asker_name}</a>
                <p class='question'>${question.question}</p>
                <p class='answer'>${question.answer}</p>
                <p class='created_at'>${question.created_at}</p>
                <p class='answered_at'>${question.answered_at}</p>
            `).join('')};
        `;
    } catch (error) {
        div.innerHTML = '<p>failed to load product</p>';    
    }
}

async function loadOrders() {
    const div = document.getElementById('orders');

    try {
        const res = await fetch('/api/orders', {credentials: 'include'});

        if (!res.ok) throw new Error('failed to load orders');

        const orders = await res.json();

        div.innerHTML = orders.map(order => `
            <a href='/order/${order.id}' class='order'>
                <p class='product_name'>${order.product_name}</p>
                <p class='quantity'>${order.quantity}</p>
                <p class='price'>$ ${order.total}</p>
            </a>
        `).join('');
    } catch (error) {
        div.innerHTML = '<p>failed to load orders</p>';
    }
}

async function loadOrder(id) {
    const div = document.getElementById('order');
    
    try {
        const res = await fetch('/api/order/' + id, {credentials: 'include'});
        if (!res.ok) throw new Error('failed to load order');
        const order = await res.json();

        div.innerHTML = `
            <h2 class='order_id'>order ${order.id}</h2>
            <p class='product_name'>${order.product_name}</p>
            <p class='price'>$ ${order.product_price}</p>
            <p class='quantity'>$ ${order.quantity}</p>
            <p class='shipping'>$ ${order.shipping}</p>
            <p class='total'>$ ${order.total}</p>
            <p class='status'>${order.status}</p>
            <p class='created_at'>${order.status}</p>
            <a class='seller' href='/users/${order.seller_id}'>${order.seller_name}</a>
        `;
    } catch (error) {
        div.innerHTML = '<p>failed to load order</p>';
    }
}

async function loadSell() {
    const div = document.getElementById('listings');
    const select = document.getElementById('listing_category');
    try {   
        const user_res = await fetch('/api/auth/me', {credentials: 'include'});
        const user = await user_res.json();
        if (!user_res.ok) {
            navigate('/login');
            throw new Error('failed to load user');
        }

        const categories_res = await fetch('/api/products/categories');
        const categories = await categories_res.json();
        if (!categories_res.ok) throw new Error('failed to load categories');

        const products_res = await fetch('/api/products/user/' + user.id);
        const products = await products_res.json();
        if (!products_res.ok) throw new Error('failed to load listings');
        
        select.innerHTML = categories.map(category => `
            <option value='${category.id}'>${category.name}</option>
        `).join('');

        if (products.length === 0) {
            div.innerHTML = `<p>you dont have any listings yet</p>`;
            return;
        }

        div.innerHTML = products.map(listing => `
            <a href='/product/${listing.id}' class='listing'>
                <p class='name'>${listing.name}</p>
                <p class='stock'>${listing.stock}</p>
                <p class='price'>${listing.price}</p>
                <button class='edit' data-id='${listing.id}'>edit</button>
            </a>
        `).join('');
    } catch (error) {
        div.innerHTML = `<p>failed to load listings</p>`;
    }
}

async function getDropdown() {
    const res = await fetch('/api/auth/me', {credentials: 'include'});
    if (res.ok) {
        return `
        <a href='/account' data-link>account</a>
        <a href='/orders' data-link>orders</a>
        <a href='/sales' data-link>sales</a>
        <a href='#' id='logoutbtn'>logout</a>`
    } else {
        return `
        <a href='/login' data-link>login</a>
        <a href='/register' data-link>register</a>`
    }
}

const routes = {
    '/': {page: getBuyPage, init: loadProducts},
    '/login': {page: getLoginPage, init: redirectIfLoggedIn},
    '/register': {page: getRegisterPage, init: redirectIfLoggedIn},
    '/buy': {page: getBuyPage, init: loadProducts},
    '/product/:id': {page: getProductPage, init: loadProduct},
    '/sell': {page: getSellPage, init: loadSell},
    '/cart': {page: getCartPage},
    '/orders': {page: getOrdersPage},
    '/orders/:id': {page: getOrderPage, init: loadOrder},
    '/sales': {page: getSalesPage},
    '/users/:id': {page: getUserPage},
    '/account': {page: getAccountPage}
};

function matchRoute(path) {
    for (const pattern in routes) {
        const keys = [];
        const regex = new RegExp('^' +
        pattern.replace(/:([^/]+)/g, (_, key) => {
            keys.push(key);
            return '([^/]+)';
        }) + '$');
        const match = path.match(regex);
        if (match) {
            const params = {};
            keys.forEach((key, i) => params[key] = match[i + 1]);
            return {route: routes[pattern], params};
        }
    }
}

async function renderContent() {
    const dropdown = await getDropdown()
    document.getElementById('dropdown').innerHTML = dropdown;
    
    const {route, params} = matchRoute(window.location.pathname);
    const div = document.getElementById('app');

    if (!route) {
        div.innerHTML = '<h1>Page not found</h1>';
        return;
    }

    div.innerHTML = route.page();

    if (route.init) {
        await route.init(params.id);
    }
}

function navigate(path) {
    window.history.pushState({}, '', path);
    renderContent();
}

document.addEventListener('click', async (e) => {
    if (e.target.matches('a[data-link]')) {
        e.preventDefault();
        navigate(e.target.getAttribute('href'));
    }
    if (e.target.id == 'loginbtn') {
        const email = document.getElementById('login_email').value;
        const password = document.getElementById('login_password').value;
        const login_error = document.getElementById('login_error');
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
            login_error.textContent = data.error;
            return;
        }
        navigate('/buy');
    }
    if (e.target.id == 'registerbtn') {
        const name = document.getElementById('register_name').value;
        const email = document.getElementById('register_email').value;
        const password = document.getElementById('register_password').value;
        const confirm_password = document.getElementById('register_confirm_password').value;
        const register_error = document.getElementById('register_error');
        if (password != confirm_password) {
            register_error.textContent = 'passwords do not match';
            return;
        }
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password, confirm_password}),
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
            register_error.textContent = data.error;
            return;
        }
        navigate('/buy');
    }
    if (e.target.id == 'logoutbtn') {
        const res = await fetch('/api/auth/logout', {method: 'POST', credentials: 'include'});
        if (res.ok) renderContent();
    }
    if (e.target.id == 'create_listing_btn') {
        const name = document.getElementById('listing_name').value;
        const description = document.getElementById('listing_description').value;
        const stock = document.getElementById('listing_stock').value;
        const price = document.getElementById('listing_price').value;
        const imagefiles = document.getElementById('listing_images').files;
        const category = document.getElementById('listing_category').value;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('stock', stock);
        formData.append('price', price);
        formData.append('category_id', category);
        for (const file of imagefiles) {
            formData.append('images', file);
        }

        const res = await fetch('/api/products/create', {
            credentials: 'include',
            method: 'POST',
            body: formData
        });
        
        renderContent();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key == 'Enter' && e.target.id == 'search') {
        const query = e.target.value;
        navigate('/buy?search=' + encodeURIComponent(query) + '?page=1');
    }
});

window.addEventListener('popstate', renderContent);
window.addEventListener('load', renderContent);