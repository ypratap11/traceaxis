# TraceAxis Startup Brief

## Overview

TraceAxis is a debugging console for robotics failures. Teams upload a run, replay the incident, and inspect the sequence of sensor data, commands, state transitions, and anomalies that led to failure.

### Core pitch

TraceAxis helps robotics teams find root causes from robot failures in minutes, not hours.

### Alternate framing

- Datadog meets replay for robots.
- Turn ROS bags and robot logs into a searchable incident timeline.

## Target User

Start with a narrow buyer:

- Robotics software teams running ROS-based systems
- Early customers: AMR startups, drone companies, industrial mobile robots, and research-heavy robotics teams

Best initial user:

- Autonomy or robotics engineer who debugs failures weekly

Not the first buyer:

- Ops executives
- Large warehouse enterprises
- Generic "all robot fleets" positioning

## Product Thesis

The product should do one job extremely well at first: investigate one failed run.

This is not a broad observability platform in v1. It is a focused workflow product for incident reconstruction and root-cause discovery.

## V1 Scope

### Must-have features

- Upload ROS bag or structured log bundle
- Parse metadata: robot, software version, run time, topics, and error markers
- Synchronized replay timeline
- Panels for video, logs, robot state, and selected telemetry
- Jump-to-event markers: E-stop, localization loss, planner timeout, mission abort
- Basic side-by-side compare with a healthy run
- Shareable incident link

### Nice-to-have, not v1

- Auto root-cause summaries
- Fleet-wide analytics
- Alerting
- Broad integrations across many robot stacks
- Full observability platform positioning

## Core Screens

### 1. Incident Inbox

A list of incidents with:

- Title
- Robot or site
- Severity
- Timestamp
- Software version
- Failure type
- Status: new, investigating, resolved

### 2. Replay Console

This is the core product surface.

- Large scrub timeline across the bottom
- Video pane in the upper-left
- Event and log stream in the upper-right
- Telemetry charts below the primary panes
- Topic and state inspector in a right rail
- Event markers on the timeline
- Jump-to-anomaly controls

### 3. Compare View

- Failed run on the left
- Baseline run on the right
- Shared timeline controls
- Diff chips such as:
  - localization drift increased
  - cmd_vel dropped
  - battery sag before abort

### 4. Incident Summary

- Key timestamps
- Attached notes
- Bookmarked moments
- Exportable report

## UI Direction

This should look like a serious engineering tool, not a generic SaaS dashboard.

### Visual direction

- Dark graphite or deep slate base, without a neon sci-fi look
- One disciplined accent color for interaction and event state
- Reserved status colors for warnings, errors, and success states
- Monospace only where useful; pair it with a sharp technical sans
- Dense layout with strong visual hierarchy
- Timeline-first design, not a collection of widgets

### Product references

- Linear for clarity
- Figma developer tooling for information density
- Datadog traces for drill-down workflows
- Professional video timelines for the replay feel

### Premium UX characteristics

- Near-instant response while scrubbing
- Accurate synchronization across panels
- Clear color semantics
- Strong loading and empty states
- Charts that reveal the right defaults instead of everything at once
- Keyboard shortcuts for core actions

## Homepage Direction

### Hero

Headline:

`Find Robot Failures Faster`

Subhead:

`Replay incidents across video, telemetry, logs, and robot state in one synchronized timeline.`

Primary calls to action:

- Book Demo
- View Sample Incident

### Value props

- Replay the exact failure
- Correlate every signal
- Compare against a healthy run

### Proof section themes

- Cuts failure investigation from hours to minutes
- Works with ROS bags and structured robot logs
- Built for autonomy and robotics teams

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- A charting library with strong sync support such as uPlot or ECharts
- A custom timeline component

### Backend

- Python FastAPI or a Node backend
- Background workers for ingestion and parsing
- Postgres for metadata
- Object storage for uploaded bags and log bundles

### Parsing and processing

- Python is the practical choice if handling ROS data
- Start with ROS 2 or one common ingestion format first
- Avoid supporting every robotics stack in v1

### Infrastructure

- Local development first
- Simple cloud object storage later
- Avoid Kubernetes early

## Data Model Sketch

### Core entities

- Workspace
- Project
- Robot
- Site
- SoftwareVersion
- Incident
- Run
- Event
- TopicStream
- Bookmark
- Note
- Attachment

### Suggested relationships

- A project has many robots and incidents
- An incident references one primary failed run
- An incident can optionally reference one baseline run
- A run has many events and topic streams
- A user can add notes and bookmarks to incidents and runs

## MVP Architecture Notes

### Ingestion flow

1. User uploads a ROS bag or structured log archive
2. Backend stores the raw file in object storage
3. Worker extracts metadata and indexes timestamps, topics, and known event markers
4. Backend persists incident and run metadata in Postgres
5. Frontend loads the replay workspace using indexed metadata and time-series slices

### System boundaries

- Keep raw data storage separate from indexed metadata
- Treat parsing as an asynchronous job
- Keep the first release optimized for replay and comparison, not arbitrary analytics

### Early event taxonomy

- E-stop
- Localization loss
- Planner timeout
- Mission abort
- Collision or near-collision
- Sensor dropout
- Battery sag
- Network disconnect

## 14-Day MVP Plan

### Days 1-2

- Define upload format
- Define metadata schema
- Draft wireframes

### Days 3-5

- Implement ingestion
- Parse basic run metadata
- Index timestamps, topics, and event markers

### Days 6-8

- Build replay console shell
- Add synchronized timeline and primary panes

### Days 9-10

- Add telemetry charts
- Add event markers and jump controls

### Days 11-12

- Add compare mode for two runs
- Add notes and bookmarks

### Days 13-14

- Polish UI
- Seed demo incidents
- Build a landing page and sample workflow

## Go-to-Market Wedge

Do not launch as a general robotics platform.

Launch as:

`TraceAxis: incident replay for ROS-based robotics teams`

Expand later into:

- Bag search
- Failure classification
- Calibration checks
- Fleet analytics

## Customer Discovery

Good interview question:

When a robot fails, what do you open first, and how long does it take to reconstruct what happened?

Strong signals:

- Bags
- Terminal logs
- Custom scripts
- Screenshots
- Slack threads

These indicate a fragmented workflow and a strong need for a better incident console.

## Pricing

Early pricing should stay simple:

- Pilot: $500-$1,500 per month
- Structure pricing around seats, storage, and retained incidents
- Offer a design partner discount for tight feedback loops

Avoid launching as a free tool for everyone. This is a painful debugging product and should be tested against willingness to pay early.

## Key Risk

The biggest risk is building a viewer instead of a workflow product.

A viewer says:

- Here are your logs

A workflow product says:

- Here is the failure moment
- Here are the likely causes
- Here is how this differed from the last healthy run
- Here is the report you send internally

That distinction should guide product scope decisions.

## Next Planning Documents To Create

- Homepage copy and messaging
- Screen-by-screen UI specification
- Route map and application structure
- Database schema and ingestion contracts
- MVP task breakdown
