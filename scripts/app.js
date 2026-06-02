const dishes = {
  ribs: {
    name: "糖醋排骨",
    price: 55,
    image: "assets/sweet-sour-ribs.png",
    kicker: "酸甜 / 油亮 / 下饭",
    detail: "酸甜口的第一道热菜，适合配米饭。主厨建议趁热吃，酱汁留一点拌饭。"
  },
  wings: {
    name: "可乐鸡翅",
    price: 45,
    image: "assets/cola-chicken-wings.png",
    kicker: "焦香 / 微甜 / 温柔",
    detail: "鸡翅煎到边缘微焦，再用可乐慢慢收汁。甜度不会太高，适合当今晚压轴。"
  }
};

const order = {
  ribs: 0,
  wings: 0
};

const summaryEl = document.querySelector("[data-order-summary]");
const totalEl = document.querySelector("[data-total]");
const toastEl = document.querySelector("[data-toast]");
const dialogEl = document.querySelector("[data-dialog]");
const dialogImageEl = document.querySelector("[data-dialog-image]");
const dialogKickerEl = document.querySelector("[data-dialog-kicker]");
const dialogTitleEl = document.querySelector("[data-dialog-title]");
const dialogDescEl = document.querySelector("[data-dialog-desc]");

let toastTimer;

function renderOrder() {
  let total = 0;
  const chosen = Object.entries(order)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      total += dishes[id].price * count;
      return `${dishes[id].name} x${count}`;
    });

  document.querySelectorAll("[data-count-for]").forEach((el) => {
    el.textContent = order[el.dataset.countFor];
  });

  summaryEl.textContent = chosen.length ? chosen.join(" + ") : "还没点菜";
  totalEl.textContent = total;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2200);
}

function changeDishCount(id, delta) {
  order[id] = Math.max(0, order[id] + delta);
  renderOrder();

  if (delta > 0) {
    showToast(`${dishes[id].name}加入今晚菜单`);
  }
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

function placeOrder() {
  const totalCount = Object.values(order).reduce((sum, count) => sum + count, 0);

  if (!totalCount) {
    showToast("先点一道菜，主厨才好开火。");
    return;
  }

  if (totalCount >= 2) {
    showToast("收到，今晚双拼开饭，饭后拥抱已安排。");
    return;
  }

  showToast("收到，主厨马上开工。");
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

  if (action === "quick-pair") {
    order.ribs = Math.max(order.ribs, 1);
    order.wings = Math.max(order.wings, 1);
    renderOrder();
    showToast("双拼已加入今晚菜单。");
  }

  if (action === "order") {
    placeOrder();
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

renderOrder();
