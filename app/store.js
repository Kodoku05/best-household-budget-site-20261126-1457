(() => {
const { seedTransactions, seedBudgets, seedBills, seedGoals } = window.HearthData;

const STORAGE_KEY = 'hearth-ledger-v1';

function freshState() {
  return {
    transactions: structuredClone(seedTransactions), budgets: structuredClone(seedBudgets),
    bills: structuredClone(seedBills), goals: structuredClone(seedGoals), month: '2026-11',
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.transactions) && saved.budgets && Array.isArray(saved.bills) && Array.isArray(saved.goals)) {
      return { ...freshState(), ...saved };
    }
  } catch { /* A damaged local copy should never stop the demo from opening. */ }
  return freshState();
}

let state = loadState();
const listeners = new Set();

function getState() { return state; }

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener(state));
}

function transactionsForMonth(month = state.month) {
  return state.transactions.filter((transaction) => transaction.date.slice(0, 7) === month);
}

function setMonth(month) {
  state.month = month;
  save();
}

function addTransaction(transaction) {
  state.transactions.unshift({ ...transaction, id: `new-${Date.now()}` });
  save();
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
  save();
}

function setBudget(category, limit) {
  state.budgets[category] = Math.max(0, Number(limit) || 0);
  save();
}

function toggleBill(id) {
  state.bills = state.bills.map((bill) => bill.id === id ? { ...bill, paid: !bill.paid } : bill);
  save();
}

function addContribution(id, amount) {
  state.goals = state.goals.map((goal) => goal.id === id ? { ...goal, saved: Math.min(goal.target, goal.saved + amount) } : goal);
  save();
}

function resetData() {
  state = freshState();
  save();
}

window.HearthStore = { getState, subscribe, transactionsForMonth, setMonth, addTransaction, deleteTransaction, setBudget, toggleBill, addContribution, resetData };
})();
