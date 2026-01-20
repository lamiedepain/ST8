#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Structure des agents et équipes ST8
Données extraites du fichier Excel de configuration
"""

from config import TEAM_COLORS

# ==============================================================================
# LISTE DES AGENTS AVEC LEURS ÉQUIPES
# ==============================================================================

AGENTS = [
    # Responsables
    {'nom': 'DEBREYNE', 'prenom': 'Sandrine', 'equipe': 'Responsable du service territorial 8'},
    {'nom': 'LUTARD', 'prenom': 'Sophie', 'equipe': "Assistant.e comptable"},
    {'nom': 'HAUTDECOEUR', 'prenom': 'Thierry', 'equipe': 'Responsable du centre voirie espaces verts'},
    {'nom': 'VRBOVSKA', 'prenom': 'Lenka', 'equipe': 'Chargé.e de la végétalisation'},
    {'nom': 'GRENET', 'prenom': 'Lionel', 'equipe': "Responsable de l'unité maintenance"},
    {'nom': 'FOURCADE', 'prenom': 'Christophe', 'equipe': 'Surveillant.es de travaux'},
    {'nom': 'GONCALVES', 'prenom': 'Sandra', 'equipe': "Assistant.e administratif.ive"},
    {'nom': 'SIGALA', 'prenom': 'Armelle', 'equipe': "Responsable de l'unité régie"},
    {'nom': 'TUCOULET', 'prenom': 'Laurent', 'equipe': "Responsable d'équipe voirie"},
    {'nom': 'GOURVIAT', 'prenom': 'Christophe', 'equipe': "Responsable d'équipe espaces verts"},
    {'nom': 'LARTIGUE', 'prenom': 'Franck', 'equipe': 'Responsable du centre propreté'},
    
    # Agents de surveillance
    {'nom': 'BOURGOIN', 'prenom': 'Yvan', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'MERCADIEU', 'prenom': 'Jean-Claude', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'GARCIA', 'prenom': 'Emmanuel', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'LARROUDE', 'prenom': 'Michel', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'SAMITIER', 'prenom': 'Alain', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'PIEL', 'prenom': 'Patrice', 'equipe': "Agent.es de surveillance de l'espace public"},
    
    # Agents de voirie
    {'nom': 'BERRIO-GAUDNER', 'prenom': 'Anthony', 'equipe': 'Agent.es de voirie'},
    {'nom': 'FONTENEAU', 'prenom': 'Nicolas', 'equipe': 'Agent.es de voirie'},
    {'nom': 'GUIJARRO', 'prenom': 'Christophe', 'equipe': 'Agent.es de voirie'},
    {'nom': 'GOUREAU', 'prenom': 'Franck', 'equipe': 'Agent.es de voirie'},
    {'nom': 'LABORIE', 'prenom': 'Hervé', 'equipe': 'Agent.es de voirie'},
    {'nom': 'LARRIEU', 'prenom': 'Michaël', 'equipe': 'Agent.es de voirie'},
    {'nom': 'LEVIGNAT', 'prenom': 'Jean-Louis', 'equipe': 'Agent.es de voirie'},
    {'nom': 'MARTIN-HERNANDEZ', 'prenom': 'David', 'equipe': 'Agent.es de voirie'},
    {'nom': 'PIERRE', 'prenom': 'Jean-François', 'equipe': 'Agent.es de voirie'},
    {'nom': 'WEISS', 'prenom': 'Christophe', 'equipe': 'Agent.es de voirie'},
    
    # Jardiniers
    {'nom': 'DELANDE', 'prenom': 'Stéphane', 'equipe': 'Jardinier.ères'},
    {'nom': 'DA SILVA REIS', 'prenom': 'Joao', 'equipe': 'Jardinier.ères'},
    {'nom': 'ELMAGROUD', 'prenom': 'Saïd', 'equipe': 'Jardinier.ères'},
    {'nom': 'ESTEVE', 'prenom': 'Ludovic', 'equipe': 'Jardinier.ères'},
    {'nom': 'KADRI', 'prenom': 'Kamel', 'equipe': 'Jardinier.ères'},
    {'nom': 'MALLET', 'prenom': 'Julien', 'equipe': 'Jardinier.ères'},
    {'nom': 'MAURY', 'prenom': 'Stéphane', 'equipe': 'Jardinier.ères'},
    {'nom': 'MOINGT', 'prenom': 'Philippe', 'equipe': 'Jardinier.ères'},
    {'nom': 'REY', 'prenom': 'Christophe', 'equipe': 'Jardinier.ères'},
    {'nom': 'TADJROUNA', 'prenom': 'Farid', 'equipe': 'Jardinier.ères'},
    {'nom': 'VILLENEUVE', 'prenom': 'Anthony', 'equipe': 'Jardinier.ères'},
    
    # Propreté
    {'nom': 'TRIQUENEAUX', 'prenom': 'David', 'equipe': "Responsables d'équipe propreté quartier 1"},
    {'nom': 'ESPERON', 'prenom': 'Philippe', 'equipe': "Responsables d'équipe propreté quartier 7"},
    {'nom': 'ROUGLAN', 'prenom': 'Sylvie', 'equipe': "Agent.es d'entretien"},
    {'nom': 'NOURRI', 'prenom': 'Fatima', 'equipe': "Agent.es d'entretien"},
    
    # Autres
    {'nom': 'VOL', 'prenom': 'Olivier', 'equipe': 'Surveillant.es de travaux'},
    {'nom': 'GENNA', 'prenom': 'Patrick', 'equipe': 'Magasinier.ère'},
    {'nom': 'BERNARD', 'prenom': 'Alain', 'equipe': 'Agent.es de voirie'},
    {'nom': 'HAUBRAICHE', 'prenom': 'Mounir', 'equipe': 'Jardinier.ères'},
]

# ==============================================================================
# FONCTIONS UTILITAIRES
# ==============================================================================

def get_agent_equipe(nom):
    """
    Retourne l'équipe d'un agent
    
    Args:
        nom: Nom de l'agent
    
    Returns:
        str: Nom de l'équipe ou chaîne vide si non trouvé
    """
    for agent in AGENTS:
        if agent['nom'] == nom:
            return agent.get('equipe', '')
    return ''

def get_agent_equipe_color(nom):
    """
    Retourne la couleur de l'équipe d'un agent
    
    Args:
        nom: Nom de l'agent
    
    Returns:
        str: Code couleur hexadécimal ou gris par défaut
    """
    equipe = get_agent_equipe(nom)
    return TEAM_COLORS.get(equipe, '#E0E0E0')

def get_agents_by_equipe(equipe):
    """
    Retourne tous les agents d'une équipe
    
    Args:
        equipe: Nom de l'équipe
    
    Returns:
        list: Liste des agents de l'équipe
    """
    return [agent for agent in AGENTS if agent.get('equipe') == equipe]

def get_all_equipes():
    """
    Retourne la liste unique de toutes les équipes
    
    Returns:
        list: Liste des noms d'équipes (triée)
    """
    equipes = set()
    for agent in AGENTS:
        if agent.get('equipe'):
            equipes.add(agent['equipe'])
    return sorted(equipes)

# ==============================================================================
# VALIDATION
# ==============================================================================

if __name__ == "__main__":
    print("Structure des agents ST8")
    print("=" * 60)
    print(f"Total agents: {len(AGENTS)}")
    print(f"Total équipes: {len(get_all_equipes())}")
    print()
    
    print("Équipes:")
    for equipe in get_all_equipes():
        agents_equipe = get_agents_by_equipe(equipe)
        color = TEAM_COLORS.get(equipe, '#E0E0E0')
        print(f"  {equipe}: {len(agents_equipe)} agents (couleur: {color})")
