/**
 * =========================
 *  CONSTS
 * =========================
 */
export const PORT = process.env.PORT || 5000;
export const CONNECTION = "connection";
/**
 * When a player joins
 */
export const SUBSCRIBE_PLAYER = "subscribePlayer";
export const DISCONNECT = "disconnect";
/**
 * Current players, etc
 */
export const SERVER_STATE = "state";

/**
 * Alter player score
 */
export const CHANGE_SCORE = "changeScore";
/**
 * Start quiz
 */
export const QUIZ_START = "QUIZ_START";

export const ROUND_WINNER = "ROUND_WINNER";


/**
 * =========================
 *  GAME PHASES
 * =========================
 */
export const NEXT_GAME_TIMEOUT = 5000;
export const END_GAME_TIMEOUT = 10000;
export const FULL_GAME_TIMEOUT = END_GAME_TIMEOUT + NEXT_GAME_TIMEOUT;
export const ROUND_START = "ROUND_START";
export const ROUND_END = "ROUND_END";
