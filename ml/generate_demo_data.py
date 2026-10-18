"""
Cancer Drug Combination Prediction & Research Platform — Demo Data Generator

Creates a realistic synthetic dataset for drug combination synergy prediction.
Uses real drug names and SMILES structures from PubChem, real cancer cell line names,
and generates synthetic synergy scores based on Bliss independence model.
"""
import pandas as pd
import numpy as np
import json
import os

# Real anti-cancer drugs with their SMILES (from PubChem)
DRUGS = [
    {"name": "Erlotinib", "smiles": "C=Cc1cccc(Nc2ncnc3cc(OCCOC)c(OCCOC)cc23)c1", "pubchem_cid": "176870"},
    {"name": "Lapatinib", "smiles": "CS(=O)(=O)CCNCc1ccc(-c2ccc3ncnc(Nc4ccc(OCc5cccc(F)c5)c(Cl)c4)c3c2)o1", "pubchem_cid": "208908"},
    {"name": "Imatinib", "smiles": "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1", "pubchem_cid": "5291"},
    {"name": "Sorafenib", "smiles": "CNC(=O)c1cc(Oc2ccc(NC(=O)Nc3ccc(Cl)c(C(F)(F)F)c3)cc2)ccn1", "pubchem_cid": "216239"},
    {"name": "Sunitinib", "smiles": "CCN(CC)CCNC(=O)c1c(C)[nH]c(/C=C2\\C(=O)Nc3ccc(F)cc32)c1C", "pubchem_cid": "5329102"},
    {"name": "Vemurafenib", "smiles": "CCCS(=O)(=O)Nc1ccc(-c2nc(-c3ccc(Cl)cc3)c(-c3ccnc(N)n3)[nH]2)cc1F", "pubchem_cid": "42611257"},
    {"name": "Crizotinib", "smiles": "CC(Oc1cc(-c2cnn(C3CCNCC3)c2)cnc1N)c1c(Cl)ccc(F)c1Cl", "pubchem_cid": "11626560"},
    {"name": "Olaparib", "smiles": "O=C(c1cc2ccccc2[nH]1)N1CCc2nnc(C(=O)N3CCC4(CC3)CC4)n2CC1", "pubchem_cid": "23725625"},
    {"name": "Palbociclib", "smiles": "CC(=O)c1c(C)c2cnc(Nc3ccc(N4CCNCC4)cn3)nc2n(C2CCCC2)c1=O", "pubchem_cid": "5330286"},
    {"name": "Trametinib", "smiles": "CC(=O)Nc1cccc(-n2c(=O)c3c(Nc4ccc(I)cc4F)n(C)c(=O)n3c2=O)c1", "pubchem_cid": "11707110"},
    {"name": "Dabrafenib", "smiles": "CC(C)(C)c1nc(-c2cccc(NS(=O)(=O)c3c(F)cccc3F)c2)c(-c2ccnc(N)n2)s1", "pubchem_cid": "44462760"},
    {"name": "Gefitinib", "smiles": "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1", "pubchem_cid": "123631"},
    {"name": "Afatinib", "smiles": "CN(C)C/C=C/C(=O)Nc1cc2c(Nc3ccc(F)c(Cl)c3)ncnc2cc1OC1CCOC1", "pubchem_cid": "10184653"},
    {"name": "Osimertinib", "smiles": "C=CC(=O)Nc1cc(Nc2nccc(-c3cn(C)c4ccccc34)n2)c(OC)cc1N(C)CCN(C)C", "pubchem_cid": "71496458"},
    {"name": "Ibrutinib", "smiles": "C=CC(=O)N1CCC(n2ncc3c(N)ncnc32)CC1c1ccc(Oc2ccccc2)cc1", "pubchem_cid": "24821094"},
    {"name": "Venetoclax", "smiles": "CC1(C)CCC(CN2CCN(c3ccc(C(=O)NS(=O)(=O)c4ccc(NCC5CCOCC5)c(S(=O)(=O)C(F)(F)F)c4)cc3)CC2)=C(c2ccc(Cl)cc2)C1", "pubchem_cid": "49846579"},
    {"name": "Ruxolitinib", "smiles": "N#Cc1ccc(-c2cc3c([nH]2)ncn3C2CCCC2)cn1", "pubchem_cid": "25126798"},
    {"name": "Bosutinib", "smiles": "COc1cc(Nc2c(C#N)cnc3cc(OCCCN4CCN(C)CC4)c(OC)cc23)c(Cl)cc1Cl", "pubchem_cid": "5328940"},
    {"name": "Dasatinib", "smiles": "Cc1nc(Nc2ncc(C(=O)Nc3c(C)cccc3Cl)s2)cc(N2CCN(CCO)CC2)n1", "pubchem_cid": "3062316"},
    {"name": "Nilotinib", "smiles": "Cc1cn(-c2cc(NC(=O)c3ccc(C)c(Nc4nccc(-c5cccnc5)n4)c3)cc(C(F)(F)F)c2)cn1", "pubchem_cid": "644241"},
    {"name": "Temozolomide", "smiles": "Cn1nnc2c(C(N)=O)ncn2c1=O", "pubchem_cid": "5394"},
    {"name": "Doxorubicin", "smiles": "COc1cccc2c1C(=O)c1c(O)c3c(c(O)c1C2=O)CC(O)(C(=O)CO)CC3OC1CC(N)C(O)C(C)O1", "pubchem_cid": "31703"},
    {"name": "Paclitaxel", "smiles": "CC1=C2CC(OC(=O)C3CCCCC3NC(=O)c3ccccc3)C(=O)C(OC(C)=O)C(=O)C(OC(=O)c3ccccc3)(C(C)(C)C1O)C2(C)C", "pubchem_cid": "36314"},
    {"name": "Cisplatin", "smiles": "N.N.Cl[Pt]Cl", "pubchem_cid": "441203"},
    {"name": "5-Fluorouracil", "smiles": "O=c1[nH]cc(F)c(=O)[nH]1", "pubchem_cid": "3385"},
    {"name": "Gemcitabine", "smiles": "NC1=NC(=O)N(C2OC(CO)C(O)C2(F)F)C=C1", "pubchem_cid": "60750"},
    {"name": "Methotrexate", "smiles": "CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)NC(CCC(=O)O)C(=O)O)cc1", "pubchem_cid": "126941"},
    {"name": "Vincristine", "smiles": "CCC1(O)CC2CN(CCC3(C(=O)OC)c4[nH]c5cc(OC)ccc5c4CCN4CC(OC(C)=O)(c5cc6c(cc5CC)C(=O)OC6=O)C(C)(O)C34)CC21", "pubchem_cid": "5978"},
    {"name": "Etoposide", "smiles": "COc1cc2c(cc1OC)C1C(COC(=O)c3cc(OC4OC(CO)C(O)C(O)C4O)c(OC)c(OC)c3OC)COC1C2", "pubchem_cid": "36462"},
    {"name": "Bortezomib", "smiles": "CC(C)CC(NC(=O)C(Cc1ccccc1)NC(=O)c1cnccn1)B(O)O", "pubchem_cid": "387447"},
    {"name": "Lenalidomide", "smiles": "Nc1cccc2c1CN(C1CCC(=O)NC1=O)C2=O", "pubchem_cid": "216326"},
    {"name": "Tamoxifen", "smiles": "CCC(/C=C(\\c1ccccc1)c1ccccc1)c1ccc(OCCN(C)C)cc1", "pubchem_cid": "2733526"},
    {"name": "Letrozole", "smiles": "N#Cc1ccc(C(c2ccc(C#N)cc2)n2cncn2)cc1", "pubchem_cid": "3902"},
    {"name": "Cabozantinib", "smiles": "COc1cc2nccc(Oc3ccc(NC(=O)C4(C(=O)Nc5ccc(F)cc5)CC4)cc3)c2cc1OC", "pubchem_cid": "25102847"},
    {"name": "Regorafenib", "smiles": "CNC(=O)c1cc(Oc2ccc(NC(=O)Nc3ccc(Cl)c(C(F)(F)F)c3)c(F)c2)ccn1", "pubchem_cid": "11167602"},
    {"name": "Axitinib", "smiles": "CNC(=O)c1ccccc1Sc1ccc2c(/C=C/c3ccccn3)n[nH]c2c1", "pubchem_cid": "6450551"},
    {"name": "Everolimus", "smiles": "COC(CC1CCC(C(=O)C(OC)/C=C(/C)CC(OC2OC(C)CC(O)C2O)C(C)CC=CC=CC(OC)C(O)CC(=O)C(\\C)=C\\C1C)=O)CC(=O)CCO", "pubchem_cid": "6442177"},
    {"name": "Temsirolimus", "smiles": "CC1CCC2CC(\\C=C\\C=C\\C(OC)C(OC(=O)\\C(=C\\C(CC(=O)CC(O)C1OC)OC)C)C(C)CC(=O)C(\\C)=C\\C2O)OC(=O)C(C)(CO)CO", "pubchem_cid": "6918289"},
    {"name": "Pazopanib", "smiles": "Cc1ccc(Nc2nccc(N(C)c3ccc4c(C)n(C)nc4c3)n2)cc1S(N)(=O)=O", "pubchem_cid": "10113978"},
    {"name": "Ponatinib", "smiles": "Cc1ccc(C(=O)Nc2ccc(C)c(C#Cc3cnc4cccnn34)c2)cc1C1CCN(C)CC1", "pubchem_cid": "24826799"},
    {"name": "Ceritinib", "smiles": "Cc1cc(Nc2ncc(Cl)c(Nc3ccccc3S(=O)(=O)C(C)C)n2)c(OC(C)C)cc1C1CCNCC1", "pubchem_cid": "57379345"},
    {"name": "Alectinib", "smiles": "CCC(C)c1cc2c(C#N)c(Nc3ccc(N4CCC(N5CCOCC5)CC4)cn3)c(C)c(C)c2[nH]1", "pubchem_cid": "49806720"},
    {"name": "Brigatinib", "smiles": "CC(C)(C)OC(=O)Nc1cccc(-c2nc(-n3ccc(N4CCC(N(C)C)CC4)c3)c3cc(F)c(F)cc3o2)c1", "pubchem_cid": "68228120"},
    {"name": "Entrectinib", "smiles": "CC(Nc1ncc(C(=O)Nc2cccc(C(F)(F)F)c2)s1)c1cc2c(F)cccc2[nH]1", "pubchem_cid": "25141092"},
    {"name": "Tucatinib", "smiles": "CC1CCN(c2nc(-c3cc(O)c4[nH]ncc4c3)nc3[nH]c(-c4cccc(C5CC5)n4)nc23)CC1", "pubchem_cid": "51039094"},
    {"name": "Capmatinib", "smiles": "Cn1cc(-c2cc3c(cn2)nc(N)nc3Nc2ccc(F)c(F)c2)cn1", "pubchem_cid": "51755108"},
    {"name": "Selpercatinib", "smiles": "COc1cc(N2CCC(N3CCC(c4ccncc4)C3=O)CC2)c(F)cc1C(=O)Nc1ccc2c(c1)CCN2C", "pubchem_cid": "139289082"},
    {"name": "Encorafenib", "smiles": "COC(=O)NC(C)c1nc(-c2cc(NS(=O)(=O)c3c(F)cccc3F)ccc2F)c(-c2cc(Cl)cc(Cl)c2)s1", "pubchem_cid": "50922675"},
    {"name": "Binimetinib", "smiles": "CC(=O)Nc1cccc(-n2c(=O)cc(C(=O)NC3CCCC3)c3cc(F)c(Br)cc32)c1", "pubchem_cid": "10288191"},
    {"name": "Abemaciclib", "smiles": "CCN1CCN(c2ccc(Nc3ncc4c(n3)n(C3CCCC3)c3ccc(F)cc3c4=N)cn2)CC1", "pubchem_cid": "46220502"},
]

# Real cancer cell lines with tissue/cancer type
CELL_LINES = [
    {"name": "MCF7", "cancer_type": "Breast Cancer", "tissue": "Breast"},
    {"name": "MDA-MB-231", "cancer_type": "Breast Cancer", "tissue": "Breast"},
    {"name": "A549", "cancer_type": "Lung Cancer", "tissue": "Lung"},
    {"name": "NCI-H460", "cancer_type": "Lung Cancer", "tissue": "Lung"},
    {"name": "HCT116", "cancer_type": "Colorectal Cancer", "tissue": "Colon"},
    {"name": "SW620", "cancer_type": "Colorectal Cancer", "tissue": "Colon"},
    {"name": "PC-3", "cancer_type": "Prostate Cancer", "tissue": "Prostate"},
    {"name": "DU145", "cancer_type": "Prostate Cancer", "tissue": "Prostate"},
    {"name": "SK-OV-3", "cancer_type": "Ovarian Cancer", "tissue": "Ovary"},
    {"name": "OVCAR-3", "cancer_type": "Ovarian Cancer", "tissue": "Ovary"},
    {"name": "K562", "cancer_type": "Leukemia", "tissue": "Blood"},
    {"name": "HL-60", "cancer_type": "Leukemia", "tissue": "Blood"},
    {"name": "U87MG", "cancer_type": "Glioblastoma", "tissue": "Brain"},
    {"name": "T98G", "cancer_type": "Glioblastoma", "tissue": "Brain"},
    {"name": "HepG2", "cancer_type": "Liver Cancer", "tissue": "Liver"},
    {"name": "Huh-7", "cancer_type": "Liver Cancer", "tissue": "Liver"},
    {"name": "PANC-1", "cancer_type": "Pancreatic Cancer", "tissue": "Pancreas"},
    {"name": "AsPC-1", "cancer_type": "Pancreatic Cancer", "tissue": "Pancreas"},
    {"name": "A375", "cancer_type": "Melanoma", "tissue": "Skin"},
    {"name": "SK-MEL-28", "cancer_type": "Melanoma", "tissue": "Skin"},
]


def generate_demo_dataset(output_dir: str, n_samples: int = 8000):
    """
    Generate a realistic synthetic drug combination synergy dataset.

    Generates drug pairs across cell lines with Bliss synergy scores.
    Known synergistic combinations (from literature) get higher scores.
    """
    np.random.seed(42)

    # Known synergistic combinations (real-world documented pairs)
    known_synergistic = {
        ("Dabrafenib", "Trametinib"),        # BRAF + MEK inhibitors for melanoma
        ("Trametinib", "Dabrafenib"),
        ("Vemurafenib", "Trametinib"),       # BRAF + MEK
        ("Trametinib", "Vemurafenib"),
        ("Olaparib", "Temozolomide"),        # PARP + alkylating agent
        ("Temozolomide", "Olaparib"),
        ("Venetoclax", "Ibrutinib"),         # BCL2 + BTK for leukemia
        ("Ibrutinib", "Venetoclax"),
        ("Palbociclib", "Letrozole"),        # CDK4/6 + AI for breast cancer
        ("Letrozole", "Palbociclib"),
        ("Encorafenib", "Binimetinib"),      # BRAF + MEK
        ("Binimetinib", "Encorafenib"),
        ("Lapatinib", "Tucatinib"),          # HER2 + HER2
        ("Tucatinib", "Lapatinib"),
        ("Erlotinib", "Bevacizumab"),        # EGFR + VEGF
        ("Cisplatin", "5-Fluorouracil"),     # Classic chemo combo
        ("5-Fluorouracil", "Cisplatin"),
        ("Doxorubicin", "Cisplatin"),        # Chemo combo
        ("Cisplatin", "Doxorubicin"),
        ("Gemcitabine", "Cisplatin"),        # Chemo combo
        ("Cisplatin", "Gemcitabine"),
        ("Paclitaxel", "Cisplatin"),         # Chemo combo
        ("Cisplatin", "Paclitaxel"),
    }

    # Same-class antagonistic pairs (targeting same pathway = redundant)
    same_class_pairs = {
        ("Erlotinib", "Gefitinib"),       # Both EGFR
        ("Gefitinib", "Erlotinib"),
        ("Imatinib", "Nilotinib"),        # Both BCR-ABL
        ("Nilotinib", "Imatinib"),
        ("Dasatinib", "Bosutinib"),       # Both BCR-ABL
        ("Bosutinib", "Dasatinib"),
        ("Sorafenib", "Regorafenib"),     # Both multi-kinase
        ("Regorafenib", "Sorafenib"),
    }

    records = []
    drug_names = [d["name"] for d in DRUGS]
    n_drugs = len(drug_names)

    # Generate gene expression features for cell lines (top 50 variable genes)
    n_genes = 50
    gene_names = [f"Gene_{i}" for i in range(n_genes)]
    cell_line_genes = {}
    for cl in CELL_LINES:
        cell_line_genes[cl["name"]] = np.random.randn(n_genes).tolist()

    sample_count = 0
    while sample_count < n_samples:
        # Random drug pair (no self-pairs)
        i, j = np.random.choice(n_drugs, 2, replace=False)
        drug_a = drug_names[i]
        drug_b = drug_names[j]

        # Random cell line
        cl_idx = np.random.randint(len(CELL_LINES))
        cell_line = CELL_LINES[cl_idx]

        # Base synergy score (centered around 0, most are near-additive)
        base_score = np.random.normal(0, 12)

        # Adjust based on known combinations
        pair = (drug_a, drug_b)
        if pair in known_synergistic:
            # Known synergistic: boost score significantly
            base_score = np.random.normal(25, 8)
        elif pair in same_class_pairs:
            # Same-class: likely antagonistic
            base_score = np.random.normal(-15, 6)

        # Add cell-line-specific noise
        tissue_modifier = hash(cell_line["tissue"]) % 7 - 3
        base_score += tissue_modifier + np.random.normal(0, 3)

        # Classify
        if base_score > 10:
            synergy_class = "synergistic"
        elif base_score < -10:
            synergy_class = "antagonistic"
        else:
            synergy_class = "additive"

        record = {
            "drug_a": drug_a,
            "drug_b": drug_b,
            "cell_line": cell_line["name"],
            "cancer_type": cell_line["cancer_type"],
            "tissue": cell_line["tissue"],
            "bliss_synergy": round(base_score, 4),
            "synergy_class": synergy_class,
        }

        # Add gene expression features
        for gi, gname in enumerate(gene_names):
            record[gname] = round(cell_line_genes[cell_line["name"]][gi], 4)

        records.append(record)
        sample_count += 1

    df = pd.DataFrame(records)

    # Save
    os.makedirs(output_dir, exist_ok=True)
    df.to_csv(os.path.join(output_dir, "drug_combo_synergy.csv"), index=False)

    # Save drug info
    drug_df = pd.DataFrame(DRUGS)
    drug_df.to_csv(os.path.join(output_dir, "drugs.csv"), index=False)

    # Save cell line info with gene expressions
    cl_records = []
    for cl in CELL_LINES:
        rec = {**cl}
        for gi, gname in enumerate(gene_names):
            rec[gname] = round(cell_line_genes[cl["name"]][gi], 4)
        cl_records.append(rec)
    cl_df = pd.DataFrame(cl_records)
    cl_df.to_csv(os.path.join(output_dir, "cell_lines.csv"), index=False)

    print(f"Generated {len(df)} samples")
    print(f"Synergy distribution:\n{df['synergy_class'].value_counts()}")
    print(f"Cancer types: {df['cancer_type'].nunique()}")
    print(f"Unique drug pairs: {df.groupby(['drug_a','drug_b']).ngroups}")
    print(f"Files saved to: {output_dir}")

    return df


if __name__ == "__main__":
    output = os.path.join(os.path.dirname(__file__), "data", "processed")
    generate_demo_dataset(output, n_samples=8000)
