# Ma'aser Tracker UI

If you only see the title line above in GitHub, click the **Raw** button or refresh—sometimes GitHub collapses the preview when it is still loading. The full instructions below outline exactly where to click to browse the code.

This repository contains a lightweight React-based interface for tracking ma'aser (tithing) income, donations, and user preferences. The UI is composed of standalone components and JSON schemas for the core data entities.

## What platforms this code covers
- **Web (desktop & mobile browsers):** The React pages in `src/pages` are responsive and are what you see when you open the repo on GitHub. Deploy these to any web host and they will work on Android/iOS browsers.
- **Native Android/iOS apps:** Not included here. To ship native apps, wrap or re-implement these screens in a mobile stack (e.g., React Native, Expo, or native Swift/Kotlin) and connect to the same backend API.
- **PWA option:** If you want an installable “app-like” experience without native builds, configure your web deploy as a Progressive Web App (PWA) and reuse this UI unchanged.

## Structure
- `src/pages` – Feature pages (dashboard, transactions, donations, settings).
- `src/components` – Reusable UI elements, forms, icons, and dashboard widgets.
- `schemas` – JSON Schema definitions for `Transaction`, `Donation`, and `Charity` objects.

## Run it locally (quick start)
1. Clone the repo: `git clone <repo-url> && cd Ma-ser`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open the printed localhost URL in your browser. The UI is responsive, so you can shrink the window or use devtools device mode to preview mobile layouts.

## How to preview the app/website
Choose the path that fits your setup:

- **Fastest (no installs):** In GitHub, press the `.` key to open the repo in the browser-based VS Code editor, then hit the Run button to start `npm run dev`; open the forwarded preview URL.
- **Local machine:** Follow the quick-start steps above, then open the localhost URL from `npm run dev` in any browser. Use the browser’s mobile device emulator (e.g., Chrome DevTools → Toggle device toolbar) to see phone layouts.
- **Phone preview:** Run `npm run dev` on your computer, note the LAN URL it prints (e.g., `http://192.168.x.x:3000`), and open that URL from your phone on the same Wi‑Fi. The site is responsive, so it will render like a mobile app.
- **Hosted preview:** Deploy the repo to Vercel/Netlify/Render and open the live URL. This requires pushing your code to a remote and connecting it to the host; no code changes are needed.

> Note: Data is stored locally in the browser via `src/api/dataClient.js`, so you don’t need any Base44 plugins or external APIs to try the UI. Make sure your bundler is configured to resolve `@` to the `src` directory. The UI primitives in `src/components/ui` are simple placeholders; swap them with your design system as needed.

### Resetting the demo data
- Open **Settings** (from the navigation bar) and click **“Reset demo data.”** This clears your local entries and reloads the seeded income, donation, and charity examples. It’s safe to use anytime if you want a clean slate.

## Pages
- **MaaserTracker**: Dashboard showing ma'aser owed, recent transactions, and quick-add forms.
- **Transactions**: Combined view of income and donations with filters for each type.
- **Donate**: Record donations against available ma'aser balance.
- **Settings**: Configure ma'aser percentage and preferred color scheme.

## Notes
- Components reference `@/...` aliases; ensure your bundler/resolver maps `@` to the `src` directory.
- Data lives in `localStorage` through `src/api/dataClient.js`, which also seeds demo transactions/donations/charities so you can click around immediately—no plugins required.
- The UI primitives in `src/components/ui` are simple, dependency-free placeholders to keep the example self-contained. Replace them with your design system as needed.

## How to browse this code on GitHub (click-by-click)
1. Open this repository on GitHub in your browser.
2. On the file list, click the folder named **`src`**.
3. Click **`pages/`** to see the main screens:
   - **`MaaserTracker.jsx`** – dashboard showing ma'aser owed and recent transactions.
   - **`Transactions.jsx`** – list of income and donations with filters.
   - **`Donate.jsx`** – donation entry form.
   - **`Settings.jsx`** – ma'aser percentage and color theme controls.
4. Back in **`src/`**, click **`Layout.jsx`** to see navigation wiring between those pages.
5. Click **`components/`** for reusable pieces:
   - **`components/forms/`** – donation and transaction forms used on the pages.
   - **`components/dashboard/`** – widgets like `StatCard` and `TransactionList`.
   - **`components/ui/`** – small UI primitives used by the forms and pages.
6. Return to the repo root and click **`schemas/`** to view JSON Schemas that describe the data (`Transaction.json`, `Donation.json`, `Charity.json`).
7. If you prefer the quick keyboard shortcut, press the **`t`** key anywhere in the repo to open GitHub’s “Go to file” picker and type a filename (e.g., `MaaserTracker.jsx`).
