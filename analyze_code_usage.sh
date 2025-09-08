#!/bin/bash

# Script d'analyse de l'utilisation du code
# Usage: ./analyze_code_usage.sh [fichier]

FILE_PATH="${1:-src/hooks/useAccessibility.tsx}"
BASE_NAME=$(basename "$FILE_PATH" .tsx)

echo "=== ANALYSE D'UTILISATION DU CODE ==="
echo "Fichier analysé: $FILE_PATH"
echo "======================================"

# 1. Vérifier si le fichier existe
if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Fichier $FILE_PATH non trouvé"
    exit 1
fi

# 2. Analyser les exports
echo -e "\n📋 EXPORTS DU FICHIER:"
grep '^export' "$FILE_PATH" | sed 's/export //' | sed 's/(.*$//' | sed 's/=.*$//' | sed 's/ //g'

# 3. Analyser les utilisations
echo -e "\n🔍 ANALYSE DES UTILISATIONS:"
echo "Recherche dans src/ (hors fichier lui-même)..."

# Liste des exports à vérifier
EXPORTS=$(grep '^export' "$FILE_PATH" | sed 's/export function //' | sed 's/export const //' | sed 's/(.*$//' | sed 's/=.*$//' | sed 's/ //g' | sed 's/;//g')

TOTAL_USAGE=0
UNUSED_COUNT=0

for export in $EXPORTS; do
    # Compter les utilisations
    USAGE_COUNT=$(grep -r "$export" src/ --include='*.tsx' --include='*.ts' | grep -v "$FILE_PATH" | wc -l)
    
    if [ "$USAGE_COUNT" -eq 0 ]; then
        echo "❌ $export: NON UTILISÉ"
        ((UNUSED_COUNT++))
    else
        echo "✅ $export: $USAGE_COUNT utilisations"
    fi
    
    ((TOTAL_USAGE += USAGE_COUNT))
done

# 4. Statistiques
echo -e "\n📊 STATISTIQUES:"
echo "Total des exports: $(echo "$EXPORTS" | wc -w)"
echo "Total des utilisations: $TOTAL_USAGE"
echo "Exports non utilisés: $UNUSED_COUNT"

# 5. Analyser les imports du fichier
echo -e "\n📦 IMPORTS DU FICHIER:"
grep '^import\|^from' "$FILE_PATH"

# 6. Rechercher des patterns suspects
echo -e "\n⚠️  PATTERNS SUSPECTS:"

# Code dupliqué potentiel
echo "Code dupliqué potentiel (mêmes patterns):"
grep -r 'useEffect\|useCallback\|useRef\|useState' "$FILE_PATH" | sort | uniq -c | sort -nr | head -5

# Fonctions très similaires
echo -e "\nFonctions avec noms similaires:"
grep '^export function' "$FILE_PATH" | sed 's/export function //' | sed 's/(.*$//' | sort

# 7. Métriques de qualité
echo -e "\n📏 MÉTRIQUES:"
echo "Lignes totales: $(wc -l < "$FILE_PATH")"
echo "Lignes de code (sans commentaires/vides): $(grep -v '^//' "$FILE_PATH" | grep -v '^$' | wc -l)"
echo "Nombre de fonctions: $(grep -c '^export function' "$FILE_PATH")"
echo "Nombre de commentaires: $(grep -c '^//' "$FILE_PATH")"

# 8. Recommandations
echo -e "\n💡 RECOMMANDATIONS:"
if [ "$UNUSED_COUNT" -gt 0 ]; then
    echo "❌ Supprimer les $UNUSED_COUNT exports non utilisés"
fi

if [ "$TOTAL_USAGE" -lt 5 ]; then
    echo "⚠️  Peu d'utilisations détectées - vérifier si le fichier est nécessaire"
fi

COMPLEXITY=$(grep -c 'if\|for\|while\|switch' "$FILE_PATH")
if [ "$COMPLEXITY" -gt 20 ]; then
    echo "⚠️  Haute complexité ($COMPLEXITY structures conditionnelles) - envisager la refactorisation"
fi

echo -e "\n✅ Analyse terminée"
