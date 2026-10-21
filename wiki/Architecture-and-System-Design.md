# CricOS — Architecture & System Design

> **Executive Overview**: Unified Cricket Operating System: high-performance tournament scheduling, certified official & venue marketplace, MCC Laws ball-by-ball scoring, real-time Server-Sent Events (SSE) broadcasting, and double-entry financial settlements. Built as a TypeScript monorepo with Fastify, React, and strict domain validation.

All system architectures, tournament workflows, scoring sequences, event pipelines, and match lifecycles are embedded below as native Mermaid diagrams with full architectural explanations.

---

## 🏛️ 1. System Architecture

```mermaid
flowchart TD
    User["👤 Players / Scorer / Organizer\n(Web App / Mobile PWA)"]
    
    subgraph PlatformCore["🏏 CricOS Platform Core (Fastify & Node.js)"]
        Gateway["⚡ API Gateway\n(Fastify :3000 & JWT Auth)"]
        
        subgraph Subsystems["🛡️ Core Domain Engines"]
            Tourn["🏆 Tournament & Scheduler Engine\n(Round-robin, Knockout, Net Run Rate)"]
            Scoring["⚖️ MCC Laws Scoring Engine\n(Ball-by-ball, 0ms Rollback, DLS)"]
            Market["🏪 Provider & Venue Marketplace\n(Umpires, Scorers, Pitches)"]
            Ledger["💰 Double-Entry Ledger\n(ACID Wallets & Match Settlements)"]
        end
        
        SSE["📡 SSE Broadcast Service\n(Real-time Match Events)"]
        DB[("🐘 PostgreSQL / Prisma ORM\n(Immutable Event Ledger)")]
    end

    Spectator["📺 Spectators & Fan Portals\n(Live Broadcast HUD)"]

    User -->|"HTTP / REST"| Gateway
    Gateway --> Tourn
    Gateway --> Scoring
    Gateway --> Market
    Gateway --> Ledger
    Scoring -->|"live delivery"| SSE
    Scoring -->|"state event"| DB
    Ledger -->|"financial tx"| DB
    SSE -->|"event stream"| Spectator
```

### Architectural Breakdown & Component Responsibilities
* **Fastify API Gateway**: High-throughput Node.js micro-framework gateway executing route dispatching, JSON schema validation, rate-limiting, and RBAC authentication.
* **Tournament & Scheduler Engine**: Generates tournament fixture grids (round-robin round allocations, double-elimination, seed pairings), manages venue availability matrices, and automatically updates Net Run Rate (NRR) tables according to ICC specifications.
* **MCC Laws Scoring Engine**: Implements the official Marylebone Cricket Club (MCC) Laws of Cricket (Laws 18 to 42), covering dead balls, no ball free hits, byes, leg-byes, bowler over limits, run outs, and penalty runs with instant rollback.
* **Double-Entry Financial Ledger**: Enforces strict financial accounting where every transaction (match fee collection, umpire compensation, ground booking, tournament prize payouts) creates balanced debit and credit entries with immutable audit trails.
* **Server-Sent Events (SSE) Broadcast**: Streams low-latency event payloads (`event: delivery`, `event: wicket`, `event: milestone`) to connected clients and live scoreboards with zero polling overhead.

---

## 🔄 2. Tournament & Match Execution Workflow

```mermaid
flowchart LR
    A["1. Tournament Setup\n(Teams, pools, venues)"] --> B["2. Fixture Auto-Schedule\n(Conflict-free slots)"]
    B --> C["3. Officials Assigned\n(Marketplace booking)"]
    C --> D["4. Live Scoring\n(MCC ball-by-ball)"]
    D --> E["5. SSE Broadcast\n(Zero-latency feed)"]
    E --> F["6. Double-Entry Settlement\n(Automated payouts)"]
```

---

## ⚡ 3. Ball-by-Ball Scoring & Broadcast Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Scorer as Official Scorer
    participant App as Scoring Console
    participant Engine as Scoring Core
    participant SSE as SSE Broker
    participant DB as PostgreSQL
    participant Fan as Fan Client

    Scorer->>App: Key In Wicket (Caught & Bowled)
    App->>Engine: POST /api/matches/:id/deliveries
    Engine->>Engine: Validate MCC Rules & Striker Swap
    Engine->>DB: Append Delivery Event (ACID)
    Engine->>SSE: Emit 'delivery' Event
    SSE-->>Fan: Push Live Score Update
    Engine-->>App: Confirmed (200 OK)
    App-->>Scorer: Next Batsman Modal Prompt
```

---

## 🌊 4. Real-time Event Data Flow Pipeline

```mermaid
flowchart LR
    subgraph S1["1. Matchday Event"]
        ScorerTouch["📱 Scorer Keypad Input\n(Runs, extras, wagon angle)"]
    end
    subgraph S2["2. Validation"]
        MCCRules["⚖️ MCC Rule Validator\n(Legal ball, free hit, bowler limit)"]
    end
    subgraph S3["3. Ledger"]
        EventStore[("💾 Immutable Match Event Ledger\n(Append-only DB events)")]
    end
    subgraph S4["4. Distribution"]
        Broadcast["📡 SSE & WebSocket Hub\n(Push event stream)"]
    end
    subgraph S5["5. Consumers"]
        SpectatorUI["📺 Live Scorecard & OBS"]
        Analytics["📊 Live NRR & Wagon Charts"]
    end

    ScorerTouch --> MCCRules
    MCCRules --> EventStore
    EventStore --> Broadcast
    Broadcast --> SpectatorUI
    Broadcast --> Analytics
```

---

## ⏱️ 5. Match & Tournament Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft_Created: Tournament & Teams Registered
    Draft_Created --> Fixtures_Scheduled: Auto-Scheduler Runs
    Fixtures_Scheduled --> Officials_Booked: Marketplace Confirmation
    Officials_Booked --> Match_Live: Toss & Match Commences
    Match_Live --> Innings_Break: 1st Innings Concluded
    Innings_Break --> Match_Live: 2nd Innings Target Chase
    Match_Live --> Match_Tied: Scores Equal
    Match_Tied --> Super_Over: ICC 1-Over Eliminator
    Super_Over --> Match_Concluded: Winner Decided
    Match_Live --> Match_Concluded: Target Chased / Wickets Down
    Match_Concluded --> Financials_Settled: Double-Entry Payouts Executed
    Financials_Settled --> [*]
```
