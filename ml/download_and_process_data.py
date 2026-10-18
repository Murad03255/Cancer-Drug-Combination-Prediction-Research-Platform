"""
Cancer Drug Combination Prediction & Research Platform — Real Data Downloader & Processor

Downloads DrugComb v1.4 summary data from Zenodo and processes it
for drug combination synergy prediction.
"""
import pandas as pd
import numpy as np
import os
import sys
import urllib.request
import json


DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")


def download_drugcomb_data():
    """Download DrugComb summary table from Zenodo."""
    os.makedirs(RAW_DIR, exist_ok=True)

    url = "https://zenodo.org/records/11102665/files/summary_table_v1.4.csv"
    output_file = os.path.join(RAW_DIR, "summary_table_v1.4.csv")

    if os.path.exists(output_file):
        print(f"File already exists: {output_file}")
        return output_file

    print(f"Downloading DrugComb data from Zenodo...")
    print(f"URL: {url}")
    print(f"This may take a few minutes depending on file size...")

    try:
        def _progress(count, block_size, total_size):
            pct = count * block_size * 100 / total_size if total_size > 0 else 0
            sys.stdout.write(f"\rProgress: {pct:.1f}%")
            sys.stdout.flush()

        urllib.request.urlretrieve(url, output_file, reporthook=_progress)
        print(f"\nDownloaded to: {output_file}")
        return output_file
    except Exception as e:
        print(f"\nError downloading: {e}")
        print("Trying alternative URL...")

        # Try alternative Zenodo record
        alt_url = "https://zenodo.org/records/15235991/files/summary_table_v1.5.csv"
        try:
            urllib.request.urlretrieve(alt_url, output_file, reporthook=_progress)
            print(f"\nDownloaded to: {output_file}")
            return output_file
        except Exception as e2:
            print(f"\nAlternative also failed: {e2}")
            return None


def process_drugcomb_data(raw_file: str):
    """
    Process DrugComb summary data into ML-ready format.

    Columns expected from DrugComb summary:
    - drug_row, drug_col: Drug names
    - cell_line_name: Cell line
    - synergy_bliss, synergy_loewe, synergy_hsa, synergy_zip: Synergy scores
    - css: Combination Sensitivity Score
    """
    os.makedirs(PROCESSED_DIR, exist_ok=True)

    print(f"\nLoading raw data: {raw_file}")
    # Read in chunks for large files
    try:
        df = pd.read_csv(raw_file, low_memory=False)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        print("Trying with different encoding...")
        df = pd.read_csv(raw_file, low_memory=False, encoding='latin1')

    print(f"Raw data shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst few rows:")
    print(df.head(3).to_string())

    # Identify synergy score columns
    synergy_cols = [c for c in df.columns if 'synergy' in c.lower() or 'bliss' in c.lower()
                    or 'loewe' in c.lower() or 'zip' in c.lower() or 'hsa' in c.lower()]
    print(f"\nSynergy columns found: {synergy_cols}")

    # Identify drug columns
    drug_cols = [c for c in df.columns if 'drug' in c.lower()]
    print(f"Drug columns found: {drug_cols}")

    # Identify cell line columns
    cl_cols = [c for c in df.columns if 'cell' in c.lower() or 'line' in c.lower()]
    print(f"Cell line columns found: {cl_cols}")

    # Standardize column names
    col_mapping = {}
    for c in df.columns:
        cl = c.lower().strip()
        if cl in ['drug_row', 'drug_a', 'druga', 'drug1']:
            col_mapping[c] = 'drug_a'
        elif cl in ['drug_col', 'drug_b', 'drugb', 'drug2']:
            col_mapping[c] = 'drug_b'
        elif cl in ['cell_line_name', 'cell_line', 'cellline', 'ccle_name']:
            col_mapping[c] = 'cell_line'
        elif cl in ['synergy_bliss', 'bliss', 'bliss_synergy']:
            col_mapping[c] = 'bliss_synergy'
        elif cl in ['synergy_loewe', 'loewe']:
            col_mapping[c] = 'loewe_synergy'
        elif cl in ['synergy_zip', 'zip']:
            col_mapping[c] = 'zip_synergy'
        elif cl in ['synergy_hsa', 'hsa']:
            col_mapping[c] = 'hsa_synergy'
        elif cl in ['css', 'css_ri']:
            col_mapping[c] = 'css'
        elif cl in ['tissue_name', 'tissue']:
            col_mapping[c] = 'tissue'
        elif cl in ['study_name', 'study']:
            col_mapping[c] = 'study'

    df = df.rename(columns=col_mapping)
    print(f"\nStandardized columns: {list(df.columns)}")

    # Select primary synergy score (prefer Bliss, fallback to others)
    synergy_col = None
    for candidate in ['bliss_synergy', 'zip_synergy', 'loewe_synergy', 'hsa_synergy']:
        if candidate in df.columns:
            synergy_col = candidate
            break

    if synergy_col is None:
        print("ERROR: No synergy score column found!")
        print("Available columns:", list(df.columns))
        # Try to find any numeric column that could be synergy
        for c in df.columns:
            if 'score' in c.lower() or 'synergy' in c.lower():
                synergy_col = c
                break

    if synergy_col is None:
        print("Cannot proceed without synergy scores. Exiting.")
        return None

    print(f"\nUsing synergy column: {synergy_col}")

    # Basic cleaning
    required_cols = ['drug_a', 'drug_b', 'cell_line']
    for rc in required_cols:
        if rc not in df.columns:
            print(f"ERROR: Required column '{rc}' not found!")
            print(f"Available: {list(df.columns)}")
            return None

    # Drop rows with missing essential values
    df = df.dropna(subset=['drug_a', 'drug_b', 'cell_line', synergy_col])
    print(f"\nAfter dropping NAs: {df.shape}")

    # Remove duplicates
    df = df.drop_duplicates(subset=['drug_a', 'drug_b', 'cell_line'])
    print(f"After removing duplicates: {df.shape}")

    # Remove self-combinations
    df = df[df['drug_a'] != df['drug_b']]
    print(f"After removing self-combinations: {df.shape}")

    # Create synergy classification
    df['synergy_class'] = df[synergy_col].apply(
        lambda x: 'synergistic' if x > 10 else ('antagonistic' if x < -10 else 'additive')
    )

    # Rename primary synergy column
    if synergy_col != 'bliss_synergy':
        df['bliss_synergy'] = df[synergy_col]

    # Extract cancer type from tissue if available
    if 'tissue' not in df.columns:
        df['tissue'] = 'Unknown'

    # Map tissue to cancer type
    tissue_cancer_map = {
        'breast': 'Breast Cancer',
        'lung': 'Lung Cancer',
        'colon': 'Colorectal Cancer',
        'colorectal': 'Colorectal Cancer',
        'prostate': 'Prostate Cancer',
        'ovary': 'Ovarian Cancer',
        'ovarian': 'Ovarian Cancer',
        'blood': 'Leukemia',
        'haematopoietic': 'Leukemia',
        'lymphoid': 'Lymphoma',
        'brain': 'Brain Cancer',
        'cns': 'Brain Cancer',
        'liver': 'Liver Cancer',
        'pancreas': 'Pancreatic Cancer',
        'skin': 'Melanoma',
        'melanoma': 'Melanoma',
        'kidney': 'Kidney Cancer',
        'renal': 'Kidney Cancer',
        'stomach': 'Stomach Cancer',
        'gastric': 'Stomach Cancer',
        'bladder': 'Bladder Cancer',
        'bone': 'Bone Cancer',
        'thyroid': 'Thyroid Cancer',
        'head': 'Head and Neck Cancer',
        'cervix': 'Cervical Cancer',
        'uterus': 'Uterine Cancer',
        'esophagus': 'Esophageal Cancer',
        'soft_tissue': 'Sarcoma',
    }

    def map_cancer_type(tissue):
        if pd.isna(tissue):
            return 'Unknown'
        tissue_lower = str(tissue).lower()
        for key, cancer in tissue_cancer_map.items():
            if key in tissue_lower:
                return cancer
        return str(tissue).title() + ' Cancer'

    df['cancer_type'] = df['tissue'].apply(map_cancer_type)

    # Select and save final columns
    keep_cols = ['drug_a', 'drug_b', 'cell_line', 'cancer_type', 'tissue',
                 'bliss_synergy', 'synergy_class']

    # Add any additional synergy scores that exist
    for extra in ['loewe_synergy', 'zip_synergy', 'hsa_synergy', 'css']:
        if extra in df.columns:
            keep_cols.append(extra)

    df_final = df[keep_cols].copy()

    # Stats
    print(f"\n{'='*50}")
    print(f"PROCESSED DATASET STATS")
    print(f"{'='*50}")
    print(f"Total samples: {len(df_final)}")
    print(f"Unique drug pairs: {df_final.groupby(['drug_a','drug_b']).ngroups}")
    print(f"Unique drugs: {pd.concat([df_final['drug_a'], df_final['drug_b']]).nunique()}")
    print(f"Unique cell lines: {df_final['cell_line'].nunique()}")
    print(f"Cancer types: {df_final['cancer_type'].nunique()}")
    print(f"\nSynergy distribution:")
    print(df_final['synergy_class'].value_counts())
    print(f"\nBliss synergy score stats:")
    print(df_final['bliss_synergy'].describe())
    print(f"\nTop 10 cancer types:")
    print(df_final['cancer_type'].value_counts().head(10))

    # Save processed data
    output_file = os.path.join(PROCESSED_DIR, "drug_combo_synergy.csv")
    df_final.to_csv(output_file, index=False)
    print(f"\nSaved processed data to: {output_file}")

    # Save unique drugs list
    all_drugs = sorted(pd.concat([df_final['drug_a'], df_final['drug_b']]).unique().tolist())
    drugs_df = pd.DataFrame({'name': all_drugs})
    drugs_df.to_csv(os.path.join(PROCESSED_DIR, "drugs.csv"), index=False)
    print(f"Saved {len(all_drugs)} unique drugs to drugs.csv")

    # Save unique cell lines with cancer types
    cl_df = df_final[['cell_line', 'cancer_type', 'tissue']].drop_duplicates()
    cl_df.to_csv(os.path.join(PROCESSED_DIR, "cell_lines.csv"), index=False)
    print(f"Saved {len(cl_df)} unique cell lines to cell_lines.csv")

    return df_final


def main():
    print("="*60)
    print("  Cancer Drug Combination Prediction & Research Platform — Data Pipeline")
    print("="*60)

    # Step 1: Download
    raw_file = download_drugcomb_data()
    if raw_file is None:
        print("\nDownload failed. Please manually download from:")
        print("  https://zenodo.org/records/11102665")
        print(f"  Place the CSV in: {RAW_DIR}")
        return

    # Step 2: Process
    df = process_drugcomb_data(raw_file)
    if df is None:
        print("\nProcessing failed. Check the data format.")
        return

    print("\n" + "="*60)
    print("  Data pipeline complete!")
    print("="*60)


if __name__ == "__main__":
    main()
