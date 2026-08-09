#!/usr/bin/env node
// =============================================================================
// Mission Barisal v3 — cPanel Start Script
// This file is the entry point for cPanel Node.js setup
// =============================================================================

// Load environment variables
const fs = require("fs");
const path = require("path");

function loadEnv() {
  try {
    const envPath = path.resolve(".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq === -1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
          v = v.slice(1, -1);
        if (!process.env[k]) process.env[k] = v;
      }
      console.log("[ENV] Loaded:", envPath);
    }
  } catch (_) {}
}

// Initialize
loadEnv();

// Start the main server
require("./api.js");
