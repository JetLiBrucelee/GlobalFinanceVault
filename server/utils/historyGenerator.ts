/**
 * Synthetic transaction history generator.
 * Produces ~15-20 realistic completed transactions per calendar month,
 * spanning January 2024 through the current month.
 */

// ── Data pools ─────────────────────────────────────────────────────────────

const DEBIT_CARD_MERCHANTS = [
  { name: "Walmart Supercenter #4821", category: "Grocery" },
  { name: "Kroger #0441", category: "Grocery" },
  { name: "Whole Foods Market", category: "Grocery" },
  { name: "Costco Wholesale #0592", category: "Grocery" },
  { name: "Target Store #2819", category: "Retail" },
  { name: "Amazon.com Purchase", category: "Online" },
  { name: "Apple.com/bill", category: "Online" },
  { name: "Netflix.com", category: "Subscription" },
  { name: "Spotify USA", category: "Subscription" },
  { name: "Hulu LLC", category: "Subscription" },
  { name: "Shell Oil Station #7714", category: "Gas" },
  { name: "ExxonMobil #5523", category: "Gas" },
  { name: "Chevron Station #9102", category: "Gas" },
  { name: "BP Gas #4401", category: "Gas" },
  { name: "CVS Pharmacy #3342", category: "Health" },
  { name: "Walgreens #0882", category: "Health" },
  { name: "McDonald's #2219", category: "Dining" },
  { name: "Starbucks #3901", category: "Dining" },
  { name: "Chipotle Mexican Grill", category: "Dining" },
  { name: "Panera Bread #7721", category: "Dining" },
  { name: "Chick-fil-A #1104", category: "Dining" },
  { name: "Subway #8812", category: "Dining" },
  { name: "Domino's Pizza", category: "Dining" },
  { name: "Uber Eats", category: "Dining" },
  { name: "DoorDash", category: "Dining" },
  { name: "Home Depot #6612", category: "Home" },
  { name: "Lowe's #0771", category: "Home" },
  { name: "IKEA USA", category: "Home" },
  { name: "Best Buy #2244", category: "Electronics" },
  { name: "Nike.com", category: "Clothing" },
  { name: "H&M USA", category: "Clothing" },
  { name: "TJ Maxx #0334", category: "Clothing" },
  { name: "Macy's #1127", category: "Clothing" },
  { name: "Uber Technologies", category: "Transport" },
  { name: "Lyft Inc.", category: "Transport" },
  { name: "Planet Fitness #4418", category: "Fitness" },
  { name: "LA Fitness", category: "Fitness" },
];

const ATM_BANKS = [
  { bank: "Chase Bank", routing: "021000021" },
  { bank: "Bank of America", routing: "026009593" },
  { bank: "Wells Fargo Bank", routing: "121042882" },
  { bank: "Citibank", routing: "021000089" },
  { bank: "US Bancorp", routing: "091000022" },
  { bank: "TD Bank", routing: "031101266" },
  { bank: "Capital One", routing: "051405515" },
  { bank: "PNC Bank", routing: "031000053" },
  { bank: "Regions Bank", routing: "062000019" },
  { bank: "Truist Bank", routing: "053101121" },
];

const WIRE_COUNTERPARTIES = [
  { name: "Morgan Stanley Wealth Mgmt", bank: "Morgan Stanley Bank NA", routing: "121193892", accountPrefix: "4782" },
  { name: "Fidelity Investments LLC", bank: "Fidelity Brokerage Services", routing: "011500120", accountPrefix: "3891" },
  { name: "Vanguard Group Inc", bank: "Valley National Bank", routing: "021201383", accountPrefix: "5012" },
  { name: "Goldman Sachs & Co", bank: "Goldman Sachs Bank USA", routing: "124085066", accountPrefix: "7234" },
  { name: "Charles Schwab Corp", bank: "Charles Schwab Bank", routing: "121202211", accountPrefix: "6100" },
  { name: "Raymond James Financial", bank: "Raymond James Bank NA", routing: "063116048", accountPrefix: "8821" },
  { name: "Edward Jones Investments", bank: "Boone County National Bank", routing: "081501551", accountPrefix: "2934" },
  { name: "Northwestern Mutual", bank: "Northwestern Mutual Investment", routing: "075911988", accountPrefix: "4400" },
  { name: "Merrill Lynch Pierce Fenner", bank: "Bank of America NA", routing: "026009593", accountPrefix: "9012" },
  { name: "UBS Financial Services", bank: "UBS Bank USA", routing: "124302150", accountPrefix: "3300" },
];

const INCOMING_TRANSFER_SENDERS = [
  { name: "Michael Thompson", bank: "Chase Bank NA", routing: "021000021" },
  { name: "Sarah Johnson", bank: "Wells Fargo Bank", routing: "121042882" },
  { name: "David Williams", bank: "Bank of America", routing: "026009593" },
  { name: "Jennifer Davis", bank: "Citibank NA", routing: "021000089" },
  { name: "Robert Martinez", bank: "Capital One Bank", routing: "051405515" },
  { name: "Emily Anderson", bank: "TD Bank", routing: "031101266" },
  { name: "Christopher Wilson", bank: "PNC Bank", routing: "031000053" },
  { name: "Amanda Taylor", bank: "US Bank", routing: "091000022" },
  { name: "Payroll — Corvenza Capital Finance", bank: "First National Bank", routing: "103101641" },
  { name: "IRS Tax Refund", bank: "Federal Reserve Bank", routing: "021030004" },
  { name: "State Tax Refund", bank: "State Treasury", routing: "044036561" },
  { name: "Freelance Payment — Upwork", bank: "Evolve Bank & Trust", routing: "084106768" },
];

const BILL_PAYEES = [
  { name: "AT&T Wireless", ref: "ATT" },
  { name: "Verizon Communications", ref: "VZN" },
  { name: "T-Mobile USA", ref: "TMBL" },
  { name: "Comcast/Xfinity", ref: "CMC" },
  { name: "Con Edison Electric", ref: "CONED" },
  { name: "National Grid Gas", ref: "NATG" },
  { name: "American Water Works", ref: "AWW" },
  { name: "Geico Insurance", ref: "GEICO" },
  { name: "Progressive Insurance", ref: "PRGS" },
  { name: "State Farm Insurance", ref: "SFARM" },
  { name: "Allstate Insurance", ref: "ALLST" },
  { name: "Rent Payment — Greystar", ref: "GRYST" },
  { name: "Mortgage — Rocket Mortgage", ref: "RKTMTG" },
  { name: "Student Loan — Navient", ref: "NAVI" },
  { name: "Car Loan — Ally Financial", ref: "ALLY" },
];

// ── Helper utilities ────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randAmount(min: number, max: number): string {
  const raw = min + Math.random() * (max - min);
  // Snap to typical purchase endings (.00, .49, .95, .99)
  const endings = [0.0, 0.49, 0.95, 0.99];
  const base = Math.floor(raw);
  return (base + randFrom(endings)).toFixed(2);
}

function randAccountSuffix(digits: number): string {
  let s = "";
  for (let i = 0; i < digits; i++) s += randInt(0, 9).toString();
  return s;
}

function buildReference(date: Date, suffix?: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const tail = suffix ?? randInt(1000, 9999).toString();
  return `TXN${y}${m}${d}-${tail}`;
}

/** Spread a timestamp randomly within the given calendar month. */
function randomDateInMonth(year: number, month: number, usedDays: Set<number>): Date {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Try to avoid placing two transactions on the same day if possible
  let day: number;
  let tries = 0;
  do {
    day = randInt(1, daysInMonth);
    tries++;
  } while (usedDays.has(day) && tries < 20);
  usedDays.add(day);
  const hour = randInt(8, 21);
  const minute = randInt(0, 59);
  return new Date(year, month, day, hour, minute, randInt(0, 59));
}

// ── Transaction record type ─────────────────────────────────────────────────

export interface HistoryRow {
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: string;
  type: string;
  transferMethod: string;
  transferDetails: Record<string, string>;
  status: string;
  description: string;
  reference: string;
  availableAt: Date;
  createdAt: Date;
  processedAt: Date;
  progressPercentage: number;
}

// ── Per-month generator ─────────────────────────────────────────────────────

function generateMonthTransactions(
  accountId: string,
  year: number,
  month: number   // 0-indexed
): HistoryRow[] {
  const count = randInt(15, 20);
  const rows: HistoryRow[] = [];
  const usedDays = new Set<number>();

  // Determine a realistic mix for this month
  // ~ 40% debit card, 15% ATM, 15% outgoing wire/external transfer,
  //   15% incoming transfer, 15% bill pay
  const targets = {
    debit: Math.round(count * 0.40),
    atm: Math.round(count * 0.15),
    wireOut: Math.round(count * 0.10),
    incoming: Math.round(count * 0.20),
    bill: count - Math.round(count * 0.40) - Math.round(count * 0.15)
          - Math.round(count * 0.10) - Math.round(count * 0.20),
  };

  const push = (partial: Omit<HistoryRow, "availableAt" | "createdAt" | "processedAt" | "progressPercentage" | "status">) => {
    const ts = randomDateInMonth(year, month, usedDays);
    // Funds available same day for completed historical transactions
    rows.push({
      ...partial,
      status: "completed",
      progressPercentage: 100,
      createdAt: ts,
      processedAt: new Date(ts.getTime() + randInt(60, 900) * 1000),
      availableAt: ts,
    });
  };

  // 1. Debit card purchases
  for (let i = 0; i < targets.debit; i++) {
    const merchant = randFrom(DEBIT_CARD_MERCHANTS);
    const amt = randAmount(5, 185);
    const ts = new Date(year, month, 1); // placeholder; push() overwrites
    push({
      fromAccountId: accountId,
      toAccountId: null,
      amount: amt,
      type: "transfer",
      transferMethod: "external",
      description: `Debit Card Purchase — ${merchant.name}`,
      reference: buildReference(ts),
      transferDetails: {
        externalName: merchant.name,
        externalBankName: "Merchant Processing Network",
        externalRoutingNumber: "026015422",
        externalAccountNumber: `MERCH${randAccountSuffix(8)}`,
        category: merchant.category,
        method: "Debit Card",
      },
    });
  }

  // 2. ATM / bank withdrawals
  for (let i = 0; i < targets.atm; i++) {
    const atm = randFrom(ATM_BANKS);
    const amt = (randFrom([100, 120, 140, 160, 200, 240, 300, 400, 500])).toFixed(2);
    push({
      fromAccountId: accountId,
      toAccountId: null,
      amount: amt,
      type: "withdrawal",
      transferMethod: "external",
      description: `${atm.bank} ATM Withdrawal`,
      reference: buildReference(new Date(year, month, 1)),
      transferDetails: {
        externalName: `${atm.bank} ATM`,
        externalBankName: atm.bank,
        externalRoutingNumber: atm.routing,
        externalAccountNumber: `ATM${randAccountSuffix(6)}`,
        method: "Cash Withdrawal",
      },
    });
  }

  // 3. Outgoing wire transfers
  for (let i = 0; i < targets.wireOut; i++) {
    const cp = randFrom(WIRE_COUNTERPARTIES);
    const amt = randAmount(800, 12000);
    push({
      fromAccountId: accountId,
      toAccountId: null,
      amount: amt,
      type: "transfer",
      transferMethod: "wire",
      description: `Wire Transfer — ${cp.name}`,
      reference: buildReference(new Date(year, month, 1), `W${randAccountSuffix(4)}`),
      transferDetails: {
        externalName: cp.name,
        externalBankName: cp.bank,
        externalRoutingNumber: cp.routing,
        externalAccountNumber: `${cp.accountPrefix}${randAccountSuffix(8)}`,
        method: "Domestic Wire",
        swiftCode: `${cp.bank.slice(0, 4).toUpperCase()}US33`,
      },
    });
  }

  // 4. Incoming transfers (deposits / payroll / person-to-person)
  for (let i = 0; i < targets.incoming; i++) {
    const sender = randFrom(INCOMING_TRANSFER_SENDERS);
    // Payroll and tax refunds get larger amounts
    const isPayroll = sender.name.includes("Payroll") || sender.name.includes("IRS") || sender.name.includes("Tax");
    const amt = isPayroll ? randAmount(1200, 4800) : randAmount(50, 1500);
    const method = isPayroll ? "ACH" : randFrom(["ACH", "Domestic Wire", "Internal Transfer"]);
    push({
      fromAccountId: null,
      toAccountId: accountId,
      amount: amt,
      type: isPayroll ? "deposit" : "transfer",
      transferMethod: isPayroll ? "external" : "external",
      description: `Incoming Transfer — ${sender.name}`,
      reference: buildReference(new Date(year, month, 1), `IN${randAccountSuffix(4)}`),
      transferDetails: {
        externalName: sender.name,
        externalBankName: sender.bank,
        externalRoutingNumber: sender.routing,
        externalAccountNumber: `${randAccountSuffix(4)}****${randAccountSuffix(4)}`,
        method,
      },
    });
  }

  // 5. Bill payments
  for (let i = 0; i < targets.bill; i++) {
    const payee = randFrom(BILL_PAYEES);
    const amt = randAmount(45, 390);
    push({
      fromAccountId: accountId,
      toAccountId: null,
      amount: amt,
      type: "bill_pay",
      transferMethod: "external",
      description: `Bill Payment — ${payee.name}`,
      reference: `BP${payee.ref}${randAccountSuffix(8)}`,
      transferDetails: {
        externalName: payee.name,
        externalBankName: "Bill Pay Network",
        externalRoutingNumber: "021000021",
        externalAccountNumber: `${payee.ref}${randAccountSuffix(10)}`,
        method: "Bill Pay",
      },
    });
  }

  return rows;
}

// ── Public entry point ──────────────────────────────────────────────────────

/**
 * Build the full history array for an account, Jan 2024 → current month.
 */
export function buildTransactionHistory(accountId: string): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth(); // 0-indexed, current month (inclusive)

  let year = 2024;
  let month = 0; // January

  while (year < endYear || (year === endYear && month <= endMonth)) {
    rows.push(...generateMonthTransactions(accountId, year, month));
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  // Sort chronologically
  rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return rows;
}
