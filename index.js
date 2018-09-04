const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const quizes = require('./static/quizes');

/**
 * =========================
 *                   LISTEN
 * =========================
 */
// Also listens to this on the client
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("LISTENING ON PORT:" + PORT);
});

// app.use(express.static(__dirname + "./build"))

/**
 * =========================
 *                CONSTS
 * =========================
 */
const CONNECTION = "connection";
/**
 * When a player joins
 */
const SUBSCRIBE_PLAYER = "subscribePlayer";
const DISCONNECT = "disconnect";
/**
 * Current players, etc
 */
const SERVER_STATE = "state";

/**
 * Alter player score
 */
const CHANGE_SCORE = "changeScore";
/**
 * Start quiz
 */
const QUIZ_START = "QUIZ_START";
const QUIZ_END = "QUIZ_END";

const ROUND_WINNER = "ROUND_WINNER";


/**
 * =========================
 *           INITIAL STATE
 * =========================
 */
const players = {};
let playerScore = 0;
let quizIndex = 0;
const currentQuiz = [quizes[quizIndex]];
/**
 * If set, then send out message to all sockets that
 * a winner has been set.
 *
 * Reset at round start
 */
let roundWinner;


/**
 * =========================
 *       HANDLE QUIZ CHANGE
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
 *      SOCKET CONNECTIONS
 * =========================
 */
io.on(CONNECTION, (socket) => {
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
});

/**
 * Notify client about server state
 */
setInterval(() => {
  io.sockets.emit(SERVER_STATE, players);
}, 100);



/**
 * =========================
 *              GAME PHASES
 * =========================
 */
const NEXT_GAME_TIMEOUT = 5000;
const END_GAME_TIMEOUT = 10000;
const FULL_GAME_TIMEOUT = END_GAME_TIMEOUT + NEXT_GAME_TIMEOUT;
const ROUND_START = "ROUND_START";
const ROUND_END = "ROUND_END";

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


