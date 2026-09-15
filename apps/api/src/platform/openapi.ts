export interface OpenApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  tag: string;
  summary: string;
  description: string;
  authRequired?: boolean;
  role?: string;
  parameters?: Array<{ name: string; in: 'query' | 'path' | 'header'; required: boolean; description: string; type: string }>;
  requestBody?: Record<string, unknown>;
  responses: Record<string, { description: string; schema?: Record<string, unknown> }>;
}

export function generateOpenApiSpec(): Record<string, unknown> {
  const endpoints: OpenApiEndpoint[] = [
    // Health & Observability
    {
      method: 'GET',
      path: '/health/live',
      tag: 'Observability',
      summary: 'Liveness probe',
      description: 'Reports server process uptime and liveliness status for container orchestrators.',
      responses: { '200': { description: 'Process is alive' } }
    },
    {
      method: 'GET',
      path: '/health/ready',
      tag: 'Observability',
      summary: 'Readiness probe',
      description: 'Checks database pool connectivity and system readiness for traffic.',
      responses: { '200': { description: 'Ready for traffic' }, '503': { description: 'Degraded' } }
    },
    {
      method: 'GET',
      path: '/health/metrics',
      tag: 'Observability',
      summary: 'Operational telemetry summary',
      description: 'JSON metrics report covering memory, event loop lag, scoring activity, and pool stats.',
      responses: { '200': { description: 'Telemetry metrics' } }
    },
    {
      method: 'GET',
      path: '/metrics',
      tag: 'Observability',
      summary: 'Prometheus metrics exposition',
      description: 'Standard text exposition format for scraping by Prometheus and OpenTelemetry collectors.',
      responses: { '200': { description: 'Prometheus metrics text' } }
    },

    // Identity & Auth
    {
      method: 'POST',
      path: '/api/v1/identity/login',
      tag: 'Identity',
      summary: 'Authenticate user and issue JWT',
      description: 'Verifies user credentials and returns an HMAC-SHA256 signed bearer JWT token.',
      requestBody: { email: 'captain@cricos.app', role: 'CAPTAIN' },
      responses: { '200': { description: 'Authentication successful with JWT' } }
    },

    // Marketplace & Booking
    {
      method: 'GET',
      path: '/api/v1/marketplace/listings',
      tag: 'Marketplace',
      summary: 'Query provider availability slots',
      description: 'Lists active ground, umpire, scorer, and coach service slots with temporal bounds.',
      parameters: [{ name: 'category', in: 'query', required: false, description: 'Provider category filter (GROUND, UMPIRE, SCORER)', type: 'string' }],
      responses: { '200': { description: 'Available service slots' } }
    },
    {
      method: 'POST',
      path: '/api/v1/checkout/bookings',
      tag: 'Marketplace',
      summary: 'Book provider slot with escrow hold',
      description: 'Calculates 5% platform fee + 18% GST in integer minor units and reserves slot.',
      authRequired: true,
      requestBody: { slotId: 'slot-101', paymentMethod: 'MOCK_UPI' },
      responses: { '201': { description: 'Booking confirmed and escrow created' } }
    },

    // Scoring & Live Match
    {
      method: 'GET',
      path: '/api/v1/scoring/matches/{id}/live',
      tag: 'Scoring',
      summary: 'Subscribe to real-time live match SSE stream',
      description: 'Server-Sent Events connection streaming real-time deliveries, scorecards, and commentary.',
      parameters: [{ name: 'id', in: 'path', required: true, description: 'Match identifier', type: 'string' }],
      responses: { '200': { description: 'SSE event stream initiated' } }
    },
    {
      method: 'POST',
      path: '/api/v1/scoring/matches/{id}/deliveries',
      tag: 'Scoring',
      summary: 'Record ball delivery with MCC Laws scoring',
      description: 'Submits a ball event with automatic strike rotation, extras accounting, and live broadcast.',
      authRequired: true,
      role: 'SCORER',
      parameters: [{ name: 'id', in: 'path', required: true, description: 'Match identifier', type: 'string' }],
      requestBody: { runs: 4, legal_ball: true, is_wicket: false },
      responses: { '201': { description: 'Delivery recorded and broadcasted' } }
    },

    // Tournaments
    {
      method: 'POST',
      path: '/api/v1/tournaments',
      tag: 'Tournaments',
      summary: 'Create tournament bracket',
      description: 'Registers a new tournament with round-robin or knockout format.',
      authRequired: true,
      role: 'ORGANISER',
      requestBody: { name: 'Premier Cricket League', format: 'ROUND_ROBIN', team_count: 8 },
      responses: { '201': { description: 'Tournament created' } }
    },
    {
      method: 'POST',
      path: '/api/v1/tournaments/orchestrate',
      tag: 'Tournaments',
      summary: 'Autonomous tournament orchestrator & simulation',
      description: 'Runs complete end-to-end synthetic tournament with fixtures, bookings, scoring, standings, and payouts.',
      requestBody: { name: 'Invitational Cup', teamCount: 4, oversPerInnings: 5 },
      responses: { '200': { description: 'Tournament simulation and reconciliation complete' } }
    },
    {
      method: 'GET',
      path: '/api/v1/tournaments/{id}/standings',
      tag: 'Tournaments',
      summary: 'Fetch tournament standings & Net Run Rate',
      description: 'Retrieves ranked points table with ICC Net Run Rate (NRR) and multi-tier tie-breakers.',
      parameters: [{ name: 'id', in: 'path', required: true, description: 'Tournament identifier', type: 'string' }],
      responses: { '200': { description: 'Current standings table' } }
    },

    // Settlements & Disputes
    {
      method: 'POST',
      path: '/api/v1/disputes/{id}/resolve',
      tag: 'Disputes & Trust',
      summary: 'Resolve operational dispute with balanced auto-refund',
      description: 'Settles incident, applies provider rating delta, and issues zero-sum double-entry refund.',
      authRequired: true,
      role: 'ADMIN',
      parameters: [{ name: 'id', in: 'path', required: true, description: 'Dispute identifier', type: 'string' }],
      requestBody: { resolution: 'PROVIDER_FAULT', refundAmountMinor: 100000 },
      responses: { '200': { description: 'Dispute resolved and journal created' } }
    },
    {
      method: 'POST',
      path: '/api/v1/payouts/disburse',
      tag: 'Settlement',
      summary: 'Disburse provider payouts from escrow',
      description: 'Validates trust standing, absence of active disputes, and issues balanced ledger disbursement.',
      authRequired: true,
      role: 'ADMIN',
      requestBody: { bookingId: 'bk-12345' },
      responses: { '200': { description: 'Payout disbursed successfully' } }
    }
  ];

  const paths: Record<string, Record<string, unknown>> = {};

  for (const ep of endpoints) {
    if (!paths[ep.path]) {
      paths[ep.path] = {};
    }
    const methodKey = ep.method.toLowerCase();
    paths[ep.path]![methodKey] = {
      tags: [ep.tag],
      summary: ep.summary,
      description: ep.description,
      parameters: ep.parameters?.map(p => ({
        name: p.name,
        in: p.in,
        required: p.required,
        description: p.description,
        schema: { type: p.type }
      })),
      requestBody: ep.requestBody ? {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              example: ep.requestBody
            }
          }
        }
      } : undefined,
      responses: ep.responses
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'CricOS Unified Cricket Platform API',
      version: '1.0.0-phase1u',
      description: 'Autonomous operating system for cricket: tournament scheduling, provider marketplace, MCC Laws ball-by-ball scoring, real-time SSE broadcast, Bayesian reputation, and double-entry financial settlements.',
      contact: {
        name: 'CricOS Engineering',
        url: 'https://github.com/manvenpratap/CricOS.git'
      }
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Development & Test Server' }
    ],
    tags: [
      { name: 'Observability', description: 'Cloud-native probes, Prometheus metrics, and system telemetry' },
      { name: 'Identity', description: 'User authentication and cryptographic JWT token management' },
      { name: 'Marketplace', description: 'Provider service slot availability and escrow bookings' },
      { name: 'Scoring', description: 'MCC Laws ball-by-ball live scoring engine and SSE broadcasts' },
      { name: 'Tournaments', description: 'Bracket scheduling, standings, and autonomous tournament orchestration' },
      { name: 'Disputes & Trust', description: 'Provider Bayesian ratings, circuit breakers, and dispute resolution' },
      { name: 'Settlement', description: 'Double-entry ledger reconciliation and payout disbursements' }
    ],
    paths
  };
}

export function getApiDocsHtml(): string {
  const spec = generateOpenApiSpec();
  const specJson = JSON.stringify(spec, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CricOS — API Documentation & Architecture Showcase</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090D16;
      --card-bg: rgba(18, 24, 38, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --primary: #10B981;
      --cyan: #06B6D4;
      --amber: #F59E0B;
      --rose: #F43F5E;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      padding-bottom: 4rem;
    }
    header {
      background: rgba(9, 13, 22, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; background: rgba(16,185,129,0.15); color: var(--primary); font-weight: 600; border: 1px solid rgba(16,185,129,0.3); }
    .container { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
    .hero { margin-bottom: 2.5rem; }
    .hero h1 { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    .hero p { color: var(--text-muted); font-size: 1.1rem; max-width: 800px; }
    
    .nav-links { display: flex; gap: 1rem; margin-top: 1rem; }
    .nav-btn { color: var(--primary); text-decoration: none; font-weight: 600; font-size: 0.9rem; padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px; background: rgba(255,255,255,0.02); transition: all 0.2s; }
    .nav-btn:hover { background: rgba(16,185,129,0.1); border-color: var(--primary); }

    .tag-section { margin-bottom: 2.5rem; }
    .tag-title { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #E2E8F0; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; }
    
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 1rem;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .endpoint-card:hover { border-color: rgba(255, 255, 255, 0.2); }
    .endpoint-header {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    }
    .method-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      min-width: 65px;
      text-align: center;
    }
    .method-get { background: rgba(6, 182, 212, 0.15); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.3); }
    .method-post { background: rgba(16, 185, 129, 0.15); color: var(--primary); border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-delete { background: rgba(244, 63, 94, 0.15); color: var(--rose); border: 1px solid rgba(244, 63, 94, 0.3); }
    
    .endpoint-path { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 600; color: #F8FAFC; }
    .endpoint-summary { color: var(--text-muted); font-size: 0.9rem; margin-left: auto; }
    
    .endpoint-body {
      padding: 1.25rem;
      border-top: 1px solid var(--border);
      background: rgba(0, 0, 0, 0.2);
    }
    .desc { color: #CBD5E1; margin-bottom: 1rem; font-size: 0.95rem; }
    pre {
      background: #060910;
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: #38BDF8;
      overflow-x: auto;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>🏏 CricOS API Showcase</span>
      <span class="badge">OpenAPI 3.0</span>
    </div>
    <div style="font-size: 0.85rem; color: var(--text-muted);">
      Server: <span style="color: var(--primary); font-family: 'JetBrains Mono';">http://localhost:3000</span>
    </div>
  </header>

  <div class="container">
    <div class="hero">
      <h1>API Architecture & Operational Catalog</h1>
      <p>Interactive reference for the Unified Cricket Platform API. Fully verified under the Minimal Tokens Protocol and monitored with Prometheus telemetry.</p>
      <div class="nav-links">
        <a class="nav-btn" href="/api/v1/openapi.json" target="_blank" data-tooltip="View raw OpenAPI 3.0 JSON specification">📄 Raw OpenAPI JSON</a>
        <a class="nav-btn" href="/metrics" target="_blank" data-tooltip="View live Prometheus metrics exposition">📊 Prometheus Metrics</a>
        <a class="nav-btn" href="/health/metrics" target="_blank" data-tooltip="View JSON telemetry probes">⚡ Health Telemetry</a>
        <a class="nav-btn" href="/" data-tooltip="Switch to Interactive Testing Console">🎮 Testing Console</a>
      </div>
    </div>

    <!-- Observability & Probes -->
    <div class="tag-section">
      <div class="tag-title">⚡ Observability & System Probes</div>
      
      <div class="endpoint-card">
        <div class="endpoint-header" data-tooltip="Click to inspect endpoint">
          <span class="method-badge method-get">GET</span>
          <span class="endpoint-path">/health/live</span>
          <span class="endpoint-summary">Process Liveness Probe</span>
        </div>
        <div class="endpoint-body">
          <div class="desc">Lightweight process liveness endpoint returning HTTP 200 OK and uptime. Used for Kubernetes/Docker container health probes.</div>
          <pre>curl -s http://localhost:3000/health/live</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header" data-tooltip="Click to inspect endpoint">
          <span class="method-badge method-get">GET</span>
          <span class="endpoint-path">/metrics</span>
          <span class="endpoint-summary">Prometheus Metrics Text</span>
        </div>
        <div class="endpoint-body">
          <div class="desc">Prometheus / OpenMetrics standard text exposition for scrapers and collectors. Emits counters, gauges, histograms, and event loop lag.</div>
          <pre>curl -s http://localhost:3000/metrics</pre>
        </div>
      </div>
    </div>

    <!-- Scoring & Live Engine -->
    <div class="tag-section">
      <div class="tag-title">🏏 Ball-by-Ball Live Scoring & SSE Broadcast</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-badge method-get">GET</span>
          <span class="endpoint-path">/api/v1/scoring/matches/{id}/live</span>
          <span class="endpoint-summary">Real-time SSE Live Match Stream</span>
        </div>
        <div class="endpoint-body">
          <div class="desc">Subscribes client to Server-Sent Events stream delivering live delivery events, striker updates, and commentary feed.</div>
          <pre>curl -N http://localhost:3000/api/v1/scoring/matches/101/live</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-badge method-post">POST</span>
          <span class="endpoint-path">/api/v1/scoring/matches/{id}/deliveries</span>
          <span class="endpoint-summary">Record Delivery (MCC Laws Engine)</span>
        </div>
        <div class="endpoint-body">
          <div class="desc">Records ball event with dynamic strike rotation, maiden over tracking, bowler figures, and automatic pub/sub broadcast.</div>
          <pre>curl -X POST http://localhost:3000/api/v1/scoring/matches/101/deliveries \\
  -H "Content-Type: application/json" \\
  -d '{"runs": 4, "legal_ball": true, "is_wicket": false}'</pre>
        </div>
      </div>
    </div>

    <!-- Tournaments -->
    <div class="tag-section">
      <div class="tag-title">🏆 Tournaments & Synthetic Orchestration</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-badge method-post">POST</span>
          <span class="endpoint-path">/api/v1/tournaments/orchestrate</span>
          <span class="endpoint-summary">Autonomous Tournament Orchestrator</span>
        </div>
        <div class="endpoint-body">
          <div class="desc">Orchestrates complete tournament: generates fixtures, books service slots with escrow hold, simulates matches, updates NRR, and verifies double-entry balance.</div>
          <pre>curl -X POST http://localhost:3000/api/v1/tournaments/orchestrate \\
  -H "Content-Type: application/json" \\
  -d '{"teamCount": 4, "oversPerInnings": 5}'</pre>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
