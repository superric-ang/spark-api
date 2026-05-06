import { Router } from 'express';
import { supabase } from '../server';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// GET /matches - get all matches with last message preview
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.id;

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:profiles!matches_user_a_fkey(id, name, photos),
        user_b:profiles!matches_user_b_fkey(id, name, photos),
        messages(count)
      `)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('matched_at', { ascending: false });

    if (error) throw error;

    // Get last message for each match
    const matchesWithPreview = await Promise.all(
      matches.map(async (match: any) => {
        const otherUser = match.user_a.id === userId ? match.user_b : match.user_a;

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', match.id)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...match,
          other_user: otherUser,
          last_message: lastMessage || null
        };
      })
    );

    res.json(matchesWithPreview);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// GET /matches/:id - get single match with full compatibility breakdown
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:profiles!matches_user_a_fkey(id, name, photos, bio_prompts),
        user_b:profiles!matches_user_b_fkey(id, name, photos, bio_prompts)
      `)
      .eq('id', id)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .single();

    if (error) throw error;

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(404).json({ error: 'Match not found' });
  }
});

// GET /matches/:id/messages - paginated message history
router.get('/:id/messages', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Verify user is in match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', id)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .single();

    if (matchError || !match) {
      return res.status(403).json({ error: 'Not authorized to view messages' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', id)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /matches/:id/messages - send a message
router.post('/:id/messages', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'text' } = req.body;
    const senderId = req.user!.id;

    // Verify user is in match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, conversation_started')
      .eq('id', id)
      .or(`user_a.eq.${senderId},user_b.eq.${senderId}`)
      .single();

    if (matchError || !match) {
      return res.status(403).json({ error: 'Not authorized to send message' });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: id,
        sender_id: senderId,
        content,
        type
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation_started if first message
    if (!match.conversation_started) {
      await supabase
        .from('matches')
        .update({ conversation_started: true })
        .eq('id', id);
    }

    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /matches/:id - unmatch
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify user is in match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', id)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .single();

    if (matchError || !match) {
      return res.status(403).json({ error: 'Not authorized to unmatch' });
    }

    // Delete match (this will cascade to messages)
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ error: 'Failed to unmatch' });
  }
});

export default router;