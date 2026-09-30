#!/bin/bash
# This script creates the [...nextauth] directory with the correct bracket syntax
# Run once after cloning the project: bash scripts/setup-auth-route.sh

set -e

ROUTE_DIR="src/app/api/auth/[...nextauth]"

mkdir -p "$ROUTE_DIR"

cat > "$ROUTE_DIR/route.ts" << 'EOF'
import { handlers } from "@/lib/auth";

// Auth.js (NextAuth v5) route handler
// Handles: GET /api/auth/* and POST /api/auth/*
export const { GET, POST } = handlers;

export const runtime = "nodejs";
EOF

echo "✅ Created: $ROUTE_DIR/route.ts"
echo ""
echo "Auth route is ready. The following routes will be handled:"
echo "  GET  /api/auth/signin"
echo "  GET  /api/auth/signout"
echo "  GET  /api/auth/session"
echo "  GET  /api/auth/providers"
echo "  POST /api/auth/signin/:provider"
echo "  POST /api/auth/callback/:provider"
