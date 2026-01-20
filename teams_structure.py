#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Structure des agents et équipes ST8
Données extraites du fichier Excel de planning
"""

from config import TEAM_COLORS

# ==============================================================================
# LISTE DES AGENTS AVEC LEURS ÉQUIPES (DONNÉES RÉELLES)
# ==============================================================================

AGENTS = [
    {'nom': 'DEBREYNE', 'prenom': 'Audrey', 'equipe': 'Responsable du service territorial 8'},
    {'nom': 'LUTARD', 'prenom': 'Karyne', 'equipe': 'Assistant.e comptable'},
    {'nom': 'HAUTDECOEUR', 'prenom': 'Laurence', 'equipe': 'Responsable du centre voirie espaces verts'},
    {'nom': 'VRBOVSKA', 'prenom': 'Xavier', 'equipe': 'Chargé.e de la végétalisation'},
    {'nom': 'GRENET', 'prenom': 'Eric', 'equipe': "Responsable de l'unité maintenance"},
    {'nom': 'BOURGOIN', 'prenom': 'Jean-Baptiste', 'equipe': 'Surveillant.es de travaux'},
    {'nom': 'MERCADIEU', 'prenom': 'Baptiste', 'equipe': 'Surveillant.es de travaux'},
    {'nom': 'GARCIA', 'prenom': 'Yoan', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'LARROUDE', 'prenom': 'Christophe', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'SAMITIER', 'prenom': 'Beatrice', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'PIEL', 'prenom': 'Frédy', 'equipe': "Agent.es de surveillance de l'espace public"},
    {'nom': 'FOURCADE', 'prenom': 'Hervé', 'equipe': "Responsable de l'unité régie"},
    {'nom': 'GONCALVES', 'prenom': 'Lionel', 'equipe': "Responsable d'équipe voirie"},
    {'nom': 'SIGALA', 'prenom': 'Jean-Christohpe', 'equipe': "Responsable d'équipe voirie"},
    {'nom': 'TUCOULET', 'prenom': 'Dorian', 'equipe': "Responsable d'équipe espaces verts"},
    {'nom': 'GOURVIAT', 'prenom': 'Annabelle', 'equipe': 'Responsable du centre propreté'},
    {'nom': 'LARTIGUE', 'prenom': 'Laura', 'equipe': 'Assistant.e administratif.ive'},
    {'nom': 'TRIQUENEAUX', 'prenom': 'Benoit', 'equipe': "Responsables d'équipe propreté quartier 1"},
    {'nom': 'ESPERON', 'prenom': 'Alain', 'equipe': "Responsables d'équipe propreté quartier 1"},
    {'nom': 'ROUGLAN', 'prenom': 'William', 'equipe': "Responsables d'équipe propreté quartier 7"},
    {'nom': 'NOURRI', 'prenom': 'Danny', 'equipe': "Responsables d'équipe propreté quartier 7"},
    {'nom': 'BERRIO-GAUDNER', 'prenom': 'Jacques', 'equipe': 'Agent.es de voirie'},
    {'nom': 'FONTENEAU', 'prenom': 'Fabrice', 'equipe': 'Agent.es de voirie'},
    {'nom': 'GUIJARRO', 'prenom': 'Juan-Pédro', 'equipe': 'Agent.es de voirie'},
    {'nom': 'GOUREAU', 'prenom': 'Jonathan', 'equipe': 'Agent.es de voirie'},
    {'nom': 'LABORIE', 'prenom': 'Jean-Louis', 'equipe': 'Agent.es de voirie'},
    {'nom': 'LARRIEU', 'prenom': 'Cédric', 'equipe': 'Agent.es de voirie'},
    {'nom': 'LEVIGNAT', 'prenom': 'Didier', 'equipe': 'Agent.es de voirie'},
    {'nom': 'MARTIN-HERNANDEZ', 'prenom': 'Pierre', 'equipe': 'Agent.es de voirie'},
    {'nom': 'PIERRE', 'prenom': 'Frantzy', 'equipe': 'Agent.es de voirie'},
    {'nom': 'WEISS', 'prenom': 'Miguel', 'equipe': 'Agent.es de voirie'},
    {'nom': 'DELANDE', 'prenom': 'Romain', 'equipe': 'Jardinier.ères'},
    {'nom': 'DA SILVA REIS', 'prenom': 'Alexandra', 'equipe': 'Jardinier.ères'},
    {'nom': 'ELMAGROUD', 'prenom': 'Sofiane', 'equipe': 'Jardinier.ères'},
    {'nom': 'ESTEVE', 'prenom': 'Thierry', 'equipe': 'Jardinier.ères'},
    {'nom': 'KADRI', 'prenom': 'Houssine', 'equipe': 'Jardinier.ères'},
    {'nom': 'MALLET', 'prenom': 'Ludovic', 'equipe': 'Jardinier.ères'},
    {'nom': 'MAURY', 'prenom': 'Xavier', 'equipe': 'Jardinier.ères'},
    {'nom': 'MOINGT', 'prenom': 'Joffrey', 'equipe': 'Jardinier.ères'},
    {'nom': 'REY', 'prenom': 'Adrien', 'equipe': 'Jardinier.ères'},
    {'nom': 'TADJROUNA', 'prenom': 'Mohamed', 'equipe': 'Jardinier.ères'},
    {'nom': 'VILLENEUVE', 'prenom': 'Fabrice', 'equipe': 'Jardinier.ères'},
    {'nom': 'VOL', 'prenom': 'Christophe', 'equipe': 'Magasinier.ère'},
    {'nom': 'GENNA', 'prenom': 'Grégory', 'equipe': 'Magasinier.ère'},
    {'nom': 'BERNARD', 'prenom': 'Jean-Louis', 'equipe': "Agent.es d'entretien"},
    {'nom': 'HAUBRAICHE', 'prenom': 'Philippe', 'equipe': "Agent.es d'entretien"},
]

# ==============================================================================
# FONCTIONS UTILITAIRES
# ==============================================================================

def get_agent_equipe(nom):
    """Retourne l'équipe d'un agent"""
    for agent in AGENTS:
        if agent['nom'] == nom:
            return agent.get('equipe', '')
    return ''

def get_agent_equipe_color(nom):
    """Retourne la couleur de l'équipe d'un agent"""
    equipe = get_agent_equipe(nom)
    return TEAM_COLORS.get(equipe, '#E0E0E0')

def get_agents_by_equipe(equipe):
    """Retourne tous les agents d'une équipe"""
    return [agent for agent in AGENTS if agent.get('equipe') == equipe]

def get_all_equipes():
    """Retourne la liste unique de toutes les équipes"""
    equipes = set()
    for agent in AGENTS:
        if agent.get('equipe'):
            equipes.add(agent['equipe'])
    return sorted(equipes)
