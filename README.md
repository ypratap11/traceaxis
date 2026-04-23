# TraceAxis

TraceAxis is an incident replay and debugging console for robotics teams.

It helps engineers reconstruct robot failures from ROS bags and structured logs by replaying video, telemetry, logs, robot state, and anomaly markers in one synchronized timeline.

## Positioning

TraceAxis is built for robotics teams that need to understand why a run failed without stitching together custom scripts, raw bag inspection, screenshots, and Slack threads.

### Core promise

Find robot failures faster.

### Tagline

Incident replay for robotics teams.

## Initial Product Scope

The MVP is focused on one workflow:

- upload a failed run
- replay the incident
- inspect video, telemetry, logs, and state together
- compare against a healthy baseline
- bookmark key moments
- share the incident internally

## Planned MVP Features

- ROS bag or structured log upload
- Incident inbox
- Synchronized replay timeline
- Event markers for failure moments
- Log and telemetry inspection
- Side-by-side compare view
- Notes and bookmarks
- Shareable incident links

## Docs

- [Startup brief](docs/incident-replay-startup-brief.md)
- [UI spec](docs/incident-replay-ui-spec.md)
- [App spec](docs/incident-replay-app-spec.md)
- [MVP checklist](docs/incident-replay-mvp-checklist.md)

## Product Direction

TraceAxis should feel like a serious engineering tool:

- timeline-first
- dense but calm
- fast to scan
- technically credible
- polished enough to feel better than internal tooling

## Current Status

This repository is in the planning stage. The current docs define the product thesis, UI direction, MVP boundaries, and application structure for the first build.
