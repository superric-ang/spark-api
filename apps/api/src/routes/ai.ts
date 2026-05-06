import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { AIService } from '../services/aiProvider';

const router = Router();

// POST /ai/conversation-assist
router.post('/conversation-assist', authenticateUser, async (req, res) => {
  try {
    const { match_id, context_messages } = req.body;
    const matchDetails = 'Match context here'; // Would fetch from DB

    const result = await AIService.getConversationAssistance(matchDetails, context_messages);
    res.json(result);
  } catch (error) {
    console.error('Conversation assist error:', error);
    res.status(500).json({ error: 'Failed to get conversation assistance' });
  }
});

// POST /ai/profile-coach
router.post('/profile-coach', authenticateUser, async (req, res) => {
  try {
    const { profile } = req.body;
    const result = await AIService.getProfileCoaching(profile);
    res.json(result);
  } catch (error) {
    console.error('Profile coach error:', error);
    res.status(500).json({ error: 'Failed to get profile coaching' });
  }
});

// POST /ai/fate-rationale
router.post('/fate-rationale', authenticateUser, async (req, res) => {
  try {
    const { user_profile, match_profile, diff_dimensions } = req.body;
    const result = await AIService.getFateRationale(user_profile, match_profile, diff_dimensions);
    res.json(result);
  } catch (error) {
    console.error('Fate rationale error:', error);
    res.status(500).json({ error: 'Failed to generate fate rationale' });
  }
});

export default router;