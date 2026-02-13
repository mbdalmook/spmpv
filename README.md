# Seamless People Management

A full-featured organisational management dashboard for managing departments, staff, workflows, compliance, and cross-functional teams — built as a single-page React application with TypeScript.

---

## Tech Stack

- **React 18** — UI framework with hooks
- **TypeScript 5.6** — Strict typing across the entire codebase
- **Vite 6** — Build tool and dev server
- **Tailwind CSS 3.4** — Utility-first styling
- **Lucide React** — Icon library
- **ESLint + Prettier** — Code quality and formatting

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (default: http://localhost:5173)
npm run dev

# Type-check and build for production
npm run build

# Lint all source files
npm run lint

# Format all source files
npm run format
```

---

## Project Structure

```
src/
├── types/              # TypeScript interfaces, enums, and action types
│   ├── entities.ts     # 15 entity interfaces (Department, Staff, etc.)
│   ├── enums.ts        # All enumerations
│   ├── state.ts        # AppState interface
│   ├── actions.ts      # Discriminated union of all reducer actions
│   └── index.ts        # Barrel export
│
├── utils/              # Pure helper functions
│   ├── id.ts           # ID generation and UID formatting
│   ├── email.ts        # Email address generation from settings
│   ├── department.ts   # Department status computation
│   └── staff.ts        # Staff name and mobile helpers
│
├── data/
│   └── seed-data.ts    # Builds typed demo data for all entities
│
├── state/              # State management (React Context + useReducer)
│   ├── context.ts      # Contexts, providers, and custom hooks
│   ├── rootReducer.ts  # Combines all domain reducers
│   └── reducers/       # Domain-split reducers
│       ├── departmentReducer.ts
│       ├── functionReducer.ts
│       ├── responsibilityReducer.ts
│       ├── staffReducer.ts
│       ├── workflowReducer.ts
│       ├── teamReducer.ts
│       └── adminReducer.ts
│
├── components/         # Shared UI components
│   ├── Badge.tsx
│   ├── CustomSelect.tsx
│   ├── DataTable.tsx
│   ├── ErrorBoundary.tsx
│   ├── IconButton.tsx
│   ├── Modal.tsx
│   ├── PageHeader.tsx
│   ├── PrimaryButton.tsx
│   ├── SearchBar.tsx
│   ├── SummaryCards.tsx
│   └── WorkflowFlowDiagram.tsx
│
├── layout/             # App shell
│   ├── Sidebar.tsx     # Collapsible sidebar navigation
│   ├── TopBar.tsx      # Top toolbar with sidebar toggle
│   ├── PageRouter.tsx  # Maps page IDs to screen components
│   └── navSections.ts  # Sidebar navigation section definitions
│
├── screens/            # All 18 application screens
│   ├── admin/          # Configuration screens
│   │   ├── ComplianceTags.tsx
│   │   ├── Grades.tsx
│   │   ├── EmailFormat.tsx
│   │   ├── ManagerThreshold.tsx
│   │   ├── CompanyNumbers.tsx
│   │   └── CompanyProfile.tsx
│   ├── entities/       # Core CRUD screens
│   │   ├── Departments.tsx
│   │   ├── Functions.tsx
│   │   ├── Responsibilities.tsx
│   │   ├── Staff.tsx
│   │   └── CrossFunctionalTeams.tsx
│   ├── user/
│   │   └── UserManagement.tsx
│   ├── views/          # Read-only dashboards
│   │   ├── OrgChart.tsx
│   │   └── Compliance.tsx
│   ├── workflows/
│   │   ├── WorkflowsView.tsx
│   │   └── WorkflowManager.tsx
│   └── tools/
│       ├── EmailCardCreator.tsx
│       └── ContactManager.tsx
│
├── App.tsx             # Root component with providers
├── main.tsx            # Entry point
├── index.css           # Tailwind directives + base styles
└── vite-env.d.ts       # Vite type declarations
```

---

## Architecture

**State management** uses React's `useReducer` combined with Context — no external libraries. The reducer is split by domain (departments, staff, workflows, etc.) and composed via a root reducer. Two contexts separate state from dispatch to avoid unnecessary re-renders.

**Navigation** is handled through a simple `NavigationContext` with a `currentPage` string and a `navigate` function. `PageRouter` maps page IDs to screen components.

**Shared components** (`DataTable`, `Modal`, `Badge`, `SummaryCards`, etc.) are fully typed and reused across all 18 screens for consistent UI.

**Error boundaries** wrap the page router so individual screen crashes display a fallback UI instead of taking down the entire app.

**Data** is currently seeded in-memory via `buildSeedData()` in `src/data/seed-data.ts`. All entities use typed interfaces from `src/types/entities.ts`.

---

## Screen Inventory (18 screens)

| Category | Screen | Description |
|----------|--------|-------------|
| Views | Org Chart | Collapsed/expanded company hierarchy |
| Views | Compliance | Filtered table of compliance obligations |
| Workflows | Workflows View | Overview of all workflows with detail cards |
| Workflows | Workflow Manager | Diagram builder with step sequencing |
| Entities | Departments | CRUD with manager assignment |
| Entities | Functions | CRUD with department grouping |
| Entities | Responsibilities | CRUD with compliance tagging and transfer |
| Entities | Staff | CRUD with grade/function assignment and profile view |
| Entities | Cross-Functional Teams | CRUD with multi-member selection |
| Tools | Email & Card Creator | Business card and email signature generator |
| Tools | Contact Manager | Phone number allocator with 3-tab directory |
| User | User Management | Role assignment for system users |
| Admin | Compliance Tags | Manage compliance tag types |
| Admin | Grades | Manage organisational grade levels |
| Admin | Email Format | Configure email generation pattern |
| Admin | Manager Threshold | Set grade threshold for manager status |
| Admin | Company Numbers | Manage company phone number pool |
| Admin | Company Profile | Edit company name, location, and branding |

---

## Licence

Private — not currently open-sourced.
