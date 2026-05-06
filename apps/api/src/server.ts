import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Routes
import profileRoutes from './routes/profiles';
import discoveryRoutes from './routes/discovery';
import matchRoutes from './routes/matches';
import quizRoutes from './routes/quiz';
import aiRoutes from './routes/ai';
import eventRoutes from './routes/events';
import paymentRoutes from './routes/payments';

// Load environment variables
const cwd = process.cwd();
const localEnvPath = path.join(cwd, '.env');
const rootEnvPath = path.join(cwd, '..', '..', '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Supabase clients - service role for server ops, anon for auth
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const supabaseAnon = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});