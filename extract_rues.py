#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour extraire toutes les rues du fichier CSV et créer un JSON
"""

import csv
import json
from pathlib import Path

def extract_rues():
    """Extrait toutes les rues uniques du fichier CSV"""
    rues = set()
    
    csv_path = Path(__file__).parent / 'quartiers' / 'nom_rues.csv'
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        
        # Sauter les 2 premières lignes (en-têtes)
        next(reader)
        next(reader)
        
        for row in reader:
            for cell in row:
                cell = cell.strip()
                # Ignorer les cellules vides et les en-têtes de colonnes
                if cell and not cell.startswith('Bastide') and not cell.startswith('Bx-Maritime'):
                    rues.add(cell)
    
    # Trier les rues par ordre alphabétique
    rues_list = sorted(list(rues))
    
    # Sauvegarder en JSON
    json_path = Path(__file__).parent / 'rues_st8.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(rues_list, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {len(rues_list)} rues extraites et sauvegardées dans rues_st8.json")
    return rues_list

if __name__ == '__main__':
    rues = extract_rues()
    print(f"\nExemples de rues:")
    for rue in rues[:10]:
        print(f"  - {rue}")
