import { getStore } from "@netlify/blobs";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const STORE_NAME = "xiong-auth";
const AUTH_KEY = "accounts-v1";
const HASH_ITERATIONS = 120000;
const HASH_LENGTH = 32;
const ACCOUNT_ORDER = ["nono", "onetwo", "bank", "restaurant"];

const DEFAULT_AUTH = {
  version: 1,
  accounts: {
    nono: { id: "nono", name: "Nono", passwordSet: false, passwordHash: null, salt: null, updatedAt: null },
    onetwo: { id: "onetwo", name: "Onetwo", passwordSet: false, passwordHash: null, salt: null, updatedAt: null },
    bank: { id: "bank", name: "Bank", passwordSet: false, passwordHash: null, salt: null, updatedAt: null },
    restaurant: { id: "restaurant", name: "Restaurant", passwordSet: false, passwordHash: null, salt: null, updatedAt: null }
  },
  updatedAt: null
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

function cloneDefaultAuth() {
  return JSON.parse(JSON.stringify(DEFAULT_AUTH));
}

function normalizeAuth(savedAuth) {
  const auth = cloneDefaultAuth();

  if (savedAuth && typeof savedAuth === "object") {
    for (const id of ACCOUNT_ORDER) {
      const savedAccount = savedAuth.accounts?.[id];

      if (!savedAccount || typeof savedAccount !== "object") {
        continue;
      }

      auth.accounts[id].passwordSet = Boolean(savedAccount.passwordSet);
      auth.accounts[id].passwordHash = typeof savedAccount.passwordHash === "string" ? savedAccount.passwordHash : null;
      auth.accounts[id].salt = typeof savedAccount.salt === "string" ? savedAccount.salt : null;
      auth.accounts[id].updatedAt = savedAccount.updatedAt || null;
    }

    auth.updatedAt = savedAuth.updatedAt || null;
  }

  return auth;
}

function publicAccount(account) {
  return {
    id: account.id,
    name: account.name,
    passwordSet: Boolean(account.passwordSet)
  };
}

function publicAccounts(auth) {
  return ACCOUNT_ORDER.map((id) => publicAccount(auth.accounts[id]));
}

function resolveAccount(auth, username) {
  const normalized = String(username || "").trim().toLowerCase();
  const accountId = ACCOUNT_ORDER.find((id) => {
    const account = auth.accounts[id];
    return id === normalized || account.name.toLowerCase() === normalized;
  });

  if (!accountId) {
    throw new Error("用户名不是有效账户");
  }

  return auth.accounts[accountId];
}

function getPassword(value) {
  return typeof value === "string" ? value : "";
}

function getNewPassword(value) {
  const password = getPassword(value);

  if (password.trim().length < 4) {
    throw new Error("新密码至少需要 4 位");
  }

  if (password.length > 64) {
    throw new Error("新密码不能超过 64 位");
  }

  return password;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const passwordHash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_LENGTH, "sha256").toString("hex");
  return { passwordHash, salt };
}

function verifyPassword(account, password) {
  if (!account.passwordSet) {
    return password === "";
  }

  if (!account.passwordHash || !account.salt) {
    return false;
  }

  const expected = Buffer.from(account.passwordHash, "hex");
  const actual = Buffer.from(hashPassword(password, account.salt).passwordHash, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function readAuth() {
  const store = getStore(STORE_NAME);
  const savedAuth = await store.get(AUTH_KEY, { type: "json" });
  return normalizeAuth(savedAuth);
}

async function writeAuth(auth) {
  const store = getStore(STORE_NAME);
  await store.setJSON(AUTH_KEY, auth);
}

function login(auth, payload) {
  const account = resolveAccount(auth, payload?.username);
  const password = getPassword(payload?.password);

  if (!account.passwordSet) {
    if (password !== "") {
      throw new Error("首次登录密码请留空，然后设置新密码");
    }

    return {
      account: publicAccount(account),
      mustChangePassword: true
    };
  }

  if (!verifyPassword(account, password)) {
    throw new Error("用户名或密码不对");
  }

  return {
    account: publicAccount(account),
    mustChangePassword: false
  };
}

async function setPassword(auth, payload) {
  const account = resolveAccount(auth, payload?.username);
  const currentPassword = getPassword(payload?.password ?? payload?.currentPassword);
  const newPassword = getNewPassword(payload?.newPassword);

  if (!verifyPassword(account, currentPassword)) {
    throw new Error(account.passwordSet ? "原密码不对" : "首次设置密码时旧密码请留空");
  }

  const hashed = hashPassword(newPassword);
  const updatedAt = new Date().toISOString();

  account.passwordSet = true;
  account.passwordHash = hashed.passwordHash;
  account.salt = hashed.salt;
  account.updatedAt = updatedAt;
  auth.updatedAt = updatedAt;

  await writeAuth(auth);

  return {
    account: publicAccount(account),
    mustChangePassword: false
  };
}

export default async function handler(req) {
  if (req.method === "GET") {
    const auth = await readAuth();
    return json({ accounts: publicAccounts(auth) });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const auth = await readAuth();

    if (payload?.action === "login") {
      return json(login(auth, payload));
    }

    if (payload?.action === "set-password") {
      return json(await setPassword(auth, payload));
    }

    throw new Error("未知的登录操作");
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "登录失败"
    }, { status: 400 });
  }
}
