"use strict";

const submissionsByIp = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const CREATE_LIMIT = 8;
const CONTACT_LIMIT = 20;

function buildHeaders(extraHeaders = {}) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  };
}

function getClientIp(headers = {}) {
  const forwarded = headers["x-forwarded-for"] || headers["client-ip"] || headers["x-nf-client-connection-ip"] || "";
  return String(forwarded).split(",")[0].trim() || "unknown";
}

function enforceRateLimit(ip, bucketName, limit) {
  const now = Date.now();
  const key = `${bucketName}:${ip}`;
  const current = submissionsByIp.get(key) || [];
  const recent = current.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= limit) {
    return false;
  }

  recent.push(now);
  submissionsByIp.set(key, recent);
  return true;
}

module.exports = {
  CONTACT_LIMIT,
  CREATE_LIMIT,
  buildHeaders,
  enforceRateLimit,
  getClientIp,
};
