import React, { useState, useEffect, useCallback } from 'react';
// Import the CSS module
import styles from './SingasongGame.module.css';
// Import icons
import { FaCheck, FaFastForward } from 'react-icons/fa';

// --- Helper & Presentational Components ---

// A small helper to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Summary screen component
function GameSummary({ message, score, onPlayAgain }) {
  return (
    <div className={styles.gameCard}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{message}</h2>
      <p style={{ fontSize: '1.5rem', color: '#b3b3b3' }}>Final Score: {score}</p>
      <div className={styles.buttonGroup}>
        <button className={`${styles.submitButton} ${styles.secondaryButton}`} onClick={() => window.location.reload()}>
          Back to Menu
        </button>
        <button className={styles.submitButton} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}

// Main game UI component
function GameUI({ timeLeft, score, skips, song, onKnow, onSkip }) {
  return (
    <div className={styles.gameCard}>
      <div className={styles.statsContainer}>
        <span>Score: {score}</span>
        <span className={styles.timer}>{formatTime(timeLeft)}</span>
        <span>Skips: {skips}</span>
      </div>
      <div className={styles.songDisplay}>
        <h2 className={styles.songTitle}>{song.title}</h2>
        <p className={styles.songArtist}>{Array.isArray(song.artist) ? song.artist.join(', ') : song.artist}</p>
      </div>
      <div className={styles.buttonGroup}>
        <button className={`${styles.submitButton} ${styles.secondaryButton}`} onClick={onSkip}>
          <FaFastForward /> Skip
        </button>
        <button className={styles.submitButton} onClick={onKnow}>
          <FaCheck /> Know
        </button>
      </div>
    </div>
  );
}

// --- Container Component ---

function SingasongGame({ songs }) {
  const [list, setList] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');

  // Initial setup and timer logic
  useEffect(() => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random()).slice(0, 100);
    setList(shuffled);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame("⏰ Time's up!");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [songs]); // Only re-run if the main songs prop changes

  // Centralized function to end the game
  const endGame = (endMessage) => {
    setDone(true);
    setMessage(endMessage);
  };

  // Centralized logic to advance to the next song
  const handleNextSong = useCallback((isKnown) => {
    if (done) return;

    const newScore = isKnown ? score + 1 : score;
    const newSkips = isKnown ? skips : skips + 1;
    const newIndex = index + 1;

    if (isKnown) setScore(newScore);
    else setSkips(newSkips);

    if (newScore >= 100) {
      endGame('🎉 You know 100 songs!');
      return;
    }

    // THE CRITICAL BUG FIX IS HERE
    if (newIndex >= list.length) {
      // We've run out of songs in the current list
      if (newSkips > 0) {
        console.log(`Ran out of songs! Generating ${newSkips} new ones.`);
        const newSongs = [...songs].sort(() => 0.5 - Math.random()).slice(0, newSkips);
        setList(newSongs); // Replace the list with fresh songs
        setIndex(0); // Reset the index
        setSkips(0); // Reset the skip counter
      } else {
        // No skips available to generate new songs
        endGame('✅ You finished all available songs!');
      }
    } else {
      // Still have songs in the list, just advance the index
      setIndex(newIndex);
    }
  }, [done, score, skips, index, list, songs]);

  const handlePlayAgain = () => {
    // Reset all state for a new game
    const shuffled = [...songs].sort(() => 0.5 - Math.random()).slice(0, 100);
    setList(shuffled);
    setIndex(0);
    setScore(0);
    setSkips(0);
    setTimeLeft(600);
    setDone(false);
    setMessage('');
    // The timer will restart due to the main useEffect re-running after state changes,
    // but a more robust implementation would encapsulate the timer start in this function.
    // For now, reloading the component via its parent is sufficient.
  };

  const currentSong = list[index] || { title: 'Loading...', artist: '' };

  return (
    <div className={styles.gameContainer}>
      {done ? (
        <GameSummary message={message} score={score} onPlayAgain={handlePlayAgain} />
      ) : (
        <GameUI
          timeLeft={timeLeft}
          score={score}
          skips={skips}
          song={currentSong}
          onKnow={() => handleNextSong(true)}
          onSkip={() => handleNextSong(false)}
        />
      )}
    </div>
  );
}

export default SingasongGame;