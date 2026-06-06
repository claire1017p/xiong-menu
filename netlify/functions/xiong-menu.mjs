import { getStore } from "@netlify/blobs";

const STORE_NAME = "xiong-menu";
const MENU_KEY = "menu-v1";
const MAX_CATEGORIES = 24;
const MAX_DISHES = 160;
const MAX_IMAGE_LENGTH = 900000;
const RESTAURANT_ACCOUNT_ID = "restaurant";

const DEFAULT_CATEGORIES = [
  { id: "recommended", name: "店长推荐", emoji: "👍👍👍", sort: 10 },
  { id: "classic", name: "招牌热菜", emoji: "🍚🍚🍚", sort: 20 },
  { id: "home", name: "家常小菜", emoji: "❤️❤️❤️", sort: 30 }
];

const DEFAULT_DISHES = [
  {
    id: "ribs",
    categoryId: "classic",
    name: "糖醋排骨",
    price: 55,
    image: "assets/sweet-sour-ribs.jpg",
    description: "酸甜、油亮、很下饭。",
    detail: "酸甜口的第一道热菜，适合配米饭。主厨建议趁热吃，酱汁留一点拌饭。"
  },
  {
    id: "wings",
    categoryId: "recommended",
    name: "可乐鸡翅",
    price: 45,
    image: "assets/cola-chicken-wings.jpg",
    description: "焦香微甜，适合今晚慢慢吃。",
    detail: "鸡翅煎到边缘微焦，再用可乐慢慢收汁。甜度不会太高，适合当压轴。"
  },
  {
    id: "yuXiangPork",
    categoryId: "recommended",
    name: "鱼香肉丝",
    price: 35,
    image: "assets/yu-xiang-rou-si.jpg",
    description: "咸香微辣，经典下饭。",
    detail: "经典鱼香口，带一点酸甜和微辣。适合拌饭，也适合配一口清爽小菜。"
  },
  {
    id: "kungPaoChicken",
    categoryId: "classic",
    name: "宫保鸡丁",
    price: 35,
    image: "assets/gong-bao-ji-ding.jpg",
    description: "花生、鸡丁和辣椒香气很认真。",
    detail: "鸡丁先炒到嫩，再裹上咸甜微辣的酱汁。花生负责香，主厨负责认真。"
  },
  {
    id: "vegetables",
    categoryId: "home",
    name: "小炒时蔬",
    price: 15,
    image: "assets/stir-fried-vegetables.jpg",
    description: "给一桌热菜留一点清爽绿色。",
    detail: "时蔬快炒，保留脆口和鲜味。适合夹在肉菜中间吃，清清爽爽。"
  },
  {
    id: "tomatoEggs",
    categoryId: "home",
    name: "番茄炒蛋",
    price: 20,
    image: "assets/tomato-scrambled-eggs.jpg",
    description: "番茄汁裹住鸡蛋，是很温柔的家常味。",
    detail: "鸡蛋炒得软一点，番茄留一点汁。简单但很会哄人开心。"
  }
];

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers
  });
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanText(value, maxLength, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const text = value.trim().slice(0, maxLength);
  return text || fallback;
}

function normalizePrice(value) {
  const price = Math.trunc(Number(value));

  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }

  return Math.min(price, 99999);
}

function normalizeCategory(category, index = 0) {
  if (!category || typeof category !== "object") {
    return null;
  }

  const id = cleanText(category.id, 64);
  const name = cleanText(category.name, 24);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    emoji: cleanText(category.emoji, 12, "🍽️"),
    sort: Number.isFinite(Number(category.sort)) ? Number(category.sort) : index * 10
  };
}

function normalizeImage(value) {
  const image = cleanText(value, MAX_IMAGE_LENGTH);

  if (!image) {
    return "";
  }

  const isAllowed =
    image.startsWith("assets/") ||
    image.startsWith("data:image/") ||
    image.startsWith("https://") ||
    image.startsWith("http://");

  return isAllowed && image.length <= MAX_IMAGE_LENGTH ? image : "";
}

function normalizeDish(dish) {
  if (!dish || typeof dish !== "object") {
    return null;
  }

  const id = cleanText(dish.id, 80);
  const categoryId = cleanText(dish.categoryId, 64);
  const name = cleanText(dish.name, 40);
  const price = normalizePrice(dish.price);
  const image = normalizeImage(dish.image);

  if (!id || !categoryId || !name || !price || !image) {
    return null;
  }

  return {
    id,
    categoryId,
    name,
    price,
    image,
    description: cleanText(dish.description ?? dish.desc, 80),
    detail: cleanText(dish.detail, 180)
  };
}

function normalizeMenu(savedMenu) {
  const menu = {
    version: 1,
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
    dishes: DEFAULT_DISHES.map((dish) => ({ ...dish })),
    updatedAt: null
  };

  if (savedMenu && typeof savedMenu === "object") {
    const categories = Array.isArray(savedMenu.categories)
      ? savedMenu.categories.map(normalizeCategory).filter(Boolean).slice(0, MAX_CATEGORIES)
      : [];
    const categoryIds = new Set(categories.map((category) => category.id));
    const dishes = Array.isArray(savedMenu.dishes)
      ? savedMenu.dishes.map(normalizeDish).filter((dish) => dish && categoryIds.has(dish.categoryId)).slice(0, MAX_DISHES)
      : [];

    if (categories.length) {
      menu.categories = categories.sort((a, b) => a.sort - b.sort);
    }

    if (Array.isArray(savedMenu.dishes)) {
      menu.dishes = dishes;
    }

    menu.updatedAt = savedMenu.updatedAt || null;
  }

  return menu;
}

function assertRestaurant(payload) {
  if (payload?.actor !== RESTAURANT_ACCOUNT_ID) {
    throw new Error("只有 Restaurant 可以管理菜品");
  }
}

function addCategory(menu, payload) {
  const name = cleanText(payload.name, 24);
  const emoji = cleanText(payload.emoji, 12, "🍽️");

  if (!name) {
    throw new Error("分类名称不能为空");
  }

  if (menu.categories.some((category) => category.name === name)) {
    throw new Error("这个分类已经存在");
  }

  if (menu.categories.length >= MAX_CATEGORIES) {
    throw new Error("分类太多了，先整理一下菜单");
  }

  const category = {
    id: makeId("category"),
    name,
    emoji,
    sort: (menu.categories[menu.categories.length - 1]?.sort || 0) + 10
  };

  menu.categories.push(category);
  menu.updatedAt = new Date().toISOString();
  return { category };
}

function addDish(menu, payload) {
  const categoryId = cleanText(payload.categoryId, 64);
  const category = menu.categories.find((item) => item.id === categoryId);
  const name = cleanText(payload.name, 40);
  const price = normalizePrice(payload.price);
  const image = normalizeImage(payload.image);

  if (!category) {
    throw new Error("请选择有效分类");
  }

  if (!name) {
    throw new Error("菜品名称不能为空");
  }

  if (!price) {
    throw new Error("价格必须大于 0");
  }

  if (!image) {
    throw new Error("请上传有效图片");
  }

  if (menu.dishes.length >= MAX_DISHES) {
    throw new Error("菜品太多了，先删除一些再添加");
  }

  const dish = {
    id: makeId("dish"),
    categoryId: category.id,
    name,
    price,
    image,
    description: cleanText(payload.description, 80),
    detail: cleanText(payload.detail, 180)
  };

  menu.dishes.unshift(dish);
  menu.updatedAt = new Date().toISOString();
  return { dish };
}

function deleteDish(menu, payload) {
  const dishId = cleanText(payload.dishId, 80);
  const index = menu.dishes.findIndex((dish) => dish.id === dishId);

  if (index === -1) {
    throw new Error("菜品不存在");
  }

  const [dish] = menu.dishes.splice(index, 1);
  menu.updatedAt = new Date().toISOString();
  return { dish };
}

function applyOperation(menu, payload) {
  assertRestaurant(payload);

  if (payload?.action === "add-category") {
    return addCategory(menu, payload);
  }

  if (payload?.action === "add-dish") {
    return addDish(menu, payload);
  }

  if (payload?.action === "delete-dish") {
    return deleteDish(menu, payload);
  }

  throw new Error("未知的菜单操作");
}

async function readMenu() {
  const store = getStore(STORE_NAME);
  const savedMenu = await store.get(MENU_KEY, { type: "json", consistency: "strong" });
  return normalizeMenu(savedMenu);
}

async function writeMenu(menu) {
  const store = getStore(STORE_NAME);
  await store.setJSON(MENU_KEY, menu);
}

export default async function handler(req) {
  if (req.method === "GET") {
    try {
      return json({ menu: await readMenu() });
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : "读取菜单失败"
      }, { status: 400 });
    }
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const menu = await readMenu();
    const result = applyOperation(menu, payload);
    await writeMenu(menu);

    return json({
      menu,
      ...result
    });
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "菜单操作失败"
    }, { status: 400 });
  }
}
