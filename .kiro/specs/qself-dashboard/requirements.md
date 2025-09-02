# Requirements Document

## Introduction

The QSelf Dashboard is a premium personal quantified-self tracking application built with SvelteKit 5 that provides an exceptional user experience for tracking and scoring daily wellness activities. The system features a completely overhauled UI/UX with a sophisticated design system, tracks sleep patterns, habit completion, mood levels, and workout presence, then calculates a weighted daily score with comprehensive historical visualization. The application uses modern web technologies including SvelteKit Remote Functions, optimistic UI patterns, Supabase for backend services, and Temporal API for timezone-aware time management, all wrapped in a premium, accessible, and highly polished interface.

## Requirements

### Requirement 1: Sleep Tracking System

**User Story:** As a user, I want to log my sleep patterns including bedtime and wake time, so that I can track my sleep duration and quality over time.

#### Acceptance Criteria

1. WHEN a user enters their bedtime and wake time THEN the system SHALL calculate and store the sleep duration in minutes
2. WHEN a user views their sleep data THEN the system SHALL display bedtime, wake time, and calculated duration in hours and minutes format
3. WHEN a user has not logged sleep data for today THEN the system SHALL show an empty state with an option to add sleep data
4. WHEN a user edits existing sleep data THEN the system SHALL update the record and recalculate the duration
5. IF a user enters invalid time data THEN the system SHALL display appropriate validation errors
6. WHEN sleep data is saved THEN the system SHALL automatically refresh the day score calculation

### Requirement 2: Habit Tracking System

**User Story:** As a user, I want to track my daily habits with weighted importance, so that I can monitor my consistency in completing important personal goals.

#### Acceptance Criteria

1. WHEN a user defines a habit THEN the system SHALL allow setting a weight value for importance scoring
2. WHEN a user marks a habit as complete for the day THEN the system SHALL record the completion timestamp
3. WHEN a user views their habits THEN the system SHALL display all habits with their completion status for the current day
4. WHEN calculating habit scores THEN the system SHALL use weighted completion percentages
5. WHEN a user toggles habit completion THEN the system SHALL immediately update the visual state and day score
6. IF no habits are completed THEN the habit score SHALL be 0

### Requirement 3: Mood Logging System

**User Story:** As a user, I want to log my daily mood on a 1-5 scale, so that I can track my emotional well-being patterns over time.

#### Acceptance Criteria

1. WHEN a user selects a mood rating THEN the system SHALL accept values from 1 (worst) to 5 (best)
2. WHEN a user saves their mood THEN the system SHALL store the rating with the current date and timestamp
3. WHEN calculating mood scores THEN the system SHALL map the 1-5 scale to a 0-100 percentage score
4. WHEN a user has not logged mood for today THEN the system SHALL show an empty state with rating options
5. WHEN a user changes their mood rating THEN the system SHALL update the existing record for the day
6. WHEN mood data is saved THEN the system SHALL automatically refresh the day score calculation

### Requirement 4: Workout Tracking System

**User Story:** As a user, I want to log whether I completed running or calisthenics workouts, so that I can track my physical activity consistency.

#### Acceptance Criteria

1. WHEN a user logs workout activity THEN the system SHALL allow toggling between running and calisthenics options
2. WHEN a user marks any workout as complete THEN the system SHALL record the workout type and completion status
3. WHEN calculating workout scores THEN the system SHALL assign full points for any completed workout type
4. WHEN a user has not logged workouts for today THEN the system SHALL show an empty state with workout options
5. WHEN a user toggles workout completion THEN the system SHALL immediately update the visual state and day score
6. IF no workouts are completed THEN the workout score SHALL be 0

### Requirement 5: Daily Scoring System

**User Story:** As a user, I want to see a weighted daily score based on my tracked activities, so that I can understand my overall wellness performance and identify areas for improvement.

#### Acceptance Criteria

1. WHEN calculating the daily score THEN the system SHALL use fixed weights: Sleep 30%, Habits 30%, Mood 20%, Workouts 20%
2. WHEN any tracked component is updated THEN the system SHALL automatically recalculate the total daily score
3. WHEN displaying the daily score THEN the system SHALL show both the total score and breakdown by component
4. WHEN the daily score is calculated THEN the system SHALL round the result to the nearest whole number
5. WHEN component scores are missing THEN the system SHALL treat them as 0 for calculation purposes
6. WHEN displaying score insights THEN the system SHALL generate contextual tips based on the component breakdown

### Requirement 6: User Authentication and Data Security

**User Story:** As a user, I want my personal tracking data to be secure and private, so that only I can access and modify my wellness information.

#### Acceptance Criteria

1. WHEN a user accesses the application THEN the system SHALL require authentication through Supabase Auth
2. WHEN a user performs any data operation THEN the system SHALL verify the user's identity
3. WHEN storing data THEN the system SHALL implement Row Level Security (RLS) to ensure users can only access their own data
4. WHEN a user is not authenticated THEN the system SHALL redirect to the authentication flow
5. IF authentication fails THEN the system SHALL display appropriate error messages
6. WHEN a user logs out THEN the system SHALL clear all cached data and redirect to the login page

### Requirement 7: Real-time UI Updates with Optimistic Patterns

**User Story:** As a user, I want the interface to respond immediately to my actions, so that I have a smooth and responsive experience while tracking my activities.

#### Acceptance Criteria

1. WHEN a user submits any tracking data THEN the system SHALL immediately update the UI before server confirmation
2. WHEN server operations fail THEN the system SHALL automatically rollback optimistic updates and display error messages
3. WHEN multiple related queries need updates THEN the system SHALL refresh them in a single-flight operation
4. WHEN data is loading THEN the system SHALL display appropriate loading states using skeleton components
5. WHEN errors occur THEN the system SHALL display user-friendly error messages without breaking the interface
6. WHEN optimistic updates succeed THEN the system SHALL seamlessly transition to the confirmed server state

### Requirement 8: Timezone-Aware Time Management

**User Story:** As a user in the Asia/Manila timezone, I want all time-related data to be handled correctly for my local timezone, so that my tracking data accurately reflects my daily schedule.

#### Acceptance Criteria

1. WHEN storing time data THEN the system SHALL convert local times to UTC timestamps while preserving local time strings
2. WHEN displaying time data THEN the system SHALL show times in the user's local timezone (Asia/Manila)
3. WHEN calculating daily boundaries THEN the system SHALL use the local date in Asia/Manila timezone
4. WHEN handling sleep data that crosses midnight THEN the system SHALL correctly associate the sleep session with the appropriate local date
5. WHEN comparing dates THEN the system SHALL use timezone-aware date calculations
6. WHEN the user enters time data THEN the system SHALL interpret it as local time in Asia/Manila timezone

### Requirement 9: Premium Design System and UI/UX Overhaul

**User Story:** As a user, I want a visually stunning and highly polished interface that feels premium and professional, so that I enjoy using the application and feel confident in its quality.

#### Acceptance Criteria

1. WHEN viewing any interface element THEN the system SHALL display consistent, premium visual design with sophisticated typography, spacing, and color schemes
2. WHEN interacting with components THEN the system SHALL provide subtle, refined animations and transitions that enhance usability without being distracting
3. WHEN using the application on different devices THEN the system SHALL maintain visual consistency and optimal layouts across all screen sizes
4. WHEN hovering over interactive elements THEN the system SHALL provide appropriate feedback without overwhelming glow effects or excessive visual noise
5. WHEN viewing data visualizations THEN the system SHALL use clean, modern chart designs with appropriate color coding and clear labeling
6. WHEN navigating the interface THEN the system SHALL provide clear visual hierarchy and intuitive information architecture
7. WHEN accessing any feature THEN the system SHALL maintain consistent interaction patterns and visual language throughout the application
8. WHEN viewing loading states THEN the system SHALL display elegant skeleton loaders and progress indicators
9. WHEN encountering errors THEN the system SHALL show graceful error states with helpful messaging and recovery options
10. WHEN using form inputs THEN the system SHALL provide clear validation feedback and intuitive input experiences

### Requirement 10: Enhanced Historical Data Visualization

**User Story:** As a user, I want to see comprehensive historical data visualization including accurate heatmaps and trends, so that I can understand my long-term wellness patterns and progress.

#### Acceptance Criteria

1. WHEN viewing the heatmap THEN the system SHALL accurately display historical daily scores including data from previous days
2. WHEN calculating historical scores THEN the system SHALL properly aggregate component scores from all tracking categories for each day
3. WHEN displaying historical data THEN the system SHALL ensure the remote functions correctly retrieve and process past data entries
4. WHEN viewing trends THEN the system SHALL provide meaningful insights and patterns from historical tracking data
5. WHEN historical data is missing THEN the system SHALL clearly indicate gaps in the visualization without showing false empty states
6. WHEN updating current day data THEN the system SHALL immediately reflect changes in both current displays and historical visualizations
7. WHEN viewing different time periods THEN the system SHALL allow users to explore various date ranges with smooth navigation
8. WHEN displaying component breakdowns THEN the system SHALL show historical trends for individual tracking categories

### Requirement 11: Refined Interaction Design

**User Story:** As a user, I want all interactions to feel smooth, intentional, and satisfying, so that using the application is a pleasant and efficient experience.

#### Acceptance Criteria

1. WHEN clicking buttons THEN the system SHALL provide immediate tactile feedback without excessive visual effects
2. WHEN hovering over cards or panels THEN the system SHALL provide subtle visual feedback that enhances usability without being distracting
3. WHEN completing actions THEN the system SHALL provide appropriate success feedback through micro-interactions
4. WHEN navigating between sections THEN the system SHALL use smooth, purposeful transitions that guide user attention
5. WHEN inputting data THEN the system SHALL provide real-time validation and formatting assistance
6. WHEN viewing different states THEN the system SHALL use consistent visual language for similar interaction patterns
7. WHEN using touch interfaces THEN the system SHALL provide appropriate touch targets and gesture support
8. WHEN keyboard navigating THEN the system SHALL provide clear focus indicators and logical tab order