// App-wide configuration constants

/** Interval (in ms) at which the QR code for attendance is refreshed — 60 seconds */
export const QR_REFRESH_INTERVAL = 60_000;

/** Human-readable application name shown in the UI */
export const APP_NAME = "KampusGo";

/** Semantic version string — update on every release */
export const APP_VERSION = "1.0.0";

/** Maximum length for news excerpt text in list cards */
export const NEWS_EXCERPT_MAX_LENGTH = 120;

/** Number of news items to fetch per page (infinite scroll) */
export const NEWS_PAGE_SIZE = 10;

/** Temporary auth feature flags while mobile login flow is narrowed for device QA */
export const ENABLE_GOOGLE_OAUTH = false;
export const ENABLE_PASSWORD_RESET = false;
