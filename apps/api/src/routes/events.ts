import { Router } from 'express';
import { supabase } from '../server';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// GET /events - list upcoming events
router.get('/', authenticateUser, async (req, res) => {
  try {
    const city = req.query.city as string;
    const limit = parseInt(req.query.limit as string) || 20;

    let query = supabase
      .from('events')
      .select(`
        *,
        event_attendees(count)
      `)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(limit);

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// GET /events/:id - single event
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_attendees(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(404).json({ error: 'Event not found' });
  }
});

// POST /events/:id/attend - RSVP
router.post('/:id/attend', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'going' } = req.body;
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('event_attendees')
      .upsert({
        event_id: id,
        user_id: userId,
        status
      }, { onConflict: 'event_id,user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

// DELETE /events/:id/attend - cancel RSVP
router.delete('/:id/attend', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ error: 'Failed to cancel RSVP' });
  }
});

export default router;