-- Row Level Security (RLS) policies for QSelf Dashboard
-- This file should be run after the main migration to set up data isolation

-- Enable RLS on all tables
ALTER TABLE "sleep_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "habits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "habit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mood_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_logs" ENABLE ROW LEVEL SECURITY;

-- Sleep logs policies
CREATE POLICY "Users manage own sleep logs" ON "sleep_logs"
  FOR ALL TO authenticated 
  USING (auth.uid()::text = user_id);

-- Habits policies
CREATE POLICY "Users manage own habits" ON "habits"
  FOR ALL TO authenticated 
  USING (auth.uid()::text = user_id);

-- Habit logs policies
CREATE POLICY "Users manage own habit logs" ON "habit_logs"
  FOR ALL TO authenticated 
  USING (auth.uid()::text = user_id);

-- Mood logs policies
CREATE POLICY "Users manage own mood logs" ON "mood_logs"
  FOR ALL TO authenticated 
  USING (auth.uid()::text = user_id);

-- Workout logs policies
CREATE POLICY "Users manage own workout logs" ON "workout_logs"
  FOR ALL TO authenticated 
  USING (auth.uid()::text = user_id);