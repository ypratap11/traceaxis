# TraceAxis App Spec

## Scope

This document defines the initial application structure, routes, entities, and ingestion boundaries for the TraceAxis MVP.

## Product Boundary

The MVP is an incident investigation tool for one failed robotics run at a time.

It is not:

- A full observability platform
- A general fleet management product
- A generic file storage product

## Application Areas

- Marketing site
- Authenticated workspace
- Ingestion pipeline
- Replay and compare workflows

## Route Map

### Marketing

- `/`
- `/sample-incident`
- `/pricing`
- `/contact`

### Authenticated app

- `/app`
- `/app/incidents`
- `/app/incidents/:incidentId`
- `/app/incidents/:incidentId/compare`
- `/app/incidents/:incidentId/summary`
- `/app/uploads`
- `/app/settings`

### Future routes

- `/app/projects`
- `/app/robots`
- `/app/sites`
- `/app/analytics`

## Primary Entities

### User

- id
- name
- email
- role
- created_at

### Workspace

- id
- name
- slug
- created_at

### Project

- id
- workspace_id
- name
- description
- created_at

### Robot

- id
- project_id
- name
- robot_type
- serial_number
- created_at

### Site

- id
- project_id
- name
- environment_type
- created_at

### SoftwareVersion

- id
- project_id
- label
- commit_sha
- build_metadata
- created_at

### Run

- id
- project_id
- robot_id
- site_id
- software_version_id
- source_type
- source_path
- started_at
- ended_at
- duration_ms
- ingestion_status
- created_at

### Incident

- id
- project_id
- primary_run_id
- baseline_run_id
- title
- status
- severity
- failure_type
- summary
- detected_at
- created_at

### Event

- id
- run_id
- event_type
- severity
- timestamp_ms
- label
- payload_json
- created_at

### TopicStream

- id
- run_id
- topic_name
- message_type
- sample_count
- start_timestamp_ms
- end_timestamp_ms
- metadata_json

### Bookmark

- id
- incident_id
- user_id
- timestamp_ms
- label
- note
- created_at

### Note

- id
- incident_id
- user_id
- body
- created_at

## Core Relationships

- A workspace has many projects
- A project has many robots, sites, runs, and incidents
- An incident references one failed run and optionally one baseline run
- A run has many events and topic streams
- A run can lead to zero or many incidents

## Ingestion Contract

### Accepted inputs for MVP

- ROS bag upload
- Structured log archive upload

### Ingestion stages

1. Upload raw file
2. Persist raw asset in object storage
3. Create run record with `pending` status
4. Dispatch background parse job
5. Extract metadata, topic inventory, and event markers
6. Persist indexed metadata
7. Mark run as `ready` or `failed`

### Derived metadata

- Robot identifier if available
- Software version if available
- Start and end times
- Topic names
- Message counts
- Known event markers

## API Sketch

### Incidents

- `GET /api/incidents`
- `GET /api/incidents/:incidentId`
- `POST /api/incidents`
- `PATCH /api/incidents/:incidentId`

### Runs

- `POST /api/runs/upload`
- `GET /api/runs/:runId`
- `GET /api/runs/:runId/topics`
- `GET /api/runs/:runId/events`
- `GET /api/runs/:runId/telemetry`

### Compare

- `GET /api/incidents/:incidentId/compare`

### Notes and bookmarks

- `POST /api/incidents/:incidentId/bookmarks`
- `POST /api/incidents/:incidentId/notes`

## Frontend State Boundaries

- Keep incident metadata separate from replay data
- Lazy load heavy telemetry windows
- Load topic data on demand
- Cache recent playback ranges locally in the client

## Security and Access

For MVP:

- Workspace-scoped access
- Basic roles: admin, member, viewer
- Signed upload URLs if object storage is used

## Operational Constraints

- Parsing should be asynchronous
- UI should remain responsive when large runs are uploaded
- Heavy processing must not block app navigation

## Suggested Build Order

1. Upload and ingest a run
2. Create incident records manually
3. Load incident inbox
4. Build replay console shell
5. Load events and telemetry into timeline
6. Add bookmarks and summary workflow
7. Add compare view
