#!/bin/sh

echo "🔍 Starting API documentation watcher..."

regenerate_docs() {
    echo "🔄 Regenerating API documentation..."
    npx apidoc -i src/app/api -o docs/api
    if [ $? -eq 0 ]; then
        echo "✅ Documentation regenerated at $(date)"
    else
        echo "❌ Failed to regenerate documentation"
    fi
}

regenerate_docs

if command -v inotifywait >/dev/null 2>&1; then
    echo "📁 Watching src/app/api for changes..."
    while inotifywait -r -e modify,create,delete,move src/app/api --exclude '\.git' 2>/dev/null; do
        sleep 1
        regenerate_docs
    done
else
    echo "⚠️  inotifywait not available. Install inotify-tools for auto-regeneration."
    echo "📝 Run 'npm run docs:generate' manually after API changes."
fi
