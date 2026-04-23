# TraceAxis UI Spec

## Product Intent

The TraceAxis interface should feel like a serious debugging console for robotics teams. The UI should prioritize speed, clarity, and confidence under dense technical information.

## Design Principles

- Timeline first
- Fast to scan
- Dense, but not crowded
- Strong visual hierarchy
- Minimal decorative chrome
- Interactions should reduce investigation time

## Visual Direction

### Style

- Dark graphite base with restrained accent usage
- Technical, editorial typography rather than generic dashboard styling
- Hard edges or lightly rounded corners, not soft consumer UI
- Subtle panels and separators instead of heavy card grids

### Color system

- Neutral background: graphite, slate, charcoal
- Accent color: electric cyan or acid green, but only one
- Status colors:
  - Warning: amber
  - Error: red
  - Success: green
  - Info: blue

### Typography

- Primary UI font: clean technical sans
- Monospace reserved for logs, timestamps, topic names, and numeric values
- Large headings should be sharp and compact

## Primary Screens

### 1. Incident Inbox

Purpose:

- Help users scan recent failures and open investigations quickly

Layout:

- Left filter rail
- Main list view
- Compact summary row per incident

Key controls:

- Search by robot, site, software version, failure type
- Filter by severity and status
- Sort by time, severity, or robot

Row contents:

- Incident title
- Robot identifier
- Site or environment
- Severity badge
- Failure type
- Timestamp
- Software version
- Investigation status

### 2. Replay Console

Purpose:

- Reconstruct exactly what happened in the failed run

Layout:

- Top bar
- Main content grid
- Bottom scrub timeline

Top bar:

- Incident title
- Robot and run metadata
- Time range
- Share action
- Compare action
- Export action

Main grid:

- Upper-left: primary video or primary sensor view
- Upper-right: event stream and logs
- Lower-left: telemetry charts
- Right rail: topic inspector and state panel

Bottom region:

- Master timeline
- Event markers
- Bookmarks
- Playback controls

### 3. Compare View

Purpose:

- Contrast a failed run with a healthy baseline

Layout:

- Split-pane left and right views
- Shared toolbar
- Shared or linked timeline
- Diff summary strip above main content

Diff summary strip:

- Localization drift increased
- Planner stalled
- Velocity command dropped
- Battery sag before abort

### 4. Incident Summary

Purpose:

- Capture what matters after investigation

Layout:

- Summary header
- Key moments timeline
- Notes and bookmarks
- Export section

Contents:

- Root-cause hypothesis
- Key timestamps
- Supporting evidence
- Internal notes
- Links to replay moments

## Replay Console Component Breakdown

### Timeline

Must support:

- Smooth scrubbing
- Zoom in and out
- Event markers
- Bookmarks
- Hover preview
- Keyboard control

Interactions:

- Click to jump
- Drag playhead
- Zoom with wheel or pinch
- Press keys for next or previous anomaly

### Video pane

Must support:

- Frame-accurate sync with timeline
- Basic playback controls
- Overlay toggles where available

### Event stream

Must support:

- Chronological event feed
- Severity coloring
- Click event to jump timeline
- Collapsed by default for noisy categories

### Telemetry charts

Must support:

- Synchronized crosshair
- Range selection
- Overlay of multiple signals
- Highlight anomaly windows

Default chart candidates:

- Battery voltage
- Velocity command
- Localization confidence
- CPU or thermal metric if present

### Topic inspector

Must support:

- Topic list
- Topic search
- Message preview
- Pin selected topics to workspace

## Interaction Patterns

### Core workflow

1. Open incident
2. See summary and key markers
3. Jump to anomaly
4. Scrub around failure window
5. Inspect logs, state, and telemetry together
6. Compare against healthy run if needed
7. Bookmark evidence
8. Write conclusion and share

### Keyboard shortcuts

- Space: play or pause
- Left or right arrows: scrub
- J or K: previous or next anomaly
- B: add bookmark
- F: focus search
- C: open compare view

## Empty States

Examples:

- No incidents yet
- No video stream attached
- No baseline selected for compare
- No event markers detected

These should still teach the workflow and suggest the next action.

## Motion

- Playback indicator should move smoothly
- Timeline hover and selection should be crisp and restrained
- Avoid flashy transitions
- Use motion only to reinforce temporal navigation

## Mobile and Responsive Guidance

This is desktop-first, but it should degrade cleanly:

- Inbox can work on tablet
- Summary screen should work on mobile
- Replay console can become read-only or reduced on small screens

## Future UI Extensions

- Fleet overview
- Failure clustering gallery
- Annotation threads
- Auto-generated narrative summary
- Calibration and sensor health layers
