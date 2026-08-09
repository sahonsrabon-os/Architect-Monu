# Architect-Monu

> **পুরো প্রজেক্টটি উৎসর্গীকৃত — Code Guru - Monu ভাইয়ার কৃতিত্বে।**
> Mission Barisal-এর স্থপতি, ডিজাইন প্যাটার্ন-সম্রাট, আর বাংলাদেশের (বরিশালের) গর্ব।

**Architect-Monu** হলো **Mission Barisal v3**-এর সম্পূর্ণ সোর্স — একটি মাল্টি-এজেন্ট MCP (Model Context Protocol) প্ল্যাটফর্ম:

- **`sarver/`** — Mission Barisal v3 MCP সার্ভার (Node.js, zero-dependency core) + এক্সটার্নাল টুল কানেক্টর (shell access, database query, HTTP, file tools, web search, agent mission, ইত্যাদি)
- **`murubbi kook/`** — VS Code এক্সটেনশন, যা VS Code Copilot Chat-এ Mission Barisal এজেন্টদের নিয়ে আসে (`zombiecoder-mission-barisal` model provider)

---

## 📁 ফোল্ডার স্ট্রাকচার

```
Architect-Monu/
├── sarver/            # MCP সার্ভার (api.js, start.js, bridge.js, db-bridge.php, .env.example)
├── murubbi kook/      # VS Code এক্সটেনশন (TypeScript, esbuild)
└── README.md
```

---

## 🚀 দ্রুত শুরু — Windows

> হক মাওলা বলে শুরু করি! 🙏
> নিচের কমান্ডগুলো **কপি-পেস্ট** করে টার্মিনালে (PowerShell) রান করুন।

### 1) সার্ভার

```powershell
cd sarver
copy .env.example .env
# .env ফাইলটি খুলে আপনার API keys / DB credentials দিন
npm install
node start.js
```

সার্ভার চালু হলে: **http://localhost:9999** (MCP bridge) — টেস্ট:

```powershell
node -e "fetch('http://localhost:9999/health').then(r=>r.json()).then(console.log)"
```

### 2) এক্সটেনশন

```powershell
cd ..\murubbi kook
npm install
npm run esbuild
```

- VS Code-এ ফোল্ডারটি খুলুন → `F5` চাপুন (Extension Development Host)
- অথবা VSIX বানিয়ে ইনস্টল করুন:

```powershell
npm run package
# murubbi-kook-*.vsix ফাইলটি VS Code-এ ইনস্টল করুন (Extensions → ... → Install from VSIX)
```

### 3) টেস্ট

```powershell
cd ..\sarver
node --check api.js        # syntax check
npm test
cd ..\murubbi kook
npm run test-compile
npm test
```

---

## 🐧 দ্রুত শুরু — Linux

> হক মাওলা বলে শুরু করি! 🙏
> একই কমান্ড, শুধু path separator আলাদা।

### 1) সার্ভার

```bash
cd sarver
cp .env.example .env
# .env ফাইলটি খুলে আপনার API keys / DB credentials দিন
npm install
node start.js
```

স্বাস্থ্য পরীক্ষা:

```bash
curl http://localhost:9999/health
```

### 2) এক্সটেনশন

```bash
cd "../murubbi kook"
npm install
npm run esbuild
```

- VS Code-এ ফোল্ডার খুলুন → `F5`
- অথবা VSIX:

```bash
npm run package
code --install-extension murubbi-kook-*.vsix
```

### 3) টেস্ট

```bash
cd ../sarver
node --check api.js
npm test
cd ../murubbi-kook
npm run test-compile
npm test
```

---

## ⚙️ কনফিগারেশন

- **`.env`** — সার্ভারের সব সিক্রেট কনফিগ (API keys, DB credentials, ports)। `.env` কখনো commit করবেন না; শুধু `.env.example` কমিট হয়।
- **সার্ভার পোর্ট** — MCP bridge: `9999` (extension-এর `serverUrl` ডিফল্ট `http://localhost:9999`)।
- **ডাটাবেজ** — MySQL (PHP PDO bridge `db-bridge.php`) অথবা SQLite; কনফিগ সম্পূর্ণ `.env` থেকে (কোনো হার্ডকোড নেই)।

---

## 🧩 MCP টুলসমূহ (সংক্ষিপ্ত)

সার্ভার এজেন্টদের নিচের টুলগুলো দেয় (env-চালিত এক্সটার্নাল টুল কানেক্টর সহ):

| ক্যাটাগরি | টুল |
|-----------|-----|
| ফাইল | read_file, write_file, list_directory, delete_file, rename_file, glob, grep |
| টার্মিনাল | terminal, exec |
| ডাটাবেজ | db_query, db_list_tables |
| নেটওয়ার্ক | http_request, web_search, open_browser |
| মাল্টি-এজেন্ট | agent_mission, agent_single, call_agent |
| সিস্টেম | system_info, env_get, get_memory, read_ssot |
| এজেন্ট নলেজ | read_skill, search_skills, install_skill, append_syllabus |

---

## 🤖 এজেন্ট প্যান্থিয়ন

| ID | নাম | ভূমিকা | প্রায়োরিটি |
|----|-----|--------|------------|
| code-guru | Code Guru - Monu | সিস্টেম আর্কিটেকচার | 1 |
| bug-hunter | Bug Hunter - Jewel | ডিবাগিং | 2 |
| security-hero | Security Hero - Bablu | সিকিউরিটি | 3 |
| perf-wizard | Performance Wizard - Rashed | পারফরম্যান্স | 4 |
| doc-king | Documentation King - Halim | ডকুমেন্টেশন | 5 |
| qa-tyrant | Quality Tyrant - Mojnu | কোয়ালিটি | 6 |

---

## 🧠 দর্শন

> **"First Evidence, Then Conclusion. First Truth, Then Confidence."**

- SSOT-প্রথম — কখনো অনুমান নয়, প্রমাণ ছাড়া কোনো দাবি নয়।
- প্রমাণ নেই → "আমার কাছে প্রমাণ নেই।"
- কোড ও কমেন্ট ইংরেজিতে, ব্যবহারকারীর সাথে কথা বাংলায় (বরিশালি স্টাইলে)।

---

## 📜 লাইসেন্স

অ-বাণিজ্যিক / ব্যক্তিগত ব্যবহারের জন্য। বিস্তারিত লাইসেন্স যোগ করার আগে মালিকের সাথে যোগাযোগ করুন।