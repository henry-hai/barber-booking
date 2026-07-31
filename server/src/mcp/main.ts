/*
 * Entry point for the booking MCP server: node dist/mcp/main.js
 *
 * Same shape as boot.ts, and for the same reason. ServerInfo reads
 * serverInfo.json when its module is loaded, so the credentials have to be on
 * disk before that import runs, and a call cannot be sequenced ahead of an
 * import in one module. Hence the require below.
 */

import { materializeCredentials } from "../Credentials";

materializeCredentials();

/* Loaded after the call above, so require rather than import. */
const { serverInfo } = require("../ServerInfo");
const { runStdioServer } = require("./server");

runStdioServer(serverInfo).catch((inError: unknown) => {
  /* stderr, never stdout: stdout carries the protocol. */
  console.error("Booking MCP server failed to start:", inError);
  process.exit(1);
});
