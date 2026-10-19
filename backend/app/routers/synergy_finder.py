"""
Cancer Drug Combination Prediction & Research Platform — SynergyFinder Dose-Response & 3D Synergy Landscape Simulator
Generates checkerboard concentration matrices, single-agent dose-response Hill curves,
and 2D/3D synergy surface coordinates for Bliss, ZIP, Loewe, and HSA models.
"""
from fastapi import APIRouter, Query, HTTPException
import numpy as np
from typing import Dict, Any, List

router = APIRouter(prefix="/synergy-finder", tags=["SynergyFinder 3D"])


def hill_equation(conc: float, ic50: float = 15.0, hill_coef: float = 1.4, max_effect: float = 100.0) -> float:
    """Standard 4-parameter logistic Hill curve for single-agent dose-response."""
    if conc <= 0:
        return 0.0
    return float(max_effect * (conc ** hill_coef) / ((ic50 ** hill_coef) + (conc ** hill_coef)))


@router.get("/dose-response")
def get_dose_response_landscape(
    drug_a: str = Query("Navitoclax", description="First agent"),
    drug_b: str = Query("AT-406", description="Second agent"),
    cell_line: str = Query("A375", description="Cell line context"),
    method: str = Query("Bliss", description="Synergy reference model: Bliss, ZIP, Loewe, or HSA")
) -> Dict[str, Any]:
    """
    Returns dose-response matrix, single-agent fitted curve points,
    and 3D synergy surface matrix for interactive Plotly rendering.
    """
    # Standard 8x8 checkerboard concentrations (nM or uM)
    concs_a = [0.0, 1.5, 3.1, 6.2, 12.5, 25.0, 50.0, 100.0]
    concs_b = [0.0, 15.6, 31.2, 62.5, 125.0, 250.0, 500.0, 1000.0]

    # Generate single-agent curves (fine grid for smooth plotting)
    smooth_concs_a = np.logspace(0, 2.2, 50).tolist()
    smooth_curve_a = [round(hill_equation(c, ic50=18.0, hill_coef=1.35), 2) for c in smooth_concs_a]
    scatter_pts_a = [{"conc": c, "inhibition": round(hill_equation(c, ic50=18.0, hill_coef=1.35) + (np.random.normal(0, 2) if c > 0 else 0), 2)} for c in concs_a]

    # Deterministic seed based on drug pair names for stable reproducible visualizations
    pair_seed = abs(hash(f"{drug_a}_{drug_b}_{cell_line}")) % 10000
    rng = np.random.RandomState(pair_seed)

    # Base synergy bias: known pairs get positive synergy
    is_synergistic = any(k in drug_a.lower() or k in drug_b.lower() for k in ["dabrafenib", "trametinib", "navitoclax", "at-406", "5-fu", "cisplatin", "olaparib"])
    synergy_multiplier = 1.4 if is_synergistic else 0.85

    # Generate 8x8 inhibition matrix
    inhibition_matrix = []
    synergy_matrix = []

    for i, ca in enumerate(concs_a):
        inh_row = []
        syn_row = []
        eff_a = hill_equation(ca, ic50=18.0, hill_coef=1.35)

        for j, cb in enumerate(concs_b):
            eff_b = hill_equation(cb, ic50=120.0, hill_coef=1.2)

            if ca == 0 and cb == 0:
                comb_inh = 0.0
                syn_score = 0.0
            elif ca == 0:
                comb_inh = eff_b
                syn_score = 0.0
            elif cb == 0:
                comb_inh = eff_a
                syn_score = 0.0
            else:
                # Bliss expected effect: Ea + Eb - (Ea * Eb / 100)
                bliss_expected = eff_a + eff_b - (eff_a * eff_b / 100.0)
                # Synergistic boost depending on concentration zone (peaks in mid-high concs)
                conc_factor = np.sin((i / 7.0) * np.pi) * np.sin((j / 7.0) * np.pi)
                noise = rng.normal(0, 1.2)

                if is_synergistic:
                    syn_score = float((14.0 * conc_factor * synergy_multiplier) + noise)
                else:
                    syn_score = float((-8.0 * conc_factor) + noise)

                # Method adjustments
                if method.upper() == "ZIP":
                    syn_score *= 1.12
                elif method.upper() == "LOEWE":
                    syn_score *= 0.94
                elif method.upper() == "HSA":
                    syn_score = float(comb_inh - max(eff_a, eff_b)) if 'comb_inh' in locals() else syn_score

                comb_inh = min(100.0, max(0.0, bliss_expected + syn_score))

            inh_row.append(round(comb_inh, 2))
            syn_row.append(round(syn_score, 2))

        inhibition_matrix.append(inh_row)
        synergy_matrix.append(syn_row)

    # Compute overall mean summary synergy score
    non_zero_syn = [s for row in synergy_matrix[1:] for s in row[1:]]
    mean_synergy = float(np.mean(non_zero_syn)) if non_zero_syn else 0.0

    return {
        "drug_a": drug_a,
        "drug_b": drug_b,
        "cell_line": cell_line,
        "method": method,
        "concs_a": concs_a,
        "concs_b": concs_b,
        "unit_a": "nM",
        "unit_b": "nM",
        "mean_synergy_score": round(mean_synergy, 3),
        "synergy_class": "synergistic" if mean_synergy > 5 else ("antagonistic" if mean_synergy < -5 else "additive"),
        # Single-agent Curve Data
        "single_agent_curve_a": {
            "smooth_concs": smooth_concs_a,
            "smooth_inhibition": smooth_curve_a,
            "scatter_points": scatter_pts_a,
        },
        # 2D Matrices
        "inhibition_matrix": inhibition_matrix,
        "synergy_matrix": synergy_matrix,
    }
