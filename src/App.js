// CSS
import "./App.css";

// React
import { useCallback, useEffect, useState } from "react";

// data
import {wordsList} from "./data/words";

// components
import StartScreen from "./components/StartScreen";
import Game from "./components/Game";
import GameOver from "./components/GameOver";

const stages = [
   { id: 1, name: "start" },
   { id: 2, name: "game" },
   { id: 3, name: "end" },
];

const guessesQty = 2

function App() {
   const [gameStage, setGameStage] = useState(stages[0].name);
   const [words] = useState(wordsList);

   const [pickedWord, setPickedWord] = useState("");
   const [pickedCategory, setPickedCategory] = useState("");
   const [letters, setLetters] = useState ([]);

   const [guessedLetters, setGuessedLetters] = useState([]);
   const [wrongLetters, setWrongLetters] = useState([]);
   const [guesses, setGuesses] = useState(guessesQty);
   const [score, setScore] = useState(0);

   const pickWordAndCategory = useCallback(() => {
      // seleciona uma categoria aleatória
      const categories = Object.keys(words);
      const category = 
         categories[Math.floor(Math.random() * Object.keys(categories).length)];

      // escolhe uma palavra aleatória
      const word = 
         words[category][Math.floor(Math.random() * words[category].length)];

      return { word, category };
   }, [words]);

   // start the secret word game
   const startGame = useCallback(() => {
      // limpa todas as letras
      clearLetterStates();

      // seleciona palavra e seleciona categoria
      const {word, category } = pickWordAndCategory();

      // cria um array de letras
      let wordLetters = word.split("");

      wordLetters = wordLetters.map((l) => l.toLowerCase());

      // fill states
      setPickedWord(word);
      setPickedCategory(category);
      setLetters(wordLetters);
      
      setGameStage(stages[1].name);
   }, [pickWordAndCategory]);

   // process the letter input
   const verifyLetter = (letter) => {
      const normalizedLetter = letter.toLowerCase()

      // checa se a letra já foi utilizada
      if(
         guessedLetters.includes(normalizedLetter) || 
         wrongLetters.includes(normalizedLetter)
      ) {
         return;
      }

      // enviar um palpite ou remove-a
      if(letters.includes(normalizedLetter)) {
         setGuessedLetters((actualGuessedLetters) => [
            ...actualGuessedLetters,
            normalizedLetter,
         ]);
      } else {
         setWrongLetters((actualWrongLetters) => [
            ...actualWrongLetters,
            normalizedLetter,
         ]);

         setGuesses((actualGuesses) => actualGuesses - 1);
      }
   };

   const clearLetterStates = () => {
      setGuessedLetters([]);
      setWrongLetters([]);
   };

   // verificar se as tentativas acabaram 
   useEffect(() => {
      if(guesses <= 0) {
         // reset all states
         clearLetterStates()

         setGameStage(stages[2].name);
      }
   }, [guesses]);

   // verificar a condição de vitória
   useEffect(() => {
      const uniqueLetters = [... new Set(letters)];

      // win condition
      if (guessedLetters.length === uniqueLetters.length && gameStage === stages[1].name) {
         // adicionar pontuação
         setScore((actualScore) => (actualScore += 100));

         // reseta o jogo com uma nova palavra
         startGame();
      }
   }, [guessedLetters, letters, startGame]);

   // restarts the game
   const retry = () => {
      setScore(0);
      setGuesses(guessesQty);

      setGameStage(stages[0].name);
   };

   return (
      <div className="App">
         {gameStage === 'start' && <StartScreen startGame={startGame} />}
         {gameStage === 'game' && (
            <Game 
               verifyLetter={verifyLetter}
               pickedWord={pickedWord}
               pickedCategory={pickedCategory}
               letters={letters} 
               guessedLetters={guessedLetters}
               wrongLetters={wrongLetters}
               guesses={guesses}
               score={score}
            />
         )}
         {gameStage === 'end' && <GameOver retry={retry} score={score} />}
      </div>
   );
}

export default App;
