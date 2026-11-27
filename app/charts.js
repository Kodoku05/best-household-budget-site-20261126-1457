(() => {
const { categories } = window.HearthData;

const money = (value) => `$${Math.round(value).toLocaleString('en-US')}`;

function categoryChart(transactions) {
  const spending = categories.map((category) => ({
    ...category,
    spent: transactions.filter((transaction) => transaction.type === 'expense' && transaction.category === category.name).reduce((sum, transaction) => sum + transaction.amount, 0),
  })).filter((item) => item.spent > 0).sort((a, b) => b.spent - a.spent);
  const total = spending.reduce((sum, item) => sum + item.spent, 0) || 1;
  const cx = 78, cy = 78, radius = 55, stroke = 17;
  let angle = -90;
  const arcs = spending.map((item) => {
    const sweep = item.spent / total * 359.6;
    const start = polar(cx, cy, radius, angle), end = polar(cx, cy, radius, angle + sweep);
    const large = sweep > 180 ? 1 : 0;
    const path = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
    angle += sweep;
    return `<path d="${path}" fill="none" stroke="${item.color}" stroke-width="${stroke}" stroke-linecap="round"><title>${item.name}: ${money(item.spent)}</title></path>`;
  }).join('');
  return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 156 156" role="img" aria-label="Spending by category, ${money(total)} total"><circle cx="78" cy="78" r="55" fill="none" stroke="#eeece5" stroke-width="17"/>${arcs}<text x="78" y="73" text-anchor="middle" class="donut-total">${money(total)}</text><text x="78" y="91" text-anchor="middle" class="donut-caption">spent so far</text></svg><div class="chart-legend">${spending.slice(0, 6).map((item) => `<div class="legend-row"><i style="--legend:${item.color}"></i><span>${item.name}</span><strong>${money(item.spent)}</strong></div>`).join('')}</div></div>`;
}

function reportChart(transactions, period) {
  const groups = period === 'month'
    ? ['Oct', 'Nov'].map((label, index) => {
      const month = ['2026-10', '2026-11'][index];
      const rows = transactions.filter((transaction) => transaction.date.startsWith(month));
      return { label, income: total(rows, 'income'), spent: total(rows, 'expense') };
    })
    : ['1–7', '8–14', '15–21', '22–28', '29–30'].map((label, index) => {
      const rows = transactions.filter((transaction) => {
        const day = Number(transaction.date.slice(-2));
        return day >= index * 7 + 1 && day <= (index === 4 ? 31 : index * 7 + 7);
      });
      return { label, income: total(rows, 'income'), spent: total(rows, 'expense') };
    });
  const max = Math.max(1, ...groups.flatMap((group) => [group.income, group.spent]));
  const width = 620, height = 206, left = 48, top = 18, baseline = 166, plotHeight = 130;
  const slot = (width - left - 20) / groups.length;
  const bars = groups.map((group, index) => {
    const x = left + slot * index + slot * .22;
    const barW = Math.min(period === 'month' ? 44 : 30, slot * .28);
    const incH = group.income / max * plotHeight, spendH = group.spent / max * plotHeight;
    return `<g><rect x="${x}" y="${baseline - incH}" width="${barW}" height="${incH}" rx="5" fill="#597c69"><title>${group.label} income ${money(group.income)}</title></rect><rect x="${x + barW + 6}" y="${baseline - spendH}" width="${barW}" height="${spendH}" rx="5" fill="#e3a46a"><title>${group.label} spending ${money(group.spent)}</title></rect><text x="${x + barW + 3}" y="193" text-anchor="middle" class="axis-label">${group.label}</text></g>`;
  }).join('');
  const grid = [0, .5, 1].map((fraction) => {
    const y = baseline - fraction * plotHeight;
    return `<g><line x1="${left}" x2="${width - 10}" y1="${y}" y2="${y}" stroke="#eae8e1" stroke-dasharray="3 5"/><text x="${left - 8}" y="${y + 4}" text-anchor="end" class="axis-label">${money(max * fraction)}</text></g>`;
  }).join('');
  return `<svg class="report-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Income and spending comparison by ${period}">${grid}${bars}</svg>`;
}

function categoryRows(transactions, budgets) {
  const totalSpent = total(transactions, 'expense') || 1;
  return categories.map((category) => {
    const spent = transactions.filter((transaction) => transaction.type === 'expense' && transaction.category === category.name).reduce((sum, transaction) => sum + transaction.amount, 0);
    return { ...category, spent, budget: Number(budgets[category.name] ?? category.limit), percent: spent / totalSpent * 100 };
  }).filter((category) => category.spent > 0).sort((a, b) => b.spent - a.spent);
}

function total(transactions, type) {
  return transactions.filter((transaction) => transaction.type === type).reduce((sum, transaction) => sum + transaction.amount, 0);
}

function polar(cx, cy, radius, degrees) {
  const radians = (degrees - 90) * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

window.HearthCharts = { categoryChart, reportChart, categoryRows };
})();
