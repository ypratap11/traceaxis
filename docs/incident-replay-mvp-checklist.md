# TraceAxis MVP Checklist

## Goal

Ship a usable first version that lets a robotics engineer investigate one failed run without relying on scattered scripts and raw logs.

## Phase 1: Foundation

- Create repository and project scaffold
- Set up frontend app
- Set up backend service
- Set up database
- Define environment variables
- Create shared types for core entities

## Phase 2: Ingestion

- Add upload flow for ROS bag or structured archive
- Persist uploaded files
- Create run record on upload
- Add background ingestion worker
- Parse run metadata
- Parse topic inventory
- Detect known event markers
- Mark ingestion success or failure

## Phase 3: Incident Model

- Create incident entity
- Link incident to primary run
- Support optional baseline run
- Add incident status
- Add severity and failure type fields
- Seed sample incidents for demo

## Phase 4: Incident Inbox

- Build incidents list page
- Add search
- Add filters
- Add sort options
- Add severity and status badges
- Add empty state

## Phase 5: Replay Console

- Build page shell
- Add playback controls
- Add synchronized timeline
- Add event markers
- Add log stream panel
- Add video or primary sensor pane
- Add telemetry chart panel
- Add topic inspector

## Phase 6: Investigation Workflow

- Add bookmark creation
- Add notes
- Add jump-to-anomaly controls
- Add shareable incident URL
- Add summary page

## Phase 7: Compare Mode

- Add baseline selection
- Build split compare layout
- Sync both timelines
- Show diff summary strip

## Phase 8: Product Polish

- Improve loading states
- Improve error states
- Add keyboard shortcuts
- Polish typography and spacing
- Add demo sample content
- Add marketing homepage

## Non-Goals for MVP

- Full fleet dashboards
- Alerting and notifications
- Automated root-cause engine
- Broad integrations beyond initial ingestion path
- Enterprise security features beyond basics

## Demo Readiness Checklist

- User can upload a run
- Uploaded run becomes an incident
- User can open replay console
- Timeline shows at least one anomaly marker
- Logs and telemetry stay synchronized
- User can bookmark a moment
- User can compare against a healthy run
- Product has one polished demo incident

## Success Criteria

- A robotics engineer can understand the failure flow from one screen
- Investigation time is visibly reduced compared with raw bag inspection
- The product feels coherent and intentional, not like an internal tool
