# Ma'aser Tracker UI

If you only see the title line above in GitHub, click the **Raw** button or refresh—sometimes GitHub collapses the preview when it is still loading. The full instructions below outline exactly where to click to browse the code.

This repository contains a lightweight React-based interface for tracking ma'aser (tithing) income, donations, and user preferences. The UI is composed of standalone components and JSON schemas for the core data entities.

## Structure
- `src/pages` – Feature pages (dashboard, transactions, donations, settings).
- `src/components` – Reusable UI elements, forms, icons, and dashboard widgets.
- `schemas` – JSON Schema definitions for `Transaction`, `Donation`, and `Charity` objects.

## Pages
- **MaaserTracker**: Dashboard showing ma'aser owed, recent transactions, and quick-add forms.
- **Transactions**: Combined view of income and donations with filters for each type.
- **Donate**: Record donations against available ma'aser balance.
- **Settings**: Configure ma'aser percentage and preferred color scheme.

## Notes
- Components reference `@/api/base44Client` and other aliases; ensure your bundler/resolver maps `@` to the `src` directory.
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
