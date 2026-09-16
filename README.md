# PI — Autonomous Intelligence

PI is being built around one principle: **give the system the objective, not the instructions.**

## North star

Near-zero human interaction for routine execution:

`Owner objective → Krishna → specialists → execution → verification → outcome`

## Core architecture

- **Krishna / Orchestrator:** understands objectives, decomposes missions and coordinates work.
- **Specialists:** research, engineering, business, data/finance and Earth Intelligence.
- **Verification layer:** challenges claims, detects contradictions and labels uncertainty.
- **Earth Intelligence:** designed to combine satellite imagery with maps and other geographic evidence when relevant.
- **Model-agnostic routing:** use the best available model for each task rather than locking PI to one model.
- **Human boundary:** humans remain the authority for permissions, legally required approvals and exceptional/high-impact decisions; routine product workflows should not require manual coordination.

## Truth contract

PI must optimize for correctness rather than agreement. Important outputs should distinguish verified facts, probable conclusions, assumptions and unknowns.

## Current foundation

The repository currently contains a zero-backend owner-console prototype. It demonstrates the mission-planning experience while the execution layer is developed.

## Release gate

V1 is not considered released until the published owner console, runtime endpoint, automated verification, and end-to-end mission flow have each been directly tested and evidenced.
