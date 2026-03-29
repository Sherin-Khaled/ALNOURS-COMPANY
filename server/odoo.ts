import xmlrpc from "xmlrpc";

const ODOO_BASE_URL = process.env.ODOO_BASE_URL || "";
const ODOO_DB = process.env.ODOO_DB || "";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";
const ODOO_LANG_EN = process.env.ODOO_LANG_EN?.trim();
const ODOO_LANG_AR = process.env.ODOO_LANG_AR?.trim();

function assertOdooConfigured() {
  if (!isOdooConfigured()) {
    throw new Error("Odoo is not configured");
  }
}

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
    client.methodCall(method, params, (err: any, value: any) => {
      if (err) reject(err);
      else resolve(value);
    });
  });
}

let cachedUid: number | null = null;

async function authenticate(): Promise<number> {
  assertOdooConfigured();
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
  assertOdooConfigured();
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
  limit?: number,
  context?: Record<string, any>
): Promise<any[]> {
  const kwargs: Record<string, any> = { fields };
  if (limit) kwargs.limit = limit;
  if (context && Object.keys(context).length > 0) {
    kwargs.context = context;
  }
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

type WebsiteLocale = "en" | "ar";

let cachedInstalledOdooLangCodes: string[] | null = null;
const cachedModelFieldNames = new Map<string, Set<string>>();
const ODOO_DESCRIPTION_FIELDS = [
  "description_ecommerce",
  "website_description",
  "description_sale",
  "description",
] as const;

function sanitizeOdooText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/li>\s*<li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function pickMeaningfulOdooDescription(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const cleaned = sanitizeOdooText(candidate);
    if (cleaned && !/^(n\/?a|na|none|null|undefined|-)$/.test(cleaned.toLowerCase())) {
      return cleaned;
    }
  }

  return null;
}

async function getModelFieldNames(model: string): Promise<Set<string>> {
  const cachedFieldNames = cachedModelFieldNames.get(model);
  if (cachedFieldNames) {
    return cachedFieldNames;
  }

  try {
    const fieldMap = await executeKw(model, "fields_get", [], {});
    const fieldNames = new Set(Object.keys(fieldMap || {}));
    cachedModelFieldNames.set(model, fieldNames);
    return fieldNames;
  } catch (err) {
    console.error(`[odoo] Failed to fetch field names for ${model}:`, (err as Error).message);
    const emptyFieldNames = new Set<string>();
    cachedModelFieldNames.set(model, emptyFieldNames);
    return emptyFieldNames;
  }
}

function getAvailableOdooDescriptionFields(fieldNames: Set<string>) {
  return ODOO_DESCRIPTION_FIELDS.filter((field) => fieldNames.has(field));
}

function pickMeaningfulDescriptionFromRecord(record?: Record<string, any> | null) {
  return pickMeaningfulOdooDescription(
    ...ODOO_DESCRIPTION_FIELDS.map((field) => record?.[field])
  );
}

function getPreferredOdooLangCodes(locale: WebsiteLocale): string[] {
  const preferred =
    locale === "ar"
      ? [ODOO_LANG_AR, "ar_001", "ar_SA", "ar"]
      : [ODOO_LANG_EN, "en_US", "en_GB", "en"];

  return Array.from(new Set(preferred.filter((value): value is string => Boolean(value))));
}

async function getInstalledOdooLangCodes(): Promise<string[]> {
  if (cachedInstalledOdooLangCodes) {
    return cachedInstalledOdooLangCodes;
  }

  try {
    const languages = await searchRead("res.lang", [["active", "=", true]], ["code"], 100);
    cachedInstalledOdooLangCodes = languages
      .map((language) => String(language.code || "").trim())
      .filter(Boolean);
  } catch (err) {
    console.error("[odoo] Failed to fetch installed language codes:", (err as Error).message);
    cachedInstalledOdooLangCodes = [];
  }

  return cachedInstalledOdooLangCodes;
}

async function resolveOdooLangCode(locale: WebsiteLocale): Promise<string | undefined> {
  const preferredCodes = getPreferredOdooLangCodes(locale);
  if (preferredCodes.length === 0) return undefined;

  const installedCodes = await getInstalledOdooLangCodes();
  if (installedCodes.length === 0) {
    return preferredCodes[0];
  }

  return preferredCodes.find((code) => installedCodes.includes(code)) || preferredCodes[0];
}

export async function getLocalizedOdooProductDescription(
  defaultCode: string,
  locale: WebsiteLocale
): Promise<string | null> {
  if (!defaultCode || !isOdooConfigured()) {
    return null;
  }

  try {
    const lang = await resolveOdooLangCode(locale);
    const context = lang ? { lang } : undefined;
    const productFieldNames = await getModelFieldNames("product.product");
    const productDescriptionFields = getAvailableOdooDescriptionFields(productFieldNames);
    const productFields = productFieldNames.has("product_tmpl_id")
      ? [...productDescriptionFields, "product_tmpl_id"]
      : productDescriptionFields;

    if (productFields.length === 0) {
      return null;
    }

    const localizedProducts = await searchRead(
      "product.product",
      [["default_code", "=", defaultCode]],
      productFields,
      1,
      context
    );

    const localizedProduct = localizedProducts[0];
    const variantDescription = pickMeaningfulDescriptionFromRecord(localizedProduct);
    if (variantDescription) {
      return variantDescription;
    }

    const templateId = Array.isArray(localizedProduct?.product_tmpl_id)
      ? localizedProduct.product_tmpl_id[0]
      : localizedProduct?.product_tmpl_id;

    if (!templateId) {
      return null;
    }

    const templateFieldNames = await getModelFieldNames("product.template");
    const templateDescriptionFields = getAvailableOdooDescriptionFields(templateFieldNames);
    if (templateDescriptionFields.length === 0) {
      return null;
    }

    const localizedTemplates = await searchRead(
      "product.template",
      [["id", "=", templateId]],
      templateDescriptionFields,
      1,
      context
    );

    return pickMeaningfulDescriptionFromRecord(localizedTemplates[0]);
  } catch (err) {
    console.error(
      `[odoo] Failed to fetch localized product description for ${defaultCode}:`,
      (err as Error).message
    );
    return null;
  }
}

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
    const englishLang = await resolveOdooLangCode("en");
    const odooProducts = await searchRead(
      "product.product",
      [["default_code", "in", codes]],
      ["name", "default_code", "list_price", "image_1920", "description_sale", "description"],
      undefined,
      englishLang ? { lang: englishLang } : undefined
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
      const productDescription = pickMeaningfulOdooDescription(op.description_sale, op.description);
      if (productDescription) updates.description = productDescription;

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
  city?: string;
  addressLine?: string;
  country?: string;
  postalCode?: string;
}, existingPartnerId?: number): Promise<number> {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const values: Record<string, any> = {
    name,
    email: user.email,
    phone: user.phone,
    customer_rank: 1,
  };

  if (address) {
    values.street = address.addressLine || false;
    values.city = address.city || false;
    values.zip = address.postalCode || false;

    const countryId = await resolveCountryId(address.country);
    values.country_id = countryId || false;
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

async function resolveCountryId(country?: string): Promise<number | undefined> {
  if (!country) return undefined;

  try {
    const countries = await searchRead("res.country", [["name", "ilike", country]], ["id"], 1);
    if (countries.length > 0) {
      return countries[0].id;
    }
  } catch (e) {
    console.error("[odoo] Country lookup failed:", (e as Error).message);
  }

  return undefined;
}

function normalizeAddressValue(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

type PartnerAddressType = "delivery" | "invoice";

const PARTNER_ADDRESS_DISPLAY_NAMES: Record<PartnerAddressType, string> = {
  delivery: "Delivery Address",
  invoice: "Invoice Address",
};

function buildPartnerAddressDisplayName(
  type: PartnerAddressType,
  address: {
    city?: string;
    addressLine?: string;
    postalCode?: string;
  }
): string {
  const parts = [address.addressLine, address.city, address.postalCode]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(", ") : PARTNER_ADDRESS_DISPLAY_NAMES[type];
}

function getWebsitePaymentMethodLabel(paymentMethod?: "card" | "cod"): string | undefined {
  if (!paymentMethod) return undefined;
  return paymentMethod === "card" ? "Credit / Debit Card" : "Cash on Delivery";
}

function getWebsiteOrderOrigin(paymentMethod?: "card" | "cod"): string {
  const paymentMethodLabel = getWebsitePaymentMethodLabel(paymentMethod);
  return paymentMethodLabel ? `Website Checkout - ${paymentMethodLabel}` : "Website Checkout";
}

async function createOrUpdatePartnerAddress(
  parentId: number,
  type: PartnerAddressType,
  address: {
    city?: string;
    addressLine?: string;
    country?: string;
    postalCode?: string;
  }
): Promise<number> {
  const typeLabel = type === "invoice" ? "invoice" : "delivery";
  const displayName = buildPartnerAddressDisplayName(type, address);
  const values: Record<string, any> = {
    parent_id: parentId,
    type,
    name: displayName,
    street: address.addressLine || false,
    city: address.city || false,
    zip: address.postalCode || false,
  };

  const countryId = await resolveCountryId(address.country);
  if (countryId) {
    values.country_id = countryId;
  }

  const existingAddresses = await searchRead(
    "res.partner",
    [["parent_id", "=", parentId], ["type", "=", type]],
    ["id", "name", "street", "city", "zip", "country_id"],
    20
  );

  const exactMatch = existingAddresses.find((partner) =>
    normalizeAddressValue(partner.name) === normalizeAddressValue(values.name) &&
    normalizeAddressValue(partner.street) === normalizeAddressValue(values.street) &&
    normalizeAddressValue(partner.city) === normalizeAddressValue(values.city) &&
    normalizeAddressValue(partner.zip) === normalizeAddressValue(values.zip) &&
    (partner.country_id?.[0] || null) === (values.country_id || null)
  );

  if (exactMatch) {
    await write("res.partner", [exactMatch.id], values);
    console.log(`[odoo] Reused ${typeLabel} address ${exactMatch.id} for partner ${parentId}`);
    return exactMatch.id;
  }

  if (existingAddresses.length > 0) {
    const addressId = existingAddresses[0].id;
    await write("res.partner", [addressId], values);
    console.log(`[odoo] Updated ${typeLabel} address ${addressId} for partner ${parentId}`);
    return addressId;
  }

  const addressId = await create("res.partner", values);
  console.log(`[odoo] Created ${typeLabel} address ${addressId} for partner ${parentId}`);
  return addressId;
}

export async function createOrUpdateInvoiceAddress(parentId: number, address: {
  city?: string;
  addressLine?: string;
  country?: string;
  postalCode?: string;
}): Promise<number> {
  return createOrUpdatePartnerAddress(parentId, "invoice", address);
}

export async function createOrUpdateDeliveryAddress(parentId: number, address: {
  city?: string;
  addressLine?: string;
  country?: string;
  postalCode?: string;
}): Promise<number> {
  return createOrUpdatePartnerAddress(parentId, "delivery", address);
}

async function buildDeliveryLine(shippingCost: number): Promise<Record<string, any>> {
  try {
    const carriers = await searchRead("delivery.carrier", [], ["id", "name", "product_id"], 1);
    const carrier = carriers[0];

    if (carrier?.product_id?.[0]) {
      return {
        product_id: carrier.product_id[0],
        name: carrier.name || "Shipping",
        product_uom_qty: 1,
        price_unit: shippingCost,
        is_delivery: true,
      };
    }
  } catch (err) {
    console.error("[odoo] Failed to resolve delivery carrier product:", (err as Error).message);
  }

  // Odoo sale.order.line permits manual lines with name, quantity, and price.
  return {
    name: "Shipping",
    product_uom_qty: 1,
    price_unit: shippingCost,
    is_delivery: true,
  };
}

export async function createCrmLead(data: {
  contactName: string;
  email: string;
  phone: string;
  name: string;
  description: string;
}): Promise<number> {
  const leadId = await create("crm.lead", {
    contact_name: data.contactName,
    email_from: data.email,
    phone: data.phone,
    name: data.name,
    description: data.description,
    type: "lead",
  });
  console.log(`[odoo] Created CRM lead ${leadId}`);
  return leadId;
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
  clientOrderRef: string,
  options?: {
    discountAmount?: number;
    shippingPartnerId?: number;
    invoicePartnerId?: number;
    shippingCost?: number;
    paymentMethod?: "card" | "cod";
    promoCode?: string | null;
  }
): Promise<number> {
  const normalizedClientOrderRef = clientOrderRef.trim();
  if (normalizedClientOrderRef) {
    const existingOrders = await searchRead(
      "sale.order",
      [["client_order_ref", "=", normalizedClientOrderRef]],
      ["id"],
      1
    );

    if (existingOrders.length > 0) {
      console.log(`[odoo] Reused sales order ${existingOrders[0].id} (ref: ${normalizedClientOrderRef})`);
      return existingOrders[0].id;
    }
  }

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

  if ((options?.shippingCost || 0) > 0) {
    const deliveryLine = await buildDeliveryLine(options!.shippingCost!);
    orderLines.push([0, 0, deliveryLine]);
  }

  if ((options?.discountAmount || 0) > 0) {
    const discountAmount = Math.abs(options?.discountAmount || 0);
    orderLines.push([0, 0, {
      name: options?.promoCode ? `Promo Code (${options.promoCode})` : "Website Discount",
      product_uom_qty: 1,
      price_unit: -discountAmount,
    }]);
  }

  if (orderLines.length === 0) {
    throw new Error("No valid order lines to create");
  }

  const values: Record<string, any> = {
    partner_id: partnerId,
    client_order_ref: normalizedClientOrderRef,
    order_line: orderLines,
  };

  if (options?.shippingPartnerId) {
    values.partner_shipping_id = options.shippingPartnerId;
  }

  if (options?.invoicePartnerId) {
    values.partner_invoice_id = options.invoicePartnerId;
  }

  const paymentMethodLabel = getWebsitePaymentMethodLabel(options?.paymentMethod);
  values.origin = getWebsiteOrderOrigin(options?.paymentMethod);
  if (paymentMethodLabel) {
    values.note = `Website payment method: ${paymentMethodLabel}`;
  }

  const orderId = await create("sale.order", values);

  console.log(`[odoo] Created sales order ${orderId} (ref: ${normalizedClientOrderRef})`);
  return orderId;
}

export async function getSalesOrderStatesByClientRefs(clientOrderRefs: string[]): Promise<Record<string, string>> {
  if (clientOrderRefs.length === 0) return {};

  const saleOrders = await searchRead(
    "sale.order",
    [["client_order_ref", "in", clientOrderRefs]],
    ["client_order_ref", "state"]
  );

  return saleOrders.reduce<Record<string, string>>((acc, order) => {
    if (order.client_order_ref) {
      acc[order.client_order_ref] = order.state;
    }
    return acc;
  }, {});
}

export function isOdooConfigured(): boolean {
  return !!(ODOO_BASE_URL && ODOO_DB && ODOO_USERNAME && ODOO_API_KEY);
}
