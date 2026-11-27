(() => {
const categories = [
  { name: 'Home', icon: '⌂', color: '#567a69', limit: 1900 },
  { name: 'Groceries', icon: '✳', color: '#d88b48', limit: 760 },
  { name: 'Utilities', icon: 'ϟ', color: '#7894b1', limit: 330 },
  { name: 'Transport', icon: '↗', color: '#9279a8', limit: 310 },
  { name: 'Dining', icon: '♧', color: '#d47d72', limit: 280 },
  { name: 'Health', icon: '✚', color: '#699b91', limit: 220 },
  { name: 'Kids', icon: '♡', color: '#d6ad55', limit: 290 },
  { name: 'Subscriptions', icon: '◉', color: '#8582ad', limit: 90 },
  { name: 'Personal', icon: '✿', color: '#b37b68', limit: 220 },
];

const seedTransactions = [
  { id:'n01',date:'2026-11-01',name:'Monthly rent',category:'Home',type:'expense',amount:1850,account:'Joint checking' },
  { id:'n02',date:'2026-11-01',name:'Jordan · salary',category:'Income',type:'income',amount:5200,account:'Joint checking' },
  { id:'n03',date:'2026-11-02',name:'Northside Market',category:'Groceries',type:'expense',amount:128.46,account:'Joint checking' },
  { id:'n04',date:'2026-11-03',name:'After-school club',category:'Kids',type:'expense',amount:68,account:'Joint checking' },
  { id:'n05',date:'2026-11-04',name:'Metro monthly pass',category:'Transport',type:'expense',amount:96,account:'Joint checking' },
  { id:'n06',date:'2026-11-05',name:'Electric · October',category:'Utilities',type:'expense',amount:84.21,account:'Joint checking' },
  { id:'n07',date:'2026-11-06',name:'Cedar & Rye',category:'Dining',type:'expense',amount:54.8,account:'Everyday card' },
  { id:'n08',date:'2026-11-07',name:'Willow Pharmacy',category:'Health',type:'expense',amount:32.17,account:'Everyday card' },
  { id:'n09',date:'2026-11-08',name:'Streamline + music',category:'Subscriptions',type:'expense',amount:31.98,account:'Everyday card' },
  { id:'n10',date:'2026-11-09',name:'Fresh Basket',category:'Groceries',type:'expense',amount:96.23,account:'Joint checking' },
  { id:'n11',date:'2026-11-10',name:'Sam · tutoring',category:'Kids',type:'expense',amount:45,account:'Joint checking' },
  { id:'n12',date:'2026-11-11',name:'Sam Lee · design work',category:'Income',type:'income',amount:940,account:'Joint checking' },
  { id:'n13',date:'2026-11-12',name:'Fuel & fill-up',category:'Transport',type:'expense',amount:62.4,account:'Everyday card' },
  { id:'n14',date:'2026-11-13',name:'Water & sewer',category:'Utilities',type:'expense',amount:48.5,account:'Joint checking' },
  { id:'n15',date:'2026-11-14',name:'Sunday Table',category:'Dining',type:'expense',amount:42.6,account:'Everyday card' },
  { id:'n16',date:'2026-11-15',name:'Market on 8th',category:'Groceries',type:'expense',amount:142.18,account:'Joint checking' },
  { id:'n17',date:'2026-11-16',name:'Mira · dance class',category:'Kids',type:'expense',amount:72,account:'Joint checking' },
  { id:'n18',date:'2026-11-17',name:'Home internet',category:'Utilities',type:'expense',amount:69.99,account:'Joint checking' },
  { id:'n19',date:'2026-11-18',name:'Corner deli lunch',category:'Dining',type:'expense',amount:28.35,account:'Everyday card' },
  { id:'n20',date:'2026-11-19',name:'Dr. Patel copay',category:'Health',type:'expense',amount:45,account:'Everyday card' },
  { id:'n21',date:'2026-11-20',name:'Cloud storage',category:'Subscriptions',type:'expense',amount:12.99,account:'Everyday card' },
  { id:'n22',date:'2026-11-21',name:'Grocer & Co.',category:'Groceries',type:'expense',amount:117.65,account:'Joint checking' },
  { id:'n23',date:'2026-11-22',name:'Bike tune-up',category:'Transport',type:'expense',amount:58,account:'Everyday card' },
  { id:'n24',date:'2026-11-23',name:'Little Pines books',category:'Kids',type:'expense',amount:38.5,account:'Everyday card' },
  { id:'n25',date:'2026-11-24',name:'Lunch with Maya',category:'Dining',type:'expense',amount:36.2,account:'Everyday card' },
  { id:'n26',date:'2026-11-25',name:'Parkside grocery',category:'Groceries',type:'expense',amount:88.74,account:'Joint checking' },
  { id:'n27',date:'2026-11-26',name:'Paper & Pine',category:'Personal',type:'expense',amount:46.8,account:'Everyday card' },
  { id:'o01',date:'2026-10-01',name:'Monthly rent',category:'Home',type:'expense',amount:1850,account:'Joint checking' },
  { id:'o02',date:'2026-10-01',name:'Jordan · salary',category:'Income',type:'income',amount:5200,account:'Joint checking' },
  { id:'o03',date:'2026-10-03',name:'Northside Market',category:'Groceries',type:'expense',amount:156.4,account:'Joint checking' },
  { id:'o04',date:'2026-10-06',name:'Electric · September',category:'Utilities',type:'expense',amount:91.72,account:'Joint checking' },
  { id:'o05',date:'2026-10-08',name:'Metro monthly pass',category:'Transport',type:'expense',amount:96,account:'Joint checking' },
  { id:'o06',date:'2026-10-10',name:'Sam · tutoring',category:'Kids',type:'expense',amount:45,account:'Joint checking' },
  { id:'o07',date:'2026-10-12',name:'Sam Lee · design work',category:'Income',type:'income',amount:780,account:'Joint checking' },
  { id:'o08',date:'2026-10-15',name:'Fresh Basket',category:'Groceries',type:'expense',amount:124.8,account:'Joint checking' },
  { id:'o09',date:'2026-10-17',name:'Water & sewer',category:'Utilities',type:'expense',amount:48.5,account:'Joint checking' },
  { id:'o10',date:'2026-10-20',name:'Willow Pharmacy',category:'Health',type:'expense',amount:58.25,account:'Everyday card' },
  { id:'o11',date:'2026-10-22',name:'Sunday Table',category:'Dining',type:'expense',amount:63.4,account:'Everyday card' },
  { id:'o12',date:'2026-10-25',name:'Market on 8th',category:'Groceries',type:'expense',amount:139.65,account:'Joint checking' },
  { id:'o13',date:'2026-10-28',name:'Home internet',category:'Utilities',type:'expense',amount:69.99,account:'Joint checking' },
  { id:'o14',date:'2026-10-30',name:'Autumn museum day',category:'Kids',type:'expense',amount:42,account:'Everyday card' },
];

const seedBudgets = Object.fromEntries(categories.map(({ name, limit }) => [name, limit]));

const seedBills = [
  { id:'b1',name:'Rent · Cedar Court',category:'Home',due:'2026-11-01',amount:1850,paid:true,method:'Joint checking' },
  { id:'b2',name:'City electric',category:'Utilities',due:'2026-11-14',amount:84.21,paid:true,method:'Auto-pay' },
  { id:'b3',name:'Home internet',category:'Utilities',due:'2026-11-18',amount:69.99,paid:false,method:'Joint checking' },
  { id:'b4',name:'Water & sewer',category:'Utilities',due:'2026-11-26',amount:48.5,paid:false,method:'Auto-pay' },
  { id:'b5',name:'Car insurance',category:'Transport',due:'2026-11-29',amount:118,paid:false,method:'Everyday card' },
  { id:'b6',name:'Family mobile plan',category:'Utilities',due:'2026-12-02',amount:92,paid:false,method:'Auto-pay' },
];

const seedGoals = [
  { id:'g1',name:'A little breathing room',purpose:'Emergency fund',saved:5400,target:12000,icon:'☼',color:'#577a68' },
  { id:'g2',name:'Coast & slow mornings',purpose:'Family getaway',saved:1840,target:3200,icon:'⌁',color:'#7394b0' },
  { id:'g3',name:'A dry roof overhead',purpose:'Home repairs',saved:2600,target:6000,icon:'⌂',color:'#d39b52' },
];

window.HearthData = { categories, seedTransactions, seedBudgets, seedBills, seedGoals };
})();
