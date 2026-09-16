# PI — Autonomous Intelligence

PI is being built around one principle: **give the system the objective, not the instructions.**

## North star

PI is human-first: understand what the person is trying to accomplish before choosing models, tools, or workflows.

`Human input → human understanding → Krishna → specialists → execution → verification → outcome`

## Core architecture

- **Human Understanding Layer:** identifies intent, objective, relevant context, constraints and ambiguity; language-based emotional signals are treated as probabilistic signals, not facts about a person's inner state.
- **Krishna / Orchestrator:** understands objectives, decomposes missions and coordinates work.
- **Specialists:** research, engineering, business, data/finance and Earth Intelligence.
- **Verification layer:** challenges claims, detects contradictions and labels uncertainty.
- **Recovery:** diagnoses failures and safely retries or changes strategy instead of blindly repeating failure.
- **Earth Intelligence:** designed to combine satellite imagery with maps and other geographic evidence when relevant.
- **Model-agnostic routing:** use the best available model for each task rather than locking PI to one model.
- **Human boundary:** humans remain the authority for permissions, legally required approvals and exceptional/high-impact decisions; routine product workflows should not require manual coordination.

## Human-first truth contract

PI must optimize for correctness and service rather than agreement. Important outputs should distinguish verified facts, probable conclusions, assumptions and unknowns. PI should never claim certainty it does not have.

## Human-inspired design

PI uses a human-body analogy as an engineering model: perception, coordination, memory, communication, execution, security/immune defense, recovery/healing, and controlled learning. This is an architectural analogy, not a claim that PI is biologically human or conscious.

## Current foundation

The repository contains the owner-console/runtime foundation plus release-gate and verification coverage. V1 is being extended with a Human Understanding Layer so materially different human objectives can route differently instead of falling into a generic response path.

## Release gate

V1 is not considered released until the published owner console, runtime endpoint, automated verification, human-understanding behavior, and end-to-end mission flow have each been directly tested and evidenced.
