import xmlrpc from "xmlrpc";

const ODOO_BASE_URL = process.env.ODOO_BASE_URL || "";
const ODOO_DB = process.env.ODOO_DB || "";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

function getUrl() {
  return ODOO_BASE_URL.replace(/\/+$/, "");
}

function createClient(path: string) {
  const url = new URL(path, getUrl());
  const isSecure = url.protocol === "https:";
  const port = url.port ? parseInt(url.port) : (isSecure ? 443 : 80);
  const opts = { host: url.hostname, port, path: url.pathname };
  return isSecure ? xmlrpc.createSecureClient(opts) : xmlrpc.createClient(opts);
}

function rpcCall(client: xmlrpc.Client, method: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (err: Error | null, value: any) => {
      if (err) reject(err);
      else resolve(value);
    });
  });
}

let cachedUid: number | null = null;

async function authenticate(): Promise<number> {
  if (cachedUid !== null) return cachedUid;
  const client = createClient("/xmlrpc/2/common");
  const uid = await rpcCall(client, "authenticate", [
    ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}
  ]);
  if (!uid || uid === false) {
    throw new Error("Odoo authentication failed");
  }
  cachedUid = uid as number;
  console.log("[odoo] Authenticated successfully");
  return cachedUid;
}

async function executeKw(model: string, method: string, args: any[], kwargs: Record<string, any> = {}): Promise<any> {
  const uid = await authenticate();
  const client = createClient("/xmlrpc/2/object");
  return rpcCall(client, "execute_kw", [
    ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs
  ]);
}

export async function searchRead(
  model: string,
  domain: any[][],
  fields: string[],
  limit?: number
): Promise<any[]> {
  const kwargs: Record<string, any> = { fields };
  if (limit) kwargs.limit = limit;
  return executeKw(model, "search_read", [domain], kwargs);
}

export async function create(model: string, values: Record<string, any>): Promise<number> {
  return executeKw(model, "create", [values]);
}

export async function write(model: string, ids: number[], values: Record<string, any>): Promise<boolean> {
  return executeKw(model, "write", [ids, values]);
}

export async function search(model: string, domain: any[][]): Promise<number[]> {
  return executeKw(model, "search", [domain]);
}

const PRODUCT_CODE_MAP: Record<string, string> = {
  "101001": "mango-premium-drink",
  "101002": "guava-premium-drink",
  "101003": "cocktail-premium-drink",
  "101004": "orange-premium-drink",
};

export async function syncProductsFromOdoo(
  getProducts: () => Promise<any[]>,
  updateProduct: (id: number, data: Record<string, any>) => Promise<void>
): Promise<void> {
  if (!ODOO_BASE_URL || !ODOO_DB || !ODOO_USERNAME || !ODOO_API_KEY) {
    console.log("[odoo] Skipping product sync — missing Odoo credentials");
    return;
  }

  try {
    const codes = Object.keys(PRODUCT_CODE_MAP);
    const odooProducts = await searchRead(
      "product.product",
      [["default_code", "in", codes]],
      ["name", "default_code", "list_price", "image_1920", "description_sale"]
    );

    console.log(`[odoo] Fetched ${odooProducts.length} products from Odoo`);

    const localProducts = await getProducts();

    for (const op of odooProducts) {
      const slug = PRODUCT_CODE_MAP[op.default_code];
      if (!slug) continue;

      const local = localProducts.find((p: any) => p.slug === slug);
      if (!local) continue;

      const updates: Record<string, any> = {
        defaultCode: op.default_code,
      };

      if (op.name) updates.name = op.name;
      if (op.list_price && op.list_price > 0) updates.price = Math.round(op.list_price);
      if (op.description_sale) updates.description = op.description_sale;

      if (op.image_1920 && typeof op.image_1920 === "string" && op.image_1920.length > 100) {
        let mime = "image/png";
        if (op.image_1920.startsWith("/9j/") || op.image_1920.startsWith("/9j+")) {
          mime = "image/jpeg";
        } else if (op.image_1920.startsWith("R0lGOD")) {
          mime = "image/gif";
        } else if (op.image_1920.startsWith("UklGR")) {
          mime = "image/webp";
        }
        updates.images = {
          ...local.images,
          packshot: `data:${mime};base64,${op.image_1920}`,
        };
      }

      await updateProduct(local.id, updates);
    }

    console.log("[odoo] Product sync complete");
  } catch (err) {
    console.error("[odoo] Product sync failed:", (err as Error).message);
  }
}

export async function createOrUpdatePartner(user: {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone: string;
}, address?: {
  fullName?: string;
  city?: string;
  addressLine?: string;
  phone?: string;
}, existingPartnerId?: number): Promise<number> {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const values: Record<string, any> = {
    name,
    email: user.email,
    phone: user.phone,
    customer_rank: 1,
  };

  if (address) {
    if (address.city) values.city = address.city;
    if (address.addressLine) values.street = address.addressLine;
    if (address.phone) values.phone = address.phone;
  }

  if (existingPartnerId) {
    await write("res.partner", [existingPartnerId], values);
    console.log(`[odoo] Updated partner ${existingPartnerId}`);
    return existingPartnerId;
  }

  const existing = await searchRead("res.partner", [["email", "=", user.email]], ["id"]);

  if (existing.length > 0) {
    const partnerId = existing[0].id;
    await write("res.partner", [partnerId], values);
    console.log(`[odoo] Updated partner ${partnerId}`);
    return partnerId;
  } else {
    const partnerId = await create("res.partner", values);
    console.log(`[odoo] Created partner ${partnerId}`);
    return partnerId;
  }
}

export async function getOdooProductId(defaultCode: string): Promise<number | null> {
  const results = await searchRead(
    "product.product",
    [["default_code", "=", defaultCode]],
    ["id"]
  );
  return results.length > 0 ? results[0].id : null;
}

export async function createSalesOrder(
  partnerId: number,
  items: { defaultCode: string; quantity: number; price: number }[],
  clientOrderRef: string
): Promise<number> {
  const codes = items.map(i => i.defaultCode);
  const odooProducts = await searchRead(
    "product.product",
    [["default_code", "in", codes]],
    ["id", "default_code"]
  );
  const codeToId: Record<string, number> = {};
  for (const op of odooProducts) {
    codeToId[op.default_code] = op.id;
  }

  const orderLines: [number, number, Record<string, any>][] = [];

  for (const item of items) {
    const productId = codeToId[item.defaultCode];
    if (!productId) {
      console.error(`[odoo] Product not found for code ${item.defaultCode}, skipping line`);
      continue;
    }

    orderLines.push([0, 0, {
      product_id: productId,
      product_uom_qty: item.quantity,
      price_unit: item.price,
    }]);
  }

  if (orderLines.length === 0) {
    throw new Error("No valid order lines to create");
  }

  const orderId = await create("sale.order", {
    partner_id: partnerId,
    client_order_ref: clientOrderRef,
    order_line: orderLines,
  });

  console.log(`[odoo] Created sales order ${orderId} (ref: ${clientOrderRef})`);
  return orderId;
}

export function isOdooConfigured(): boolean {
  return !!(ODOO_BASE_URL && ODOO_DB && ODOO_USERNAME && ODOO_API_KEY);
}
