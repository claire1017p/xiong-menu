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

let currentPage = 0;
let toastTimer;

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

function placeOrder() {
  const totalCount = Object.values(order).reduce((sum, count) => sum + count, 0);

  if (!totalCount) {
    showToast("先点一道菜，主厨才好开火。");
    return;
  }

  showToast("收到，今晚菜单已安排，主厨马上开工。");
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
});

document.querySelector("[data-close-dialog]").addEventListener("click", () => {
  dialogEl.close();
});

dialogEl.addEventListener("click", (event) => {
  if (event.target === dialogEl) {
    dialogEl.close();
  }
});

renderPage();
