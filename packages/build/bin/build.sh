#!/usr/bin/env bash

VERSION="1.0.1"

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "sk-build v${VERSION}"
    echo ""
    echo "Usage: sk-build [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -v, --version    Show version number"
    echo ""
    echo "Shared build script for @znk-sk-tools projects."
    exit 0
fi

if [ "$1" = "--version" ] || [ "$1" = "-v" ]; then
    echo "sk-build v${VERSION}"
    exit 0
fi

echo "👋🏼 sk-build executed successfully ! 🎉"
