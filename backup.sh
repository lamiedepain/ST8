#!/bin/bash
# ST8 Backup Management Script
# Usage: ./backup.sh [list|restore|clean]

DATA_DIR="server/data"
DATA_FILE="$DATA_DIR/agents_source.json"

case "$1" in
  list)
    echo "Available backups:"
    ls -lh "$DATA_DIR"/*.bak 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' || echo "No backups found"
    ;;
  
  restore)
    if [ -z "$2" ]; then
      echo "Usage: $0 restore <backup-file>"
      echo "Available backups:"
      ls -1 "$DATA_DIR"/*.bak 2>/dev/null || echo "No backups found"
      exit 1
    fi
    
    if [ ! -f "$2" ]; then
      echo "Error: Backup file not found: $2"
      exit 1
    fi
    
    echo "Restoring from $2..."
    cp "$DATA_FILE" "$DATA_DIR/agents_source.json.before_restore.bak"
    cp "$2" "$DATA_FILE"
    echo "Restore complete. Previous version backed up to agents_source.json.before_restore.bak"
    ;;
  
  clean)
    echo "Cleaning old backups (keeping last 10)..."
    ls -t "$DATA_DIR"/*.bak 2>/dev/null | tail -n +11 | xargs -r rm -v
    echo "Cleanup complete"
    ;;
  
  *)
    echo "ST8 Backup Management"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  list              List all available backups"
    echo "  restore <file>    Restore from a specific backup file"
    echo "  clean             Remove old backups (keep last 10)"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 restore server/data/agents_source.json.1234567890.bak"
    echo "  $0 clean"
    ;;
esac
