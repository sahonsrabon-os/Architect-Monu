# 🧟 Mission Barisal — ZombieCoder Multi-Agent Platform

> **"Barisal's playful chaos meets code discipline!"**

**Mission Barisal v3** is a **zero-dependency**, **evidence-driven** multi-agent AI platform built in pure Node.js — a Model Context Protocol (MCP) server plus a VS Code extension, created by **Sahon Srabon (ZombieCoder)** from Barisal, Bangladesh.

| | |
|---|---|
| **Version** | `3.2.1` (Blueprint `v3.0.0`) |
| **Runtime** | Pure Node.js — **zero third-party dependencies** |
| **Agents** | 6 specialist agents with real-time web search |
| **Protocol** | MCP — JSON-RPC 2.0 over HTTP / SSE / WebSocket / UDS |
| **Owner** | Sahon Srabon (ZombieCoder) · Barisal, Bangladesh |

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

## 🧠 The Six Agents

| Agent | Role | Expertise |
|-------|------|-----------|
| **Code Guru — Monu** | Architecture | System design, design patterns, code structure, project organization |
| **Bug Hunter — Jewel** | Debugging | Bug detection, error handling, logic validation, root-cause analysis |
| **Security Hero — Bablu** | Security | Vulnerability assessment, data protection, CVE research |
| **Performance Wizard — Rashed** | Performance | Optimization, caching, memory management, benchmarks |
| **Documentation King — Halim** | Documentation | API specs, README, code comments, technical writing |
| **Quality Tyrant — Mojnu** | Quality | Final verification, consensus, release readiness |

Each agent speaks **Bengali with Barishali flavor** to users, but writes all code and technical docs in **professional English** — a dual identity built for both heart and precision.

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

## ⚡ Quick Start

### Requirements

- **Node.js** 18+ (tested on 22.x)
- No `npm install` needed — **zero dependencies**

### 1. Generate configuration (optional, OS-aware)

```bash
node start.js --config-all
# or interactively:
node start.js
```

Writes `config.json` to your OS default config directory (no hardcoded paths).

### 2. Start the full server

```bash
node start.js --start-all
```

Boots the complete chain: config → providers → personas → SSOT scan → cache → note store → watchdog → MCP server.

| Flag | Description |
|------|-------------|
| `--config-all`, `-c` | Generate `config.json` for the current OS |
| `--start-all`, `-s` | Start the full server (all components) |
| `--help`, `-h` | Show usage help |

### 3. Connect an MCP client

Point your MCP client at `http://localhost:9999/mcp` — the server speaks **JSON-RPC 2.0** (protocol `2024-11-05`, backwards compatible).

---

## 🔌 MCP Tools (23)

The server exposes **23 MCP tools**, including:

| Tool | Description |
|------|-------------|
| `read_file` | Read a file from the filesystem |
| `write_file` | Write content to a file (creates directories) |
| `set_working_dir` / `get_working_dir` | Manage the MCP working directory |
| `web_search` | Real-time web search for facts |
| `agent_mission` | Run a mission with all 6 agents in parallel |
| `agent_single` | Run with a single agent |
| `get_memory` | Retrieve session memory |
| `read_ssot` | Read the Single Source of Truth file |
| `list_directory`, `glob`, `grep` | Filesystem exploration |
| `terminal`, `exec` | Run shell commands |
| `db_query`, `db_list_tables` | Database access (SQLite / MySQL / PostgreSQL) |
| `http_request` | Make HTTP requests (no external deps) |
| `env_get`, `system_info` | Environment & system introspection |
| `call_agent` | Delegate a sub-task to a specialist agent |
| …and more | `open_browser`, `delete_file`, `rename_file`, `get_memory`… |

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

## 🔧 Configuration

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

## 🤝 Author

**Sahon Srabon (ZombieCoder)** — Developer Zone, Dhaka / Barisal, Bangladesh

> *"যখন প্রযুক্তি সততার সাথে তৈরি হয়, তখন তা এক অজেয় শক্তিতে পরিণত হয়।"*
> *(When technology is built with honesty, it becomes an unbeatable force.)*

---

## 📄 License

This project is open source. See the repository for licensing details.
