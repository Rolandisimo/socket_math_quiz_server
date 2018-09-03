const io = require('socket.io')();
const quizes = require('./static/quizes');

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

/**
 * Initial state
 */
const players = {};
let playerScore = 0;
let quizIndex = 0;
const currentQuiz = [quizes[quizIndex]];
/**
 * Handle quiz chanign
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


io.on('connection', (socket) => {
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
});

/**
 * Notify client about server state
 */
setInterval(() => {
  io.sockets.emit(SERVER_STATE, players);
}, 100);


/**
 * Handle  Game phases
 */
const NEXT_GAME_TIMEOUT = 5000;
const END_GAME_TIMEOUT = 10000;
const FULL_GAME_TIMEOUT = END_GAME_TIMEOUT + NEXT_GAME_TIMEOUT;
const ROUND_START = "ROUND_START";
const ROUND_END = "ROUND_END";

setInterval(() => {
  io.emit(ROUND_START);

  setTimeout(() => {
    io.emit(ROUND_END);

    setTimeout(() => {
      changeQuiz();
    }, NEXT_GAME_TIMEOUT)
  }, END_GAME_TIMEOUT)
}, FULL_GAME_TIMEOUT)


// Start listening to port
// Also listens to this on the client
const port = 8000;
io.listen(port);
console.log('Client listening on port ' + port);