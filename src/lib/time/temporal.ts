import { Temporal } from '@js-temporal/polyfill';

export const MANILA_TZ = 'Asia/Manila';

/**
 * Get today's date in the Manila timezone as a string (YYYY-MM-DD format)
 * This ensures consistent date handling across the application
 */
export function getTodayLocalDate(): string {
  return Temporal.Now.plainDateISO(MANILA_TZ).toString();
}

/**
 * Convert a local date and time to a Temporal.Instant
 * This handles timezone-aware timestamp conversion
 * 
 * @param localDate - Date string in YYYY-MM-DD format
 * @param localTime - Time string in HH:MM format
 * @returns Temporal.Instant representing the moment in UTC
 */
export function localTimeToInstant(localDate: string, localTime: string): Temporal.Instant {
  const plainDateTime = Temporal.PlainDateTime.from(`${localDate}T${localTime}`);
  return plainDateTime.toZonedDateTime(MANILA_TZ).toInstant();
}

/**
 * Calculate sleep duration in minutes, handling sleep sessions that cross midnight
 * 
 * @param sleepStart - Sleep start time in HH:MM format
 * @param wakeTime - Wake time in HH:MM format  
 * @param localDate - The local date when sleep started (YYYY-MM-DD format)
 * @returns Duration in minutes
 */
export function calculateSleepDuration(
  sleepStart: string, 
  wakeTime: string, 
  localDate: string
): number {
  const sleepStartInstant = localTimeToInstant(localDate, sleepStart);
  let wakeInstant = localTimeToInstant(localDate, wakeTime);
  
  // Handle sleep that crosses midnight - if wake time is before or equal to sleep start,
  // assume wake time is on the next day
  if (wakeInstant.epochMilliseconds <= sleepStartInstant.epochMilliseconds) {
    const nextDay = Temporal.PlainDate.from(localDate).add({ days: 1 }).toString();
    wakeInstant = localTimeToInstant(nextDay, wakeTime);
  }
  
  // Calculate duration in minutes
  const durationMs = wakeInstant.epochMilliseconds - sleepStartInstant.epochMilliseconds;
  return Math.round(durationMs / (1000 * 60));
}

/**
 * Format a duration in minutes to a human-readable string
 * 
 * @param durationMins - Duration in minutes
 * @returns Formatted string like "7h 30m"
 */
export function formatDuration(durationMins: number): string {
  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Convert an Instant back to local time string in Manila timezone
 * 
 * @param instant - Temporal.Instant to convert
 * @returns Time string in HH:MM format
 */
export function instantToLocalTime(instant: Temporal.Instant): string {
  const zonedDateTime = instant.toZonedDateTimeISO(MANILA_TZ);
  return zonedDateTime.toPlainTime().toString({ smallestUnit: 'minute' });
}

/**
 * Convert an Instant back to local date string in Manila timezone
 * 
 * @param instant - Temporal.Instant to convert
 * @returns Date string in YYYY-MM-DD format
 */
export function instantToLocalDate(instant: Temporal.Instant): string {
  const zonedDateTime = instant.toZonedDateTimeISO(MANILA_TZ);
  return zonedDateTime.toPlainDate().toString();
}