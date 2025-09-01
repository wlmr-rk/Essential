# Implementation Plan

- [x] 1. Configure SvelteKit for Remote Functions and Async Svelte
  - Update svelte.config.js to enable experimental Remote Functions and Async Svelte features
  - Verify Bun development environment is properly configured
  - Test basic SvelteKit functionality with existing skeleton
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Set up database schema and authentication helpers
  - Create Drizzle schema definitions for sleep_logs, habits, habit_logs, mood_logs, and workout_logs tables
  - Implement Row Level Security (RLS) policies for all tables to ensure user data isolation
  - Create requireUser authentication helper function for server-side user validation
  - Set up database migrations and verify Supabase connection
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2.1. Implement authentication UI and user management
  - Create Supabase client configuration for browser and server
  - Implement GitHub OAuth login page with loading states and error handling
  - Create auth callback handler for OAuth flow completion
  - Build authentication store for managing user state across the app
  - Create protected navigation with user avatar and dropdown menu
  - Implement automatic redirects based on authentication state
  - Create landing page for unauthenticated users and basic dashboard for authenticated users
  - Add sign-out functionality and session management
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. Implement timezone-aware time management utilities
  - Create Temporal API utilities for Asia/Manila timezone handling
  - Implement getTodayLocalDate function for consistent date handling
  - Create localTimeToInstant conversion function for timezone-aware timestamps
  - Implement calculateSleepDuration function to handle sleep sessions crossing midnight
  - Write unit tests for time utility functions using Bun test runner
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 4. Create sleep tracking Remote Functions
  - Implement getTodaySleep query function to retrieve sleep data for a specific date
  - Create upsertSleep command function with optimistic UI support using withOverride
  - Implement sleep duration calculation and scoring logic
  - Add server-side validation for sleep time inputs
  - Write unit tests for sleep Remote Functions using Bun test runner
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5. Build SleepCard component with optimistic UI
  - Create SleepCard component following the established card pattern
  - Implement edit/display mode switching with form validation
  - Add optimistic updates using sleepData.withOverride() for immediate UI feedback
  - Implement error handling with automatic rollback on failure
  - Add loading states with skeleton components
  - Sync form inputs with current sleep data using $effect
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Create habits tracking system
  - Implement getTodayHabits query function to retrieve habit completion status
  - Create upsertHabits command function with weighted habit support
  - Implement habit scoring logic using weighted completion percentages
  - Add server-side validation for habit data
  - Write unit tests for habits Remote Functions using Bun test runner
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. Build HabitsCard component with weighted scoring
  - Create HabitsCard component with habit list and completion toggles
  - Implement weighted habit scoring display and calculation
  - Add optimistic updates for habit completion status changes
  - Implement error handling and loading states
  - Add ability to toggle individual habit completion with immediate UI feedback
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4_

- [x] 8. Create mood logging Remote Functions
  - Implement getTodayMood query function to retrieve mood rating for a specific date
  - Create upsertMood command function with 1-5 scale validation
  - Implement mood scoring logic mapping 1-5 scale to 0-100 percentage
  - Add server-side validation for mood rating inputs
  - Write unit tests for mood Remote Functions using Bun test runner
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Build MoodCard component with rating interface
  - Create MoodCard component with 1-5 rating scale interface
  - Implement optimistic updates for mood rating changes
  - Add visual feedback for selected mood rating
  - Implement error handling and loading states
  - Add empty state display when no mood is logged
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4_

- [x] 10. Create workout tracking Remote Functions
  - Implement getTodayWorkouts query function to retrieve workout completion status
  - Create upsertWorkouts command function supporting running and calisthenics toggles
  - Implement workout scoring logic (full points for any completed workout)
  - Add server-side validation for workout data
  - Write unit tests for workout Remote Functions using Bun test runner
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 11. Build WorkoutsCard component with activity toggles
  - Create WorkoutsCard component with running and calisthenics toggle buttons
  - Implement optimistic updates for workout completion status
  - Add visual feedback for completed workout types
  - Implement error handling and loading states
  - Add empty state display when no workouts are completed
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4_

- [x] 12. Implement daily scoring system
  - Create getDayScore query function with weighted component calculation (Sleep 30%, Habits 30%, Mood 20%, Workouts 20%)
  - Implement component scoring algorithms for sleep, habits, mood, and workouts
  - Add score breakdown display and contextual tips generation
  - Implement automatic score recalculation when any component is updated
  - Write unit tests for scoring algorithms and edge cases using Bun test runner
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 13. Build DayScoreCard component with breakdown display
  - Create DayScoreCard component showing total score and component breakdown
  - Implement visual score representation with progress indicators
  - Add contextual tips display based on score breakdown
  - Implement automatic updates when component scores change
  - Add loading states and error handling for score calculations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1, 7.2, 7.3_

- [x] 14. Enhance main dashboard layout with tracking cards
  - Integrate all tracking cards (Sleep, Habits, Mood, Workouts, DayScore) into existing dashboard
  - Replace placeholder quick stats cards with functional tracking components
  - Add dashboard header with current date display and navigation
  - Ensure proper card ordering and responsive behavior across device sizes
  - Connect quick action buttons to their respective tracking functions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Implement global error boundary and loading states
  - Add svelte:boundary to +layout.svelte for global error handling
  - Create consistent loading skeleton components for all cards
  - Implement user-friendly error messages with retry options
  - Add global error state management and user feedback
  - Test error scenarios and recovery mechanisms
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_

- [ ] 16. Add comprehensive error handling and validation
  - Implement client-side form validation for all input components
  - Add server-side validation in all Remote Functions
  - Create consistent error message display across all components
  - Implement graceful error recovery and user guidance
  - Add validation for edge cases (invalid times, out-of-range values)
  - _Requirements: 1.5, 2.5, 3.5, 4.5, 6.5, 7.4, 7.5_

- [ ] 17. Write comprehensive test suite
  - Create unit tests for all Remote Functions (queries and commands) using Bun test runner
  - Write component tests for all card components using Testing Library and Bun
  - Add integration tests for optimistic UI update/rollback scenarios with Bun
  - Create end-to-end tests for complete user workflows using Playwright
  - Test timezone handling and edge cases in time calculations with Bun
  - Add performance tests for scoring calculations and database operations using Bun
  - _Requirements: All requirements validation through automated testing_

- [ ] 18. Optimize performance and finalize deployment
  - Optimize bundle size and implement code splitting
  - Add database query optimization and indexing
  - Implement proper caching strategies for Remote Functions
  - Test application performance under various network conditions
  - Verify Vercel deployment configuration and environment variables
  - Conduct final user acceptance testing and bug fixes
  - _Requirements: 7.1, 7.2, 7.3, 7.6_