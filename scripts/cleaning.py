import sys
from pathlib import Path

import pandas as pd

# Resolve paths from the repo root so the script works on any machine
ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
# Every processed file merged into one, imported by the website at build time
COMBINED_JSON = PROCESSED_DIR / "vietnam_migration.json"


def clean(df):
    # snake_case column names, e.g. "Country of Origin" -> "country_of_origin"
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(r"[^a-z0-9]+", "_", regex=True)
        .str.strip("_")
    )
    df = df.drop_duplicates()
    if "year" in df.columns:
        df = df.sort_values("year").reset_index(drop=True)
    return df


def process(filename):
    raw_path = RAW_DIR / filename
    try:
        df = pd.read_csv(raw_path)
    except Exception as e:
        print(f"Error reading file {raw_path}: {e}")
        sys.exit(1)

    df = clean(df)
    print(f"\n== {filename}")
    print("Columns:", df.columns.tolist())
    print("Head:\n", df.head(3).to_string())
    if "country_of_asylum" in df.columns:
        print("Destinations:", df["country_of_asylum"].unique()[:10])

    # Write to data/processed and leave the raw file untouched.
    # Spaces become underscores, e.g. "persons_of_concern 2.csv" -> "persons_of_concern_2.csv"
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / filename.replace(" ", "_")
    df.to_csv(out_path, index=False)
    print(f"Saved {len(df)} rows to {out_path.relative_to(ROOT)}")


def combine():
    frames = [pd.read_csv(p) for p in sorted(PROCESSED_DIR.glob("*.csv"))]
    combined = pd.concat(frames).drop_duplicates()
    combined = combined.sort_values(["country_of_asylum", "year"]).reset_index(drop=True)
    combined.to_json(COMBINED_JSON, orient="records", indent=2)
    print(f"\nSaved {len(combined)} rows from {len(frames)} files to {COMBINED_JSON.relative_to(ROOT)}")


def main(*filenames):
    # No arguments: process every CSV in data/raw
    for filename in filenames or sorted(p.name for p in RAW_DIR.glob("*.csv")):
        process(filename)
    combine()


if __name__ == "__main__":
    main(*sys.argv[1:])
