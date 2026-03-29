import type { Express, Request } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const SESSION_COOKIE_NAME = "alnours.sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (isProduction()) {
    throw new Error("SESSION_SECRET must be set in production");
  }

  console.warn("[auth] SESSION_SECRET is not set. Using the local development fallback secret.");
  return "dev-session-secret-change-me";
}

function getTrustProxySetting() {
  const rawValue = process.env.TRUST_PROXY?.trim();
  if (!rawValue) {
    return isProduction() ? 1 : undefined;
  }

  if (rawValue === "true") return 1;
  if (rawValue === "false") return false;

  const numericValue = Number.parseInt(rawValue, 10);
  return Number.isNaN(numericValue) ? rawValue : numericValue;
}

function buildSessionCookieOptions(): session.CookieOptions {
  const cookieOptions: session.CookieOptions = {
    httpOnly: true,
    maxAge: SESSION_TTL_MS,
    path: "/",
    sameSite: "lax",
    secure: isProduction(),
  };

  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }

  return cookieOptions;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieClearOptions() {
  const { domain, httpOnly, path, sameSite, secure } = buildSessionCookieOptions();

  return {
    domain,
    httpOnly,
    path,
    sameSite,
    secure: secure === true,
  };
}

export function setupSessions(app: Express) {
  const trustProxySetting = getTrustProxySetting();
  if (trustProxySetting !== undefined) {
    app.set("trust proxy", trustProxySetting);
  }

  const PgSessionStore = connectPgSimple(session);

  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      store: new PgSessionStore({
        createTableIfMissing: true,
        pool,
        tableName: "user_sessions",
      }),
      secret: getSessionSecret(),
      resave: false,
      saveUninitialized: false,
      proxy: isProduction(),
      cookie: buildSessionCookieOptions(),
    }),
  );
}

export function getSessionUserId(req: Request) {
  return typeof req.session.userId === "number" && Number.isInteger(req.session.userId)
    ? req.session.userId
    : null;
}

export function regenerateSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

export function saveSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

export function destroySession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}
