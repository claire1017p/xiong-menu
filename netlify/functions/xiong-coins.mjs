import { getStore } from "@netlify/blobs";

const STORE_NAME = "xiong-coin-ledger";
const LEDGER_KEY = "ledger-v1";
const MAX_TRANSACTIONS = 120;

const ACCOUNT_ORDER = ["nono", "onetwo", "bank"];
const DEFAULT_LEDGER = {
  version: 1,
  accounts: {
    nono: { id: "nono", name: "Nono", balance: 0 },
    onetwo: { id: "onetwo", name: "Onetwo", balance: 0 },
    bank: { id: "bank", name: "Bank", balance: 0 }
  },
  transactions: [],
  updatedAt: null
};

const ACTION_LABELS = {
  add: "添加",
  fine: "罚款",
  pay: "支付",
  save: "储蓄",
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

    ledger.updatedAt = savedLedger.updatedAt || null;
  }

  return ledger;
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

function makeTransaction({ action, amount, from = null, to = null, note = "" }) {
  const now = new Date();

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    label: ACTION_LABELS[action] || action,
    amount,
    from,
    to,
    note,
    createdAt: now.toISOString()
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
    return applyTransaction(
      ledger,
      makeTransaction({
        action,
        amount,
        from: account.id,
        to: "bank",
        note: note || "存入 Bank"
      })
    );
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
    const ledger = await readLedger();
    return json({ ledger });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const ledger = await readLedger();
    const transaction = applyOperation(ledger, payload);

    await writeLedger(ledger);

    return json({
      ledger,
      transaction
    });
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "小熊币操作失败"
    }, { status: 400 });
  }
}
