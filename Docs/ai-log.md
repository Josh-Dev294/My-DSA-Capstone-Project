# AI log

## Build 1

### Prompt 1: Build 1 prompt (docs/build-1.md)
- **What I asked:** Read `README.md` and `docs/build-1.md`, then build the Event Ticketing domain core in plain JavaScript with no server or database. Create the domain files, `package.json` with `"type": "module"`, the demo script, and the benchmark script, and ensure the code validates inputs, enforces seat capacity and waitlist rules, and uses `node:crypto` for IDs and references.
- **What came back:** A working terminal-only domain layer: `package.json` with `demo` and `benchmark` scripts, `src/domain/errors.js`, `src/domain/ids.js`, `src/domain/waitlistQueue.js`, `src/domain/inventory.js`, `scripts/demo.js`, and `scripts/benchmark-lookup.js`. The implementation included `DomainError`, UUID-based IDs, readable 8-character booking references, a linked-list FIFO queue, booking validation, sold-out checks, cancellation, waitlist joins, and O(1) booking lookup via `Map`.
- **What was wrong (or "nothing"):** I reviewed the generated code before trusting it. The main fixes were to keep the waitlist queue truly O(1) with a linked list rather than an array, validate inputs carefully to reject invalid quantities or empty strings, make seat checks and cancellation leave state unchanged on failure, keep booking lookup in `Map` for fast O(1) reads, and preserve FIFO order for the waitlist. After those checks, the project matched the Build 1 requirements and `npm run demo` plus `npm run benchmark` ran as expected.

