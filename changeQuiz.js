/**
 * Initial state
 */
let quizIndex = 0;
const currentQuiz = [quizes[quizIndex]];

/**
 * Handle socket connections incomming from client
 */

module.export = function changeQuiz() {
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
