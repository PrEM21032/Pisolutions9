# V1 Next Upgrade

The V1 gate is split from V2 so V1 health remains independently observable.

Next engineering priority: replace source-only UI assertions with a true browser/runtime interaction harness when a browser test runtime is available. The current contract tests intentionally provide an intermediate guard for DOM IDs, loading/recovery behavior, response rendering, and safe text output.

Production provider failures remain external health signals and must not be hidden by local test success.
