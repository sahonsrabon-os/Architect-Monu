# 🧟 Architect-Monu — Mission Barisal v3 Multi-Agent Platform

> **পুরো প্রজেক্টটি উৎসর্গীকৃত — Code Guru - Monu ভাইয়ার কৃতিত্বে।**
> Mission Barisal-এর স্থপতি, ডিজাইন প্যাটার্ন-সম্রাট, আর বাংলাদেশের (বরিশালের) গর্ব।

**Architect-Monu** is the complete source of **Mission Barisal v3** — a **zero-dependency**, **evidence-driven**, multi-agent AI platform built in pure Node.js. It combines a Model Context Protocol (MCP) server with a VS Code extension, created by **Sahon Srabon (ZombieCoder)** from Barisal, Bangladesh.

| | |
|---|---|
| **Version** | `3.2.1` (Blueprint `v3.0.0`) |
| **Runtime** | Pure Node.js — **zero third-party dependencies** |
| **Agents** | 6 specialist agents with real-time web search |
| **Protocol** | MCP — JSON-RPC 2.0 over HTTP / SSE / WebSocket / UDS |
| **Owner** | Sahon Srabon (ZombieCoder) · Barisal, Bangladesh |

---

## 📁 Folder Structure

```
Architect-Monu/
├── sarver/            # MCP server (api.js, start.js, bridge.js, db-bridge.php, .env.example)
├── murubbi kook/      # VS Code extension (TypeScript, esbuild)
├── assets/            # Architecture images & infographics (from the mb/ archive)
├── guides/            # Story & governance guides (from the mb/ archive)
└── README.md
```

---

## 🚀 Highlights

- **Zero Dependency** — Built only on Node core modules (`http`, `https`, `crypto`, `fs`, `net`, `os`). No `node_modules`, no supply-chain risk, runs anywhere.
- **Multi-Agent Debate** — Six specialist agents analyze your problem in parallel and reach an evidence-based consensus.
- **Evidence Before Confidence** — No claim without proof. Every agent must verify facts (via web search) before answering.
- **Haq Mawla Normalizer** — Converts any AI provider's response into one clean, OpenAI-compatible format.
- **Real-time Web Search** — Agents search the live web instead of relying on stale training data.
- **Memory Trinity** — `SSOT.md` (project truth) → `Syllabus.md` (growing knowledge) → `Memory.json` (session history).
- **Anti-Dote System** — A 6-step logical-proof gate that rejects outputs scoring below the quality threshold.
- **Universal Socket Architecture** — Plug in via HTTP, WebSocket, SSE, or Unix Domain Socket. Works with VS Code, JetBrains, and any MCP client.

---

## 🏗️ Architecture

![Mission Barisal — Multi-Agent AI Architecture](assets/architecture.png)

*Full-resolution infographic: [`assets/architecture.png`](assets/architecture.png) · Alternative view: [`assets/architecture-alt.png`](assets/architecture-alt.png)*

### The Memory Trinity

```
SSOT.md (Single Source of Truth)
        │  project state, file structure, tech stack
        ▼
Syllabus.md (The Growing Brain)
        │  learned knowledge from web & docs
        ▼
Memory.json (Session History)
        │  conversation continuity
        ▼
  Evidence-Driven Answer
```

### The Anti-Dote Chain (6 Steps)

```
validateInput → checkProof → getUserConsent → setGoalContract → execute → verifyOutput
```

A **75-point quality gate** decides whether an output is accepted or rejected as a *logical proof failure*. Monitoring mode never blocks execution — it reports results transparently.

### Universal Socket Architecture

```
┌─────────────┐   HTTP    ┌──────────────────┐
│  Browser    │──────────▶│                  │
├─────────────┤  SSE      │   Mission        │
│  VS Code    │──────────▶│   Barisal        │
├─────────────┤  WS       │   Server         │
│  JetBrains  │──────────▶│   (api.js)       │
├─────────────┤  UDS      │                  │
│  Local tools│──────────▶│                  │
└─────────────┘           └──────────────────┘
```

---

## 🧠 The Six Agents

| ID | Agent | Role | Priority |
|----|-------|------|----------|
| `code-guru` | **Code Guru — Monu** | System Architecture | 1 |
| `bug-hunter` | **Bug Hunter — Jewel** | Debugging | 2 |
| `security-hero` | **Security Hero — Bablu** | Security | 3 |
| `perf-wizard` | **Performance Wizard — Rashed** | Performance | 4 |
| `doc-king` | **Documentation King — Halim** | Documentation | 5 |
| `qa-tyrant` | **Quality Tyrant — Mojnu** | Quality | 6 |

Each agent speaks **Bengali with Barishali flavor** to users, but writes all code and technical docs in **professional English** — a dual identity built for both heart and precision.

---

## ⚡ Quick Start

### Requirements

- **Node.js** 18+ (tested on 22.x)

### 🪟 Windows

> হক মাওলা বলে শুরু করি! 🙏 — copy-paste the commands below into PowerShell.

**1) Server**

```powershell
cd sarver
copy .env.example .env
# open .env and add your API keys / DB credentials
npm install
node start.js
```

Server runs at **http://localhost:9999** (MCP bridge) — test:

```powershell
node -e "fetch('http://localhost:9999/health').then(r=>r.json()).then(console.log)"
```

**2) Extension**

```powershell
cd ..\murubbi kook
npm install
npm run esbuild
```

- Open the folder in VS Code → press `F5` (Extension Development Host)
- Or build a VSIX and install:

```powershell
npm run package
# install murubbi-kook-*.vsix via Extensions → ... → Install from VSIX
```

**3) Test**

```powershell
cd ..\sarver
node --check api.js        # syntax check
npm test
cd ..\murubbi kook
npm run test-compile
npm test
```

### 🐧 Linux

**1) Server**

```bash
cd sarver
cp .env.example .env
# open .env and add your API keys / DB credentials
npm install
node start.js
```

Health check:

```bash
curl http://localhost:9999/health
```

**2) Extension**

```bash
cd "../murubbi kook"
npm install
npm run esbuild
```

- Open the folder in VS Code → `F5`
- Or build a VSIX:

```bash
npm run package
code --install-extension murubbi-kook-*.vsix
```

**3) Test**

```bash
cd ../sarver
node --check api.js
npm test
cd ../murubbi-kook
npm run test-compile
npm test
```

---

## 🔌 MCP Tools (23)

The server exposes **23 MCP tools**, including:

| Tool | Description |
|------|-------------|
| `read_file` / `write_file` | Read / write files (creates directories) |
| `set_working_dir` / `get_working_dir` | Manage the MCP working directory |
| `web_search` | Real-time web search for facts |
| `agent_mission` | Run a mission with all 6 agents in parallel |
| `agent_single` / `call_agent` | Run / delegate to a single specialist agent |
| `get_memory` / `read_ssot` | Session memory & Single Source of Truth |
| `list_directory`, `glob`, `grep` | Filesystem exploration |
| `terminal`, `exec` | Run shell commands |
| `db_query`, `db_list_tables` | Database access (SQLite / MySQL / PostgreSQL) |
| `http_request` | Make HTTP requests (no external deps) |
| `env_get`, `system_info` | Environment & system introspection |
| `open_browser` | Open a file or URL in the default browser |
| `delete_file`, `rename_file` | File lifecycle management |
| `read_skill`, `search_skills`, `install_skill`, `append_syllabus` | Agent knowledge management |

---

## 🌐 HTTP API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check — version, agents, models, uptime |
| `/v1/models` | GET | List models (OpenAI-compatible) |
| `/api/v1/models` | GET | Same model list (API namespace) |
| `/api/mcp-clients` | GET | Connected MCP clients + tool count |
| `/v1/chat/completions` | POST | OpenAI-compatible chat completions |
| `/mcp` | POST/GET | MCP endpoint — JSON-RPC 2.0 |
| `/api/v1/anti-dote` | POST | Run the anti-dote quality gate |

---

## ⚙️ Configuration

- **`.env`** — All server secrets (API keys, DB credentials, ports). **Never commit `.env`**; only `.env.example` is committed.
- **Server port** — MCP bridge: `9999` (extension `serverUrl` defaults to `http://localhost:9999`).
- **Database** — MySQL (PHP PDO bridge `db-bridge.php`) or SQLite; configured entirely via `.env` (no hardcoding).

### Custom Providers

Providers are defined via environment variables — no code changes needed:

| Env Var | Purpose |
|---------|---------|
| `CUSTOM_PROVIDER_N_NAME` | Provider name |
| `CUSTOM_PROVIDER_N_URL` | Provider endpoint |
| `CUSTOM_PROVIDER_N_KEY` | API key |
| `CUSTOM_PROVIDER_N_MODELS` | Models offered |
| `CUSTOM_PROVIDER_N_PRIORITY` | Fallback priority |

Priority-based fallback: if the primary provider fails, the next priority takes over automatically.

---

## 📚 Documentation

Collected from the Mission Barisal archive (`mb/`):

| Guide | File |
|-------|------|
| Evidence-Driven Multi-Agent Architectural Governance Guide | [`guides/governance-guide.md`](guides/governance-guide.md) |
| Zero to Creation — Anatomy of Truth & a Human Story of Technology | [`guides/zero-to-creation.md`](guides/zero-to-creation.md) |
| Heartbeat of Technology — A ZombieCoder's Fight for Truth | [`guides/heartbeat-of-technology.md`](guides/heartbeat-of-technology.md) |
| Technical & Logical Analysis Report (v3) | [`guides/technical-analysis.md`](guides/technical-analysis.md) |
| When Barisal's Coding Discipline Meets Chaos | [`guides/coding-powerhouse-story.md`](guides/coding-powerhouse-story.md) |

### Media (local archive)

The full story also lives as video & audio in the local `mb/` archive: the *Sotota'r Projukti* video, regional-language audio essays, and the NotebookLM mind-map (see [`assets/mind-map.png`](assets/mind-map.png)). *(Large media files are kept out of the repo to respect GitHub's 100 MB file limit.)*

---

## 🧠 Philosophy

> **"First Evidence, Then Conclusion. First Truth, Then Confidence."**

- SSOT-first — never assume, never claim without proof.
- No proof → *"আমার কাছে প্রমাণ নেই।"*
- Code & comments in English; user-facing chat in Bengali (Barishali style).

---

## 🤝 Author

**Sahon Srabon (ZombieCoder)** — Developer Zone, Dhaka / Barisal, Bangladesh

> *"যখন প্রযুক্তি সততার সাথে তৈরি হয়, তখন তা এক অজেয় শক্তিতে পরিণত হয়।"*
> *(When technology is built with honesty, it becomes an unbeatable force.)*

---

## 📄 License

Non-commercial / personal use. For details, contact the owner before adding a full license.
