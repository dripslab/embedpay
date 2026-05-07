# embedpay

> Drop-in Stellar payment widget for any website — no backend, no server, no complexity.

[![npm version](https://img.shields.io/npm/v/embedpay)](https://www.npmjs.com/package/embedpay)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Stellar](https://img.shields.io/badge/Built%20for-Stellar-blue)](https://stellar.org)
[![Drips Wave](https://img.shields.io/badge/Drips-Wave%20Program-purple)](https://drips.network/wave)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## The Problem

Most Web3 payment tools require backend infrastructure, custom APIs, and deep blockchain knowledge. Small developers and startups building on Stellar have no quick way to accept payments on a webpage without writing a lot of plumbing code.

## The Solution

**embedpay** is a single `<script>` tag. Drop it into any HTML page, pass your wallet address, and you have a live Stellar payment button connected to Horizon in under 5 minutes — with QR code, real-time confirmation, and zero server setup.

---

## Features

- One `<script>` tag install — works in plain HTML, React, Vue, anything
- Auto-generated QR code using the SEP-0007 URI standard
- Real-time payment confirmation via Horizon EventSource stream
- Testnet and mainnet support via a single config flag
- Transaction history panel (optional)
- Shadow DOM isolation — zero CSS conflicts with your existing site
- Fully accessible (WCAG 2.1 AA)

---

## Quick Start

### Via CDN (no install needed)

```html
<!DOCTYPE html>
<html>
  <body>

    <div id="pay-here"></div>

    <script src="https://cdn.jsdelivr.net/npm/embedpay/dist/widget.min.js"></script>
    <script>
      EmbedPay.init({
        container: '#pay-here',
        destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount: '5',
        asset: 'XLM',
        network: 'testnet',
        memo: 'Order #0042',
        onSuccess: (tx) => console.log('Payment received!', tx),
        onError:   (err) => console.error('Payment failed', err),
      });
    </script>

  </body>
</html>
```

### Via npm

```bash
npm install embedpay
```

```js
import EmbedPay from 'embedpay';

EmbedPay.init({
  container: '#pay-here',
  destination: 'GXXXX...',
  amount: '5',
  asset: 'XLM',
  network: 'mainnet',
});
```

---

## Configuration Options

| Option        | Type       | Required | Default      | Description                                         |
|---------------|------------|----------|--------------|-----------------------------------------------------|
| `container`   | `string`   | Yes      | —            | CSS selector for the mount element                  |
| `destination` | `string`   | Yes      | —            | Stellar wallet address to receive payment           |
| `amount`      | `string`   | Yes      | —            | Amount in XLM or custom asset                       |
| `asset`       | `string`   | No       | `'XLM'`      | Asset code (e.g. `'XLM'`, `'USDC'`)               |
| `network`     | `string`   | No       | `'testnet'`  | `'testnet'` or `'mainnet'`                         |
| `memo`        | `string`   | No       | `''`         | Optional memo attached to the transaction           |
| `onSuccess`   | `function` | No       | `undefined`  | Callback fired when payment is confirmed on-chain   |
| `onError`     | `function` | No       | `undefined`  | Callback fired if the payment stream errors         |

---

## Technical Architecture

```
User Browser
│
├── embedpay widget (Shadow DOM)
│     ├── UI Layer         → Shadow DOM components (zero CSS bleed)
│     ├── QR Module        → qrcode.js — generates SEP-0007 URI QR
│     └── Payment Core     → stellar-sdk wrapper
│                               ├── Validates destination via Horizon /accounts/{id}
│                               ├── Builds SEP-0007 payment URI
│                               └── Opens Horizon EventSource stream
│                                       └── Fires onSuccess when tx detected
│
└── Horizon API (Stellar Foundation)
      ├── GET  /accounts/{address}      → validate wallet
      └── GET  /accounts/{address}/payments?cursor=now  → stream new payments
```

**Stack:**

| Layer | Technology |
|---|---|
| Core runtime | Vanilla JavaScript (ESM) — zero framework dependency |
| Stellar connection | `stellar-sdk` + Horizon REST API |
| QR generation | `qrcode.js` (MIT licensed) |
| Payment streaming | Horizon EventSource (Server-Sent Events) |
| UI isolation | Shadow DOM |
| Build tool | Vite + Rollup → outputs `widget.min.js` |
| Testing | Vitest (unit) + Playwright (E2E on testnet) |

---

## Repository Structure

```
embedpay/
├── src/
│   ├── core/           # Stellar SDK wrapper, Horizon API calls
│   │   ├── horizon.js  # Account validation + payment streaming
│   │   └── stellar.js  # Transaction builder helpers
│   ├── ui/             # Shadow DOM components
│   │   ├── widget.js   # Root widget mount
│   │   └── styles.js   # Scoped CSS-in-JS
│   └── qr/
│       └── generate.js # SEP-0007 URI + QR code generation
├── tests/
│   ├── unit/           # Vitest unit tests
│   └── e2e/            # Playwright E2E (runs against testnet)
├── examples/
│   ├── plain-html/     # Basic CDN usage
│   ├── react/          # React integration example
│   └── vue/            # Vue integration example
├── dist/               # Built output (widget.min.js)
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/nexpay/embedpay.git
cd embedpay

# 2. Install dependencies
npm install

# 3. Start dev server (connects to Stellar testnet)
npm run dev
# → http://localhost:3000

# 4. Run unit tests
npm test

# 5. Run E2E tests (requires testnet connection)
npm run test:e2e

# 6. Build for production
npm run build
# → dist/widget.min.js
```

---

## Open Issues (Wave Program)

These issues are part of the **Stellar Wave Program** on Drips. Contributors earn Points for resolving them.

| # | Issue | Complexity | Points |
|---|-------|-----------|--------|
| 1 | Add QR code auto-refresh on address change | Trivial | 100 |
| 2 | Support testnet / mainnet toggle via config | Medium | 150 |
| 3 | Build transaction history display panel | High | 200 |
| 4 | Add SEP-0010 authentication handshake | High | 200 |
| 5 | Write Playwright E2E tests for payment flow | Medium | 150 |

To apply for an issue, visit the [Drips Wave dashboard](https://drips.network/wave) or apply directly via GitHub.

---

## Contributing

We actively welcome contributions. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

1. Fork this repo
2. Create a branch: `git checkout -b fix/your-issue-name`
3. Make your changes and write tests
4. Open a Pull Request linking the issue: `Closes #12`

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Maintainer

Built and maintained by jotel-dev.
Part of the [Stellar Wave Program](https://drips.network/wave) on Drips.
