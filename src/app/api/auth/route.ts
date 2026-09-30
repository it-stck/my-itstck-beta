// This file handles all auth routes via the handlers exported from auth.ts
// The actual file should be at: src/app/api/auth/[...nextauth]/route.ts
// Create that directory manually and add:
//
// import { handlers } from "@/lib/auth";
// export const { GET, POST } = handlers;
//
// The [...nextauth] folder name cannot be created programmatically with brackets
// See the README.md for setup instructions.
export const dynamic = "force-dynamic";
