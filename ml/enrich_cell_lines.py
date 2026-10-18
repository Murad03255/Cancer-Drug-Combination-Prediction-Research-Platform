"""
Enrich cell lines with standard cancer types (CCLE / COSMIC / GDSC mapping).
"""
import pandas as pd
import os

PROCESSED_DIR = r"d:\Project\CancerPredictionAndSuggestionWeb\ml\data\processed"
cl_file = os.path.join(PROCESSED_DIR, "cell_lines.csv")
data_file = os.path.join(PROCESSED_DIR, "drug_combo_synergy.csv")

# Standard cell line to cancer type dictionary
CELL_LINE_MAP = {
    'A2058': 'Melanoma', 'A375': 'Melanoma', 'SK-MEL-28': 'Melanoma', 'MALME-3M': 'Melanoma', 'UACC-62': 'Melanoma', 'M14': 'Melanoma',
    'MCF7': 'Breast Cancer', 'MDA-MB-231': 'Breast Cancer', 'T-47D': 'Breast Cancer', 'BT-549': 'Breast Cancer', 'HS 578T': 'Breast Cancer', 'SK-BR-3': 'Breast Cancer',
    'A549': 'Lung Cancer', 'NCI-H460': 'Lung Cancer', 'NCI-H23': 'Lung Cancer', 'NCI-H522': 'Lung Cancer', 'HOP-62': 'Lung Cancer', 'EKVX': 'Lung Cancer',
    'HCT116': 'Colorectal Cancer', 'HT29': 'Colorectal Cancer', 'SW-620': 'Colorectal Cancer', 'COLO 205': 'Colorectal Cancer', 'HCC-2998': 'Colorectal Cancer', 'KM12': 'Colorectal Cancer',
    'PC-3': 'Prostate Cancer', 'DU-145': 'Prostate Cancer', 'LNCaP': 'Prostate Cancer',
    'SK-OV-3': 'Ovarian Cancer', 'OVCAR-3': 'Ovarian Cancer', 'OVCAR-4': 'Ovarian Cancer', 'OVCAR-5': 'Ovarian Cancer', 'OVCAR-8': 'Ovarian Cancer', 'IGROV1': 'Ovarian Cancer',
    'K-562': 'Leukemia', 'HL-60': 'Leukemia', 'MOLT-4': 'Leukemia', 'CCRF-CEM': 'Leukemia', 'RPMI-8226': 'Multiple Myeloma', 'SR': 'Leukemia',
    'U251': 'Glioblastoma', 'SF-268': 'Glioblastoma', 'SF-295': 'Glioblastoma', 'SF-539': 'Glioblastoma', 'SNB-19': 'Glioblastoma', 'SNB-75': 'Glioblastoma',
    '786-0': 'Renal Cancer', 'A498': 'Renal Cancer', 'ACHN': 'Renal Cancer', 'CAKI-1': 'Renal Cancer', 'RXF 393': 'Renal Cancer', 'SN12C': 'Renal Cancer', 'TK-10': 'Renal Cancer', 'UO-31': 'Renal Cancer',
    'HepG2': 'Liver Cancer', 'Huh-7': 'Liver Cancer',
    'PANC-1': 'Pancreatic Cancer', 'AsPC-1': 'Pancreatic Cancer', 'BxPC-3': 'Pancreatic Cancer', 'MIA PaCa-2': 'Pancreatic Cancer',
    'HT-1080': 'Fibrosarcoma', 'RD': 'Rhabdomyosarcoma', 'SJSA-1': 'Osteosarcoma'
}

print("Enriching cell line metadata...")
df = pd.read_csv(data_file)
cl_df = pd.read_csv(cl_file)

def get_cancer_type(name):
    clean = str(name).strip().upper()
    for k, v in CELL_LINE_MAP.items():
        if k.upper() in clean or clean in k.upper():
            return v
    # fallback
    return "Solid Tumor"

df['cancer_type'] = df['cell_line'].apply(get_cancer_type)
cl_df['cancer_type'] = cl_df['cell_line'].apply(get_cancer_type)

df.to_csv(data_file, index=False)
cl_df.to_csv(cl_file, index=False)

print(f"Updated dataset with {df['cancer_type'].nunique()} distinct cancer types:")
print(df['cancer_type'].value_counts())
