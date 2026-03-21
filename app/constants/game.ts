export const ADVERSARY_MIN_LEVEL = 0;
export const ADVERSARY_MAX_LEVEL = 6;
/** Total number of distinct levels (0–6 inclusive) */
export const ADVERSARY_LEVEL_COUNT = ADVERSARY_MAX_LEVEL - ADVERSARY_MIN_LEVEL + 1;
/** Minimum level used when picking today's adversary */
export const TODAY_MIN_ADVERSARY_LEVEL = 3;

/** Difficulty above which the chip turns yellow (warning) */
export const DIFFICULTY_WARNING_THRESHOLD = 4;
/** Difficulty above which the chip turns red (error) */
export const DIFFICULTY_ERROR_THRESHOLD = 7;
