# Network Designer TODO

## Phase 1: Core Designer Component

- [x] Create `/designer` route page (`src/app/designer/page.tsx`)
- [x] Create `NetworkDesigner` component (`src/components/network-designer.tsx`)
- [x] Implement drag-and-drop device palette (sidebar with device types)
- [x] Enable dragging devices from palette onto canvas
- [x] Create device nodes on drop with auto-generated IDs
- [x] Implement node selection and highlighting
- [x] Add node dragging/repositioning on canvas
- [x] Enable node deletion (keyboard shortcut + button)

## Phase 2: Device Management

- [x] Create device properties panel (right sidebar)
- [x] Editable device fields:
  - [x] Device name/label
  - [x] IP address (with validation)
  - [x] Location
  - [x] VLAN assignment
  - [x] Status (online/offline/warning)
  - [x] Device type (router/switch/server/ap/etc)
  - [x] Model name
  - [x] Port count (for switches/routers)
  - [x] Additional metadata (key-value pairs)
- [x] Form validation for IP addresses and required fields
- [x] Real-time updates to canvas when properties change

## Phase 3: Connection Management

- [x] Enable edge creation by dragging between nodes
- [x] Connection properties dialog/panel:
  - [x] Bandwidth selection (dropdown + custom input)
  - [x] Connection type (ethernet/fiber/wireless/wan)
  - [x] VLAN tagging
  - [x] Custom label
  - [x] Latency/QoS settings (optional)
- [x] Edge selection and editing
- [x] Edge deletion
- [ ] Auto-route edges through appropriate handles based on bandwidth
- [ ] Connection validation (prevent duplicate connections)

## Phase 4: UI/UX Enhancements

- [x] Top toolbar with actions:
  - [x] Save/Load network
  - [x] Export to JSON
  - [x] Clear canvas (with confirmation)
  - [x] Undo/Redo functionality
  - [x] Auto-layout toggle (hierarchy/radial/auto)
  - [x] Zoom controls
  - [x] Grid snap toggle
- [x] Device palette categories/search
- [x] Keyboard shortcuts:
  - [x] Delete (Del/Backspace)
  - [x] Undo (Ctrl+Z)
  - [x] Redo (Ctrl+Y / Ctrl+Shift+Z)
  - [x] Save (Ctrl+S)
  - [x] Select All (Ctrl+A)
  - [x] Duplicate (Ctrl+D)
  - [x] Group (Ctrl+G)
- [x] Context menu (right-click on nodes/edges)
- [x] Multi-select nodes (Ctrl+Click, drag selection box)
- [x] Node grouping/clustering

## Phase 5: Data Persistence

- [x] Save network designs to localStorage (auto-save implemented)
- [x] Save to database (create schema)
- [x] Load saved networks from database
- [x] Network templates/presets (small/medium/enterprise)
- [x] Import from JSON file
- [x] Export to JSON file
- [x] Export to PNG/SVG image
- [x] Share functionality (generate shareable link)

## Phase 6: Advanced Features

- [x] Network validation/health check:
  - [x] Detect orphaned devices
  - [x] Identify missing default gateway
  - [x] Check IP address conflicts
  - [x] Validate VLAN consistency
  - [x] Bandwidth bottleneck detection
  - [x] PoE budget validation
  - [x] Rack space allocation checks
  - [x] Connection type compatibility
  - [x] Redundancy analysis
  - [x] Port capacity validation
  - [x] Subnet and IP address validation
  - [x] DNS/DHCP server detection
  - [x] Inter-VLAN routing validation
  - [x] Network security layers
- [x] Device templates library
- [ ] Connection templates (common patterns)
- [ ] Copy/paste nodes and edges
- [ ] Bulk operations (edit multiple devices)
- [ ] Network documentation generation
- [ ] BOM (Bill of Materials) export
- [ ] Cost calculator (if device pricing added)

## Phase 7: Collaboration Features

- [ ] User authentication integration
- [ ] Save designs to user account
- [ ] Share networks with team members
- [ ] Version history/revisions
- [ ] Comments/annotations on devices
- [ ] Real-time collaboration (optional, complex)

## Phase 8: Visual Enhancements

- [x] Custom node colors/themes
- [x] Device icons customization
- [x] Connection animation controls
- [x] Dark/light mode optimization
- [x] Minimap improvements
- [x] Background pattern options
- [x] Legend/key for connection types
- [ ] Status indicators (live monitoring simulation)

## Phase 9: Integration & Export

- [ ] Export to network diagram formats:
  - [ ] Visio XML
  - [ ] Draw.io/Diagrams.net
  - [ ] Lucidchart
  - [ ] PDF report
- [ ] Integration with network monitoring tools
- [ ] Generate configuration templates:
  - [ ] Cisco IOS
  - [ ] UniFi Controller
  - [ ] pfSense/OPNsense
- [ ] Import from network discovery tools

## Phase 10: Documentation & Polish

- [ ] User guide/tutorial
- [ ] Interactive onboarding tour
- [ ] Tooltips and help text
- [ ] Error handling and user feedback
- [ ] Loading states and animations
- [ ] Mobile responsive design (view-only mode)
- [ ] Accessibility improvements (keyboard navigation, screen readers)
- [ ] Performance optimization for large networks (100+ devices)

## Technical Requirements

- [ ] State management for designer (Zustand/Jotai or React Context)
- [ ] React Flow integration and customization
- [ ] Form library (React Hook Form + Zod validation)
- [ ] File upload/download utilities
- [ ] Clipboard API for copy/paste
- [ ] IndexedDB or localStorage for auto-save
- [ ] Database schema for saved networks
- [ ] API endpoints for CRUD operations

## Nice-to-Have Features

- [ ] AI-powered network suggestions
- [ ] Auto-complete for device models
- [ ] IP address auto-assignment (DHCP simulation)
- [ ] Subnet calculator integration
- [ ] Cable length estimation
- [ ] Rack elevation diagram generator
- [ ] Network simulation (packet flow visualization)
- [ ] Performance metrics dashboard
- [ ] Comparison view (before/after designs)
- [ ] Print-friendly layout
