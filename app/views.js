(() => {
const { categories } = window.HearthData;
const { categoryChart, reportChart, categoryRows } = window.HearthCharts;
const { transactionsForMonth } = window.HearthStore;

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const pageNames = { dashboard:'Overview', transactions:'Transactions', budgets:'Budgets', bills:'Bills', goals:'Savings goals', reports:'Reports' };
const iconMap = Object.fromEntries(categories.map((category) => [category.name, category]));

function getPageName(page) { return pageNames[page] || pageNames.dashboard; }

function renderPage(page, state, filters = {}, period = 'week') {
  const transactions = transactionsForMonth(state.month).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const income = sum(transactions, 'income');
  const spending = sum(transactions, 'expense');
  const net = income - spending;
  const content = {
    dashboard: () => dashboard(state, transactions, income, spending, net),
    transactions: () => transactionPage(state, transactions, filters),
    budgets: () => budgetsPage(state, transactions),
    bills: () => billsPage(state),
    goals: () => goalsPage(state),
    reports: () => reportsPage(state, transactions, income, spending, period),
  }[page] || (() => dashboard(state, transactions, income, spending, net));
  return `<div class="page-heading"><div><div class="eyebrow">${page === 'dashboard' ? 'YOUR MONTH AT HOME' : 'HOUSEHOLD MONEY · ' + monthLabel(state.month).toUpperCase()}</div><h1>${page === 'dashboard' ? 'Room to breathe.' : getPageName(page)}</h1><p class="page-subtitle">${headingNote(page, state.month)}</p></div>${page === 'transactions' ? '<div class="heading-mark">✳ <span>Every little thing, in view.</span></div>' : ''}</div>${content()}`;
}

function dashboard(state, transactions, income, spending, net) {
  const rate = income ? net / income * 100 : 0;
  const monthBills = state.bills.filter((bill) => !bill.paid && bill.due.startsWith(state.month)).sort((a, b) => a.due.localeCompare(b.due));
  const budgets = categoryRows(transactions, state.budgets).sort((a,b) => b.spent / b.budget - a.spent / a.budget);
  const goals = state.goals.slice(0, 3);
  const recent = transactions.slice(0, 5);
  return `<section class="metric-grid" aria-label="Monthly totals">
    ${metricCard('Income', currency.format(income), '↗', 'inflow', `${transactions.filter((t) => t.type === 'income').length} income deposits`, 'mint')}
    ${metricCard('Spent so far', currency.format(spending), '↘', 'outflow', `Across ${new Set(transactions.filter((t) => t.type === 'expense').map((t) => t.category)).size} categories`, 'peach')}
    ${metricCard('Left to plan', currency.format(net), '＝', 'available', net >= 0 ? 'Income minus this month’s spending' : 'Spending is above income', net >= 0 ? 'lavender' : 'rose')}
    ${metricCard('Savings rate', `${rate.toFixed(0)}%`, '◎', 'of income', 'Net income after spending', 'sand')}
  </section>
  <section class="content-grid dash-grid">
    <article class="panel spending-panel"><div class="panel-heading"><div><h2>Where it’s going</h2><p>Your spending by category</p></div><a class="text-link" href="#reports">Full report <span>↗</span></a></div>${categoryChart(transactions)}<div class="panel-bottomline"><span><i></i> ${transactions.filter((t) => t.type === 'expense').length} purchases this month</span><strong>${currency.format(spending)} total</strong></div></article>
    <article class="panel budget-snapshot"><div class="panel-heading"><div><h2>Budget pulse</h2><p>A quick check on your plan</p></div><a class="text-link" href="#budgets">All budgets <span>↗</span></a></div><div class="mini-budgets">${budgets.slice(0, 3).map((item) => miniBudget(item)).join('')}</div><div class="snapshot-foot"><span>${budgets.filter((item) => item.spent > item.budget).length ? `${budgets.filter((item) => item.spent > item.budget).length} category over plan` : 'All categories within plan'}</span><span class="pulse-dot"></span></div></article>
    <article class="panel bills-snapshot"><div class="panel-heading"><div><h2>Coming up</h2><p>Unpaid bills to keep in mind</p></div><a class="text-link" href="#bills">Bill calendar <span>↗</span></a></div>${monthBills.length ? `<div class="bill-preview-list">${monthBills.slice(0, 2).map((bill) => billPreview(bill, state.month)).join('')}</div><div class="bills-total"><span>${monthBills.length} still to pay</span><strong>${currency.format(monthBills.reduce((sum,bill) => sum + bill.amount,0))}</strong></div>` : '<div class="empty-inline">You’re all caught up on bills this month.</div>'}</article>
    <article class="panel goals-snapshot"><div class="panel-heading"><div><h2>Saving for</h2><p>Good things, one month at a time</p></div><a class="text-link" href="#goals">Your goals <span>↗</span></a></div><div class="mini-goal-list">${goals.map((goal) => miniGoal(goal)).join('')}</div></article>
    <article class="panel recent-panel"><div class="panel-heading"><div><h2>Just happened</h2><p>Your latest money moves</p></div><a class="text-link" href="#transactions">All activity <span>↗</span></a></div><div class="recent-list">${recent.map((transaction) => compactTransaction(transaction)).join('')}</div></article>
  </section>`;
}

function transactionPage(state, transactions, filters) {
  const search = filters.search || '';
  const category = filters.category || 'all';
  const type = filters.type || 'all';
  const shown = transactions.filter((transaction) => {
    const text = `${transaction.name} ${transaction.category} ${transaction.account}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (category === 'all' || transaction.category === category) && (type === 'all' || transaction.type === type);
  });
  return `<section class="summary-strip"><div><span>Income</span><strong class="positive">${cents.format(sum(transactions,'income'))}</strong></div><div><span>Spent</span><strong>${cents.format(sum(transactions,'expense'))}</strong></div><div><span>Entries</span><strong>${transactions.length}</strong></div><div class="strip-caption">${monthLabel(state.month)} activity</div></section>
    <details class="add-panel"><summary><span class="plus-circle">＋</span><span><strong>Add a transaction</strong><small>Record income or a household purchase</small></span><span class="add-chevron">⌄</span></summary><form id="add-transaction-form" class="transaction-form"><label>Description<input name="name" maxlength="64" placeholder="e.g. Weekly market shop" required></label><label>Amount<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></label><label>Type<select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Category<select name="category">${categories.map((item) => `<option>${item.name}</option>`).join('')}<option>Income</option></select></label><label>Date<input name="date" type="date" value="${state.month}-27" required></label><button type="submit" class="primary-button">Save transaction <span>→</span></button></form></details>
    <section class="panel table-panel"><div class="table-toolbar"><div><h2>All transactions</h2><p>${shown.length} of ${transactions.length} entries · newest first</p></div><div class="filters"><label class="search-field"><span>⌕</span><input id="transaction-search" type="search" placeholder="Search activity" value="${escapeHtml(search)}" aria-label="Search transactions"></label><select id="category-filter" aria-label="Filter by category"><option value="all">All categories</option>${categories.map((item) => `<option value="${item.name}" ${category===item.name?'selected':''}>${item.name}</option>`).join('')}<option value="Income" ${category==='Income'?'selected':''}>Income</option></select><select id="type-filter" aria-label="Filter transaction type"><option value="all" ${type==='all'?'selected':''}>All types</option><option value="income" ${type==='income'?'selected':''}>Income</option><option value="expense" ${type==='expense'?'selected':''}>Expense</option></select></div></div><div class="table-wrap"><table><thead><tr><th>DESCRIPTION</th><th>DATE</th><th>CATEGORY</th><th>ACCOUNT</th><th class="amount-cell">AMOUNT</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${shown.length ? shown.map((transaction) => transactionRow(transaction)).join('') : '<tr><td colspan="6" class="no-results">No transactions match these filters.</td></tr>'}</tbody></table></div></section>`;
}

function budgetsPage(state, transactions) {
  const rows = categoryRows(transactions, state.budgets);
  return `<section class="budget-intro"><div class="intro-icon">▤</div><div><strong>${currency.format(rows.reduce((sum,item) => sum + item.spent,0))} of ${currency.format(Object.values(state.budgets).reduce((sum,value) => sum + Number(value),0))} planned</strong><p>Monthly limits give every dollar a place to go. Change any limit to fit this month.</p></div><div class="plan-remaining"><span>Available</span><strong>${currency.format(Object.values(state.budgets).reduce((sum,value) => sum + Number(value),0)-rows.reduce((sum,item) => sum + item.spent,0))}</strong></div></section><section class="budget-grid">${categories.map((category) => budgetCard(category, rows.find((item) => item.name===category.name), state.budgets[category.name] ?? category.limit)).join('')}</section><div class="budget-tip"><span>✳</span><p><strong>A helpful check-in:</strong> A budget is a guide, not a grade. Adjust your plan when the month changes.</p></div>`;
}

function billsPage(state) {
  const bills = [...state.bills].sort((a,b) => a.due.localeCompare(b.due));
  const unpaid = bills.filter((bill) => !bill.paid);
  const overdue = unpaid.filter((bill) => bill.due < '2026-11-27');
  const dueSoon = unpaid.filter((bill) => bill.due >= '2026-11-27' && bill.due <= '2026-12-04');
  return `<section class="metric-grid bill-metrics">${metricCard('Still to pay',currency.format(unpaid.reduce((sum,bill) => sum + bill.amount,0)),'◷','across all listed bills',`${unpaid.length} open payments`,'peach')}${metricCard('Past due',String(overdue.length),'!','needs a quick check',overdue.length ? `${currency.format(overdue.reduce((sum,bill) => sum + bill.amount,0))} overdue` : 'Nothing overdue','rose')}${metricCard('Due this week',currency.format(dueSoon.reduce((sum,bill) => sum + bill.amount,0)),'↗','by Dec 4',`${dueSoon.length} upcoming payments`,'mint')}${metricCard('Paid this month',currency.format(bills.filter((bill) => bill.paid && bill.due.startsWith(state.month)).reduce((sum,bill) => sum + bill.amount,0)),'✓','already taken care of','Payments marked paid','sand')}</section><section class="panel bills-panel"><div class="panel-heading"><div><h2>Bill calendar</h2><p>Mark each bill paid to update your upcoming list</p></div><span class="bill-month-label">NOV — DEC 2026</span></div><div class="bill-list">${bills.map((bill) => billRow(bill)).join('')}</div></section><div class="billing-note"><span>⌁</span><span>Bill reminders are saved on this device. Check your provider’s due date before scheduling a payment.</span></div>`;
}

function goalsPage(state) {
  const saved = state.goals.reduce((sum,goal) => sum + goal.saved,0);
  const target = state.goals.reduce((sum,goal) => sum + goal.target,0);
  return `<section class="goal-overview"><div class="goal-orbit">◎</div><div><span>THE FUTURE YOU’RE BUILDING</span><strong>${currency.format(saved)} <small>saved of ${currency.format(target)}</small></strong><div class="goal-overview-track"><i style="width:${Math.min(100,saved/target*100)}%"></i></div></div><div class="goal-count">${state.goals.length}<span>active goals</span></div></section><section class="goal-grid">${state.goals.map((goal) => goalCard(goal)).join('')}</section><div class="goal-note"><span>✳</span><div><strong>Progress over perfection</strong><p>Even a small contribution moves your household closer to a safer, more joyful next chapter.</p></div></div>`;
}

function reportsPage(state, transactions, income, spending, period) {
  const rows = categoryRows(transactions, state.budgets);
  const net = income-spending;
  return `<section class="report-topline"><div><span>NET THIS MONTH</span><strong class="${net>=0?'positive':''}">${currency.format(net)}</strong></div><div><span>SPENDING SHARE</span><strong>${income ? (spending/income*100).toFixed(0) : 0}% <small>of income</small></strong></div><div><span>BIGGEST CATEGORY</span><strong>${rows[0]?.name || '—'} <small>${currency.format(rows[0]?.spent || 0)}</small></strong></div></section><section class="panel report-panel"><div class="panel-heading"><div><h2>Income & spending</h2><p>See what came in alongside what went out</p></div><label class="period-select"><span class="sr-only">Chart time period</span><select id="report-period"><option value="week" ${period==='week'?'selected':''}>By week · November</option><option value="month" ${period==='month'?'selected':''}>By month · Oct & Nov</option></select></label></div><div class="chart-key"><span><i class="key-income"></i>Income</span><span><i class="key-spending"></i>Spending</span></div>${reportChart(period === 'week' ? transactions : state.transactions,period)}</section><section class="panel breakdown-panel"><div class="panel-heading"><div><h2>Spending breakdown</h2><p>${currency.format(spending)} spread across ${rows.length} categories</p></div><span class="breakdown-caption">% OF SPENDING</span></div><div class="breakdown-list">${rows.map((item) => `<div class="breakdown-row"><span class="cat-glyph" style="--cat:${item.color}">${item.icon}</span><strong>${item.name}</strong><div class="breakdown-track"><i style="width:${item.percent}%;--cat:${item.color}"></i></div><span>${item.percent.toFixed(1)}%</span><strong>${cents.format(item.spent)}</strong></div>`).join('')}</div></section>`;
}

function metricCard(label, value, symbol, sublabel, detail, tone) {
  return `<article class="metric-card tone-${tone}"><div class="metric-top"><span>${label}</span><i>${symbol}</i></div><strong class="metric-value">${value}</strong><div class="metric-bottom"><span>${sublabel}</span><span>${detail}</span></div></article>`;
}

function miniBudget(item) {
  const percent = item.budget ? item.spent / item.budget * 100 : item.spent ? 100 : 0;
  return `<div class="mini-budget"><div class="mini-budget-top"><span class="cat-glyph" style="--cat:${item.color}">${item.icon}</span><strong>${item.name}</strong><span class="mini-budget-total">${currency.format(item.spent)} <i>/</i> ${currency.format(item.budget)}</span></div><div class="progress-track"><i style="width:${Math.min(percent,100)}%;--bar:${item.color}"></i></div></div>`;
}

function miniGoal(goal) {
  const pct = Math.min(100,goal.saved/goal.target*100);
  return `<div class="mini-goal"><span class="goal-glyph" style="--goal:${goal.color}">${goal.icon}</span><div class="mini-goal-main"><div><strong>${goal.name}</strong><span>${pct.toFixed(0)}%</span></div><div class="progress-track"><i style="width:${pct}%;--bar:${goal.color}"></i></div><small>${currency.format(goal.saved)} of ${currency.format(goal.target)}</small></div></div>`;
}

function billPreview(bill, month) {
  const overdue = bill.due < '2026-11-27';
  return `<div class="bill-preview"><span class="bill-date ${overdue?'late':''}"><strong>${new Date(`${bill.due}T12:00:00`).getDate()}</strong><small>${new Date(`${bill.due}T12:00:00`).toLocaleString('en-US',{month:'short'}).toUpperCase()}</small></span><span class="bill-name"><strong>${escapeHtml(bill.name)}</strong><small>${overdue?'Past due':`Due ${shortDate(bill.due)}`}</small></span><strong>${currency.format(bill.amount)}</strong></div>`;
}

function compactTransaction(transaction) {
  const category = iconMap[transaction.category];
  return `<div class="compact-transaction"><span class="cat-glyph" style="--cat:${category?.color || '#597c69'}">${category?.icon || '↗'}</span><span class="compact-name"><strong>${escapeHtml(transaction.name)}</strong><small>${transaction.category} · ${shortDate(transaction.date)}</small></span><strong class="${transaction.type==='income'?'positive':''}">${transaction.type==='income'?'+':'−'}${currency.format(transaction.amount)}</strong></div>`;
}

function transactionRow(transaction) {
  const category = iconMap[transaction.category];
  return `<tr><td><span class="transaction-title"><span class="cat-glyph" style="--cat:${category?.color || '#597c69'}">${category?.icon || '↗'}</span><strong>${escapeHtml(transaction.name)}</strong></span></td><td>${shortDate(transaction.date)}</td><td><span class="category-pill" style="--cat:${category?.color || '#597c69'}">${escapeHtml(transaction.category)}</span></td><td class="account-cell">${escapeHtml(transaction.account)}</td><td class="amount-cell ${transaction.type==='income'?'positive':''}">${transaction.type==='income'?'+':'−'}${cents.format(transaction.amount)}</td><td><button class="delete-row" type="button" data-delete="${escapeHtml(transaction.id)}" aria-label="Delete ${escapeHtml(transaction.name)}">×</button></td></tr>`;
}

function budgetCard(category, row, limit) {
  const spent = row?.spent || 0;
  const pct = limit ? spent / limit * 100 : spent ? 100 : 0;
  const over = spent > limit;
  const near = !over && pct >= 80;
  const remaining = limit - spent;
  const tone = over ? 'over' : near ? 'near' : 'okay';
  const status = over ? `${currency.format(-remaining)} over plan` : `${currency.format(remaining)} left`;
  return `<article class="budget-card"><div class="budget-card-head"><span class="budget-icon" style="--cat:${category.color}">${category.icon}</span><div><h2>${category.name}</h2><span>${over?'Over plan':near?'Getting close':'On track'}</span></div><span class="budget-status ${tone}">${status}</span></div><div class="budget-amounts"><strong>${cents.format(spent)} <small>spent</small></strong><span>of <strong>${cents.format(Number(limit)||0)}</strong></span></div><div class="budget-track"><i class="${tone}" style="width:${Math.min(100,pct)}%;--bar:${category.color}"></i></div><form class="budget-edit" data-budget="${category.name}"><label>Monthly limit <span>$</span><input type="number" min="0" step="10" name="limit" value="${Number(limit)||0}" aria-label="${category.name} monthly budget limit"></label><button type="submit">Update limit <span>→</span></button></form></article>`;
}

function billRow(bill) {
  const date = new Date(`${bill.due}T12:00:00`);
  const overdue = !bill.paid && bill.due < '2026-11-27';
  const status = bill.paid ? 'Paid' : overdue ? 'Past due' : 'Upcoming';
  const cat = iconMap[bill.category];
  return `<article class="bill-row ${bill.paid?'is-paid':''}"><div class="bill-calendar-date ${overdue?'late':''} ${bill.paid?'done':''}"><strong>${String(date.getDate()).padStart(2,'0')}</strong><span>${date.toLocaleString('en-US',{month:'short'}).toUpperCase()}</span></div><div class="bill-row-name"><strong>${escapeHtml(bill.name)}</strong><span><i style="--cat:${cat?.color || '#597c69'}">${cat?.icon || '▤'}</i>${bill.category} <b>·</b> ${escapeHtml(bill.method)}</span></div><div class="bill-row-status"><i class="status-dot ${bill.paid?'paid':overdue?'overdue':''}"></i><span>${status}</span></div><strong class="bill-amount">${cents.format(bill.amount)}</strong><button type="button" class="bill-toggle ${bill.paid?'paid-toggle':''}" data-bill="${bill.id}">${bill.paid?'✓ Paid':'Mark paid'}</button></article>`;
}

function goalCard(goal) {
  const pct = Math.min(100,goal.saved/goal.target*100);
  const remaining = Math.max(0,goal.target-goal.saved);
  return `<article class="goal-card"><div class="goal-card-head"><span class="goal-large-icon" style="--goal:${goal.color}">${goal.icon}</span><span class="goal-pct">${pct.toFixed(0)}% there</span></div><h2>${escapeHtml(goal.name)}</h2><p>${escapeHtml(goal.purpose)}</p><div class="goal-progress-label"><span>Saved so far</span><strong>${cents.format(goal.saved)}</strong></div><div class="goal-progress-track"><i style="width:${pct}%;--goal:${goal.color}"></i></div><div class="goal-target-line"><span>Goal ${currency.format(goal.target)}</span><span>${currency.format(remaining)} to go</span></div>${remaining ? `<form class="contribute-form" data-goal="${goal.id}"><label><span>＋</span><input aria-label="Contribution to ${escapeHtml(goal.name)}" name="amount" type="number" min="1" step="1" placeholder="Add contribution" required><span class="input-dollar">$</span></label><button type="submit">Add <span>→</span></button></form>` : '<div class="goal-complete">✳ Goal reached — well done!</div>'}</article>`;
}

function monthLabel(month) { return new Date(`${month}-15T12:00:00`).toLocaleString('en-US',{month:'long',year:'numeric'}); }
function shortDate(value) { return new Date(`${value}T12:00:00`).toLocaleString('en-US',{month:'short',day:'numeric'}); }
function sum(transactions,type) { return transactions.filter((transaction) => transaction.type === type).reduce((total,transaction) => total + Number(transaction.amount),0); }
function headingNote(page,month) {
  const notes = { dashboard:`${monthLabel(month)} · The Morrow household, finding its rhythm.`, transactions:'Every deposit and purchase, in one friendly place.', budgets:'A flexible plan for the things that make a home.', bills:'Know what’s paid, what’s next, and what needs a nudge.', goals:'Make space for the future, a little at a time.', reports:'A clearer picture of where your household money goes.' };
  return notes[page] || notes.dashboard;
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[character]); }

window.HearthViews = { renderPage, getPageName };
})();
