# How to Run Tzedaka Tracker on Your Computer (Beginner Friendly)

These steps are written for someone with no coding background. Pick **one** option below (HTTPS, ZIP, SSH, or GitHub CLI) and follow its steps from start to finish.

## Before you start
- You need a computer with internet access.
- Install **Node.js** (includes npm) from [https://nodejs.org](https://nodejs.org). Choose the LTS version and click through the installer with the default options.

## Option A: Clone with HTTPS (requires Git installed)
1. Install **Git** from [https://git-scm.com/downloads](https://git-scm.com/downloads). Accept the default options.
2. Open a terminal (Command Prompt on Windows or Terminal on Mac).
3. Copy and paste this command, then press **Enter**:
   ```
   git clone https://github.com/<your-username>/Ma-ser.git
   ```
4. When the command finishes, a folder named `Ma-ser` will appear.
5. Move into the folder by typing `cd Ma-ser` and pressing **Enter**.
6. Install the required files by typing `npm install` and pressing **Enter**. Wait until the downloads finish and you see the prompt again.
7. Start the app by typing `npm run dev` and pressing **Enter**. After a few seconds the terminal will print a web address like `http://localhost:5173/`.
8. Open the app by copying that address into Chrome, Edge, or Safari.
9. To view a new version later, stop the app with **Ctrl + C** (or **Cmd + C** on Mac), run `git pull` to download updates, then restart with `npm run dev` and refresh your browser.
10. Stop the app when you are done by returning to the terminal window and pressing **Ctrl + C** (or **Cmd + C** on Mac).

## Option B: Download ZIP (no extra tools required)
1. On the project page, click the green **Code** button.
2. Click **Download ZIP**.
3. When the file finishes downloading, right-click it and choose **Extract All** (or double-click to unzip on Mac). A folder named `Ma-ser` will appear.
4. Open a terminal:
   - Windows: click the search bar, type **Command Prompt**, and open it.
   - Mac: open **Terminal** from Applications → Utilities.
5. In the terminal, type `cd ` (with a space) and drag the `Ma-ser` folder into the window. Press **Enter**. The prompt should now show `Ma-ser` at the end of the line.
6. Install the required files by typing `npm install` and pressing **Enter**. Wait until the downloads finish and you see the prompt again.
7. Start the app by typing `npm run dev` and pressing **Enter**. After a few seconds the terminal will print a web address like `http://localhost:5173/`.
8. Open the app by copying that address into Chrome, Edge, or Safari. The Tzedaka Tracker will load.
9. To view a new version later, stop the app with **Ctrl + C** (or **Cmd + C** on Mac), download the latest ZIP again, replace your existing `Ma-ser` folder with the new one, then rerun `npm install` (if asked) and `npm run dev` before refreshing the browser.
10. Stop the app when you are done by returning to the terminal window and pressing **Ctrl + C** (or **Cmd + C** on Mac).

## Option C: Clone with SSH (requires Git and SSH keys set up with GitHub)
1. Install **Git** from [https://git-scm.com/downloads](https://git-scm.com/downloads). Accept the default options.
2. Make sure you have SSH keys added to your GitHub account (see GitHub's "Generating a new SSH key" guide if you have not done this).
3. Open a terminal.
4. Copy and paste this command, then press **Enter**:
   ```
   git clone git@github.com:<your-username>/Ma-ser.git
   ```
5. When the command finishes, a folder named `Ma-ser` will appear.
6. Move into the folder by typing `cd Ma-ser` and pressing **Enter**.
7. Install the required files by typing `npm install` and pressing **Enter**. Wait until the downloads finish and you see the prompt again.
8. Start the app by typing `npm run dev` and pressing **Enter**. After a few seconds the terminal will print a web address like `http://localhost:5173/`.
9. Open the app by copying that address into your browser.
10. To view a new version later, stop the app with **Ctrl + C** (or **Cmd + C** on Mac), run `git pull` to download updates, then restart with `npm run dev` and refresh your browser.
11. Stop the app when you are done by returning to the terminal window and pressing **Ctrl + C** (or **Cmd + C** on Mac).

## Option D: Clone with GitHub CLI (requires `gh` installed and signed in)
1. Install **GitHub CLI** from [https://cli.github.com/](https://cli.github.com/) and sign in by running `gh auth login` in your terminal. Follow the prompts.
2. Open a terminal.
3. Copy and paste this command, then press **Enter**:
   ```
   gh repo clone <your-username>/Ma-ser
   ```
4. When the command finishes, a folder named `Ma-ser` will appear.
5. Move into the folder by typing `cd Ma-ser` and pressing **Enter**.
6. Install the required files by typing `npm install` and pressing **Enter**. Wait until the downloads finish and you see the prompt again.
7. Start the app by typing `npm run dev` and pressing **Enter**. After a few seconds the terminal will print a web address like `http://localhost:5173/`.
8. Open the app by copying that address into your browser.
9. To view a new version later, stop the app with **Ctrl + C** (or **Cmd + C** on Mac), run `gh repo sync` or `git pull` inside the `Ma-ser` folder to download updates, then restart with `npm run dev` and refresh your browser.
10. Stop the app when you are done by returning to the terminal window and pressing **Ctrl + C** (or **Cmd + C** on Mac).

## Troubleshooting
- If `npm install` or `npm run dev` is not recognized, close the terminal, reopen it, and try again. Node.js may need a restart to finish installing.
- If the page does not open, make sure you copied the full address (including `http://` and the numbers) into the browser.
