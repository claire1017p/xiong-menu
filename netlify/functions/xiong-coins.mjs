import { getStore } from "@netlify/blobs";

const STORE_NAME = "xiong-coin-ledger";
const LEDGER_KEY = "ledger-v1";
const MAX_TRANSACTIONS = 120;
const MAX_HOLDINGS = 160;

const ACCOUNT_ORDER = ["nono", "onetwo", "bank"];
const SAVINGS_ACCOUNTS = ["nono", "onetwo"];
const DEFAULT_SAVINGS_PRODUCT_ID = "fixed-30d-3";
const SAVINGS_PRODUCTS = [
  {
    id: DEFAULT_SAVINGS_PRODUCT_ID,
    name: "30天定期",
    summary: "默认储蓄，月利率 3%",
    monthlyRate: 0.03,
    termMonths: 1,
    termDays: 30,
    fixedAmount: null
  },
  {
    id: "fixed-6m-10-2000",
    name: "小熊高息 6个月",
    summary: "储值 2000 小熊币，月利率 10%",
    monthlyRate: 0.1,
    termMonths: 6,
    termDays: null,
    fixedAmount: 2000
  }
];
const DEFAULT_LEDGER = {
  version: 1,
  accounts: {
    nono: { id: "nono", name: "Nono", balance: 0 },
    onetwo: { id: "onetwo", name: "Onetwo", balance: 0 },
    bank: { id: "bank", name: "Bank", balance: 0 }
  },
  holdings: [],
  transactions: [],
  updatedAt: null
};

const ACTION_LABELS = {
  add: "添加",
  fine: "罚款",
  pay: "支付",
  save: "储蓄",
  "savings-redeem": "到期返还",
  "menu-order": "菜单付款"
};

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers
  });
}

function cloneDefaultLedger() {
  return JSON.parse(JSON.stringify(DEFAULT_LEDGER));
}

function normalizeBalance(value) {
  const balance = Math.trunc(Number(value));
  return Number.isFinite(balance) ? Math.max(0, balance) : 0;
}

function normalizeHolding(savedHolding) {
  if (!savedHolding || typeof savedHolding !== "object") {
    return null;
  }

  const accountId = savedHolding.accountId;
  const productId = savedHolding.productId;
  const principal = normalizeBalance(savedHolding.principal);
  const interest = normalizeBalance(savedHolding.interest);
  const payout = normalizeBalance(savedHolding.payout);

  if (!SAVINGS_ACCOUNTS.includes(accountId) || !productId || principal <= 0) {
    return null;
  }

  return {
    id: typeof savedHolding.id === "string" ? savedHolding.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountId,
    productId,
    productName: typeof savedHolding.productName === "string" ? savedHolding.productName : "定期储蓄",
    principal,
    interest,
    payout: payout || principal + interest,
    monthlyRate: Number(savedHolding.monthlyRate) || 0,
    termMonths: Math.max(1, Math.trunc(Number(savedHolding.termMonths) || 1)),
    termDays: savedHolding.termDays === null ? null : Math.max(1, Math.trunc(Number(savedHolding.termDays) || 30)),
    startAt: savedHolding.startAt || new Date().toISOString(),
    maturityAt: savedHolding.maturityAt || new Date().toISOString(),
    status: savedHolding.status === "redeemed" ? "redeemed" : "active",
    redeemedAt: savedHolding.redeemedAt || null,
    note: typeof savedHolding.note === "string" ? savedHolding.note : ""
  };
}

export function normalizeLedger(savedLedger) {
  const ledger = cloneDefaultLedger();

  if (savedLedger && typeof savedLedger === "object") {
    for (const id of ACCOUNT_ORDER) {
      const savedAccount = savedLedger.accounts?.[id];
      ledger.accounts[id].balance = normalizeBalance(savedAccount?.balance);
    }

    if (Array.isArray(savedLedger.transactions)) {
      ledger.transactions = savedLedger.transactions.slice(0, MAX_TRANSACTIONS);
    }

    if (Array.isArray(savedLedger.holdings)) {
      ledger.holdings = savedLedger.holdings
        .map(normalizeHolding)
        .filter(Boolean)
        .slice(0, MAX_HOLDINGS);
    }

    ledger.updatedAt = savedLedger.updatedAt || null;
  }

  return ledger;
}

function getSavingsProduct(productId = DEFAULT_SAVINGS_PRODUCT_ID) {
  const product = SAVINGS_PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    throw new Error("理财产品不存在");
  }

  return product;
}

function addTerm(startAt, product) {
  const maturity = new Date(startAt);

  if (product.termDays) {
    maturity.setDate(maturity.getDate() + product.termDays);
  } else {
    maturity.setMonth(maturity.getMonth() + product.termMonths);
  }

  return maturity;
}

function calculateInterest(principal, product) {
  return Math.round(principal * product.monthlyRate * product.termMonths);
}

function getAccount(ledger, accountId, fieldName) {
  if (!ACCOUNT_ORDER.includes(accountId)) {
    throw new Error(`${fieldName} 不是有效账户`);
  }

  return ledger.accounts[accountId];
}

function getAmount(value) {
  const amount = Math.trunc(Number(value));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("数量必须大于 0");
  }

  return amount;
}

function getNote(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 80);
}

function makeTransaction({ action, amount, from = null, to = null, note = "", extra = {} }) {
  const now = new Date();

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    label: ACTION_LABELS[action] || action,
    amount,
    from,
    to,
    note,
    createdAt: now.toISOString(),
    ...extra
  };
}

function assertCanDebit(account, amount) {
  if (account.balance < amount) {
    throw new Error(`${account.name} 余额不足，不能扣成负数。当前余额 ${account.balance}，需要 ${amount}。`);
  }
}

function applyTransaction(ledger, transaction) {
  if (transaction.from) {
    assertCanDebit(ledger.accounts[transaction.from], transaction.amount);
  }

  if (transaction.from) {
    ledger.accounts[transaction.from].balance -= transaction.amount;
  }

  if (transaction.to) {
    ledger.accounts[transaction.to].balance += transaction.amount;
  }

  ledger.transactions.unshift(transaction);
  ledger.transactions = ledger.transactions.slice(0, MAX_TRANSACTIONS);
  ledger.updatedAt = transaction.createdAt;

  return transaction;
}

function makeHolding({ account, amount, product, note = "" }) {
  const start = new Date();
  const maturity = addTerm(start, product);
  const interest = calculateInterest(amount, product);

  return {
    id: `${start.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    accountId: account.id,
    productId: product.id,
    productName: product.name,
    principal: amount,
    interest,
    payout: amount + interest,
    monthlyRate: product.monthlyRate,
    termMonths: product.termMonths,
    termDays: product.termDays,
    startAt: start.toISOString(),
    maturityAt: maturity.toISOString(),
    status: "active",
    redeemedAt: null,
    note
  };
}

function addHolding(ledger, holding) {
  ledger.holdings.unshift(holding);
  ledger.holdings = ledger.holdings.slice(0, MAX_HOLDINGS);
  return holding;
}

function redeemHolding(ledger, holding, now = new Date()) {
  if (holding.status !== "active" || new Date(holding.maturityAt) > now) {
    return null;
  }

  const account = getAccount(ledger, holding.accountId, "返还账户");
  const bank = getAccount(ledger, "bank", "收款账户");
  assertCanDebit(bank, holding.principal);

  bank.balance -= holding.principal;
  account.balance += holding.payout;
  holding.status = "redeemed";
  holding.redeemedAt = now.toISOString();

  const transaction = makeTransaction({
    action: "savings-redeem",
    amount: holding.payout,
    from: "bank",
    to: account.id,
    note: `${holding.productName}到期返还：本金 ${holding.principal} + 利息 ${holding.interest}`,
    extra: {
      holdingId: holding.id,
      productId: holding.productId,
      principal: holding.principal,
      interest: holding.interest,
      maturedAt: holding.maturityAt
    }
  });

  ledger.transactions.unshift(transaction);
  ledger.transactions = ledger.transactions.slice(0, MAX_TRANSACTIONS);
  ledger.updatedAt = transaction.createdAt;

  return transaction;
}

export function settleMaturedHoldings(ledger, now = new Date()) {
  const transactions = [];

  for (const holding of ledger.holdings) {
    const transaction = redeemHolding(ledger, holding, now);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}

export function applyOperation(ledger, payload) {
  const action = payload?.action;
  const amount = getAmount(payload?.amount);
  const note = getNote(payload?.note);

  if (action === "add") {
    const actor = getAccount(ledger, payload.actor, "操作账户");
    if (actor.id !== "bank") {
      throw new Error("只有 Bank 可以添加小熊币");
    }

    const account = getAccount(ledger, payload.account, "添加账户");
    return applyTransaction(
      ledger,
      makeTransaction({
        action,
        amount,
        to: account.id,
        note: note || "添加小熊币"
      })
    );
  }

  if (action === "fine") {
    const account = getAccount(ledger, payload.account, "罚款账户");
    return applyTransaction(
      ledger,
      makeTransaction({
        action,
        amount,
        from: account.id,
        to: "bank",
        note: note || "罚款"
      })
    );
  }

  if (action === "save") {
    const account = getAccount(ledger, payload.account, "储蓄账户");

    if (!SAVINGS_ACCOUNTS.includes(account.id)) {
      throw new Error("Bank 不能购买理财产品");
    }

    const product = getSavingsProduct(payload.productId);

    if (product.fixedAmount && amount !== product.fixedAmount) {
      throw new Error(`${product.name} 固定储值 ${product.fixedAmount} 小熊币`);
    }

    const holding = makeHolding({ account, amount, product, note });
    const transaction = applyTransaction(
      ledger,
      makeTransaction({
        action,
        amount,
        from: account.id,
        to: "bank",
        note: note || `购买${product.name}`,
        extra: {
          holdingId: holding.id,
          productId: product.id,
          productName: product.name,
          interest: holding.interest,
          payout: holding.payout,
          maturityAt: holding.maturityAt
        }
      })
    );

    addHolding(ledger, holding);
    return transaction;
  }

  if (action === "pay" || action === "menu-order") {
    const from = getAccount(ledger, payload.from, "付款账户");
    const to = getAccount(ledger, payload.to, "收款账户");

    if (from.id === to.id) {
      throw new Error("付款和收款不能是同一个账户");
    }

    return applyTransaction(
      ledger,
      makeTransaction({
        action,
        amount,
        from: from.id,
        to: to.id,
        note: note || (action === "menu-order" ? "熊熊菜单下单" : "支付")
      })
    );
  }

  throw new Error("未知的小熊币操作");
}

async function readLedger() {
  const store = getStore(STORE_NAME);
  const savedLedger = await store.get(LEDGER_KEY, { type: "json", consistency: "strong" });
  return normalizeLedger(savedLedger);
}

async function writeLedger(ledger) {
  const store = getStore(STORE_NAME);
  await store.setJSON(LEDGER_KEY, ledger);
}

export default async function handler(req) {
  if (req.method === "GET") {
    try {
      const ledger = await readLedger();
      const settlements = settleMaturedHoldings(ledger);

      if (settlements.length) {
        await writeLedger(ledger);
      }

      return json({ ledger, products: SAVINGS_PRODUCTS, settlements });
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : "读取小熊币账本失败"
      }, { status: 400 });
    }
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const ledger = await readLedger();
    const settlements = settleMaturedHoldings(ledger);
    const transaction = applyOperation(ledger, payload);

    await writeLedger(ledger);

    return json({
      ledger,
      transaction,
      products: SAVINGS_PRODUCTS,
      settlements
    });
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "小熊币操作失败"
    }, { status: 400 });
  }
}
