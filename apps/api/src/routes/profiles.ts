import { Router } from 'express';
import { supabase } from '../server';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// GET /profiles/me - get own profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /profiles/me - update profile
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'name', 'birthdate', 'gender', 'orientation', 'intent',
      'match_mode', 'flow_weight', 'depth_weight', 'bio_prompts',
      'location', 'city'
    ];

    const filteredUpdates: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /profiles/:id - get another user's public profile
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, birthdate, gender, orientation, intent, bio_prompts, photos, city, is_verified, trust_score, last_active')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(404).json({ error: 'Profile not found' });
  }
});

// POST /profiles/me/photos - upload photo URL
router.post('/me/photos', authenticateUser, async (req, res) => {
  try {
    const { url, is_primary = false } = req.body;

    // Get current photos
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', req.user!.id)
      .single();

    if (fetchError) throw fetchError;

    const photos = profile.photos || [];
    const newPhoto = {
      url,
      is_primary,
      is_verified: false,
      order: photos.length
    };

    // If primary, unset other primaries
    if (is_primary) {
      photos.forEach((photo: any) => photo.is_primary = false);
    }

    photos.push(newPhoto);

    const { data, error } = await supabase
      .from('profiles')
      .update({ photos })
      .eq('id', req.user!.id)
      .select('photos')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// DELETE /profiles/me/photos/:index - remove photo
router.delete('/me/photos/:index', authenticateUser, async (req, res) => {
  try {
    const indexParam = req.params.index;
const index = parseInt(Array.isArray(indexParam) ? indexParam[0] : indexParam);

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', req.user!.id)
      .single();

    if (fetchError) throw fetchError;

    const photos = profile.photos || [];
    if (index < 0 || index >= photos.length) {
      return res.status(400).json({ error: 'Invalid photo index' });
    }

    photos.splice(index, 1);

    // Reorder remaining photos
    photos.forEach((photo: any, i: number) => photo.order = i);

    const { data, error } = await supabase
      .from('profiles')
      .update({ photos })
      .eq('id', req.user!.id)
      .select('photos')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;