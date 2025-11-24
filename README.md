# How to Run Ma'aser Tracker on Your Computer (Beginner Friendly)

These steps are written for someone with no coding background. Follow them in order and you will open the app in your browser.

## Before you start
- You need a computer with internet access.
- Install **Node.js** (includes npm) from [https://nodejs.org](https://nodejs.org). Choose the LTS version and click through the installer with the default options.

## Step-by-step
1. **Get the project onto your computer** (pick one method)
   - **Download ZIP (easiest)**
     - Click the green **Code** button on the project page and choose **Download ZIP**.
     - Save the file, then right-click the ZIP and choose **Extract All** (or double-click to unzip on Mac). A folder named `Ma-ser` will appear.
   - **Clone with HTTPS (Git installed)**
     - In your terminal, run:
       ```
       git clone https://github.com/<your-username>/Ma-ser.git
       ```
   - **Clone with SSH (Git + SSH keys set up)**
     - In your terminal, run:
       ```
       git clone git@github.com:<your-username>/Ma-ser.git
       ```
   - **Clone with GitHub CLI (gh installed)**
     - In your terminal, run:
       ```
       gh repo clone <your-username>/Ma-ser
       ```

2. **Open the folder in a terminal**
   - Windows: click the search bar, type **Command Prompt**, and open it.
   - Mac: open **Terminal** from Applications → Utilities.
   - In the terminal, type `cd ` (with a space) and drag the `Ma-ser` folder into the window. Press **Enter**. The prompt should now show `Ma-ser` at the end of the line.

3. **Install the required files**
   - In the same terminal window, type:
     ```
     npm install
     ```
   - Press **Enter**. Wait until the downloads finish and you see the prompt again.

4. **Start the app**
   - In the terminal, type:
     ```
     npm run dev
     ```
   - Press **Enter**. After a few seconds the terminal will print a line that includes a web address like `http://localhost:5173/`.

5. **Open the app in your browser**
   - Copy the web address shown in the terminal and paste it into Chrome, Edge, or Safari. The Ma'aser Tracker will load.

6. **Stop the app when you are done**
   - Return to the terminal window and press **Ctrl + C** (or **Cmd + C** on Mac). This closes the app.

## Troubleshooting
- If `npm install` or `npm run dev` is not recognized, close the terminal, reopen it, and try again. Node.js may need a restart to finish installing.
- If the page does not open, make sure you copied the full address (including `http://` and the numbers) into the browser.
