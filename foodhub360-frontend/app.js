const SESSION_KEY = 'foodhub360.session';

const state = {
    session: readSession(),
    nav: null,
    search: '',
    products: [],
    orders: [],
    deliveries: [],
    dashboard: null,
    restaurants: []
};

const app = document.querySelector('#app');

function readSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (_) {
        return null;
    }
}

function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    state.session = session;
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    state.session = null;
    state.nav = null;
    renderAuth();
}

async function api(path, options = {}) {
    try {
        return await FoodHubBackend.request(path, options);
    } catch (error) {
        throw new Error(error.message || 'Nao foi possivel concluir a operacao local.');
    }
}

function money(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dateTime(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function statusLabel(status) {
    const labels = {
        CREATED: 'Criado',
        WAITING_PAYMENT: 'Aguardando',
        PAID: 'Pago',
        PREPARING: 'Preparando',
        READY_FOR_DELIVERY: 'Pronto',
        OUT_FOR_DELIVERY: 'Em rota',
        DELIVERED: 'Entregue',
        CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
}

function roleName(role) {
    return { ADMIN: 'Administrador', ATTENDANT: 'Atendente', COURIER: 'Entregador', CUSTOMER: 'Cliente' }[role] || role;
}

function toast(message, type = 'success') {
    let host = document.querySelector('.toast-host');
    if (!host) {
        host = document.createElement('div');
        host.className = 'toast-host';
        document.body.appendChild(host);
    }
    const item = document.createElement('div');
    item.className = `alert alert-${type} shadow-sm mb-2`;
    item.textContent = message;
    host.appendChild(item);
    setTimeout(() => item.remove(), 3200);
}

function formJson(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function renderAuth() {
    app.innerHTML = `
        <div class="auth-layout">
            <section class="auth-panel">
                <div>
                    <img class="brand-logo mb-4" src="assets/LogoMarca.jpg" alt="FoodHub360">
                    <div class="auth-copy">
                        <h1>FoodHub360</h1>
                        <p>MVP operacional para cliente, atendente, entregador e administrador acompanharem pedidos em tempo real.</p>
                    </div>
                </div>
            </section>
            <section class="auth-main">
                <div class="auth-card">
                    <ul class="nav nav-pills auth-tabs mb-4" role="tablist">
                        <li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#login-tab" type="button">Login</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#customer-tab" type="button">Cadastro Cliente</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#staff-tab" type="button">Cadastro Admin</button></li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="login-tab">
                            <form id="login-form" class="row g-3">
                                <div class="col-md-6"><label class="form-label">E-mail</label><input class="form-control" name="email" type="email" required value="admin@foodhub360.com"></div>
                                <div class="col-md-6"><label class="form-label">Senha</label><input class="form-control" name="password" type="password" required value="admin123"></div>
                                <div class="col-12 d-flex gap-2 flex-wrap">
                                    <button class="btn btn-danger fw-bold" type="submit">Entrar</button>
                                    <button class="btn btn-outline-secondary demo-login" type="button" data-email="atendente@foodhub360.com" data-password="123456">Atendente</button>
                                    <button class="btn btn-outline-secondary demo-login" type="button" data-email="entregador@foodhub360.com" data-password="123456">Entregador</button>
                                    <button class="btn btn-outline-secondary demo-login" type="button" data-email="ana.cliente@foodhub360.com" data-password="123456">Cliente</button>
                                </div>
                            </form>
                        </div>
                        <div class="tab-pane fade" id="customer-tab">
                            <form id="customer-form" class="row g-3">
                                <div class="col-md-6"><label class="form-label">Nome</label><input class="form-control" name="name" required></div>
                                <div class="col-md-6"><label class="form-label">E-mail</label><input class="form-control" name="email" type="email" required></div>
                                <div class="col-md-6"><label class="form-label">Senha</label><input class="form-control" name="password" type="password" required minlength="4"></div>
                                <div class="col-md-6"><label class="form-label">Telefone</label><input class="form-control" name="phone"></div>
                                <div class="col-12"><label class="form-label">Endereco</label><input class="form-control" name="address" required></div>
                                <div class="col-12"><button class="btn btn-warning fw-bold" type="submit">Registrar cliente</button></div>
                            </form>
                        </div>
                        <div class="tab-pane fade" id="staff-tab">
                            <form id="staff-form" class="row g-3">
                                <div class="col-md-6"><label class="form-label">Nome</label><input class="form-control" name="name" required></div>
                                <div class="col-md-6"><label class="form-label">E-mail</label><input class="form-control" name="email" type="email" required></div>
                                <div class="col-md-6"><label class="form-label">Senha</label><input class="form-control" name="password" type="password" required minlength="4"></div>
                                <div class="col-md-6"><label class="form-label">Perfil</label><select class="form-select" name="role"><option value="ATTENDANT">Atendente</option><option value="COURIER">Entregador</option><option value="ADMIN">Administrador</option></select></div>
                                <div class="col-12"><button class="btn btn-danger fw-bold" type="submit">Registrar usuario interno</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>`;

    document.querySelector('#login-form').addEventListener('submit', submitLogin);
    document.querySelector('#customer-form').addEventListener('submit', submitCustomerRegister);
    document.querySelector('#staff-form').addEventListener('submit', submitStaffRegister);
    document.querySelectorAll('.demo-login').forEach(button => button.addEventListener('click', () => quickLogin(button.dataset.email, button.dataset.password)));
}

async function submitLogin(event) {
    event.preventDefault();
    const payload = formJson(event.currentTarget);
    await quickLogin(payload.email, payload.password);
}

async function quickLogin(email, password) {
    try {
        const session = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        saveSession(session);
        toast(`Bem-vindo, ${session.name}`);
        renderShell();
    } catch (error) {
        toast(error.message, 'danger');
    }
}

async function submitCustomerRegister(event) {
    event.preventDefault();
    try {
        const session = await api('/auth/register/customer', { method: 'POST', body: JSON.stringify(formJson(event.currentTarget)) });
        saveSession(session);
        toast('Cliente registrado com sucesso.');
        renderShell();
    } catch (error) {
        toast(error.message, 'danger');
    }
}

async function submitStaffRegister(event) {
    event.preventDefault();
    try {
        const session = await api('/auth/register/staff', { method: 'POST', body: JSON.stringify(formJson(event.currentTarget)) });
        saveSession(session);
        toast('Usuario interno registrado com sucesso.');
        renderShell();
    } catch (error) {
        toast(error.message, 'danger');
    }
}

function navForRole(role) {
    const maps = {
        ADMIN: [['dashboard', 'D', 'Dashboard'], ['sales', '$', 'Vendas'], ['register', '+', 'Cadastrar Usuario']],
        ATTENDANT: [['orders', '#', 'Pedidos'], ['cashier', '$', 'Caixa']],
        COURIER: [['deliveries', '>', 'Ver Rotas']],
        CUSTOMER: [['menu', '*', 'Cardapio'], ['my-orders', '#', 'Meus Pedidos'], ['profile', '~', 'Preferencias']]
    };
    return maps[role] || maps.CUSTOMER;
}

function defaultNav(role) {
    return navForRole(role)[0][0];
}

function renderShell() {
    if (!state.session) return renderAuth();
    const template = document.querySelector('#shell-template').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(template);
    document.querySelector('#logout-button').addEventListener('click', logout);
    document.querySelector('#session-pill').textContent = `${state.session.name} | ${roleName(state.session.role)}`;
    const search = document.querySelector('#global-search');
    search.addEventListener('input', event => {
        state.search = event.target.value.toLowerCase();
        renderCurrentView();
    });
    if (!state.nav) state.nav = defaultNav(state.session.role);
    if (!navForRole(state.session.role).some(([id]) => id === state.nav)) state.nav = defaultNav(state.session.role);
    renderNav();
    renderCurrentView();
}

function renderNav() {
    const nav = document.querySelector('#side-nav');
    nav.innerHTML = navForRole(state.session.role).map(([id, icon, label]) => `
        <button class="side-link ${state.nav === id ? 'active' : ''}" type="button" data-nav="${id}"><span class="nav-icon">${icon}</span>${label}</button>
    `).join('');
    nav.querySelectorAll('[data-nav]').forEach(button => button.addEventListener('click', () => {
        state.nav = button.dataset.nav;
        renderNav();
        renderCurrentView();
    }));
}

async function loadCoreData() {
    const [orders, deliveries, products, restaurants] = await Promise.all([
        api('/orders'),
        api('/deliveries'),
        api('/products'),
        api('/restaurants')
    ]);
    state.orders = orders;
    state.deliveries = deliveries;
    state.products = products;
    state.restaurants = restaurants;
}

async function renderCurrentView() {
    const view = document.querySelector('#view');
    if (!view) return;
    view.innerHTML = '<div class="empty-state">Carregando dados locais...</div>';
    try {
        if (state.nav === 'dashboard') return renderAdminDashboard();
        if (state.nav === 'sales') return renderSales();
        if (state.nav === 'register') return renderStaffAdminRegister();
        if (state.nav === 'orders' || state.nav === 'cashier') return renderAttendant();
        if (state.nav === 'deliveries') return renderCourier();
        if (state.nav === 'my-orders') return renderCustomerOrders();
        if (state.nav === 'profile') return renderProfile();
        return renderMenu();
    } catch (error) {
        view.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function matchesSearch(order) {
    if (!state.search) return true;
    return [order.customerName, order.restaurantName, order.deliveryAddress, order.status].join(' ').toLowerCase().includes(state.search);
}

function dashboardStats() {
    const delivered = state.orders.filter(order => order.status === 'DELIVERED');
    const active = state.orders.filter(order => !['DELIVERED', 'CANCELLED'].includes(order.status));
    const deliveryQueue = state.orders.filter(order => ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(order.status));
    const cancelled = state.orders.filter(order => order.status === 'CANCELLED');
    const revenue = delivered.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const cost = delivered.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.subtotalCost || item.subtotal * 0.55 || 0), 0), 0);
    const grossProfit = revenue - cost;
    const margin = revenue ? (grossProfit / revenue) * 100 : 0;
    const averageTicket = delivered.length ? revenue / delivered.length : 0;
    const pendingRevenue = active.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return { delivered, active, deliveryQueue, cancelled, revenue, cost, grossProfit, margin, averageTicket, pendingRevenue };
}

function statusSummary() {
    const labels = {
        WAITING_PAYMENT: 'Aguardando',
        PREPARING: 'Preparando',
        READY_FOR_DELIVERY: 'Pronto',
        OUT_FOR_DELIVERY: 'Em rota',
        DELIVERED: 'Entregue',
        CANCELLED: 'Cancelado'
    };
    return Object.entries(labels).map(([status, label]) => ({
        status,
        label,
        count: state.orders.filter(order => order.status === status).length
    }));
}

function topProducts() {
    const products = new Map();
    state.orders.forEach(order => {
        order.items.forEach(item => {
            const current = products.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0, image: item.productImage || 'assets/combo-burger.jpg' };
            current.quantity += Number(item.quantity || 0);
            current.revenue += Number(item.subtotal || 0);
            products.set(item.productName, current);
        });
    });
    return [...products.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, 4);
}

function recentMovements() {
    const orderMoves = state.orders.map(order => ({
        type: 'Pedido',
        title: `${order.customerName} - ${statusLabel(order.status)}`,
        detail: `${money(order.total)} | ${order.deliveryAddress}`,
        date: order.createdAt
    }));
    const deliveryMoves = state.deliveries.map(delivery => {
        const order = state.orders.find(item => item.id === delivery.orderId);
        return {
            type: 'Entrega',
            title: `${delivery.courierName || 'Entregador'} - ${delivery.status === 'DELIVERED' ? 'Entregue' : 'Em andamento'}`,
            detail: order ? `${order.customerName} | ${order.deliveryAddress}` : delivery.trackingCode,
            date: delivery.updatedAt
        };
    });
    return [...orderMoves, ...deliveryMoves]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
}

function dashboardSuggestion(stats, leaders) {
    if (!state.orders.length) return 'Ainda nao ha movimentacoes. Cadastre pedidos para alimentar o painel.';
    if (stats.margin < 35 && stats.delivered.length) return 'Margem abaixo do ideal. Revise precificacao dos itens mais vendidos ou reduza custos de insumos.';
    if (stats.margin >= 45 && stats.delivered.length) return 'Margem saudavel. Vale impulsionar os produtos lideres para aumentar volume sem sacrificar lucro.';
    if (stats.deliveryQueue.length > 2) return 'Fila de entrega crescendo. Priorize despacho e acompanhe pedidos em rota para reduzir atraso.';
    if (stats.active.length > stats.delivered.length) return 'Ha mais pedidos ativos do que vendas concluidas. Acelere confirmacao do atendente e liberacao para entrega.';
    if (leaders.length) return `${leaders[0].name} lidera as vendas. Considere destacar este item em promocao ou combo.`;
    return 'Operacao equilibrada. Continue monitorando ticket medio, entregas e produtos mais pedidos.';
}

function renderStatusChart(summary) {
    const max = Math.max(...summary.map(item => item.count), 1);
    return summary.map(item => `
        <div class="status-meter">
            <div class="status-meter-head"><span>${item.label}</span><strong>${item.count}</strong></div>
            <div class="status-track"><span class="status-fill status-fill-${item.status.toLowerCase()}" style="width: ${(item.count / max) * 100}%"></span></div>
        </div>
    `).join('');
}

function renderFinancialPie(stats) {
    if (!stats.revenue) {
        return `
            <div class="movement-pie-wrap">
                <div class="movement-pie empty"></div>
                <div class="movement-legend"><span>Nenhuma venda concluida ainda</span></div>
            </div>
        `;
    }
    const costPercent = Math.max(0, Math.min(100, (stats.cost / stats.revenue) * 100));
    const profitPercent = Math.max(0, 100 - costPercent);
    const slices = `#ef5656 0% ${costPercent}%, #49b84f ${costPercent}% 100%`;
    return `
        <div class="movement-pie-wrap">
            <div class="movement-pie" style="background: conic-gradient(${slices})"><strong>${stats.margin.toFixed(1)}%</strong><small>margem</small></div>
            <div class="movement-legend">
                <span><i style="background:#49b84f"></i>Lucro bruto: ${money(stats.grossProfit)} (${profitPercent.toFixed(1)}%)</span>
                <span><i style="background:#ef5656"></i>Custo estimado: ${money(stats.cost)} (${costPercent.toFixed(1)}%)</span>
                <span><i style="background:#f2b705"></i>Receita concluida: ${money(stats.revenue)}</span>
            </div>
        </div>
    `;
}

function renderTopProducts(products) {
    if (!products.length) return '<div class="empty-state">Nenhum produto vendido ainda.</div>';
    return products.map(product => `
        <article class="leader-item">
            <img src="${product.image}" alt="${product.name}">
            <div>
                <strong>${product.name}</strong>
                <span>${product.quantity} itens | ${money(product.revenue)}</span>
            </div>
        </article>
    `).join('');
}

function renderMovements(movements) {
    if (!movements.length) return '<tr><td colspan="4">Nenhuma movimentacao registrada.</td></tr>';
    return movements.map(move => `
        <tr>
            <td>${move.type}</td>
            <td>${move.title}</td>
            <td>${move.detail}</td>
            <td>${dateTime(move.date)}</td>
        </tr>
    `).join('');
}

async function renderAdminDashboard() {
    const view = document.querySelector('#view');
    const [dashboard] = await Promise.all([api('/analytics/dashboard'), loadCoreData()]);
    state.dashboard = dashboard;
    const stats = dashboardStats();
    const summary = statusSummary();
    const leaders = topProducts();
    const movements = recentMovements();
    const ticket = dashboardSuggestion(stats, leaders);
    view.innerHTML = `
        <div class="kpi-row">
            <div class="kpi-card"><span>Total de Vendas</span><strong>${money(stats.revenue)}</strong></div>
            <div class="kpi-card"><span>Lucro Bruto</span><strong>${money(stats.grossProfit)}</strong></div>
            <div class="kpi-card"><span>Margem de Lucro</span><strong>${stats.margin.toFixed(1)}%</strong></div>
            <div class="kpi-card"><span>Vendas Concluidas</span><strong>${stats.delivered.length}</strong></div>
        </div>
        <section class="dashboard-grid">
            <div class="panel white dashboard-panel">
                <h2>Movimentacao Financeira</h2>
                ${renderFinancialPie(stats)}
                <div class="finance-summary">
                    <span>Ticket medio: <strong>${money(stats.averageTicket)}</strong></span>
                    <span>Receita em aberto: <strong>${money(stats.pendingRevenue)}</strong></span>
                    <span>Pedidos em entrega: <strong>${stats.deliveryQueue.length}</strong></span>
                </div>
                <h2>Status dos Pedidos</h2>
                ${renderStatusChart(summary)}
            </div>
            <div class="panel white dashboard-panel">
                <h2>Produtos Mais Vendidos</h2>
                <div class="leader-list">${renderTopProducts(leaders)}</div>
            </div>
        </section>
        <section class="ai-card mb-4"><h2 class="section-title">Sugestao de IA</h2><p class="mb-0">${ticket}</p></section>
        <section class="mb-4">
            <h2 class="section-title">Movimentacoes Recentes</h2>
            <div class="table-panel"><table class="table table-sm table-hover"><thead><tr><th>Tipo</th><th>Evento</th><th>Detalhe</th><th>Quando</th></tr></thead><tbody>${renderMovements(movements)}</tbody></table></div>
        </section>
        <section><h2 class="section-title">Vendas Concluidas</h2>${ordersTable(stats.delivered, false)}</section>`;
}

async function renderSales() {
    const view = document.querySelector('#view');
    await loadCoreData();
    const delivered = state.orders.filter(order => order.status === 'DELIVERED' && matchesSearch(order));
    view.innerHTML = `<h1 class="section-title">Vendas concluidas</h1>${ordersTable(delivered, false)}`;
}

function renderStaffAdminRegister() {
    const view = document.querySelector('#view');
    view.innerHTML = `
        <section class="panel gray">
            <h1 class="section-title">Cadastrar perfil de usuario</h1>
            <form id="admin-staff-form" class="row g-3">
                <div class="col-md-6"><label class="form-label">Nome</label><input class="form-control" name="name" required></div>
                <div class="col-md-6"><label class="form-label">E-mail</label><input class="form-control" name="email" type="email" required></div>
                <div class="col-md-6"><label class="form-label">Senha</label><input class="form-control" name="password" type="password" required minlength="4"></div>
                <div class="col-md-6"><label class="form-label">Perfil</label><select class="form-select" name="role"><option value="ATTENDANT">Atendente</option><option value="COURIER">Entregador</option><option value="ADMIN">Administrador</option></select></div>
                <div class="col-12"><button class="btn btn-danger fw-bold" type="submit">Cadastrar usuario</button></div>
            </form>
        </section>`;
    document.querySelector('#admin-staff-form').addEventListener('submit', submitStaffRegisterOnly);
}

async function submitStaffRegisterOnly(event) {
    event.preventDefault();
    try {
        await api('/auth/register/staff', { method: 'POST', body: JSON.stringify(formJson(event.currentTarget)) });
        event.currentTarget.reset();
        toast('Usuario criado para acesso interno.');
    } catch (error) {
        toast(error.message, 'danger');
    }
}

async function renderAttendant() {
    const view = document.querySelector('#view');
    await loadCoreData();
    const visible = state.orders.filter(order => order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && matchesSearch(order));
    view.innerHTML = `
        <section class="panel gray">
            <h1 class="section-title">Cadastrar Pedido</h1>
            <form id="quick-order-form" class="row g-3 align-items-end">
                <div class="col-md-4"><label class="form-label">Nome do cliente</label><input class="form-control" name="customerName" value="Cliente Balcao" required></div>
                <div class="col-md-4"><label class="form-label">Endereco</label><input class="form-control" name="deliveryAddress" value="Rua Joaquim, 120" required></div>
                <div class="col-md-4"><label class="form-label">Produto</label><select class="form-select" name="productId">${state.products.map(product => `<option value="${product.id}">${product.name} - ${money(product.price)}</option>`).join('')}</select></div>
                <div class="col-md-2"><label class="form-label">Qtd.</label><input class="form-control" name="quantity" type="number" min="1" value="1"></div>
                <div class="col-md-4"><label class="form-label">Observacoes</label><input class="form-control" name="notes" placeholder="Sem cebola, ponto da carne..."></div>
                <div class="col-md-3"><button class="btn btn-warning w-100 fw-bold" type="submit">Confirmar</button></div>
            </form>
        </section>
        <section><h2 class="section-title">Pedidos Confirmados</h2>${ordersTable(visible, true)}</section>`;
    document.querySelector('#quick-order-form').addEventListener('submit', createCounterOrder);
    wireOrderActions();
}

async function createCounterOrder(event) {
    event.preventDefault();
    const data = formJson(event.currentTarget);
    try {
        const customer = await api('/customers', {
            method: 'POST',
            body: JSON.stringify({ name: data.customerName, email: `balcao.${Date.now()}@foodhub360.local`, phone: '', address: data.deliveryAddress })
        });
        const product = state.products.find(item => item.id === data.productId);
        await api('/orders', {
            method: 'POST',
            body: JSON.stringify({
                customerId: customer.id,
                restaurantId: product.restaurantId,
                deliveryAddress: data.deliveryAddress,
                items: [{ productId: data.productId, quantity: Number(data.quantity || 1) }]
            })
        });
        toast('Pedido cadastrado.');
        renderAttendant();
    } catch (error) {
        toast(error.message, 'danger');
    }
}

function wireOrderActions() {
    document.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', async () => {
        try {
            await api(`/orders/${button.dataset.order}/status`, { method: 'PUT', body: JSON.stringify({ status: button.dataset.status }) });
            toast('Pedido atualizado.');
            renderCurrentView();
        } catch (error) {
            toast(error.message, 'danger');
        }
    }));
    document.querySelectorAll('[data-delivery]').forEach(button => button.addEventListener('click', async () => {
        try {
            await api('/deliveries', { method: 'POST', body: JSON.stringify({ orderId: button.dataset.delivery, courierName: 'Entregador FoodHub360', trackingCode: `FH-${Date.now()}` }) });
            await api(`/orders/${button.dataset.delivery}/status`, { method: 'PUT', body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }) });
            toast('Entrega criada para o entregador.');
            renderCurrentView();
        } catch (error) {
            toast(error.message, 'danger');
        }
    }));
}

async function renderCourier() {
    const view = document.querySelector('#view');
    await loadCoreData();
    const pendingOrders = state.orders.filter(order => ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(order.status) && matchesSearch(order));
    const delivered = state.orders.filter(order => order.status === 'DELIVERED' && matchesSearch(order));
    view.innerHTML = `
        <section class="mb-5"><h1 class="section-title">Pedidos Pendentes</h1>${ordersTable(pendingOrders, false, true)}</section>
        <section><h2 class="section-title">Entregues</h2>${ordersTable(delivered, false)}</section>`;
    document.querySelectorAll('[data-finish-delivery]').forEach(button => button.addEventListener('click', async () => {
        try {
            await api(`/orders/${button.dataset.finishDelivery}/status`, { method: 'PUT', body: JSON.stringify({ status: 'DELIVERED' }) });
            const delivery = state.deliveries.find(item => item.orderId === button.dataset.finishDelivery);
            if (delivery) await api(`/deliveries/${delivery.id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'DELIVERED' }) });
            toast('Entrega confirmada.');
            renderCourier();
        } catch (error) {
            toast(error.message, 'danger');
        }
    }));
}

async function renderMenu() {
    const view = document.querySelector('#view');
    await loadCoreData();
    const filteredProducts = state.products.filter(product => !state.search || product.name.toLowerCase().includes(state.search));
    view.innerHTML = `
        <section class="hero-offer" style="background-image: linear-gradient(90deg, rgba(0,0,0,.15), rgba(0,0,0,.86)), url('assets/combo-burger.jpg');"><div><h2>Promocao do Dia:<br>X-Cheese Americano</h2><strong>R$ 34,90</strong></div></section>
        <div class="filter-row"><button class="btn">Novidades</button><button class="btn">Em Promocao</button><button class="btn">Mais Pedidos</button><button class="btn">Todos</button></div>
        <section class="product-grid mb-4">${filteredProducts.map(productCard).join('')}</section>
        <h2 class="section-title">Categorias</h2>
        <section class="category-grid"><div class="category-card"><span>/\\</span>Pizzas</div><div class="category-card"><span>=</span>Hamburgers</div><div class="category-card"><span>[]</span>Bebidas</div><div class="category-card"><span>o</span>Sobremesas</div></section>`;
    document.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', buyProduct));
}

function productCard(product) {
    const image = product.image || 'assets/combo-burger.jpg';
    return `<article class="product-card"><div class="product-image" style="background-image: url('${image}')"></div><div class="body"><h3>${product.name}</h3><p>${product.description || 'Produto FoodHub360'}</p><div class="d-flex justify-content-between align-items-center"><span class="price">${money(product.price)}</span><button class="btn btn-sm btn-warning fw-bold" data-buy="${product.id}">Pedir</button></div></div></article>`;
}

async function buyProduct(event) {
    const product = state.products.find(item => item.id === event.currentTarget.dataset.buy);
    if (!state.session.customerId) return toast('Cadastre-se como cliente para fazer pedidos.', 'warning');
    try {
        await api('/orders', {
            method: 'POST',
            body: JSON.stringify({
                customerId: state.session.customerId,
                restaurantId: product.restaurantId,
                deliveryAddress: 'Endereco cadastrado do cliente',
                items: [{ productId: product.id, quantity: 1 }]
            })
        });
        toast('Pedido enviado para confirmacao do atendente.');
    } catch (error) {
        toast(error.message, 'danger');
    }
}

async function renderCustomerOrders() {
    const view = document.querySelector('#view');
    await loadCoreData();
    const orders = state.orders.filter(order => order.customerId === state.session.customerId && matchesSearch(order));
    view.innerHTML = `<h1 class="section-title">Meus Pedidos</h1>${ordersTable(orders, false)}`;
}

function renderProfile() {
    const view = document.querySelector('#view');
    view.innerHTML = `<section class="panel white"><h1 class="section-title">Preferencias</h1><p class="mb-2"><strong>Nome:</strong> ${state.session.name}</p><p class="mb-2"><strong>E-mail:</strong> ${state.session.email}</p><p class="mb-2"><strong>Persistencia:</strong> dados locais no navegador.</p><button class="btn btn-outline-danger" id="reset-data" type="button">Restaurar dados do MVP</button></section>`;
    document.querySelector('#reset-data').addEventListener('click', () => {
        FoodHubBackend.reset();
        toast('Dados locais restaurados.');
    });
}

function ordersTable(orders, attendantActions = false, courierActions = false) {
    if (!orders.length) return '<div class="empty-state">Nenhum pedido encontrado.</div>';
    return `<div class="table-panel"><table class="table table-sm table-hover"><thead><tr><th>Nome</th><th>Pedido</th><th>Valor</th><th>Status</th><th>Data Pedido</th><th>Endereco</th><th></th></tr></thead><tbody>${orders.map(order => {
        const itemNames = order.items.map(item => item.productName).join(', ');
        const image = order.items[0]?.productImage || 'assets/combo-burger.jpg';
        return `<tr><td>${order.customerName}</td><td><div class="order-product"><img src="${image}" alt="${itemNames}"><span>${itemNames}</span></div></td><td>${money(order.total)}</td><td><span class="status-badge status-${String(order.status).toLowerCase()}">${statusLabel(order.status)}</span></td><td>${dateTime(order.createdAt)}</td><td>${order.deliveryAddress}</td><td>${actionButtons(order, attendantActions, courierActions)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function actionButtons(order, attendantActions, courierActions) {
    if (attendantActions) {
        return `<div class="order-actions">
            <button class="btn btn-sm btn-outline-primary" data-status="PREPARING" data-order="${order.id}">Preparar</button>
            <button class="btn btn-sm btn-outline-success" data-status="READY_FOR_DELIVERY" data-order="${order.id}">Pronto</button>
            <button class="btn btn-sm btn-warning" data-delivery="${order.id}">Enviar</button>
        </div>`;
    }
    if (courierActions) {
        return `<button class="btn btn-sm btn-green fw-bold" data-finish-delivery="${order.id}">Confirmar Entrega</button>`;
    }
    return '';
}

if (state.session) {
    renderShell();
} else {
    renderAuth();
}
