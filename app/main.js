(() => {
const { getState, subscribe, setMonth, addTransaction, deleteTransaction, setBudget, toggleBill, addContribution, resetData } = window.HearthStore;
const { renderPage, getPageName } = window.HearthViews;

const content = document.querySelector('#page-content');
const crumb = document.querySelector('#crumb-page');
const monthSelect = document.querySelector('#month-select');
let page = routePage();
let filters = { search: '', category: 'all', type: 'all' };
let reportPeriod = 'week';

function routePage() {
  const value = location.hash.replace(/^#/, '').split('?')[0];
  return ['dashboard','transactions','budgets','bills','goals','reports'].includes(value) ? value : 'dashboard';
}

function render() {
  const state = getState();
  page = routePage();
  content.innerHTML = renderPage(page, state, filters, reportPeriod);
  crumb.textContent = getPageName(page);
  document.querySelectorAll('[data-page]').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
  monthSelect.value = state.month;
  document.querySelector('#bill-count').textContent = state.bills.filter((bill) => !bill.paid).length;
  bindPageEvents();
}

function bindPageEvents() {
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => {
    if (window.confirm('Delete this transaction?')) deleteTransaction(button.dataset.delete);
  }));
  document.querySelector('#transaction-search')?.addEventListener('input', (event) => { filters.search = event.target.value; render(); focusSearch(); });
  document.querySelector('#category-filter')?.addEventListener('change', (event) => { filters.category = event.target.value; render(); });
  document.querySelector('#type-filter')?.addEventListener('change', (event) => { filters.type = event.target.value; render(); });
  document.querySelector('#report-period')?.addEventListener('change', (event) => { reportPeriod = event.target.value; render(); });
  document.querySelector('#add-transaction-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addTransaction({ name: form.get('name'), amount: Number(form.get('amount')), type: form.get('type'), category: form.get('type') === 'income' ? 'Income' : form.get('category'), date: form.get('date'), account: 'Joint checking' });
  });
  document.querySelectorAll('.budget-edit').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    setBudget(form.dataset.budget, new FormData(form).get('limit'));
  }));
  document.querySelectorAll('[data-bill]').forEach((button) => button.addEventListener('click', () => toggleBill(button.dataset.bill)));
  document.querySelectorAll('.contribute-form').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    addContribution(form.dataset.goal, Number(new FormData(form).get('amount')) || 0);
  }));
}

function focusSearch() {
  const input = document.querySelector('#transaction-search');
  if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
}

window.addEventListener('hashchange', () => { filters = { search: '', category: 'all', type: 'all' }; render(); });
monthSelect.addEventListener('change', (event) => setMonth(event.target.value));
document.querySelector('#reset-demo').addEventListener('click', () => { if (window.confirm('Restore the original demo data?')) resetData(); });
subscribe(render);
render();
})();
