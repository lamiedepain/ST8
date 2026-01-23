#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuration centralisée pour l'application ST8 Planning
"""

import os
from pathlib import Path

# ==============================================================================
# CONFIGURATION SHAREPOINT
# ==============================================================================

# URL SharePoint du fichier Excel
SHAREPOINT_SITE_URL = "https://bdx.sharepoint.com/sites/PT-BORDEAUX-MET-DGT"
SHAREPOINT_FILE_URL = "https://bdx.sharepoint.com/sites/PT-BORDEAUX-MET-DGT/Documents%20partages/DGEP/HBC/6-ST8/06_RESSOURCES%20HUMAINES/CONGES/PLANNING%20CONGES%20CENTRE%20VOIRE%20ESPACE%20VERTS/2026_PLANNING_CENTRE_ST8.xlsm"
SHAREPOINT_FILE_PATH = "/sites/PT-BORDEAUX-MET-DGT/Documents partages/DGEP/HBC/6-ST8/06_RESSOURCES HUMAINES/CONGES/PLANNING CONGES CENTRE VOIRE ESPACE VERTS/2026_PLANNING_CENTRE_ST8.xlsm"
SHAREPOINT_SITE_NAME = "PT-BORDEAUX-MET-DGT"
SHAREPOINT_DRIVE_PATH = "Documents partages/DGEP/HBC/6-ST8/06_RESSOURCES HUMAINES/CONGES/PLANNING CONGES CENTRE VOIRE ESPACE VERTS"
SHAREPOINT_FILE_NAME = "2026_PLANNING_CENTRE_ST8.xlsm"

# Credentials SharePoint (depuis variables d'environnement)
SHAREPOINT_USERNAME = os.getenv('SHAREPOINT_USERNAME', '')
SHAREPOINT_PASSWORD = os.getenv('SHAREPOINT_PASSWORD', '')
SHAREPOINT_TENANT_ID = os.getenv('SHAREPOINT_TENANT_ID', 'b3dd23de-593f-4d74-bcf9-f035c1a2eb24')
SHAREPOINT_CLIENT_ID = os.getenv('SHAREPOINT_CLIENT_ID', '')
SHAREPOINT_CLIENT_SECRET = os.getenv('SHAREPOINT_CLIENT_SECRET', '')

# Synchronisation automatique - DÉSACTIVÉ (mode local uniquement)
AUTO_SYNC_ENABLED = False  # SharePoint désactivé - Travail en local uniquement
SYNC_INTERVAL_MINUTES = 0  # Synchronisation désactivée

# ==============================================================================
# CONFIGURATION FICHIERS LOCAUX
# ==============================================================================

# Nom du fichier Excel local (cache)
EXCEL_FILE = '2026_PLANNING_CENTRE_ST8.xlsm'
LOCAL_EXCEL_PATH = Path(__file__).parent / EXCEL_FILE

# Dossier de sauvegarde
BACKUP_DIR = Path(__file__).parent / 'backups'
MAX_BACKUPS = 50  # Nombre maximum de backups à conserver

# ==============================================================================
# CONFIGURATION EXCEL - STRUCTURE
# ==============================================================================

# Feuille de configuration des agents
AGENTS_CONFIG_SHEET = 'config'

# Structure des feuilles de planning
PLANNING_AGENTS_START_ROW = 11  # Première ligne d'agent (après en-tête)
PLANNING_DAYS_START_COL = 4      # Colonne D = jour 1 (1=A, 2=B, 3=C, 4=D)

# Colonnes dans la feuille 'config'
AGENT_COL_MATRICULE = 1              # Colonne A
AGENT_COL_NOM = 2                    # Colonne B
AGENT_COL_PRENOM = 3                 # Colonne C
AGENT_COL_ANNIVERSAIRE = 4           # Colonne D
AGENT_COL_DERNIERES_VISITES = 5      # Colonne E - Dernières visites médicale
AGENT_COL_PROCHAINES_VISITES = 6     # Colonne F - Prochaines visites médicale
AGENT_COL_CACES_R482_A_1 = 7         # Colonne G - R.482 A (1)
AGENT_COL_CACES_R482_B1_2 = 8        # Colonne H - R.482 B1 (2)
AGENT_COL_CACES_R482_C2_3 = 9        # Colonne I - R.482 C2 (3)
AGENT_COL_CACES_R482_C1_4 = 10       # Colonne J - R.482 C1 (4)
AGENT_COL_CACES_R482_5 = 11          # Colonne K - R.482 5
AGENT_COL_CACES_R482_D_7 = 12        # Colonne L - R.482 D (7)
AGENT_COL_CACES_R482_E_8 = 13        # Colonne M - R.482 E (8)
AGENT_COL_CACES_R482_F_9 = 14        # Colonne N - R.482 F (9)
AGENT_COL_CACES_R482_G_10 = 15       # Colonne O - R.482 G (10)
AGENT_COL_TONDEUSE = 16              # Colonne P - Tondeuse
AGENT_COL_GRUE_R490 = 17             # Colonne Q - Grue R.490
AGENT_COL_B_NACELLE = 18             # Colonne R - B (Nacelle)
AGENT_COL_CHARIOT_R489_3 = 19        # Colonne S - Chariot R.489 / 3
AGENT_COL_TRONCO = 20                # Colonne T - Tronço
AGENT_COL_PERMIS_BE = 21             # Colonne U - Permis BE - REMORQUE
AGENT_COL_PERMIS_PL = 22             # Colonne V - Permis PL
AGENT_COL_PERMIS_CE = 23             # Colonne W - Permis CE Sup Lourd
AGENT_COL_FIMO = 24                  # Colonne X - FIMO
AGENT_COL_AIPR = 25                  # Colonne Y - AIPR
AGENT_COL_PREMIERS_SECOURS = 26      # Colonne Z - Premiers secours

# Noms des colonnes de certifications/qualifications (pour affichage)
CERTIFICATION_COLUMNS = {
    'R.482 A (1)': AGENT_COL_CACES_R482_A_1,
    'R.482 B1 (2)': AGENT_COL_CACES_R482_B1_2,
    'R.482 C2 (3)': AGENT_COL_CACES_R482_C2_3,
    'R.482 C1 (4)': AGENT_COL_CACES_R482_C1_4,
    'R.482 5': AGENT_COL_CACES_R482_5,
    'R.482 D (7)': AGENT_COL_CACES_R482_D_7,
    'R.482 E (8)': AGENT_COL_CACES_R482_E_8,
    'R.482 F (9)': AGENT_COL_CACES_R482_F_9,
    'R.482 G (10)': AGENT_COL_CACES_R482_G_10,
    'Tondeuse': AGENT_COL_TONDEUSE,
    'Grue R.490': AGENT_COL_GRUE_R490,
    'B (Nacelle)': AGENT_COL_B_NACELLE,
    'Chariot R.489 / 3': AGENT_COL_CHARIOT_R489_3,
    'Tronço': AGENT_COL_TRONCO,
    'Permis BE': AGENT_COL_PERMIS_BE,
    'Permis PL': AGENT_COL_PERMIS_PL,
    'Permis CE': AGENT_COL_PERMIS_CE,
    'FIMO': AGENT_COL_FIMO,
    'AIPR': AGENT_COL_AIPR,
    'Premiers secours': AGENT_COL_PREMIERS_SECOURS
}

# ==============================================================================
# CODES DE STATUT PRÉSENCE/ABSENCE
# ==============================================================================

# Statuts d'absence (13 statuts + vide/P = présent)
ABSENT_STATUSES = {
    'PC',   # Prev Congés
    'F',    # Formation
    'AST',  # Statutf
    'CA',   # Congés Annuel
    'RTT',  # RTT
    'CEX',  # Congés Exc
    'RES',  # Réserve
    'MA',   # Maladie
    'AT',   # Accident de Travail
    'TAD',  # Travail à Distance
    'TP'    # TP pareil IH
}

PRESENT_STATUSES = {'P', '', None}  # Codes indiquant la présence (P ou vide)

# Couleurs des statuts (correspondant exactement à l'Excel)
STATUS_COLORS = {
    'P': '#00B050',      # Vert foncé - PRESENCE
    'AH': '#92D050',     # Vert clair - AH
    'PC': '#C6E0B4',     # Vert très clair - PREV CONGES
    'F': '#FF00FF',      # Magenta - FORMATION
    'AST': '#7030A0',    # Violet - STATUTF
    'CA': '#FFC000',     # Orange - CONGES ANNUEL
    'RTT': '#FFFF00',    # Jaune - RTT
    'CEX': '#00B0F0',    # Cyan clair - CONGES EXC
    'RES': '#0070C0',    # Bleu - RESERVE
    'MA': '#FF0000',     # Rouge - MALADIE
    'AT': '#C65911',     # Orange foncé - ACCIDENT DE TRAVAIL
    'TAD': '#00B0F0',    # Cyan - TRAVAIL A DISTANCE
    'TP': '#D6B08C'      # Beige/Marron - TP pareil IH
}

# Libellés des statuts
STATUS_LABELS = {
    'P': 'Présence',
    'AH': 'AH',
    'PC': 'Prev Congés',
    'F': 'Formation',
    'AST': 'Statutf',
    'CA': 'Congés Annuel',
    'RTT': 'RTT',
    'CEX': 'Congés Exc',
    'RES': 'Réserve',
    'MA': 'Maladie',
    'AT': 'Accident de Travail',
    'TAD': 'Travail à Distance',
    'TP': 'TP pareil IH'
}

# ==============================================================================
# COULEURS DES ÉQUIPES
# ==============================================================================

TEAM_COLORS = {
    'Responsable du service territorial 8': '#FF0000',             # Rouge vif
    'Assistant.e comptable': '#FFC0CB',                            # Rose clair
    'Responsable du centre voirie espaces verts': '#92D050',       # Vert moyen
    'Chargé.e de la végétalisation': '#92D050',                    # Vert moyen
    "Responsable de l’unité maintenance": '#548235',              # Vert foncé
    'Surveillant.es de travaux': '#548235',                        # Vert foncé
    "Agent.es de surveillance de l’espace public": '#548235',     # Vert foncé
    "Responsable de l’unité régie": '#E2EFDA',                    # Vert très clair
    "Responsable d’équipe voirie": '#E2EFDA',                     # Vert très clair
    "Responsable d’équipe espaces verts": '#E2EFDA',              # Vert très clair
    'Responsable du centre propreté': '#FFFF00',                   # Jaune
    'Assistant.e administratif.ive': '#FFFF00',                    # Jaune
    "Responsables d’équipe propreté quartier 1": '#FFFF00',       # Jaune
    "Responsables d’équipe propreté quartier 7": '#FFFF00',       # Jaune
    'Agent.es de voirie': '#00B0F0',                               # Bleu cyan vif
    'Jardinier.ères': '#00FF00',                                   # Vert vif
    'Magasinier.ère': '#D9D9D9',                                   # Gris clair
    "Agent.es d’entretien": '#C9A3D1',                            # Violet
}

# ==============================================================================
# GROUPES D'AGENTS (Extraits du fichier Excel)
# ==============================================================================

# Équipes pour génération (seulement Voirie et Espaces Verts)
GROUPS_FOR_TEAMS = {
    'voirie': [
        'BERRIO-GAUDNER', 'FONTENEAU', 'GUIJARRO', 'GOUREAU', 'LABORIE',
        'LARRIEU', 'LEVIGNAT', 'MARTIN-HERNANDEZ', 'PIERRE', 'WEISS'
    ],
    'espaces_verts': [
        'DELANDE', 'DA SILVA REIS', 'ELMAGROUD', 'ESTEVE', 'KADRI',
        'MALLET', 'MAURY', 'MOINGT', 'REY', 'TADJROUNA', 'VILLENEUVE'
    ]
}

# Tous les groupes pour les disponibilités
GROUPS = {
    'voirie': [
        'BERRIO-GAUDNER', 'FONTENEAU', 'GUIJARRO', 'GOUREAU', 'LABORIE',
        'LARRIEU', 'LEVIGNAT', 'MARTIN-HERNANDEZ', 'PIERRE', 'WEISS'
    ],
    'espaces_verts': [
        'DELANDE', 'DA SILVA REIS', 'ELMAGROUD', 'ESTEVE', 'KADRI',
        'MALLET', 'MAURY', 'MOINGT', 'REY', 'TADJROUNA', 'VILLENEUVE'
    ],
    'responsables': [
        'DEBREYNE', 'LUTARD', 'HAUTDECOEUR', 'VRBOVSKA', 'GRENET',
        'FOURCADE', 'GONCALVES', 'SIGALA', 'TUCOULET', 'GOURVIAT', 'LARTIGUE'
    ],
    'surveillance': [
        'BOURGOIN', 'MERCADIEU', 'GARCIA', 'LARROUDE', 'SAMITIER', 'PIEL'
    ],
    'proprete': [
        'TRIQUENEAUX', 'ESPERON', 'ROUGLAN', 'NOURRI'
    ],
    'autres': [
        'VOL', 'GENNA', 'BERNARD', 'HAUBRAICHE'
    ]
}

# ==============================================================================
# NOMS DE MOIS EN FRANÇAIS
# ==============================================================================

MONTH_NAMES_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

# ==============================================================================
# CONFIGURATION FLASK
# ==============================================================================

FLASK_HOST = '0.0.0.0'
FLASK_PORT = 5001
FLASK_DEBUG = True

# Secret key pour les sessions (générer une clé unique en production)
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# ==============================================================================
# FONCTIONS UTILITAIRES
# ==============================================================================

def get_month_sheet_name(year, month):
    """
    Génère le nom de la feuille Excel pour un mois donné
    
    Args:
        year: Année (ex: 2026)
        month: Mois (1-12)
    
    Returns:
        str: Nom de la feuille (ex: "Janvier 2026")
    """
    if not 1 <= month <= 12:
        raise ValueError(f"Mois invalide: {month}")
    return f"{MONTH_NAMES_FR[month - 1]} {year}"

def get_all_agents():
    """Retourne la liste de tous les agents de tous les groupes"""
    all_agents = set()
    for group_agents in GROUPS.values():
        all_agents.update(group_agents)
    return sorted(all_agents)

# ==============================================================================
# VALIDATION
# ==============================================================================

def validate_config():
    """Valide la configuration et affiche les avertissements"""
    warnings = []
    
    # Vérification SharePoint
    if AUTO_SYNC_ENABLED and not SHAREPOINT_USERNAME:
        warnings.append("⚠️  SHAREPOINT_USERNAME non défini (sync désactivée)")
    
    if AUTO_SYNC_ENABLED and not SHAREPOINT_PASSWORD and not SHAREPOINT_CLIENT_SECRET:
        warnings.append("⚠️  Credentials SharePoint manquants (sync désactivée)")
    
    # Vérification fichier local
    if not LOCAL_EXCEL_PATH.exists():
        warnings.append(f"⚠️  Fichier Excel local introuvable: {LOCAL_EXCEL_PATH}")
    
    # Vérification dossier backup
    if not BACKUP_DIR.exists():
        warnings.append(f"⚠️  Dossier backups/ inexistant (sera créé)")
    
    return warnings

if __name__ == "__main__":
    print("Configuration ST8 Planning")
    print("=" * 60)
    print(f"Fichier Excel: {EXCEL_FILE}")
    print(f"SharePoint: {SHAREPOINT_SITE_URL}")
    print(f"Auto-sync: {AUTO_SYNC_ENABLED}")
    print(f"Groupes: {len(GROUPS)}")
    print(f"Agents total: {len(get_all_agents())}")
    print()
    
    warnings = validate_config()
    if warnings:
        print("Avertissements:")
        for w in warnings:
            print(f"  {w}")
    else:
        print("✅ Configuration valide")
