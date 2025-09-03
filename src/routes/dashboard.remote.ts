import { query } from '$app/server';
import { z } from 'zod';
import { getTodaySleep } from './sleep.remote';
import { getTodayHabits } from './habits.remote';
import { getTodayMood } from './mood.remote';
import { getTodayWorkouts } from './workout.remote';

const DashboardDataSchema = z.object({
  localDate: z.string()
});

export const getDashboardData = query(DashboardDataSchema, async ({ localDate }) => {
  const [sleep, habits, mood, workouts] = await Promise.all([
    getTodaySleep({ localDate }),
    getTodayHabits({ localDate }),
    getTodayMood({ localDate }),
    getTodayWorkouts({ localDate })
  ]);

  return {
    sleep,
    habits,
    mood,
    workouts
  };
});
