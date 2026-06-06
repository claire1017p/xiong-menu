const dishes = {
  ribs: {
    name: "糖醋排骨",
    price: 55,
    image: "assets/sweet-sour-ribs.jpg",
    kicker: "酸甜 / 油亮 / 下饭",
    desc: "一口甜，一口酸，认真收汁到亮晶晶。",
    detail: "酸甜口的第一道热菜，适合配米饭。主厨建议趁热吃，酱汁留一点拌饭。"
  },
  wings: {
    name: "可乐鸡翅",
    price: 45,
    image: "assets/cola-chicken-wings.jpg",
    kicker: "焦香 / 微甜 / 温柔",
    desc: "可乐慢慢煮进鸡翅里，适合当压轴。",
    detail: "鸡翅煎到边缘微焦，再用可乐慢慢收汁。甜度不会太高，适合今晚慢慢吃。"
  },
  yuXiangPork: {
    name: "鱼香肉丝",
    price: 35,
    image: "assets/yu-xiang-rou-si.jpg",
    kicker: "咸香 / 微辣 / 下饭",
    desc: "肉丝细细炒开，酱香和酸甜都刚好。",
    detail: "经典鱼香口，带一点酸甜和微辣。适合拌饭，也适合配一口清爽小菜。"
  },
  kungPaoChicken: {
    name: "宫保鸡丁",
    price: 35,
    image: "assets/gong-bao-ji-ding.jpg",
    kicker: "花生 / 微辣 / 焦香",
    desc: "鸡丁、花生和辣椒香气凑成一盘热闹。",
    detail: "鸡丁先炒到嫩，再裹上咸甜微辣的酱汁。花生负责香，主厨负责认真。"
  },
  vegetables: {
    name: "小炒时蔬",
    price: 15,
    image: "assets/stir-fried-vegetables.jpg",
    kicker: "清爽 / 蒜香 / 解腻",
    desc: "给一桌热菜留一点清爽的绿色。",
    detail: "时蔬快炒，保留脆口和鲜味。适合夹在肉菜中间吃，清清爽爽。"
  },
  tomatoEggs: {
    name: "番茄炒蛋",
    price: 20,
    image: "assets/tomato-scrambled-eggs.jpg",
    kicker: "酸甜 / 软嫩 / 家常",
    desc: "番茄汁裹住鸡蛋，是很温柔的家常味。",
    detail: "鸡蛋炒得软一点，番茄留一点汁。简单但很会哄人开心。"
  }
};

const ORDER_FORM_NAME = "xiong-menu-order";
const COIN_API_URL = "/.netlify/functions/xiong-coins";
const AUTH_API_URL = "/.netlify/functions/xiong-auth";
const AUTH_SESSION_KEY = "xiong-active-account";
const LOCAL_AUTH_KEY = "xiong-local-auth-v1";
const LOCAL_LEDGER_KEY = "xiong-local-ledger-v1";
const ACCOUNT_IDS = ["nono", "onetwo", "bank"];
const TRANSFER_ACCOUNTS = ["nono", "onetwo"];
const ACCOUNT_NAMES = {
  nono: "Nono",
  onetwo: "Onetwo",
  bank: "Bank"
};
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

const COIN_MODE_CONFIG = {
  add: {
    fromLabel: "添加到",
    submitLabel: "添加小熊币",
    showTo: false,
    fromAccounts: ACCOUNT_IDS
  },
  fine: {
    fromLabel: "罚款账户",
    submitLabel: "确认罚款",
    showTo: false,
    fromAccounts: TRANSFER_ACCOUNTS
  },
  pay: {
    fromLabel: "付款账户",
    submitLabel: "确认支付",
    showTo: true,
    fromAccounts: ACCOUNT_IDS,
    toAccounts: ACCOUNT_IDS
  },
  save: {
    fromLabel: "储蓄账户",
    submitLabel: "购买30天定期",
    showTo: true,
    fromAccounts: TRANSFER_ACCOUNTS,
    toAccounts: ["bank"]
  },
  query: {
    fromLabel: "查询账户",
    submitLabel: "刷新查询",
    showTo: false,
    fromAccounts: ACCOUNT_IDS
  }
};

const pages = [
  {
    title: "第 1 页 · 招牌热菜",
    name: "招牌热菜",
    dishIds: ["ribs", "wings"]
  },
  {
    title: "第 2 页 · 经典下饭",
    name: "经典下饭",
    dishIds: ["yuXiangPork", "kungPaoChicken"]
  },
  {
    title: "第 3 页 · 家常小菜",
    name: "家常小菜",
    dishIds: ["vegetables", "tomatoEggs"]
  }
];

const DECOR_IMAGE_URLS = [
  "assets/bear-piggy-pink.jpg",
  "assets/bear-call-panda.jpg",
  "assets/bear-icecream-panda.jpg",
  "assets/bear-summer-panda.jpg",
  "assets/bear-snack-hat-brown.jpg",
  "assets/bear-call-brown.jpg",
  "assets/bear-summer-swim.jpg",
  "assets/bear-bedtime-phone.jpg"
];

const order = Object.fromEntries(Object.keys(dishes).map((id) => [id, 0]));

const dishListEl = document.querySelector("[data-dish-list]");
const pageTitleEl = document.querySelector("[data-page-title]");
const pageKickerEl = document.querySelector("[data-page-kicker]");
const pageNameEl = document.querySelector("[data-page-name]");
const summaryEl = document.querySelector("[data-order-summary]");
const totalEl = document.querySelector("[data-total]");
const toastEl = document.querySelector("[data-toast]");
const dialogEl = document.querySelector("[data-dialog]");
const dialogImageEl = document.querySelector("[data-dialog-image]");
const dialogKickerEl = document.querySelector("[data-dialog-kicker]");
const dialogTitleEl = document.querySelector("[data-dialog-title]");
const dialogDescEl = document.querySelector("[data-dialog-desc]");
const loginScreenEl = document.querySelector("[data-login-screen]");
const loginFormEl = document.querySelector("[data-login-form]");
const loginUsernameEl = document.querySelector("[data-login-username]");
const loginPasswordEl = document.querySelector("[data-login-password]");
const loginSubmitEl = document.querySelector("[data-login-submit]");
const passwordFormEl = document.querySelector("[data-password-form]");
const passwordAccountEl = document.querySelector("[data-password-account]");
const newPasswordEl = document.querySelector("[data-new-password]");
const confirmPasswordEl = document.querySelector("[data-confirm-password]");
const passwordSubmitEl = document.querySelector("[data-password-submit]");
const loginMessageEl = document.querySelector("[data-login-message]");
const authStatusEl = document.querySelector("[data-auth-status]");
const authUserEl = document.querySelector("[data-auth-user]");
const portalUserEl = document.querySelector("[data-portal-user]");
const orderDialogEl = document.querySelector("[data-order-dialog]");
const orderMessageEl = document.querySelector("[data-order-message]");
const orderSendStatusEl = document.querySelector("[data-order-send-status]");
const commissionDialogEl = document.querySelector("[data-commission-dialog]");
const commissionFormEl = document.querySelector("[data-commission-form]");
const commissionUserEl = document.querySelector("[data-commission-user]");
const commissionTitleEl = document.querySelector("[data-commission-title]");
const commissionBountyEl = document.querySelector("[data-commission-bounty]");
const commissionDetailEl = document.querySelector("[data-commission-detail]");
const commissionSubmitEl = document.querySelector("[data-commission-submit]");
const commissionMessageEl = document.querySelector("[data-commission-message]");
const commissionListEl = document.querySelector("[data-commission-list]");
const passwordDialogEl = document.querySelector("[data-password-dialog]");
const changePasswordFormEl = document.querySelector("[data-change-password-form]");
const changePasswordAccountEl = document.querySelector("[data-change-password-account]");
const currentPasswordEl = document.querySelector("[data-current-password]");
const changeNewPasswordEl = document.querySelector("[data-change-new-password]");
const changeConfirmPasswordEl = document.querySelector("[data-change-confirm-password]");
const changePasswordSubmitEl = document.querySelector("[data-change-password-submit]");
const changePasswordMessageEl = document.querySelector("[data-change-password-message]");
const coinDialogEl = document.querySelector("[data-coin-dialog]");
const coinAccountsEl = document.querySelector("[data-coin-accounts]");
const coinLedgerEl = document.querySelector("[data-coin-ledger]");
const coinFormEl = document.querySelector("[data-coin-form]");
const coinFromLabelEl = document.querySelector("[data-coin-from-label]");
const coinFromEl = document.querySelector("[data-coin-from]");
const coinToFieldEl = document.querySelector("[data-coin-to-field]");
const coinToEl = document.querySelector("[data-coin-to]");
const coinAmountEl = document.querySelector("[data-coin-amount]");
const coinNoteEl = document.querySelector("[data-coin-note]");
const coinSubmitEl = document.querySelector("[data-coin-submit]");
const coinQueryPanelEl = document.querySelector("[data-coin-query]");
const coinQueryAccountEl = document.querySelector("[data-coin-query-account]");
const coinQuerySummaryEl = document.querySelector("[data-coin-query-summary]");
const coinQueryLedgerEl = document.querySelector("[data-coin-query-ledger]");
const coinRefreshEl = document.querySelector("[data-coin-refresh]");
const savingsPanelEl = document.querySelector("[data-savings-panel]");
const savingsProductsEl = document.querySelector("[data-savings-products]");
const savingsHoldingsEl = document.querySelector("[data-savings-holdings]");

let currentPage = 0;
let toastTimer;
let coinMode = "add";
let coinLedger = null;
let savingsProducts = SAVINGS_PRODUCTS;
let activeAccount = null;
let pendingPasswordAccount = null;
let pendingPassword = "";
let isPlacingOrder = false;
let warmupStarted = false;
let authWarmupPromise = null;
let coinWarmupPromise = null;
let menuRendered = false;

function runWhenIdle(callback, timeout = 700) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, timeout);
}

function warmAuthService() {
  if (!authWarmupPromise) {
    authWarmupPromise = fetch(AUTH_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    }).catch(() => null);
  }

  return authWarmupPromise;
}

function warmCoinService() {
  if (!coinWarmupPromise) {
    coinWarmupPromise = fetch(COIN_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    }).catch(() => null);
  }

  return coinWarmupPromise;
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

function getMobileDishImage(src) {
  return src.replace(/\.jpg$/, "-mobile.jpg");
}

function shouldUseMobileDishImages() {
  return window.matchMedia?.("(max-width: 700px)").matches;
}

function getDishImage(dish) {
  return shouldUseMobileDishImages() ? getMobileDishImage(dish.image) : dish.image;
}

function getDishImageUrlsForPage(pageIndex = currentPage) {
  const page = pages[pageIndex] || pages[0];
  return page.dishIds.map((id) => getDishImage(dishes[id]));
}

async function preloadImages(urls, batchSize = 3) {
  const uniqueUrls = [...new Set(urls)];

  for (let index = 0; index < uniqueUrls.length; index += batchSize) {
    await Promise.all(uniqueUrls.slice(index, index + batchSize).map(preloadImage));
  }
}

function preloadPageImages(pageIndex = currentPage) {
  return preloadImages(getDishImageUrlsForPage(pageIndex), 2);
}

function startWarmup() {
  if (warmupStarted) {
    return;
  }

  warmupStarted = true;
  warmAuthService();
  runWhenIdle(() => {
    preloadImages(DECOR_IMAGE_URLS, 2);
  }, 900);
}

function renderPage() {
  menuRendered = true;
  const page = pages[currentPage];
  pageTitleEl.textContent = page.title;
  pageKickerEl.textContent = `PAGE ${currentPage + 1} / ${pages.length}`;
  pageNameEl.textContent = page.name;

  dishListEl.innerHTML = page.dishIds
    .map((id, index) => {
      const dish = dishes[id];
      const cardClass = index % 2 === 0 ? "is-featured" : "is-offset";

      return `
        <article class="dish-card ${cardClass}" data-dish-id="${id}">
          <img src="${getDishImage(dish)}" alt="${dish.name}" loading="eager" fetchpriority="high" decoding="async" />
          <div class="dish-overlay">
            <div class="dish-title-row">
              <div>
                <p>${dish.kicker}</p>
                <h2>${dish.name}</h2>
              </div>
              <div class="price-badge" aria-label="${dish.price} 小熊币">
                <strong>${dish.price}</strong>
                <span class="bear-coin" aria-hidden="true"></span>
              </div>
            </div>
            <p class="dish-desc">${dish.desc}</p>
            <div class="dish-actions">
              <button class="detail-button" type="button" data-open-detail="${id}">看看详情</button>
              <div class="stepper" aria-label="${dish.name}数量">
                <button type="button" data-action="decrease" data-dish-id="${id}" aria-label="减少${dish.name}">-</button>
                <span data-count-for="${id}">${order[id]}</span>
                <button type="button" data-action="increase" data-dish-id="${id}" aria-label="增加${dish.name}">+</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  renderOrder();
}

function ensureMenuRendered() {
  preloadPageImages(currentPage);

  if (!menuRendered) {
    renderPage();
  }
}

function renderOrder() {
  let total = 0;
  const chosen = getOrderItems().map(({ dish, count }) => {
    total += dish.price * count;
    return `${dish.name} x${count}`;
  });

  document.querySelectorAll("[data-count-for]").forEach((el) => {
    el.textContent = order[el.dataset.countFor];
  });

  summaryEl.textContent = chosen.length ? chosen.join(" + ") : "还没点菜";
  totalEl.textContent = total;
}

function getOrderItems() {
  return Object.entries(order)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({
      id,
      dish: dishes[id],
      count
    }));
}

function getOrderTotal(items = getOrderItems()) {
  return items.reduce((sum, { dish, count }) => sum + dish.price * count, 0);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[char];
  });
}

function getAccountName(accountId) {
  return ACCOUNT_NAMES[accountId] || accountId || "外部";
}

function formatCoinTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatBalances(ledger = coinLedger) {
  if (!ledger) {
    return "";
  }

  return ACCOUNT_IDS.map((id) => `${getAccountName(id)} ${ledger.accounts[id]?.balance ?? 0}`).join(" / ");
}

function getMenuPaymentAccounts() {
  if (!activeAccount || !TRANSFER_ACCOUNTS.includes(activeAccount.id)) {
    throw new Error("请用 Nono 或 Onetwo 账户点菜，Bank 只负责管理小熊币。");
  }

  return {
    from: activeAccount.id,
    to: TRANSFER_ACCOUNTS.find((id) => id !== activeAccount.id)
  };
}

function formatAccountRoute(from, to) {
  return `${getAccountName(from)} → ${getAccountName(to)}`;
}

function renderSelectOptions(selectEl, accountIds, selectedId) {
  selectEl.innerHTML = accountIds
    .map((id) => `<option value="${id}" ${id === selectedId ? "selected" : ""}>${getAccountName(id)}</option>`)
    .join("");
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

function shouldUseLocalFallback(responseOrError) {
  if (responseOrError instanceof TypeError) {
    return true;
  }

  if (responseOrError && typeof responseOrError.status === "number") {
    return responseOrError.status === 404 || responseOrError.status === 405;
  }

  return false;
}

function getAccountIdByUsername(username) {
  const normalized = String(username || "").trim().toLowerCase();
  return ACCOUNT_IDS.find((id) => id === normalized || ACCOUNT_NAMES[id].toLowerCase() === normalized) || "";
}

function getPublicAccount(accountId) {
  return {
    id: accountId,
    name: getAccountName(accountId)
  };
}

function setLoginMessage(message, tone = "normal") {
  loginMessageEl.textContent = message;
  loginMessageEl.dataset.tone = tone;
}

function showLoginForm(message = "") {
  pendingPasswordAccount = null;
  pendingPassword = "";
  passwordFormEl.hidden = true;
  loginFormEl.hidden = false;
  loginPasswordEl.value = "";
  newPasswordEl.value = "";
  confirmPasswordEl.value = "";
  setLoginMessage(message);
}

function showPasswordForm(account, password) {
  pendingPasswordAccount = account;
  pendingPassword = password;
  passwordAccountEl.textContent = `${account.name} 首次设置密码`;
  loginFormEl.hidden = true;
  passwordFormEl.hidden = false;
  newPasswordEl.value = "";
  confirmPasswordEl.value = "";
  setLoginMessage("首次登录需要设置新密码，保存后会自动进入菜单。");
  window.setTimeout(() => newPasswordEl.focus(), 0);
}

function saveAuthSession(account) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    id: account.id,
    name: account.name
  }));
}

function setAppView(view = "portal") {
  document.body.classList.toggle("view-portal", view === "portal");
  document.body.classList.toggle("view-menu", view === "menu");
}

function applyAuthenticatedState(account) {
  activeAccount = getPublicAccount(account.id);
  saveAuthSession(activeAccount);
  document.body.classList.remove("auth-required");
  document.body.classList.add("is-authenticated");
  authUserEl.textContent = activeAccount.name;
  portalUserEl.textContent = activeAccount.name;
  authStatusEl.hidden = false;
  setAppView("portal");
  setCoinMode(getDefaultCoinMode());
  showLoginForm("");
  runWhenIdle(() => {
    warmCoinService();
    preloadImages(DECOR_IMAGE_URLS, 2);
    preloadPageImages(0);
  }, 700);
}

function requireLogin(message = "") {
  activeAccount = null;
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  document.body.classList.add("auth-required");
  document.body.classList.remove("is-authenticated");
  document.body.classList.remove("view-portal", "view-menu");
  authStatusEl.hidden = true;
  portalUserEl.textContent = "";
  showLoginForm(message);
  window.setTimeout(() => loginPasswordEl.focus(), 0);
}

function readLocalAuth() {
  const fallback = {
    accounts: Object.fromEntries(ACCOUNT_IDS.map((id) => [
      id,
      { id, name: getAccountName(id), passwordSet: false, password: "" }
    ]))
  };

  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_AUTH_KEY) || "null");

    if (saved && typeof saved === "object") {
      for (const id of ACCOUNT_IDS) {
        const savedAccount = saved.accounts?.[id];

        if (savedAccount && typeof savedAccount === "object") {
          fallback.accounts[id].passwordSet = Boolean(savedAccount.passwordSet);
          fallback.accounts[id].password = typeof savedAccount.password === "string" ? savedAccount.password : "";
        }
      }
    }
  } catch {
    localStorage.removeItem(LOCAL_AUTH_KEY);
  }

  return fallback;
}

function writeLocalAuth(auth) {
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(auth));
}

function createDefaultLocalLedger() {
  return {
    version: 1,
    accounts: {
      nono: { id: "nono", name: "Nono", balance: 0 },
      onetwo: { id: "onetwo", name: "Onetwo", balance: 0 },
      bank: { id: "bank", name: "Bank", balance: 0 }
    },
    holdings: [],
    commissions: [],
    transactions: [],
    updatedAt: null
  };
}

function normalizeLocalLedger(savedLedger) {
  const ledger = createDefaultLocalLedger();

  if (savedLedger && typeof savedLedger === "object") {
    for (const id of ACCOUNT_IDS) {
      const savedBalance = Math.trunc(Number(savedLedger.accounts?.[id]?.balance));
      ledger.accounts[id].balance = Number.isFinite(savedBalance) ? Math.max(0, savedBalance) : 0;
    }

    if (Array.isArray(savedLedger.transactions)) {
      ledger.transactions = savedLedger.transactions.slice(0, 120);
    }

    if (Array.isArray(savedLedger.holdings)) {
      ledger.holdings = savedLedger.holdings.slice(0, 160);
    }

    if (Array.isArray(savedLedger.commissions)) {
      ledger.commissions = savedLedger.commissions.slice(0, 120);
    }

    ledger.updatedAt = savedLedger.updatedAt || null;
  }

  return ledger;
}

function readLocalLedger() {
  try {
    const ledger = normalizeLocalLedger(JSON.parse(localStorage.getItem(LOCAL_LEDGER_KEY) || "null"));
    if (settleLocalMaturedHoldings(ledger)) {
      writeLocalLedger(ledger);
    }
    return ledger;
  } catch {
    localStorage.removeItem(LOCAL_LEDGER_KEY);
    return createDefaultLocalLedger();
  }
}

function writeLocalLedger(ledger) {
  localStorage.setItem(LOCAL_LEDGER_KEY, JSON.stringify(ledger));
}

function getLocalCoinAmount(value) {
  const amount = Math.trunc(Number(value));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("数量必须大于 0");
  }

  return amount;
}

function getLocalCoinAccount(ledger, accountId, fieldName) {
  if (!ACCOUNT_IDS.includes(accountId)) {
    throw new Error(`${fieldName} 不是有效账户`);
  }

  return ledger.accounts[accountId];
}

function getSavingsProduct(productId = DEFAULT_SAVINGS_PRODUCT_ID) {
  const product = savingsProducts.find((item) => item.id === productId) || SAVINGS_PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    throw new Error("理财产品不存在");
  }

  return product;
}

function addSavingsTerm(startAt, product) {
  const maturity = new Date(startAt);

  if (product.termDays) {
    maturity.setDate(maturity.getDate() + product.termDays);
  } else {
    maturity.setMonth(maturity.getMonth() + product.termMonths);
  }

  return maturity;
}

function calculateSavingsInterest(principal, product) {
  return Math.round(principal * product.monthlyRate * product.termMonths);
}

function makeLocalHolding({ account, amount, product, note = "" }) {
  const start = new Date();
  const maturity = addSavingsTerm(start, product);
  const interest = calculateSavingsInterest(amount, product);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

function makeLocalTransaction({ action, amount, from = null, to = null, note = "", extra = {} }) {
  const labels = {
    add: "添加",
    fine: "罚款",
    pay: "支付",
    save: "储蓄",
    "savings-redeem": "到期返还",
    "menu-order": "菜单付款",
    "commission-reward": "委托赏金"
  };
  const createdAt = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    label: labels[action] || action,
    amount,
    from,
    to,
    note: String(note || "").trim().slice(0, 80),
    createdAt,
    ...extra
  };
}

function assertLocalCanDebit(account, amount) {
  if (account.balance < amount) {
    throw new Error(`${account.name} 余额不足，不能扣成负数。当前余额 ${account.balance}，需要 ${amount}。`);
  }
}

function getLocalText(value, maxLength, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const text = value.trim().slice(0, maxLength);
  return text || fallback;
}

function getLocalCommission(ledger, commissionId) {
  const commission = ledger.commissions.find((item) => item.id === commissionId);

  if (!commission) {
    throw new Error("委托不存在");
  }

  return commission;
}

function applyLocalCommissionOperation(ledger, payload, amount) {
  const action = payload?.action;
  const actor = getLocalCoinAccount(ledger, payload.actor, "操作账户");

  if (action === "create-commission") {
    assertLocalCanDebit(actor, amount);

    const createdAt = new Date().toISOString();
    const commission = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: getLocalText(payload.title, 40, "小熊委托"),
      detail: getLocalText(payload.detail, 160, ""),
      bounty: amount,
      requesterId: actor.id,
      assigneeId: null,
      status: "open",
      requesterConfirmed: false,
      assigneeConfirmed: false,
      createdAt,
      acceptedAt: null,
      completedAt: null,
      paidTransactionId: null
    };
    ledger.commissions.unshift(commission);
    ledger.commissions = ledger.commissions.slice(0, 120);
    ledger.updatedAt = createdAt;
    return { commission };
  }

  const commission = getLocalCommission(ledger, payload.commissionId);

  if (action === "accept-commission") {
    if (commission.status !== "open") {
      throw new Error("这个委托已经不能接受了");
    }

    if (commission.requesterId === actor.id) {
      throw new Error("不能接受自己发布的委托");
    }

    commission.assigneeId = actor.id;
    commission.status = "accepted";
    commission.acceptedAt = new Date().toISOString();
    commission.requesterConfirmed = false;
    commission.assigneeConfirmed = false;
    ledger.updatedAt = commission.acceptedAt;
    return { commission };
  }

  if (action === "confirm-commission") {
    if (commission.status !== "accepted" || !commission.assigneeId) {
      throw new Error("这个委托还不能确认完成");
    }

    if (actor.id !== commission.requesterId && actor.id !== commission.assigneeId) {
      throw new Error("只有委托双方可以确认完成");
    }

    const requesterConfirmed = commission.requesterConfirmed || actor.id === commission.requesterId;
    const assigneeConfirmed = commission.assigneeConfirmed || actor.id === commission.assigneeId;
    let transaction = null;

    if (requesterConfirmed && assigneeConfirmed) {
      assertLocalCanDebit(ledger.accounts[commission.requesterId], commission.bounty);
      transaction = makeLocalTransaction({
        action: "commission-reward",
        amount: commission.bounty,
        from: commission.requesterId,
        to: commission.assigneeId,
        note: `委托完成：${commission.title}`,
        extra: {
          commissionId: commission.id
        }
      });
      ledger.accounts[transaction.from].balance -= transaction.amount;
      ledger.accounts[transaction.to].balance += transaction.amount;
      ledger.transactions.unshift(transaction);
      ledger.transactions = ledger.transactions.slice(0, 120);
    }

    commission.requesterConfirmed = requesterConfirmed;
    commission.assigneeConfirmed = assigneeConfirmed;

    if (transaction) {
      commission.status = "completed";
      commission.completedAt = transaction.createdAt;
      commission.paidTransactionId = transaction.id;
      ledger.updatedAt = transaction.createdAt;
    } else {
      ledger.updatedAt = new Date().toISOString();
    }

    return { commission, transaction };
  }

  throw new Error("未知的委托操作");
}

function settleLocalMaturedHoldings(ledger) {
  const now = new Date();
  let changed = false;

  for (const holding of ledger.holdings) {
    if (holding.status !== "active" || new Date(holding.maturityAt) > now) {
      continue;
    }

    const account = getLocalCoinAccount(ledger, holding.accountId, "返还账户");
    const bank = getLocalCoinAccount(ledger, "bank", "收款账户");

    if (bank.balance < holding.principal) {
      continue;
    }

    bank.balance -= holding.principal;
    account.balance += holding.payout;
    holding.status = "redeemed";
    holding.redeemedAt = now.toISOString();
    ledger.transactions.unshift(makeLocalTransaction({
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
    }));
    ledger.transactions = ledger.transactions.slice(0, 120);
    ledger.updatedAt = holding.redeemedAt;
    changed = true;
  }

  return changed;
}

function applyLocalCoinOperation(payload) {
  const ledger = readLocalLedger();
  const action = payload?.action;
  const amount = ["add", "fine", "pay", "save", "menu-order", "create-commission"].includes(action) ? getLocalCoinAmount(payload?.amount) : 0;
  let transaction;

  if (action === "create-commission" || action === "accept-commission" || action === "confirm-commission") {
    const result = applyLocalCommissionOperation(ledger, payload, amount);
    writeLocalLedger(ledger);
    return { ledger, transaction: result.transaction || null, commission: result.commission || null, localFallback: true };
  }

  if (action === "add") {
    const actor = getLocalCoinAccount(ledger, payload.actor, "操作账户");
    if (actor.id !== "bank") {
      throw new Error("只有 Bank 可以添加小熊币");
    }

    const account = getLocalCoinAccount(ledger, payload.account, "添加账户");
    transaction = makeLocalTransaction({
      action,
      amount,
      to: account.id,
      note: payload.note || "添加小熊币"
    });
  } else if (action === "fine") {
    const account = getLocalCoinAccount(ledger, payload.account, "罚款账户");
    transaction = makeLocalTransaction({
      action,
      amount,
      from: account.id,
      to: "bank",
      note: payload.note || "罚款"
    });
  } else if (action === "save") {
    const account = getLocalCoinAccount(ledger, payload.account, "储蓄账户");
    const product = getSavingsProduct(payload.productId);

    if (account.id === "bank") {
      throw new Error("Bank 不能购买理财产品");
    }

    if (product.fixedAmount && amount !== product.fixedAmount) {
      throw new Error(`${product.name} 固定储值 ${product.fixedAmount} 小熊币`);
    }

    const holding = makeLocalHolding({
      account,
      amount,
      product,
      note: payload.note || ""
    });
    transaction = makeLocalTransaction({
      action,
      amount,
      from: account.id,
      to: "bank",
      note: payload.note || `购买${product.name}`,
      extra: {
        holdingId: holding.id,
        productId: product.id,
        productName: product.name,
        interest: holding.interest,
        payout: holding.payout,
        maturityAt: holding.maturityAt
      }
    });
    ledger.holdings.unshift(holding);
    ledger.holdings = ledger.holdings.slice(0, 160);
  } else if (action === "pay" || action === "menu-order") {
    const from = getLocalCoinAccount(ledger, payload.from, "付款账户");
    const to = getLocalCoinAccount(ledger, payload.to, "收款账户");

    if (from.id === to.id) {
      throw new Error("付款和收款不能是同一个账户");
    }

    transaction = makeLocalTransaction({
      action,
      amount,
      from: from.id,
      to: to.id,
      note: payload.note || (action === "menu-order" ? "熊熊菜单下单" : "支付")
    });
  } else {
    throw new Error("未知的小熊币操作");
  }

  if (transaction.from) {
    assertLocalCanDebit(ledger.accounts[transaction.from], transaction.amount);
  }

  if (transaction.from) {
    ledger.accounts[transaction.from].balance -= transaction.amount;
  }

  if (transaction.to) {
    ledger.accounts[transaction.to].balance += transaction.amount;
  }

  ledger.transactions.unshift(transaction);
  ledger.transactions = ledger.transactions.slice(0, 120);
  ledger.updatedAt = transaction.createdAt;
  writeLocalLedger(ledger);

  return { ledger, transaction, localFallback: true };
}

function runLocalAuthAction(payload) {
  const auth = readLocalAuth();
  const accountId = getAccountIdByUsername(payload?.username);

  if (!accountId) {
    throw new Error("用户名不是有效账户");
  }

  const account = auth.accounts[accountId];
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (payload?.action === "login") {
    if (!account.passwordSet) {
      if (password !== "") {
        throw new Error("首次登录密码请留空，然后设置新密码");
      }

      return {
        account: getPublicAccount(accountId),
        mustChangePassword: true
      };
    }

    if (password !== account.password) {
      throw new Error("用户名或密码不对");
    }

    return {
      account: getPublicAccount(accountId),
      mustChangePassword: false
    };
  }

  if (payload?.action === "set-password") {
    const newPassword = typeof payload?.newPassword === "string" ? payload.newPassword : "";

    if (newPassword.trim().length < 4) {
      throw new Error("新密码至少需要 4 位");
    }

    if (newPassword.length > 64) {
      throw new Error("新密码不能超过 64 位");
    }

    if (account.passwordSet && password !== account.password) {
      throw new Error("原密码不对");
    }

    if (!account.passwordSet && password !== "") {
      throw new Error("首次设置密码时旧密码请留空");
    }

    account.password = newPassword;
    account.passwordSet = true;
    writeLocalAuth(auth);

    return {
      account: getPublicAccount(accountId),
      mustChangePassword: false
    };
  }

  throw new Error("未知的登录操作");
}

async function requestAuth(payload) {
  try {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (isLocalPreview() && shouldUseLocalFallback(response)) {
        return runLocalAuthAction(payload);
      }

      throw new Error(data.error || "登录失败");
    }

    return data;
  } catch (error) {
    if (isLocalPreview() && shouldUseLocalFallback(error)) {
      return runLocalAuthAction(payload);
    }

    throw error;
  }
}

function initializeAuth() {
  renderSelectOptions(loginUsernameEl, ACCOUNT_IDS, "onetwo");

  try {
    const savedAccount = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) || "null");

    if (savedAccount && ACCOUNT_IDS.includes(savedAccount.id)) {
      applyAuthenticatedState(savedAccount);
      return;
    }
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }

  requireLogin();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  startWarmup();
  loginSubmitEl.disabled = true;
  setLoginMessage("正在登录...");

  try {
    const data = await requestAuth({
      action: "login",
      username: loginUsernameEl.value,
      password: loginPasswordEl.value
    });

    if (data.mustChangePassword) {
      showPasswordForm(data.account, loginPasswordEl.value);
      return;
    }

    applyAuthenticatedState(data.account);
    showToast(`${data.account.name} 已登录。`);
  } catch (error) {
    setLoginMessage(error.message, "error");
  } finally {
    loginSubmitEl.disabled = false;
  }
}

async function handlePasswordSubmit(event) {
  event.preventDefault();
  startWarmup();

  if (!pendingPasswordAccount) {
    showLoginForm("请先登录账户。");
    return;
  }

  if (newPasswordEl.value !== confirmPasswordEl.value) {
    setLoginMessage("两次输入的新密码不一致。", "error");
    return;
  }

  passwordSubmitEl.disabled = true;
  setLoginMessage("正在保存密码...");

  try {
    const data = await requestAuth({
      action: "set-password",
      username: pendingPasswordAccount.id,
      password: pendingPassword,
      newPassword: newPasswordEl.value
    });

    applyAuthenticatedState(data.account);
    showToast("密码已保存，登录成功。");
  } catch (error) {
    setLoginMessage(error.message, "error");
  } finally {
    passwordSubmitEl.disabled = false;
  }
}

function setPasswordChangeMessage(message = "", tone = "normal") {
  changePasswordMessageEl.textContent = message;
  changePasswordMessageEl.dataset.tone = tone;
}

function resetPasswordChangeForm() {
  currentPasswordEl.value = "";
  changeNewPasswordEl.value = "";
  changeConfirmPasswordEl.value = "";
  setPasswordChangeMessage("");
}

function openPasswordChange() {
  if (!activeAccount) {
    requireLogin("请先登录账户。");
    return;
  }

  if (dialogEl.open) {
    dialogEl.close();
  }

  if (orderDialogEl.open) {
    orderDialogEl.close();
  }

  if (coinDialogEl.open) {
    coinDialogEl.close();
  }

  changePasswordAccountEl.textContent = `${activeAccount.name} 当前登录`;
  resetPasswordChangeForm();
  passwordDialogEl.showModal();
  window.setTimeout(() => currentPasswordEl.focus(), 0);
}

async function handleChangePasswordSubmit(event) {
  event.preventDefault();
  startWarmup();

  if (!activeAccount) {
    passwordDialogEl.close();
    requireLogin("请先登录账户。");
    return;
  }

  if (!currentPasswordEl.value) {
    setPasswordChangeMessage("请输入原密码。", "error");
    return;
  }

  if (changeNewPasswordEl.value !== changeConfirmPasswordEl.value) {
    setPasswordChangeMessage("两次输入的新密码不一致。", "error");
    return;
  }

  changePasswordSubmitEl.disabled = true;
  setPasswordChangeMessage("正在保存新密码...");

  try {
    const data = await requestAuth({
      action: "set-password",
      username: activeAccount.id,
      password: currentPasswordEl.value,
      newPassword: changeNewPasswordEl.value
    });

    activeAccount = getPublicAccount(data.account.id);
    saveAuthSession(activeAccount);
    authUserEl.textContent = activeAccount.name;
    portalUserEl.textContent = activeAccount.name;
    resetPasswordChangeForm();
    passwordDialogEl.close();
    showToast("密码修改成功。");
  } catch (error) {
    setPasswordChangeMessage(error.message, "error");
  } finally {
    changePasswordSubmitEl.disabled = false;
  }
}

function logout() {
  if (dialogEl.open) {
    dialogEl.close();
  }

  if (orderDialogEl.open) {
    orderDialogEl.close();
  }

  if (commissionDialogEl.open) {
    commissionDialogEl.close();
  }

  if (passwordDialogEl.open) {
    passwordDialogEl.close();
  }

  if (coinDialogEl.open) {
    coinDialogEl.close();
  }

  requireLogin("已退出登录。");
}

function renderTransactionItems(transactions, emptyMessage) {
  if (!transactions.length) {
    return `<p class="coin-empty">${emptyMessage}</p>`;
  }

  return transactions
    .map((transaction) => {
      const from = transaction.from ? getAccountName(transaction.from) : "外部";
      const to = transaction.to ? getAccountName(transaction.to) : "外部";
      const route = transaction.from || transaction.to ? `${from} → ${to}` : transaction.label;
      const note = transaction.note ? `<small>${escapeHtml(transaction.note)}</small>` : "";

      return `
        <article class="coin-ledger-item">
          <div>
            <strong>${escapeHtml(transaction.label)}</strong>
            <span>${escapeHtml(route)}</span>
            ${note}
          </div>
          <div>
            <strong>${transaction.amount}</strong>
            <time>${formatCoinTime(transaction.createdAt)}</time>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCoinAccounts() {
  if (!coinLedger) {
    coinAccountsEl.innerHTML = `
      <article class="coin-account-card is-loading">
        <span>正在读取线上账本</span>
        <strong>...</strong>
      </article>
    `;
    return;
  }

  coinAccountsEl.innerHTML = ACCOUNT_IDS.map((id) => {
    const account = coinLedger.accounts[id];

    return `
      <article class="coin-account-card">
        <span>${getAccountName(id)}</span>
        <strong>${account?.balance ?? 0}</strong>
        <small>小熊币</small>
      </article>
    `;
  }).join("");
}

function renderCoinLedger() {
  renderCoinAccounts();
  renderCoinQuery();
  renderSavingsPanel();

  if (!coinLedger) {
    coinLedgerEl.innerHTML = `<p class="coin-empty">打开后会显示最近流水。</p>`;
    return;
  }

  coinLedgerEl.innerHTML = renderTransactionItems(
    coinLedger.transactions.slice(0, 10),
    "还没有流水，先记一笔小熊币吧。"
  );
}

function getCommissionStatusText(commission) {
  if (commission.status === "completed") {
    return "已完成";
  }

  if (commission.status === "accepted") {
    return "进行中";
  }

  return "待接受";
}

function renderCommissionAction(commission) {
  if (!activeAccount) {
    return "";
  }

  const commissionId = escapeHtml(commission.id);

  if (commission.status === "open") {
    if (commission.requesterId === activeAccount.id) {
      return `<button type="button" disabled>等待接受</button>`;
    }

    return `<button type="button" data-commission-action="accept" data-commission-id="${commissionId}">接受委托</button>`;
  }

  if (commission.status === "accepted") {
    const isRequester = commission.requesterId === activeAccount.id;
    const isAssignee = commission.assigneeId === activeAccount.id;

    if (isRequester && !commission.requesterConfirmed) {
      return `<button type="button" data-commission-action="confirm" data-commission-id="${commissionId}">确认完成</button>`;
    }

    if (isAssignee && !commission.assigneeConfirmed) {
      return `<button type="button" data-commission-action="confirm" data-commission-id="${commissionId}">确认完成</button>`;
    }

    if (isRequester || isAssignee) {
      return `<button type="button" disabled>已确认，等对方</button>`;
    }

    return `<button type="button" disabled>进行中</button>`;
  }

  return `<button type="button" disabled>已结算</button>`;
}

function renderCommissionList() {
  if (!commissionListEl) {
    return;
  }

  if (!coinLedger) {
    commissionListEl.innerHTML = `<p class="coin-empty">正在读取委托...</p>`;
    return;
  }

  const commissions = coinLedger.commissions || [];

  if (!commissions.length) {
    commissionListEl.innerHTML = `<p class="coin-empty">还没有委托，可以先发布一个。</p>`;
    return;
  }

  commissionListEl.innerHTML = commissions.slice(0, 30).map((commission) => {
    const requester = getAccountName(commission.requesterId);
    const assignee = commission.assigneeId ? getAccountName(commission.assigneeId) : "待接受";
    const requesterDone = commission.requesterConfirmed ? "委托人已确认" : "委托人未确认";
    const assigneeDone = commission.assigneeConfirmed ? "被委托人已确认" : "被委托人未确认";
    const detail = commission.detail ? `<p>${escapeHtml(commission.detail)}</p>` : "";

    return `
      <article class="commission-card ${commission.status === "completed" ? "is-completed" : ""}">
        <header>
          <div>
            <h4>${escapeHtml(commission.title)}</h4>
            ${detail}
          </div>
          <strong>${commission.bounty}</strong>
        </header>
        <div class="commission-meta">
          <span>${getCommissionStatusText(commission)}</span>
          <span>委托人 ${requester}</span>
          <span>接受人 ${assignee}</span>
          <span>${requesterDone}</span>
          <span>${assigneeDone}</span>
        </div>
        ${renderCommissionAction(commission)}
      </article>
    `;
  }).join("");
}

function getAccountStats(accountId) {
  const transactions = coinLedger?.transactions || [];
  const balance = Number(coinLedger?.accounts?.[accountId]?.balance ?? 0);
  const stats = {
    balance,
    saved: 0,
    fined: 0,
    income: 0,
    outgo: 0
  };

  for (const transaction of transactions) {
    const amount = Number(transaction.amount) || 0;

    if (transaction.to === accountId) {
      stats.income += amount;
    }

    if (transaction.from === accountId) {
      stats.outgo += amount;
    }

    if (transaction.action === "save" && transaction.to === "bank") {
      if (accountId === "bank" || transaction.from === accountId) {
        stats.saved += amount;
      }
    }

    if (transaction.action === "fine" && transaction.to === "bank") {
      if (accountId === "bank" || transaction.from === accountId) {
        stats.fined += amount;
      }
    }
  }

  return stats;
}

function renderStatCard(label, value) {
  return `
    <article class="coin-query-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>小熊币</small>
    </article>
  `;
}

function formatSavingsRate(rate) {
  return `${Math.round(rate * 100)}%`;
}

function formatSavingsDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  });
}

function getSavingsDuration(product) {
  return product.termDays ? `${product.termDays}天` : `${product.termMonths}个月`;
}

function getHoldingStatus(holding) {
  if (holding.status === "redeemed") {
    return "已返还";
  }

  const daysLeft = Math.ceil((new Date(holding.maturityAt).getTime() - Date.now()) / 86400000);
  return daysLeft > 0 ? `还剩 ${daysLeft} 天` : "待返还";
}

function renderSavingsProducts() {
  savingsProductsEl.innerHTML = savingsProducts.map((product) => {
    const isDefault = product.id === DEFAULT_SAVINGS_PRODUCT_ID;
    const amountLabel = product.fixedAmount ? `${product.fixedAmount} 小熊币` : "自定义本金";
    const projectedInterest = product.fixedAmount ? calculateSavingsInterest(product.fixedAmount, product) : null;
    const button = product.fixedAmount
      ? `<button type="button" data-savings-product="${product.id}">购买</button>`
      : `<button type="button" data-savings-product="${product.id}">填入表单</button>`;

    return `
      <article class="savings-product-card ${isDefault ? "is-default" : ""}">
        <div>
          <span>${isDefault ? "默认产品" : "限时产品"}</span>
          <strong>${product.name}</strong>
          <p>${product.summary}</p>
        </div>
        <dl>
          <div><dt>本金</dt><dd>${amountLabel}</dd></div>
          <div><dt>期限</dt><dd>${getSavingsDuration(product)}</dd></div>
          <div><dt>月利率</dt><dd>${formatSavingsRate(product.monthlyRate)}</dd></div>
          ${projectedInterest === null ? "" : `<div><dt>预计利息</dt><dd>${projectedInterest}</dd></div>`}
        </dl>
        ${button}
      </article>
    `;
  }).join("");
}

function renderSavingsHoldings() {
  const holdings = coinLedger?.holdings || [];

  if (!holdings.length) {
    savingsHoldingsEl.innerHTML = `<p class="coin-empty">还没有购买理财产品。</p>`;
    return;
  }

  savingsHoldingsEl.innerHTML = holdings.slice(0, 12).map((holding) => `
    <article class="savings-holding-card ${holding.status === "redeemed" ? "is-redeemed" : ""}">
      <div>
        <span>${getAccountName(holding.accountId)} · ${getHoldingStatus(holding)}</span>
        <strong>${holding.productName}</strong>
        <p>到期 ${formatSavingsDate(holding.maturityAt)} · 本金 ${holding.principal} + 利息 ${holding.interest}</p>
      </div>
      <strong>${holding.payout}</strong>
    </article>
  `).join("");
}

function renderSavingsPanel() {
  if (!savingsProductsEl || !savingsHoldingsEl) {
    return;
  }

  renderSavingsProducts();
  renderSavingsHoldings();
}

function renderCoinQuery() {
  const selectedAccount = coinQueryAccountEl.value || "onetwo";

  if (!coinQueryAccountEl.options.length) {
    renderSelectOptions(coinQueryAccountEl, ACCOUNT_IDS, selectedAccount);
  }

  if (!coinLedger) {
    coinQuerySummaryEl.innerHTML = `<p class="coin-empty">正在读取账户余额...</p>`;
    coinQueryLedgerEl.innerHTML = "";
    return;
  }

  const accountId = coinLedger.accounts[selectedAccount] ? selectedAccount : "onetwo";
  const accountName = getAccountName(accountId);
  const stats = getAccountStats(accountId);
  const cards = accountId === "bank"
    ? [
        renderStatCard("Bank 余额", stats.balance),
        renderStatCard("储值入账", stats.saved),
        renderStatCard("罚款入账", stats.fined),
        renderStatCard("入账合计", stats.income)
      ]
    : [
        renderStatCard("账户余额", stats.balance),
        renderStatCard("已储值", stats.saved),
        renderStatCard("已罚款", stats.fined),
        renderStatCard("余额+储值", stats.balance + stats.saved)
      ];
  const relatedTransactions = coinLedger.transactions
    .filter((transaction) => transaction.from === accountId || transaction.to === accountId)
    .slice(0, 8);

  coinQuerySummaryEl.innerHTML = cards.join("");
  coinQueryLedgerEl.innerHTML = `
    <div class="coin-query-title">
      <span>${accountName}</span>
      <strong>账户流水</strong>
    </div>
    ${renderTransactionItems(relatedTransactions, `${accountName} 还没有相关流水。`)}
  `;
}

function canUseCoinMode(mode) {
  return mode !== "add" || activeAccount?.id === "bank";
}

function getDefaultCoinMode() {
  return activeAccount?.id === "bank" ? "add" : "pay";
}

function getDefaultPayFromAccount() {
  if (activeAccount?.id && ACCOUNT_IDS.includes(activeAccount.id)) {
    return activeAccount.id;
  }

  return "onetwo";
}

function getDefaultPayToAccount(fromAccountId) {
  if (TRANSFER_ACCOUNTS.includes(fromAccountId)) {
    return TRANSFER_ACCOUNTS.find((id) => id !== fromAccountId);
  }

  return "nono";
}

function getDefaultSavingsAccount() {
  if (activeAccount?.id && TRANSFER_ACCOUNTS.includes(activeAccount.id)) {
    return activeAccount.id;
  }

  return "nono";
}

function setCoinMode(mode) {
  const requestedMode = COIN_MODE_CONFIG[mode] ? mode : getDefaultCoinMode();
  coinMode = canUseCoinMode(requestedMode) ? requestedMode : getDefaultCoinMode();
  const config = COIN_MODE_CONFIG[coinMode];
  const isQueryMode = coinMode === "query";

  document.querySelectorAll("[data-coin-mode]").forEach((button) => {
    button.hidden = !canUseCoinMode(button.dataset.coinMode);
    button.classList.toggle("is-active", button.dataset.coinMode === coinMode);
  });

  coinFormEl.hidden = isQueryMode;
  coinQueryPanelEl.hidden = !isQueryMode;
  savingsPanelEl.hidden = coinMode !== "save";

  if (isQueryMode) {
    renderSelectOptions(coinQueryAccountEl, ACCOUNT_IDS, coinQueryAccountEl.value || "onetwo");
    renderCoinQuery();
    return;
  }

  coinFromLabelEl.textContent = config.fromLabel;
  coinSubmitEl.textContent = config.submitLabel;
  coinToFieldEl.hidden = !config.showTo;
  coinToFieldEl.querySelector("span").textContent = coinMode === "save" ? "收款账户（固定）" : "收款账户";
  coinToEl.disabled = coinMode === "save";
  coinAmountEl.placeholder = coinMode === "save" ? "自定义本金" : "1";
  coinNoteEl.placeholder = coinMode === "save" ? "定期储蓄备注..." : "晚饭、奖励、迟到...";

  const fromAccount = coinMode === "pay"
    ? getDefaultPayFromAccount()
    : coinMode === "save"
      ? getDefaultSavingsAccount()
      : config.fromAccounts[0];
  renderSelectOptions(coinFromEl, config.fromAccounts, fromAccount);

  if (config.showTo) {
    renderSelectOptions(coinToEl, config.toAccounts, coinMode === "pay" ? getDefaultPayToAccount(fromAccount) : "bank");
  }
}

async function fetchCoinLedger() {
  renderCoinAccounts();
  coinLedgerEl.innerHTML = `<p class="coin-empty">正在读取线上账本...</p>`;

  try {
    const response = await fetch(COIN_API_URL, {
      headers: {
        Accept: "application/json"
      }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (isLocalPreview() && shouldUseLocalFallback(response)) {
        coinLedger = readLocalLedger();
        savingsProducts = SAVINGS_PRODUCTS;
        renderCoinLedger();
        renderCommissionList();
        return { ledger: coinLedger, localFallback: true };
      }

      throw new Error(data.error || "读取小熊币账本失败");
    }

    coinLedger = data.ledger;
    savingsProducts = Array.isArray(data.products) ? data.products : SAVINGS_PRODUCTS;
    renderCoinLedger();
    renderCommissionList();
    return data;
  } catch (error) {
    if (isLocalPreview() && shouldUseLocalFallback(error)) {
      coinLedger = readLocalLedger();
      savingsProducts = SAVINGS_PRODUCTS;
      renderCoinLedger();
      renderCommissionList();
      return { ledger: coinLedger, localFallback: true };
    }

    throw error;
  }
}

async function postCoinOperation(payload) {
  try {
    const response = await fetch(COIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (isLocalPreview() && shouldUseLocalFallback(response)) {
        const localData = applyLocalCoinOperation(payload);
        coinLedger = localData.ledger;
        savingsProducts = SAVINGS_PRODUCTS;
        renderCoinLedger();
        renderCommissionList();
        return localData;
      }

      throw new Error(data.error || "小熊币操作失败");
    }

    coinLedger = data.ledger;
    savingsProducts = Array.isArray(data.products) ? data.products : SAVINGS_PRODUCTS;
    renderCoinLedger();
    renderCommissionList();
    return data;
  } catch (error) {
    if (isLocalPreview() && shouldUseLocalFallback(error)) {
      const localData = applyLocalCoinOperation(payload);
      coinLedger = localData.ledger;
      savingsProducts = SAVINGS_PRODUCTS;
      renderCoinLedger();
      renderCommissionList();
      return localData;
    }

    throw error;
  }
}

async function openWallet() {
  coinDialogEl.showModal();
  setCoinMode(coinMode);

  try {
    await fetchCoinLedger();
  } catch (error) {
    coinLedgerEl.innerHTML = `<p class="coin-empty">读取失败，请稍后再试。</p>`;
    showToast(error.message);
  }
}

async function openCommission() {
  commissionUserEl.textContent = activeAccount ? `${activeAccount.name} 当前登录` : "";
  commissionDialogEl.showModal();
  renderCommissionList();

  try {
    await fetchCoinLedger();
  } catch (error) {
    commissionListEl.innerHTML = `<p class="coin-empty">读取委托失败，请稍后再试。</p>`;
    showToast(error.message);
  }
}

function setCommissionMessage(message = "", tone = "normal") {
  commissionMessageEl.textContent = message;
  commissionMessageEl.dataset.tone = tone;
}

async function handleCommissionFormSubmit(event) {
  event.preventDefault();

  if (!activeAccount) {
    requireLogin("请先登录账户。");
    return;
  }

  const amount = Math.trunc(Number(commissionBountyEl.value));

  if (!Number.isFinite(amount) || amount <= 0) {
    setCommissionMessage("赏金必须大于 0。", "error");
    return;
  }

  const availableBalance = Number(coinLedger?.accounts?.[activeAccount.id]?.balance ?? 0);

  if (coinLedger && amount > availableBalance) {
    setCommissionMessage(`${activeAccount.name} 余额不足，不能发布这个赏金。`, "error");
    return;
  }

  commissionSubmitEl.disabled = true;
  setCommissionMessage("正在发布委托...");

  try {
    await postCoinOperation({
      action: "create-commission",
      actor: activeAccount.id,
      amount,
      title: commissionTitleEl.value,
      detail: commissionDetailEl.value
    });
    commissionTitleEl.value = "";
    commissionBountyEl.value = "";
    commissionDetailEl.value = "";
    setCommissionMessage("委托已发布。");
    showToast("委托已发布。");
  } catch (error) {
    setCommissionMessage(error.message, "error");
  } finally {
    commissionSubmitEl.disabled = false;
  }
}

async function handleCommissionAction(action, commissionId, button) {
  if (!activeAccount) {
    requireLogin("请先登录账户。");
    return;
  }

  button.disabled = true;

  try {
    const payloadAction = action === "accept" ? "accept-commission" : "confirm-commission";
    const data = await postCoinOperation({
      action: payloadAction,
      actor: activeAccount.id,
      commissionId
    });

    if (data.transaction) {
      showToast("委托已完成，赏金已结算。");
    } else if (action === "accept") {
      showToast("委托已接受。");
    } else {
      showToast("已确认完成，等待对方确认。");
    }
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

async function handleCoinFormSubmit(event) {
  event.preventDefault();

  if (coinMode === "query") {
    return;
  }

  const amount = Math.trunc(Number(coinAmountEl.value));

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("先填一个大于 0 的小熊币数量。");
    return;
  }

  if (coinMode === "add" && activeAccount?.id !== "bank") {
    showToast("只有 Bank 可以添加小熊币。");
    return;
  }

  const payload = {
    action: coinMode,
    amount,
    note: coinNoteEl.value.trim(),
    actor: activeAccount?.id || ""
  };

  if (coinMode === "add" || coinMode === "fine" || coinMode === "save") {
    payload.account = coinFromEl.value;
  }

  if (coinMode === "save") {
    payload.productId = DEFAULT_SAVINGS_PRODUCT_ID;
  }

  if (coinMode === "pay") {
    payload.from = coinFromEl.value;
    payload.to = coinToEl.value;

    if (payload.from === payload.to) {
      showToast("付款和收款不能是同一个账户。");
      return;
    }
  }

  const debitAccountId = payload.from || (coinMode === "fine" || coinMode === "save" ? payload.account : "");
  const availableBalance = Number(coinLedger?.accounts?.[debitAccountId]?.balance ?? 0);

  if (debitAccountId && amount > availableBalance) {
    showToast(`${getAccountName(debitAccountId)} 余额不足，不能扣成负数。`);
    return;
  }

  coinSubmitEl.disabled = true;

  try {
    const data = await postCoinOperation(payload);
    coinAmountEl.value = "";
    coinNoteEl.value = "";
    showToast(`${data.transaction.label}已记账。`);
  } catch (error) {
    showToast(error.message);
  } finally {
    coinSubmitEl.disabled = false;
  }
}

async function buySavingsProduct(productId) {
  const product = getSavingsProduct(productId);

  if (!product.fixedAmount) {
    setCoinMode("save");
    coinAmountEl.focus();
    showToast("填写本金后即可购买默认定期。");
    return;
  }

  const account = TRANSFER_ACCOUNTS.includes(coinFromEl.value) ? coinFromEl.value : getDefaultSavingsAccount();
  const availableBalance = Number(coinLedger?.accounts?.[account]?.balance ?? 0);

  if (availableBalance < product.fixedAmount) {
    showToast(`${getAccountName(account)} 余额不足，购买这款产品需要 ${product.fixedAmount} 小熊币。`);
    return;
  }

  try {
    const data = await postCoinOperation({
      action: "save",
      amount: product.fixedAmount,
      account,
      actor: activeAccount?.id || "",
      productId: product.id,
      note: `购买${product.name}`
    });
    showToast(`${data.transaction.label}已记账，${product.name}购买成功。`);
  } catch (error) {
    showToast(error.message);
  }
}

async function refreshCoinQuery() {
  coinRefreshEl.disabled = true;

  try {
    await fetchCoinLedger();
    showToast("账户余额已刷新。");
  } catch (error) {
    coinQuerySummaryEl.innerHTML = `<p class="coin-empty">查询失败，请稍后再试。</p>`;
    coinQueryLedgerEl.innerHTML = "";
    showToast(error.message);
  } finally {
    coinRefreshEl.disabled = false;
  }
}

function changeDishCount(id, delta) {
  order[id] = Math.max(0, order[id] + delta);
  renderOrder();

  if (delta > 0) {
    showToast(`${dishes[id].name}加入今晚菜单`);
  }
}

function changePage(delta) {
  currentPage = (currentPage + delta + pages.length) % pages.length;
  preloadPageImages(currentPage);
  renderPage();
  showToast(`翻到${pages[currentPage].title}`);
}

function openDetail(id) {
  const dish = dishes[id];
  dialogImageEl.src = getDishImage(dish);
  dialogImageEl.alt = dish.name;
  dialogKickerEl.textContent = dish.kicker;
  dialogTitleEl.textContent = dish.name;
  dialogDescEl.textContent = dish.detail;
  dialogEl.showModal();
}

function buildMenuPaymentPayload(total, items, accounts) {
  const itemSummary = items.map(({ dish, count }) => `${dish.name} x${count}`).join("，");

  return {
    action: "menu-order",
    amount: total,
    from: accounts.from,
    to: accounts.to,
    actor: accounts.from,
    note: `熊熊菜单：${itemSummary}`
  };
}

function buildOrderMessage(paymentResult = null) {
  const items = getOrderItems();
  const lines = items.map(({ dish, count }) => `- ${dish.name} x${count} = ${dish.price * count} 小熊币`);
  const total = getOrderTotal(items);
  const paymentLines = paymentResult?.transaction
    ? [
        "",
        "小熊币付款",
        `- ${formatAccountRoute(paymentResult.transaction.from, paymentResult.transaction.to)}：${paymentResult.transaction.amount} 小熊币`,
        `- 交易号：${paymentResult.transaction.id}`,
        `- 余额：${formatBalances(paymentResult.ledger)}`
      ]
    : [];

  return [
    "熊熊菜单下单啦",
    "",
    ...lines,
    "",
    `合计：${total} 小熊币`,
    ...paymentLines,
    "",
    "主厨请开火。"
  ].join("\n");
}

function buildOrderPayload(message = buildOrderMessage(), paymentResult = null) {
  const items = getOrderItems();
  const itemSummary = items.map(({ dish, count }) => `${dish.name} x${count}`).join("，");
  const orderedAt = new Date().toLocaleString("zh-CN", { hour12: false });
  const transaction = paymentResult?.transaction;
  const payer = transaction?.from ? getAccountName(transaction.from) : "";
  const payee = transaction?.to ? getAccountName(transaction.to) : "";

  return {
    "form-name": ORDER_FORM_NAME,
    ordered_at: orderedAt,
    items: itemSummary,
    total: String(getOrderTotal(items)),
    payer,
    payee,
    payment: transaction ? `${payer} -> ${payee} ${transaction.amount} 小熊币` : "",
    transaction_id: transaction?.id || "",
    balances: formatBalances(paymentResult?.ledger),
    order: message
  };
}

async function submitOrder(payload) {
  const response = await fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(payload).toString()
  });

  if (!response.ok) {
    throw new Error(`Order submit failed: ${response.status}`);
  }
}

async function placeOrder() {
  if (isPlacingOrder) {
    return;
  }

  const items = getOrderItems();
  const totalCount = items.reduce((sum, { count }) => sum + count, 0);

  if (!totalCount) {
    showToast("先点一道菜，主厨才好开火。");
    return;
  }

  isPlacingOrder = true;
  const total = getOrderTotal(items);
  let paymentAccounts;

  try {
    paymentAccounts = getMenuPaymentAccounts();
  } catch (error) {
    showToast(error.message);
    isPlacingOrder = false;
    return;
  }

  const paymentRoute = formatAccountRoute(paymentAccounts.from, paymentAccounts.to);
  let message = buildOrderMessage();

  orderMessageEl.textContent = message;
  orderSendStatusEl.textContent = `正在把小熊币从 ${getAccountName(paymentAccounts.from)} 转给 ${getAccountName(paymentAccounts.to)}...`;
  orderDialogEl.showModal();
  showToast("订单小票已生成，正在处理小熊币。");

  let paymentResult;

  try {
    paymentResult = await postCoinOperation(buildMenuPaymentPayload(total, items, paymentAccounts));
  } catch (error) {
    orderSendStatusEl.textContent = `小熊币转账失败，订单没有自动发送：${error.message}`;
    showToast("小熊币转账失败，订单还没发出。");
    isPlacingOrder = false;
    return;
  }

  message = buildOrderMessage(paymentResult);
  orderMessageEl.textContent = message;
  orderSendStatusEl.textContent = `小熊币已到账 ${getAccountName(paymentAccounts.to)}，正在发送订单通知...`;

  try {
    await submitOrder(buildOrderPayload(message, paymentResult));
    orderSendStatusEl.textContent = `订单通知已自动发出，${total} 小熊币已完成 ${paymentRoute}。`;
    showToast("下单成功，小熊币已到账。");
  } catch {
    orderSendStatusEl.textContent = "小熊币已到账，但订单通知自动发送失败，请用下面按钮发给主厨。";
    showToast("订单通知失败，但小熊币已到账。");
  } finally {
    isPlacingOrder = false;
  }
}

async function copyOrderMessage() {
  const message = orderMessageEl.textContent || buildOrderMessage();

  try {
    await navigator.clipboard.writeText(message);
    showToast("订单已复制，粘贴到微信发给主厨。");
  } catch {
    showToast("复制失败，请长按小票文字手动复制。");
  }
}

async function shareOrderMessage() {
  const message = orderMessageEl.textContent || buildOrderMessage();

  if (navigator.share) {
    try {
      await navigator.share({
        title: "熊熊菜单",
        text: message
      });
      showToast("订单已打开分享面板。");
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
    }
  }

  await copyOrderMessage();
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  const detailButton = event.target.closest("[data-open-detail]");
  const savingsButton = event.target.closest("[data-savings-product]");
  const commissionButton = event.target.closest("[data-commission-action]");

  if (detailButton) {
    openDetail(detailButton.dataset.openDetail);
    return;
  }

  if (savingsButton) {
    if (!activeAccount) {
      requireLogin("请先登录账户。");
      return;
    }

    buySavingsProduct(savingsButton.dataset.savingsProduct);
    return;
  }

  if (commissionButton) {
    handleCommissionAction(commissionButton.dataset.commissionAction, commissionButton.dataset.commissionId, commissionButton);
    return;
  }

  if (!actionButton) {
    return;
  }

  const { action, dishId } = actionButton.dataset;

  if (action === "back-login") {
    showLoginForm("请重新登录。");
    return;
  }

  if (action === "logout") {
    logout();
    return;
  }

  if (!activeAccount) {
    requireLogin("请先登录账户。");
    return;
  }

  if (action === "open-password-change") {
    openPasswordChange();
    return;
  }

  if (action === "enter-menu") {
    ensureMenuRendered();
    setAppView("menu");
    showToast("进入点菜页面。");
    return;
  }

  if (action === "back-portal") {
    setAppView("portal");
    showToast("回到熊付宝。");
    return;
  }

  if (action === "enter-wallet") {
    setAppView("portal");
    openWallet();
    return;
  }

  if (action === "enter-commission") {
    setAppView("portal");
    openCommission();
    return;
  }

  if (action === "increase") {
    changeDishCount(dishId, 1);
  }

  if (action === "decrease") {
    changeDishCount(dishId, -1);
  }

  if (action === "prev-page") {
    changePage(-1);
  }

  if (action === "next-page") {
    changePage(1);
  }

  if (action === "order") {
    placeOrder();
  }

  if (action === "open-wallet") {
    openWallet();
  }

  if (action === "copy-order") {
    copyOrderMessage();
  }

  if (action === "share-order") {
    shareOrderMessage();
  }
});

document.querySelector("[data-close-dialog]").addEventListener("click", () => {
  dialogEl.close();
});

dialogEl.addEventListener("click", (event) => {
  if (event.target === dialogEl) {
    dialogEl.close();
  }
});

document.querySelector("[data-close-order-dialog]").addEventListener("click", () => {
  orderDialogEl.close();
});

orderDialogEl.addEventListener("click", (event) => {
  if (event.target === orderDialogEl) {
    orderDialogEl.close();
  }
});

document.querySelector("[data-close-commission-dialog]").addEventListener("click", () => {
  commissionDialogEl.close();
});

commissionDialogEl.addEventListener("click", (event) => {
  if (event.target === commissionDialogEl) {
    commissionDialogEl.close();
  }
});

document.querySelector("[data-close-password-dialog]").addEventListener("click", () => {
  passwordDialogEl.close();
});

passwordDialogEl.addEventListener("click", (event) => {
  if (event.target === passwordDialogEl) {
    passwordDialogEl.close();
  }
});

document.querySelector("[data-close-coin-dialog]").addEventListener("click", () => {
  coinDialogEl.close();
});

coinDialogEl.addEventListener("click", (event) => {
  if (event.target === coinDialogEl) {
    coinDialogEl.close();
  }
});

document.querySelectorAll("[data-coin-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    setCoinMode(button.dataset.coinMode);
  });
});

coinQueryAccountEl.addEventListener("change", renderCoinQuery);
coinFromEl.addEventListener("change", () => {
  if (coinMode === "pay" && coinFromEl.value === coinToEl.value) {
    coinToEl.value = getDefaultPayToAccount(coinFromEl.value);
  }
});
coinRefreshEl.addEventListener("click", refreshCoinQuery);
coinFormEl.addEventListener("submit", handleCoinFormSubmit);
commissionFormEl.addEventListener("submit", handleCommissionFormSubmit);
loginFormEl.addEventListener("submit", handleLoginSubmit);
passwordFormEl.addEventListener("submit", handlePasswordSubmit);
changePasswordFormEl.addEventListener("submit", handleChangePasswordSubmit);
loginUsernameEl.addEventListener("focus", startWarmup);
loginPasswordEl.addEventListener("focus", startWarmup);

setCoinMode(coinMode);
initializeAuth();
runWhenIdle(startWarmup, 600);
