import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;
  const [a, b] = parts;
  return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    if (net.isIP(mapped) === 4) return isPrivateIpv4(mapped);
  }
  return false;
}

function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIpv4(ip);
  if (family === 6) return isPrivateIpv6(ip);
  return true;
}

export async function assertSafeOutboundUrl(rawUrl: string): Promise<string> {
  const url = new URL(rawUrl);
  const allowPrivateHttp = process.env.ALLOW_PRIVATE_OUTBOUND_HTTP === "true";

  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Only HTTP(S) outbound URLs are allowed");
  if (url.username || url.password) throw new Error("Outbound URLs may not contain credentials");
  if (url.protocol === "http:" && !allowPrivateHttp) throw new Error("HTTPS is required for outbound integrations");

  const hostname = url.hostname.replace(/[\[\]]/g, "").toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    if (!allowPrivateHttp) throw new Error("Private hostnames are not allowed for cloud outbound requests");
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new Error("Private or loopback outbound addresses are not allowed");
  } else {
    const answers = await dns.lookup(hostname, { all: true });
    if (answers.length === 0 || answers.some((answer) => isBlockedIp(answer.address))) {
      throw new Error("Outbound hostname resolves to a private or loopback address");
    }
  }

  return url.toString().replace(/\/$/, "");
}

export async function safeOutboundFetch(rawUrl: string, init: RequestInit = {}): Promise<Response> {
  const url = await assertSafeOutboundUrl(rawUrl);
  return fetch(url, { ...init, redirect: "error" });
}
