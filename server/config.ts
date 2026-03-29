type RequestBaseUrlInput = {
  get(name: string): string | undefined;
  headers: Record<string, unknown>;
  protocol: string;
};

function parseBooleanLike(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return null;
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function getConfiguredAppBaseUrl() {
  return process.env.APP_BASE_URL?.trim().replace(/\/+$/, "") || "";
}

export function resolvePublicAppBaseUrl(req: RequestBaseUrlInput) {
  const configuredBaseUrl = getConfiguredAppBaseUrl();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const forwardedProto = typeof req.headers["x-forwarded-proto"] === "string"
    ? req.headers["x-forwarded-proto"].split(",")[0]?.trim()
    : "";
  const forwardedHost = typeof req.headers["x-forwarded-host"] === "string"
    ? req.headers["x-forwarded-host"].split(",")[0]?.trim()
    : "";
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host") || "";

  return `${protocol}://${host}`;
}

function validatePort() {
  const rawPort = process.env.PORT?.trim();
  if (!rawPort) return;

  const parsedPort = Number.parseInt(rawPort, 10);
  if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
    throw new Error("PORT must be a positive integer when provided");
  }
}

function validateAppBaseUrl() {
  const appBaseUrl = getConfiguredAppBaseUrl();
  if (!appBaseUrl) {
    if (isProductionEnvironment()) {
      throw new Error("APP_BASE_URL must be set in production");
    }

    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(appBaseUrl);
  } catch {
    throw new Error("APP_BASE_URL must be a valid absolute URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("APP_BASE_URL must use http or https");
  }

  if ((parsedUrl.pathname || "/") !== "/" || parsedUrl.search || parsedUrl.hash) {
    throw new Error("APP_BASE_URL must not include a path, query string, or hash");
  }

  if (isProductionEnvironment() && parsedUrl.protocol !== "https:") {
    throw new Error("APP_BASE_URL must use https in production");
  }
}

function validateMoyasarMode() {
  const mode = process.env.MOYASAR_MODE?.trim().toLowerCase();
  if (!mode) return;

  if (mode !== "test" && mode !== "live") {
    throw new Error("MOYASAR_MODE must be either 'test' or 'live'");
  }
}

function collectRuntimeWarnings() {
  const warnings: string[] = [];

  if (!isProductionEnvironment()) {
    return warnings;
  }

  const smtpConfigured = Boolean(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_PORT?.trim() &&
    process.env.SMTP_SECURE?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM?.trim(),
  );

  if (!smtpConfigured) {
    warnings.push("SMTP is not fully configured. Forgot/reset password email will fail.");
  }

  const odooConfigured = Boolean(
    process.env.ODOO_BASE_URL?.trim() &&
    process.env.ODOO_DB?.trim() &&
    process.env.ODOO_USERNAME?.trim() &&
    process.env.ODOO_API_KEY?.trim(),
  );

  if (!odooConfigured) {
    warnings.push("Odoo is not fully configured. Contact form and Odoo sync features will fail.");
  }

  const moyasarConfigured = Boolean(
    process.env.MOYASAR_PUBLISHABLE_KEY?.trim() &&
    process.env.MOYASAR_SECRET_KEY?.trim() &&
    process.env.MOYASAR_WEBHOOK_SECRET?.trim(),
  );

  if (!moyasarConfigured) {
    warnings.push("Moyasar is not fully configured. Card payments will fail.");
  }

  const secureSmtp = parseBooleanLike(process.env.SMTP_SECURE);
  if (process.env.SMTP_SECURE?.trim() && secureSmtp === null) {
    warnings.push("SMTP_SECURE is set but not a recognized boolean value.");
  }

  return warnings;
}

export function validateRuntimeConfig() {
  validatePort();
  validateAppBaseUrl();
  validateMoyasarMode();

  return {
    appBaseUrl: getConfiguredAppBaseUrl(),
    isProduction: isProductionEnvironment(),
    warnings: collectRuntimeWarnings(),
  };
}
