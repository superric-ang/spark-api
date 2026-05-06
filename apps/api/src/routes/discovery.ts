import { Router } from 'express';
import { supabase } from '../server';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// GET /discovery/stack - get today's match cards
router.get('/stack', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user profile for filters and limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, daily_cards_used, daily_cards_reset_at, match_mode, flow_weight, depth_weight')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Check daily limit
    const now = new Date();
    const resetTime = profile.daily_cards_reset_at ? new Date(profile.daily_cards_reset_at) : new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (now > resetTime) {
      // Reset counter
      await supabase
        .from('profiles')
        .update({ daily_cards_used: 0, daily_cards_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000) })
        .eq('id', userId);
      profile.daily_cards_used = 0;
    }

    const limits = { free: 10, plus: 30, gold: 100 };
    const limit = limits[profile.subscription_tier as keyof typeof limits] || 10;

    if (profile.daily_cards_used >= limit) {
      return res.json({ candidates: [], limit_reached: true });
    }

    // Call matching service
    const weights = {
      flow: profile.match_mode === 'blend' ? profile.flow_weight : (profile.match_mode === 'flow' ? 1 : 0),
      depth: profile.match_mode === 'blend' ? profile.depth_weight : (profile.match_mode === 'depth' ? 1 : 0)
    };

    // For MVP, return mock candidates. In production, call the Python service
    const mockCandidates = [
      {
        profile: {
          id: 'mock1',
          name: 'Alex',
          birthdate: '1995-01-01',
          intent: 'casual',
          photos: [{ url: 'https://example.com/photo1.jpg', is_primary: true, is_verified: false, order: 0 }],
          city: 'Singapore'
        },
        scores: { overall: 0.85 },
        breakdown: { values: 0.8, lifestyle: 0.9, goals: 0.8 },
        engine_source: 'depth'
      }
    ];

    res.json({ candidates: mockCandidates });
  } catch (error) {
    console.error('Get stack error:', error);
    res.status(500).json({ error: 'Failed to get discovery stack' });
  }
});

// POST /discovery/action - record a swipe action
router.post('/action', authenticateUser, async (req, res) => {
  try {
    const { target_id, action, engine_source, scroll_depth, time_spent_ms } = req.body;
    const actor_id = req.user!.id;

    // Insert action
    const { data: actionData, error: actionError } = await supabase
      .from('actions')
      .insert({
        actor_id,
        target_id,
        action,
        engine_source,
        scroll_depth: scroll_depth || 0,
        time_spent_ms: time_spent_ms || 0
      })
      .select()
      .single();

    if (actionError) throw actionError;

    // Check for mutual like
    if (action === 'like' || action === 'superlike') {
      const { data: mutualAction } = await supabase
        .from('actions')
        .select('*')
        .eq('actor_id', target_id)
        .eq('target_id', actor_id)
        .eq('action', 'like')
        .or('action.eq.superlike')
        .single();

      if (mutualAction) {
        // Create match
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_a: actor_id < target_id ? actor_id : target_id,
            user_b: actor_id < target_id ? target_id : actor_id,
            compatibility_score: 0.8, // Would calculate this
            compatibility_breakdown: { values: 0.8, lifestyle: 0.7, goals: 0.9 },
            engine_source: engine_source || 'blend'
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // TODO: Send push notification
      }
    }

    // Increment daily counter
    await supabase.rpc('increment', { row_id: actor_id, column_name: 'daily_cards_used' });

    res.json({ success: true });
  } catch (error) {
    console.error('Action error:', error);
    res.status(500).json({ error: 'Failed to record action' });
  }
});

export default router;