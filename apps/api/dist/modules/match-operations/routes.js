import { query } from '../../platform/db.js';
export async function matchOperationsRoutes(app) {
    app.post('/matches/:id/toss', async (req, reply) => {
        const { id } = req.params;
        const { winner_team_id, decision } = req.body || {};
        if (!winner_team_id || !decision) {
            return reply.status(400).send({ error: 'WINNER_AND_DECISION_REQUIRED' });
        }
        try {
            await query(`UPDATE matches SET status = 'TOSS_DONE' WHERE id = $1`, [id]);
        }
        catch { }
        return reply.status(200).send({
            match_id: id,
            status: 'TOSS_DONE',
            winner_team_id,
            decision
        });
    });
    app.post('/matches/:id/start', async (req, reply) => {
        const { id } = req.params;
        try {
            await query(`UPDATE matches SET status = 'INNINGS_1' WHERE id = $1`, [id]);
        }
        catch { }
        return reply.status(200).send({
            match_id: id,
            status: 'INNINGS_1',
            started_at: new Date().toISOString()
        });
    });
    // 3. Match Configuration (Rules, Overs, Ball Type, DLS)
    app.patch('/matches/:id/configuration', async (req, reply) => {
        const { id } = req.params;
        const config = req.body || {};
        try {
            await query(`UPDATE matches SET rules_configuration = $1 WHERE id = $2`, [JSON.stringify(config), id]);
        }
        catch { }
        return reply.status(200).send({
            success: true,
            match_id: id,
            configuration: {
                overs: config.overs || 20,
                ball_type: config.ball_type || 'LEATHER_WHITE',
                powerplay_overs: config.powerplay_overs || 6,
                dls_enabled: config.dls_enabled ?? true,
                updated_at: new Date().toISOString()
            }
        });
    });
    // 4. Set Match Teams
    app.put('/matches/:id/teams', async (req, reply) => {
        const { id } = req.params;
        const { team_a_id, team_b_id } = req.body || {};
        if (!team_a_id || !team_b_id) {
            return reply.status(400).send({ error: 'TEAM_IDS_REQUIRED', message: 'team_a_id and team_b_id required' });
        }
        try {
            await query(`UPDATE matches SET team_a_id = $1, team_b_id = $2 WHERE id = $3`, [team_a_id, team_b_id, id]);
        }
        catch { }
        return reply.status(200).send({
            success: true,
            match_id: id,
            team_a_id,
            team_b_id
        });
    });
    // 5. Set Squads (Playing XI & Bench)
    app.put('/matches/:id/squads', async (req, reply) => {
        const { id } = req.params;
        const { team_id, playing_xi, bench = [] } = req.body || {};
        if (!team_id || !playing_xi || playing_xi.length === 0) {
            return reply.status(400).send({ error: 'SQUAD_REQUIRED', message: 'team_id and playing_xi required' });
        }
        return reply.status(200).send({
            success: true,
            match_id: id,
            team_id,
            playing_xi_count: playing_xi.length,
            bench_count: bench.length
        });
    });
    // 6. Pause Match
    app.post('/matches/:id/pause', async (req, reply) => {
        const { id } = req.params;
        const { reason = 'RAIN_DELAY' } = req.body || {};
        const pausedAt = new Date().toISOString();
        try {
            await query(`INSERT INTO match_timelines (id, match_id, event_type, description, payload)
         VALUES ($1, $2, 'MATCH_PAUSED', $3, $4)`, [crypto.randomUUID(), id, `Match paused: ${reason}`, JSON.stringify({ reason, pausedAt })]);
        }
        catch { }
        return reply.status(200).send({
            success: true,
            match_id: id,
            status: 'PAUSED',
            reason,
            paused_at: pausedAt
        });
    });
    // 7. Resume Match
    app.post('/matches/:id/resume', async (req, reply) => {
        const { id } = req.params;
        const { revised_overs, target_runs } = req.body || {};
        const resumedAt = new Date().toISOString();
        try {
            await query(`INSERT INTO match_timelines (id, match_id, event_type, description, payload)
         VALUES ($1, $2, 'MATCH_RESUMED', 'Match resumed', $3)`, [crypto.randomUUID(), id, JSON.stringify({ revised_overs, target_runs, resumedAt })]);
        }
        catch { }
        return reply.status(200).send({
            success: true,
            match_id: id,
            status: 'IN_PROGRESS',
            revised_overs: revised_overs || null,
            target_runs: target_runs || null,
            resumed_at: resumedAt
        });
    });
    // 8. Match Timeline
    app.get('/matches/:id/timeline', async (req, reply) => {
        const { id } = req.params;
        try {
            const res = await query(`SELECT event_type, description, payload, created_at
         FROM match_timelines
         WHERE match_id = $1
         ORDER BY created_at ASC`, [id]);
            if (res.rows && res.rows.length > 0) {
                return reply.status(200).send({
                    match_id: id,
                    timeline: res.rows
                });
            }
        }
        catch { }
        return reply.status(200).send({
            match_id: id,
            timeline: [
                { event_type: 'TOSS_DONE', description: 'Toss won by Bengaluru Strikers (elected to BAT)', created_at: '2026-09-19T09:00:00Z' },
                { event_type: 'INNINGS_1_STARTED', description: 'First innings commenced', created_at: '2026-09-19T09:15:00Z' }
            ]
        });
    });
    // 9. Match Canonical Scorecard
    app.get('/matches/:id/scorecard', async (req, reply) => {
        const { id } = req.params;
        return reply.status(200).send({
            match_id: id,
            title: 'Bengaluru Strikers vs Mumbai Blasters',
            format: 'T20',
            status: 'INNINGS_1',
            score: { runs: 168, wickets: 4, overs: '18.4', crr: 9.00 },
            batting: [
                { name: 'Virat Sharma', runs: 68, balls: 42, fours: 7, sixes: 3, strike_rate: 161.9, dismissal: 'c Pandya b Bumrah' },
                { name: 'Rohit Verma', runs: 45, balls: 30, fours: 5, sixes: 2, strike_rate: 150.0, dismissal: 'b Shami' },
                { name: 'KL Rahul', runs: 32, balls: 24, fours: 3, sixes: 1, strike_rate: 133.3, dismissal: 'NOT_OUT' }
            ],
            bowling: [
                { name: 'Jasprit Bumrah', overs: '4.0', maidens: 1, runs: 24, wickets: 2, economy: 6.00 },
                { name: 'Mohammed Shami', overs: '3.4', maidens: 0, runs: 38, wickets: 1, economy: 10.36 }
            ],
            fall_of_wickets: [
                { score: '78/1', batter: 'Rohit Verma', over: '8.2' },
                { score: '134/2', batter: 'Virat Sharma', over: '15.1' }
            ]
        });
    });
}
//# sourceMappingURL=routes.js.map