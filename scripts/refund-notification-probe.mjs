// Explicit operational probe: sends only labelled test alerts to the configured support inbox.
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import nextEnv from "@next/env";

if (!process.argv.includes("--send-test")) throw new Error("Pass --send-test to send the labelled support notification probe.");
nextEnv.loadEnvConfig(process.cwd(), false);
if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_FROM_EMAIL) throw new Error("Production email configuration missing");
const server = await createServer({ configFile: false, server: { middlewareMode: true }, resolve: { alias: {
  "server-only": path.resolve("tests/stubs/server-only.ts"), "@": path.resolve("src"),
} } });
const providerIds = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (String(args[0]) === "https://api.resend.com/emails" && args[1]?.method === "POST" && response.ok) {
    const result = await response.clone().json(); providerIds.push(result.id);
  }
  return response;
};
try {
  const { createAdminClient } = await server.ssrLoadModule("/src/lib/supabase/admin.ts");
  const { notifyRefundOperator, flushBillingEmails } = await server.ssrLoadModule("/src/lib/billing/refund-notifications.ts");
  const admin = createAdminClient();
  if (!admin) throw new Error("Database unavailable");
  const reference = "TEST-REFUND-NOTIFICATION-20261003";
  for (const kind of ["requested", "attention"]) {
    await notifyRefundOperator(admin, { reference, kind, detail: "TEST ONLY: verification of refund alerts to support@k53mentorai.co.za. No customer refund has been requested or paid by this test. No payment action is needed." });
  }
  const sent = await flushBillingEmails(admin, 2, ["requested", "attention"].map(kind => `refund-${reference}-${kind}`));
  const evidence = { testReference: reference, recipient: "support@k53mentorai.co.za", accepted: sent, providerIds, recordedAt: new Date().toISOString() };
  fs.mkdirSync("docs/audits/2026-10-03", {recursive:true});
  fs.writeFileSync("docs/audits/2026-10-03/refund-notification-probe.json", JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence));
} finally { globalThis.fetch = originalFetch; await server.close(); }
