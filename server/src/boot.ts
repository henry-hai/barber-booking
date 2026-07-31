/*
 * Process entry point. Start the server with: node dist/boot.js
 *
 * This exists so credentials are on disk before anything reads them.
 * ServerInfo.ts does a readFileSync of serverInfo.json at module load, and
 * main.ts imports it at the top, so by the time any statement inside main.ts
 * runs the file has already had to exist. An import cannot be sequenced after
 * a function call in the same module, so the call lives here instead and
 * main.ts is pulled in afterwards by require.
 *
 * On a machine with real credential files this does nothing at all.
 */

import { materializeCredentials } from "./Credentials";

materializeCredentials();

/* Deliberately require rather than import: this has to happen after the call
   above, and imports are hoisted above it. */
require("./main");
