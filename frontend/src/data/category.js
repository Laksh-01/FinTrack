export const defaultCategories = [
  // Income Categories
  {
    id: "salary",
    name: "Salary",
    type: "INCOME",
    color: "#22c55e", // green-500
    icon: "Wallet",
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "INCOME",
    color: "#06b6d4", // cyan-500
    icon: "Laptop",
  },
  // {
  //   id: "investments",
  //   name: "Investments",
  //   type: "INCOME",
  //   color: "#6366f1", // indigo-500
  //   icon: "TrendingUp",
  // },
  {
    id: "business",
    name: "Business",
    type: "INCOME",
    color: "#ec4899", // pink-500
    icon: "Building",
  },
  {
    id: "rental",
    name: "Rental",
    type: "INCOME",
    color: "#f59e0b", // amber-500
    icon: "Home",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#64748b", // slate-500
    icon: "Plus",
  },

  // Expense Categories
  {
    id: "housing",
    name: "Housing",
    type: "EXPENSE",
    color: "#ef4444", // red-500
    icon: "Home",
    subcategories: ["Rent", "Mortgage", "Property Tax", "Maintenance"],
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "EXPENSE",
    color: "#f97316", // orange-500
    icon: "Car",
    subcategories: ["Fuel", "Public Transport", "Maintenance", "Parking"],
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "EXPENSE",
    color: "#84cc16", // lime-500
    icon: "Shopping",
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#06b6d4", // cyan-500
    icon: "Zap",
    subcategories: ["Electricity", "Water", "Gas", "Internet", "Phone"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    color: "#8b5cf6", // violet-500
    icon: "Film",
    subcategories: ["Movies", "Games", "Streaming Services"],
  },
  {
    id: "food",
    name: "Food",
    type: "EXPENSE",
    color: "#f43f5e", // rose-500
    icon: "UtensilsCrossed",
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "EXPENSE",
    color: "#ec4899", // pink-500
    icon: "ShoppingBag",
    subcategories: ["Clothing", "Electronics", "Home Goods"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    type: "EXPENSE",
    color: "#14b8a6", // teal-500
    icon: "HeartPulse",
    subcategories: ["Medical", "Dental", "Pharmacy", "Insurance"],
  },
  {
    id: "education",
    name: "Education",
    type: "EXPENSE",
    color: "#6366f1", // indigo-500
    icon: "GraduationCap",
    subcategories: ["Tuition", "Books", "Courses"],
  },
  {
    id: "personal",
    name: "Personal Care",
    type: "EXPENSE",
    color: "#d946ef", // fuchsia-500
    icon: "Smile",
    subcategories: ["Haircut", "Gym", "Beauty"],
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#0ea5e9", // sky-500
    icon: "Plane",
  },
  {
    id: "insurance",
    name: "Insurance",
    type: "EXPENSE",
    color: "#64748b", // slate-500
    icon: "Shield",
    subcategories: ["Life", "Home", "Vehicle"],
  },
  {
    id: "gifts",
    name: "Gifts & Donations",
    type: "EXPENSE",
    color: "#f472b6", // pink-400
    icon: "Gift",
  },
  {
    id: "bills",
    name: "Bills & Fees",
    type: "EXPENSE",
    color: "#fb7185", // rose-400
    icon: "Receipt",
    subcategories: ["Bank Fees", "Late Fees", "Service Charges"],
  },
  {
    id: "other-expense",
    name: "Other Expenses",
    type: "EXPENSE",
    color: "#94a3b8", // slate-400
    icon: "MoreHorizontal",
  },

  //INVESTMENTS 
//   {
//   id: "Investments",
//   name: "Investments",
//   type: "INVES",
//   color: "#6366f1", // indigo-500
//   icon: "TrendingUp",
// },
{
  id: "fd",
  name: "Fixed Deposit (FD)",
  type: "INVESTMENTS",
  color: "#4ade80", // green-400
  icon: "Banknote",
},
{
  id: "rd",
  name: "Recurring Deposit (RD)",
  type: "INVESTMENTS",
  color: "#34d399", // emerald-400
  icon: "Clock",
},
{
  id: "mutual-funds",
  name: "Mutual Funds",
  type: "INVESTMENTS",
  color: "#60a5fa", // blue-400
  icon: "PieChart",
},
{
  id: "stocks",
  name: "Stocks",
  type: "INVESTMENTS",
  color: "#818cf8", // indigo-400
  icon: "LineChart",
},
{
  id: "bonds",
  name: "Bonds",
  type: "INVESTMENTS",
  color: "#a78bfa", // violet-400
  icon: "Link",
},
{
  id: "index-funds",
  name: "Index Funds",
  type: "INVESTMENTS",
  color: "#facc15", // yellow-400
  icon: "BarChart",
},
{
  id: "etfs",
  name: "Exchange-Traded Funds (ETFs)",
  type: "INVESTMENTS",
  color: "#fcd34d", // amber-300
  icon: "Layers",
},
{
  id: "reits",
  name: "REITs",
  type: "INVESTMENTS",
  color: "#f97316", // orange-400
  icon: "Building2",
},
{
  id: "crypto",
  name: "Cryptocurrencies",
  type: "INVESTMENTS",
  color: "#10b981", // teal-500
  icon: "Bitcoin",
},
{
  id: "commodities",
  name: "Commodities (Gold, Oil, etc.)",
  type: "INVESTMENTS",
  color: "#eab308", // amber-500
  icon: "Gem",
},
{
  id: "gov-schemes",
  name: "Government Schemes",
  type: "INVESTMENTS",
  color: "#3b82f6", // blue-500
  icon: "Flag",
},
{
  id: "p2p",
  name: "Peer-to-Peer Lending",
  type: "INVESTMENTS",
  color: "#c084fc", // purple-400
  icon: "Users",
},
{
  id: "vc",
  name: "Venture Capital",
  type: "INVESTMENTS",
  color: "#ec4899", // pink-500
  icon: "Rocket",
},
{
  id: "private-equity",
  name: "Private Equity",
  type: "INVESTMENTS",
  color: "#a3e635", // lime-400
  icon: "Briefcase",
},
{
  id: "annuities",
  name: "Annuities",
  type: "INVESTMENTS",
  color: "#fb923c", // orange-400
  icon: "Coins",
},
{
  id: "derivatives",
  name: "Derivatives (Options, Futures)",
  type: "INVESTMENTS",
  color: "#facc15", // yellow-400
  icon: "Shuffle",
},
{
  id: "forex",
  name: "Foreign Exchange (Forex)",
  type: "INVESTMENTS",
  color: "#38bdf8", // sky-400
  icon: "Globe",
}



];

export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});