# PinPoint

A daily hidden-target puzzle game for the web. Find the hidden blue circle 
in as few clicks as possible. Each click shows how close you are (green → red), 
or turns grey if a wall blocks its line of sight to the target. Everyone gets the
same board each day.

**▶ Play it: https://pinpoint.sheptrundle.workers.dev/**

**Status:** Early prototype. One test course is playable. See [DESIGN.md](DESIGN.md) for the game design, strategy mechanics and planned architecture.

## Tech stack and workflow

AI Assisted development using Claude Code through the CLI (in-terminal).

TypeScript · React · SVG · Vite · Vitest · Cloudflare Workers

## Development

Requires Node.js.

```bash
npm install
npm run dev       # local dev server with instant reload
npm test          # run tests in watch mode
npm run build     # type-check and build for production
```
