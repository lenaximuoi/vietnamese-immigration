# Vietnamese Immigration: Refugees and Asylum-Seekers from Viet Nam

An interactive website that shows how many people from Viet Nam have lived as **refugees** or **asylum-seekers** in the **United States** and **Canada**, from 1988 to 2025.

### 👉 [See the live website](https://lenaximuoi.github.io/vietnamese-immigration/)

You don't need to install anything. Just open the link in any browser, on a computer or a phone.

---

## What you'll see on the website

- **A year slider with a Play button.** Drag the slider, or press Play to watch the years go by. Everything on the page updates to match the year you pick.
- **A map** with lines from Viet Nam to the United States and Canada. The thicker the line, the more people there were that year.
- **Number cards** showing the exact figures for each country in the selected year.
- **Two line charts**, one for refugees and one for asylum-seekers, covering the whole period. Point at a chart (or tap it on a phone) to see the numbers for any year.
- **A table** at the bottom with every number, if you prefer reading the raw figures.

### A few things the data shows

- The number of refugees from Viet Nam living in the United States was highest in **1994: 211,376 people**. It then fell steadily.
- In **2025**, the United States counted **637 refugees** and **8,401 asylum-seekers** from Viet Nam. Canada counted **606 refugees** and **1,101 asylum-seekers**.
- In both countries, the number of asylum-seekers has grown quickly since about 2018.

### What the words mean

- **Refugee:** someone who fled their country and has been officially given protection in another country.
- **Asylum-seeker:** someone who has asked another country for protection and is still waiting for a decision.

**Important:** these numbers count **how many people were living in each country at the end of each year**. They are *not* the number of people who arrived that year.

---

## Where the data comes from

All numbers come from the **[UNHCR Refugee Data Finder](https://www.unhcr.org/refugee-statistics/)**. UNHCR is the United Nations Refugee Agency. Its "persons of concern" data was downloaded for people from Viet Nam in each destination country.

A couple of things to keep in mind:

- **Canada's figures start in 1994.** The US figures start in 1988.
- The US refugee number jumps from 10,238 in 2005 to 45,757 in 2006, then drops to 251 in 2007. That jump is in UNHCR's own data. It is probably a change in how people were counted, not a real surge. Treat it with care.

---

## What has been done so far

1. **Collected the data.** Two files were downloaded from UNHCR, one for the United States and one for Canada.
2. **Cleaned the data.** A small Python script tidies up column names, removes duplicates, sorts the rows by year and combines both files into one. The original files are kept unchanged, so anyone can check the cleaning.
3. **Built the website.** It has the map, charts, number cards and table described above. It works on phones and supports dark mode.
4. **Put it online.** The website is published free on GitHub Pages. It updates itself whenever new changes are saved to the `main` branch.

### What's coming next

This mini deployment is just the start. Here's the plan:

- **More countries and more years.** The data will grow beyond the United States and Canada to other parts of the world, such as **Germany**, **Former Soviet Union**, **Japan**, **Taiwan** and **South Korea**. It will also cover longer periods of time.
- **More data sources, combined into one picture.** Each organization publishes its numbers in its own format, with different column names, categories and time spans. A big part of the work is cleaning these datasets and matching them up so they can be compared fairly. The original files will always be kept, so every step can be checked.
- **One world map.** All destinations will come together on a single interactive map, so you can follow the paths people from Viet Nam took across the world over time.
- **A storytelling landing page.** The current website will grow into a guided story, with new visuals built on the charts and map you see today.
- **The history behind the numbers.** Secondary research from scholarly (and) historical sources will explain *why* people left when they did and why they went where they went. This covers the political, social and economic forces behind each wave of migration.

---

## Browse the data without installing anything

GitHub can show spreadsheet files as tables right in your browser:

1. At the top of this page, click the **`data`** folder.
2. Open **`raw`** to see the original files from UNHCR, exactly as downloaded.
3. Open **`processed`** to see the cleaned versions.
4. Click any `.csv` file to see it as a table. To download it, click the **Download raw file** button (the down-arrow icon) at the top right of the file. The file opens in Excel, Numbers or Google Sheets.

---

## Run the website on your own computer

You only need this if you want to change something or add data. To just *look* at the work, use the [live website](https://lenaximuoi.github.io/vietnamese-immigration/).

### Step 1: Install the tools (one time only)

- **Node.js**, which runs the website on your computer. Download the "LTS" version from [nodejs.org](https://nodejs.org) and install it like any other app.
- **Python**, which runs the data-cleaning script. Download it from [python.org](https://www.python.org/downloads/). Mac users may already have it.

### Step 2: Get a copy of this project

Choose **one** of these:

- **Easiest:** at the top of this page, click the green **Code** button, then **Download ZIP**. Unzip the file anywhere on your computer.
- **If you use Git:** run this in a terminal:
  ```
  git clone https://github.com/lenaximuoi/vietnamese-immigration.git
  ```

### Step 3: Open a terminal inside the project folder

- **Mac:** open the **Terminal** app. Type `cd `, with a space after it, then drag the project folder into the Terminal window and press Enter.
- **Windows:** open the project folder in File Explorer. Click the address bar, type `cmd` and press Enter.

### Step 4: Start the website

Type these commands one at a time, pressing Enter after each:

```
npm install
npm run dev
```

The first command downloads what the website needs. It takes a minute and is only needed the first time. The second starts the website.

Then open **http://localhost:3000** in your browser. To stop the website, go back to the terminal and press **Ctrl + C**.

---

## Add new data

1. Download a new "persons of concern" CSV file from the [UNHCR Refugee Data Finder](https://www.unhcr.org/refugee-statistics/). Put it in the **`data/raw`** folder.
2. Install the Python data tool once:
   ```
   pip install pandas
   ```
3. Run the cleaning script. It processes every file in `data/raw`:
   ```
   python3 scripts/cleaning.py
   ```
   On Windows, type `python` instead of `python3`.
4. **If the file is for a new country**, open `src/lib/destinations.js` and add one line for it, copying the pattern of the United States and Canada lines. That line sets the country's color and its place on the map. Without it, the country won't appear on the website.
5. Run `npm run dev` again to check the result at http://localhost:3000.
6. Save your changes to GitHub (commit and push to the `main` branch). The live website updates itself within a few minutes. You can watch its progress in the **Actions** tab at the top of this page.

---

## What's in each folder

| Folder or file | What it holds |
|---|---|
| `data/raw/` | The original files from UNHCR, never edited |
| `data/processed/` | The cleaned files, including `vietnam_migration.json`, which the website reads |
| `scripts/cleaning.py` | The script that turns raw data into processed data |
| `src/` | The website's code: pages, charts and map |
| `src/lib/destinations.js` | The list of countries shown, with their colors and map positions |
| `.github/workflows/deploy.yml` | The instructions GitHub follows to publish the website |

---

## Built with

- **[Next.js](https://nextjs.org)**, the framework for the website
- **[MapLibre](https://maplibre.org)**, for the map, with map backgrounds from [CARTO](https://carto.com) and [OpenStreetMap](https://www.openstreetmap.org)
- **[pandas](https://pandas.pydata.org)**, for cleaning the data
- **GitHub Pages**, for free hosting
