import { Router } from 'express';
import { supabase } from '../server';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Quiz questions data (would be in DB in production)
const QUIZ_QUESTIONS = [
  { id: 1, question: "What's your ideal weekend?", category: "lifestyle", options: ["Relaxing at home", "Exploring new places", "Socializing with friends", "Working on personal projects"] },
  { id: 2, question: "How do you handle conflict?", category: "conflict", options: ["Talk it out calmly", "Give space then discuss", "Avoid confrontation", "Address it directly"] },
  // Add more questions...
];

// GET /quiz/questions - get all questions
router.get('/questions', authenticateUser, async (req, res) => {
  res.json(QUIZ_QUESTIONS);
});

// GET /quiz/answers - get user's current answers
router.get('/answers', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get quiz answers error:', error);
    res.status(500).json({ error: 'Failed to get quiz answers' });
  }
});

// POST /quiz/answers - upsert one or many answers
router.post('/answers', authenticateUser, async (req, res) => {
  try {
    const answers = Array.isArray(req.body) ? req.body : [req.body];
    const userId = req.user!.id;

    const upsertData = answers.map((answer: any) => ({
      user_id: userId,
      question_id: answer.question_id,
      question_text: answer.question_text,
      answer_value: answer.answer_value,
      answer_weight: answer.answer_weight
    }));

    const { data, error } = await supabase
      .from('quiz_answers')
      .upsert(upsertData, { onConflict: 'user_id,question_id' })
      .select();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Upsert quiz answers error:', error);
    res.status(500).json({ error: 'Failed to save quiz answers' });
  }
});

// GET /quiz/completion - return % completed
router.get('/completion', authenticateUser, async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('quiz_answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user!.id);

    if (error) throw error;

    const totalQuestions = QUIZ_QUESTIONS.length;
    const completion = Math.round(((count ?? 0) / totalQuestions) * 100);

    res.json({ completion, answered: count, total: totalQuestions });
  } catch (error) {
    console.error('Get quiz completion error:', error);
    res.status(500).json({ error: 'Failed to get quiz completion' });
  }
});

export default router;