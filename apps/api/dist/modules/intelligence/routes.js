import { calculateMvpImpactPoints, generateMatchNarrative } from '@cricket-platform/domain';
export async function intelligenceRoutes(app) {
    // ── P1-010: Player of the Match (MVP) Impact Scorecard ───────────────────────
    app.get('/analytics/matches/:id/mvp', async (req, reply) => {
        const { id } = req.params;
        // Sample player performances for match
        const samplePerformers = [
            {
                player_id: 'p-01',
                player_name: 'Virat K.',
                team_name: 'Northside XI',
                runs: 74,
                balls_faced: 42,
                fours: 8,
                sixes: 3,
                overs_bowled: 0,
                maidens: 0,
                runs_conceded: 0,
                wickets: 0,
                catches: 2,
                stumpings: 0,
                run_outs: 0
            },
            {
                player_id: 'p-02',
                player_name: 'Jasprit B.',
                team_name: 'Northside XI',
                runs: 4,
                balls_faced: 3,
                fours: 0,
                sixes: 0,
                overs_bowled: 4,
                maidens: 1,
                runs_conceded: 18,
                wickets: 3,
                catches: 0,
                stumpings: 0,
                run_outs: 1
            },
            {
                player_id: 'p-03',
                player_name: 'David W.',
                team_name: 'Riverside XI',
                runs: 58,
                balls_faced: 38,
                fours: 6,
                sixes: 2,
                overs_bowled: 0,
                maidens: 0,
                runs_conceded: 0,
                wickets: 0,
                catches: 1,
                stumpings: 0,
                run_outs: 0
            },
            {
                player_id: 'p-04',
                player_name: 'Rashid K.',
                team_name: 'Riverside XI',
                runs: 14,
                balls_faced: 8,
                fours: 1,
                sixes: 1,
                overs_bowled: 4,
                maidens: 0,
                runs_conceded: 24,
                wickets: 2,
                catches: 1,
                stumpings: 0,
                run_outs: 0
            }
        ];
        const scorecard = calculateMvpImpactPoints(id, samplePerformers);
        const potm = scorecard.find(p => p.is_potm);
        return reply.status(200).send({
            match_id: id,
            player_of_the_match: potm,
            rankings: scorecard
        });
    });
    // ── P2-001: AI Match Narrative & Turning Point Detection ─────────────────────
    app.get('/analytics/matches/:id/insights', async (req, reply) => {
        const { id } = req.params;
        const narrative = generateMatchNarrative(id, {
            teamA: 'Northside XI',
            teamB: 'Riverside XI',
            innings1: { runs: 168, wickets: 6, overs: 20 },
            innings2: { runs: 169, wickets: 5, overs: 19.3, target: 169 },
            winner: 'Riverside XI',
            topBatter: { name: 'Virat K.', runs: 74, balls: 42 },
            topBowler: { name: 'Jasprit B.', wickets: 3, runs: 18, overs: 4 }
        });
        return reply.status(200).send(narrative);
    });
    // ── P2-002: Smart Procurement Recommendations ────────────────────────────────
    app.get('/recommendations/procurement', async (req, reply) => {
        return reply.status(200).send([
            {
                category: 'VENUE',
                recommended_id: '00000000-0000-0000-0000-000000000001',
                title: 'Harbour Cricket Ground - Pitch 1',
                match_score: 96,
                trust_rating: 98,
                price_minor: 350000,
                rationale: 'Top rated venue for T20 night matches. High-lux floodlights and pristine Bermuda grass pitch.'
            },
            {
                category: 'OFFICIAL',
                recommended_id: '00000000-0000-0000-0000-000000000002',
                title: 'Elite Certified Umpire',
                match_score: 94,
                trust_rating: 94,
                price_minor: 250000,
                rationale: 'BCCI Level 1 certified official with 100% on-time check-in history and zero contested decisions.'
            },
            {
                category: 'SCORER',
                recommended_id: 'scorer-001',
                title: 'Arjun Mehta (Digital Scorer)',
                match_score: 92,
                trust_rating: 98,
                price_minor: 120000,
                rationale: 'Experienced digital scorer with tablet hardware and live ball-by-ball broadcast sync expertise.'
            }
        ]);
    });
    // ── P2-005: Broadcast Graphic Overlay Feed ───────────────────────────────────
    app.get('/broadcast/matches/:id/overlay', async (req, reply) => {
        const { id } = req.params;
        return reply.status(200).send({
            match_id: id,
            batting_team: 'Riverside XI',
            bowling_team: 'Northside XI',
            runs: 142,
            wickets: 3,
            overs: '16.4',
            target: 169,
            required_runs: 27,
            remaining_balls: 20,
            current_run_rate: 8.52,
            required_run_rate: 8.10,
            striker: { name: 'David W.', runs: 58, balls: 38 },
            non_striker: { name: 'Glenn M.', runs: 24, balls: 14 },
            bowler: { name: 'Jasprit B.', overs: '3.4', maidens: 1, runs: 18, wickets: 3 },
            recent_deliveries: ['1', '4', '•', '2', 'Wd', '1']
        });
    });
    // ── P1-008: Social Activity Feed & Sharing ───────────────────────────────────
    const socialFeedStore = [
        {
            id: 'act-001',
            actor_id: '00000000-0000-0000-0000-000000000001',
            actor_name: 'Virat K.',
            action_type: 'CENTURY',
            title: 'Majestic Century!',
            details: 'Virat K. scored an unbeaten 102 off 54 deliveries for Northside XI.',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
            id: 'act-002',
            actor_id: '00000000-0000-0000-0000-000000000002',
            actor_name: 'Jasprit B.',
            action_type: 'WICKET_FALL',
            title: 'Crucial Breakthrough',
            details: 'Jasprit B. claims 3/18 in high-voltage final over thriller.',
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
        }
    ];
    app.get('/social/feed', async (_req, reply) => {
        return reply.status(200).send(socialFeedStore);
    });
    app.post('/social/follow', async (req, reply) => {
        const { target_id, target_type } = req.body || {};
        if (!target_id || !target_type) {
            return reply.status(400).send({ error: 'MISSING_FIELDS' });
        }
        return reply.status(200).send({
            user_id: '00000000-0000-0000-0000-000000000001',
            target_id,
            target_type,
            following: true,
            message: `Now following ${target_type.toLowerCase()} ${target_id}`
        });
    });
    app.get('/social/matches/:id/share', async (req, reply) => {
        const { id } = req.params;
        return reply.status(200).send({
            match_id: id,
            share_title: 'Live Match Broadcast on CricOS',
            share_description: 'Northside XI 168/6 vs Riverside XI 169/5 (19.4 ov). Riverside XI won by 5 wickets.',
            share_url: `https://cricos.app/matches/${id}`,
            og_image_url: `https://cricos.app/api/v1/matches/${id}/share-card.png`,
            twitter_share_url: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Live on CricOS: Riverside XI win thriller against Northside XI!')}&url=${encodeURIComponent(`https://cricos.app/matches/${id}`)}`
        });
    });
}
//# sourceMappingURL=routes.js.map