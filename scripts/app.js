const dishes = {
  ribs: {
    name: "糖醋排骨",
    price: 55,
    image: "assets/sweet-sour-ribs.png",
    kicker: "酸甜 / 油亮 / 下饭",
    desc: "一口甜，一口酸，认真收汁到亮晶晶。",
    detail: "酸甜口的第一道热菜，适合配米饭。主厨建议趁热吃，酱汁留一点拌饭。"
  },
  wings: {
    name: "可乐鸡翅",
    price: 45,
    image: "assets/cola-chicken-wings.png",
    kicker: "焦香 / 微甜 / 温柔",
    desc: "可乐慢慢煮进鸡翅里，适合当压轴。",
    detail: "鸡翅煎到边缘微焦，再用可乐慢慢收汁。甜度不会太高，适合今晚慢慢吃。"
  },
  yuXiangPork: {
    name: "鱼香肉丝",
    price: 35,
    image: "assets/yu-xiang-rou-si.png",
    kicker: "咸香 / 微辣 / 下饭",
    desc: "肉丝细细炒开，酱香和酸甜都刚好。",
    detail: "经典鱼香口，带一点酸甜和微辣。适合拌饭，也适合配一口清爽小菜。"
  },
  kungPaoChicken: {
    name: "宫保鸡丁",
    price: 35,
    image: "assets/gong-bao-ji-ding.png",
    kicker: "花生 / 微辣 / 焦香",
    desc: "鸡丁、花生和辣椒香气凑成一盘热闹。",
    detail: "鸡丁先炒到嫩，再裹上咸甜微辣的酱汁。花生负责香，主厨负责认真。"
  },
  vegetables: {
    name: "小炒时蔬",
    price: 15,
    image: "assets/stir-fried-vegetables.png",
    kicker: "清爽 / 蒜香 / 解腻",
    desc: "给一桌热菜留一点清爽的绿色。",
    detail: "时蔬快炒，保留脆口和鲜味。适合夹在肉菜中间吃，清清爽爽。"
  },
  tomatoEggs: {
    name: "番茄炒蛋",
    price: 20,
    image: "assets/tomato-scrambled-eggs.png",
    kicker: "酸甜 / 软嫩 / 家常",
    desc: "番茄汁裹住鸡蛋，是很温柔的家常味。",
    detail: "鸡蛋炒得软一点，番茄留一点汁。简单但很会哄人开心。"
  }
};

const ORDER_FORM_NAME = "xiong-menu-order";
const COIN_API_URL = "/.netlify/functions/xiong-coins";
const ACCOUNT_IDS = ["nono", "onetwo", "bank"];
const TRANSFER_ACCOUNTS = ["nono", "onetwo"];
const ACCOUNT_NAMES = {
  nono: "Nono",
  onetwo: "Onetwo",
  bank: "Bank"
};

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
    submitLabel: "存入 Bank",
    showTo: false,
    fromAccounts: TRANSFER_ACCOUNTS
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
const orderDialogEl = document.querySelector("[data-order-dialog]");
const orderMessageEl = document.querySelector("[data-order-message]");
const orderSendStatusEl = document.querySelector("[data-order-send-status]");
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

let currentPage = 0;
let toastTimer;
let coinMode = "add";
let coinLedger = null;
let isPlacingOrder = false;

function renderPage() {
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
          <img src="${dish.image}" alt="${dish.name}" />
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

function renderSelectOptions(selectEl, accountIds, selectedId) {
  selectEl.innerHTML = accountIds
    .map((id) => `<option value="${id}" ${id === selectedId ? "selected" : ""}>${getAccountName(id)}</option>`)
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

  if (!coinLedger) {
    coinLedgerEl.innerHTML = `<p class="coin-empty">打开后会显示最近流水。</p>`;
    return;
  }

  if (!coinLedger.transactions.length) {
    coinLedgerEl.innerHTML = `<p class="coin-empty">还没有流水，先记一笔小熊币吧。</p>`;
    return;
  }

  coinLedgerEl.innerHTML = coinLedger.transactions
    .slice(0, 10)
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

function setCoinMode(mode) {
  coinMode = COIN_MODE_CONFIG[mode] ? mode : "add";
  const config = COIN_MODE_CONFIG[coinMode];

  document.querySelectorAll("[data-coin-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.coinMode === coinMode);
  });

  coinFromLabelEl.textContent = config.fromLabel;
  coinSubmitEl.textContent = config.submitLabel;
  coinToFieldEl.hidden = !config.showTo;

  renderSelectOptions(coinFromEl, config.fromAccounts, coinMode === "pay" ? "onetwo" : config.fromAccounts[0]);

  if (config.showTo) {
    renderSelectOptions(coinToEl, config.toAccounts, coinMode === "pay" ? "nono" : config.toAccounts[0]);
  }
}

async function fetchCoinLedger() {
  renderCoinAccounts();
  coinLedgerEl.innerHTML = `<p class="coin-empty">正在读取线上账本...</p>`;

  const response = await fetch(COIN_API_URL, {
    headers: {
      Accept: "application/json"
    }
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "读取小熊币账本失败");
  }

  coinLedger = data.ledger;
  renderCoinLedger();
  return data;
}

async function postCoinOperation(payload) {
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
    throw new Error(data.error || "小熊币操作失败");
  }

  coinLedger = data.ledger;
  renderCoinLedger();
  return data;
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

async function handleCoinFormSubmit(event) {
  event.preventDefault();

  const amount = Math.trunc(Number(coinAmountEl.value));

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("先填一个大于 0 的小熊币数量。");
    return;
  }

  const payload = {
    action: coinMode,
    amount,
    note: coinNoteEl.value.trim()
  };

  if (coinMode === "add" || coinMode === "fine" || coinMode === "save") {
    payload.account = coinFromEl.value;
  }

  if (coinMode === "pay") {
    payload.from = coinFromEl.value;
    payload.to = coinToEl.value;
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

function changeDishCount(id, delta) {
  order[id] = Math.max(0, order[id] + delta);
  renderOrder();

  if (delta > 0) {
    showToast(`${dishes[id].name}加入今晚菜单`);
  }
}

function changePage(delta) {
  currentPage = (currentPage + delta + pages.length) % pages.length;
  renderPage();
  showToast(`翻到${pages[currentPage].title}`);
}

function openDetail(id) {
  const dish = dishes[id];
  dialogImageEl.src = dish.image;
  dialogImageEl.alt = dish.name;
  dialogKickerEl.textContent = dish.kicker;
  dialogTitleEl.textContent = dish.name;
  dialogDescEl.textContent = dish.detail;
  dialogEl.showModal();
}

function buildMenuPaymentPayload(total, items) {
  const itemSummary = items.map(({ dish, count }) => `${dish.name} x${count}`).join("，");

  return {
    action: "menu-order",
    amount: total,
    from: "onetwo",
    to: "nono",
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
        `- Onetwo → Nono：${paymentResult.transaction.amount} 小熊币`,
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

  return {
    "form-name": ORDER_FORM_NAME,
    ordered_at: orderedAt,
    items: itemSummary,
    total: String(getOrderTotal(items)),
    payer: "Onetwo",
    payee: "Nono",
    payment: transaction ? `Onetwo -> Nono ${transaction.amount} 小熊币` : "",
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
  let message = buildOrderMessage();

  orderMessageEl.textContent = message;
  orderSendStatusEl.textContent = "正在把小熊币从 Onetwo 转给 Nono...";
  orderDialogEl.showModal();
  showToast("订单小票已生成，正在处理小熊币。");

  let paymentResult;

  try {
    paymentResult = await postCoinOperation(buildMenuPaymentPayload(total, items));
  } catch (error) {
    orderSendStatusEl.textContent = `小熊币转账失败，订单没有自动发送：${error.message}`;
    showToast("小熊币转账失败，订单还没发出。");
    isPlacingOrder = false;
    return;
  }

  message = buildOrderMessage(paymentResult);
  orderMessageEl.textContent = message;
  orderSendStatusEl.textContent = "小熊币已到账 Nono，正在发送订单通知...";

  try {
    await submitOrder(buildOrderPayload(message, paymentResult));
    orderSendStatusEl.textContent = `订单通知已自动发出，${total} 小熊币已从 Onetwo 转入 Nono。`;
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

  if (detailButton) {
    openDetail(detailButton.dataset.openDetail);
    return;
  }

  if (!actionButton) {
    return;
  }

  const { action, dishId } = actionButton.dataset;

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

coinFormEl.addEventListener("submit", handleCoinFormSubmit);

renderPage();
setCoinMode(coinMode);
