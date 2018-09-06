import { io } from "./server";
import { quizes } from '../static/quizes';
import { PlayerType, Quiz } from "./types";
import {
  CHANGE_SCORE,
  CONNECTION,
  DISCONNECT,
  END_GAME_TIMEOUT,
  FULL_GAME_TIMEOUT,
  NEXT_GAME_TIMEOUT,
  QUIZ_START,
  ROUND_END,
  ROUND_START,
  ROUND_WINNER,
  SERVER_STATE,
  SUBSCRIBE_PLAYER,
} from "./consts";


/**
 * =========================
 *  INITIAL STATE
 * =========================
 */

const players: {[key: string]: PlayerType} = {};
let playerScore = 0;
let quizIndex = 0;
const currentQuiz: Quiz[] = [quizes[quizIndex]];
/**
 * If set, then send out message to all sockets that
 * a winner has been set.
 *
 * Reset at round start
 */
let roundWinner: PlayerType | undefined;


/**
 * =========================
 *  HANDLE QUIZ CHANGE
 * =========================
 */
function changeQuiz() {
    // Remove item from the stack
    currentQuiz.pop();

    if (quizIndex >= quizes.length - 1) {
      quizIndex = 0; // reset index
    } else {
      ++quizIndex;
    }
  
    currentQuiz.push(quizes[quizIndex])

    io.sockets.emit(QUIZ_START, currentQuiz[0]);
}


/**
 * =========================
 *  SOCKET CONNECTIONS
 * =========================
 */
function socketConnection(socket: SocketIO.Socket) {
  /**
   * Notify a late joiner if there's a winner
   * to avoid incorrect state change
   */
  if (roundWinner) {
    io.emit(ROUND_WINNER, roundWinner.id)
  }
  socket.emit(QUIZ_START, currentQuiz[0]);

  socket.on(SUBSCRIBE_PLAYER, (data) => {
    console.log("+++++++++++++")
    console.log(`ID: ${data.id}`)
    console.log("+++++++++++++")

    /**
     * Check if unique player
     */
    if (data.name) {
      players[data.id] = {
        id: data.id,
        name: data.name,
        score: data.score,
        isPlaying: true,
      }
    }
  });

  /**
   * Subscribe user which is being catched on the client
   * to allow to set the screenname
   */
  socket.emit(SUBSCRIBE_PLAYER, { id: socket.id, name: "",  score: playerScore, isPlaying: false });

  /**
 * Remove player on disconnect
 */
  socket.on(DISCONNECT, (reason) => {
    console.log(`Player ${socket.id} disconnected`);
    console.log(`Disconnect reason: ${reason}`);

    delete players[socket.id];
  });

  /**
   * Handle score
   */
  socket.on(CHANGE_SCORE, (id, score) => {
    players[id].score = score
  });

  socket.on(ROUND_WINNER, (id) => {
    /**
     * If round has no winner yet,
     * we emit a winner to prevent
     * from adding positive score
     * to the next players that
     * answer correctly in a single round
     */
    if (!roundWinner) {
      roundWinner = players[id];
      io.emit(ROUND_WINNER, roundWinner)
    }
  });

  /**
   * TODO:
   * Kick inactive players out of the game
   */
}

/* Notify client about server state */
setInterval(() => {
  io.sockets.emit(SERVER_STATE, players);
}, 100);

// Game phases handling
setInterval(() => {
  roundWinner = undefined;
  io.emit(ROUND_START);

  setTimeout(() => {
    io.emit(ROUND_END);

    setTimeout(() => {
      changeQuiz();
    }, NEXT_GAME_TIMEOUT)
  }, END_GAME_TIMEOUT)
}, FULL_GAME_TIMEOUT)

// Establish connection listener
io.on(CONNECTION,  socketConnection);
