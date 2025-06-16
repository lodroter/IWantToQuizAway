import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import the CSS module
import styles from './GuessGame.module.css';

// --- Presentational Components ---

// Component for the end-of-game summary
function GameSummary({ correctTitle, correctArtist, totalQuestions, missed, onPlayAgain }) {
  const formatArtist = (artist) => {
    if (Array.isArray(artist)) {
      return artist.join(', ');
    }
    return artist;
  };

  return (
    <div className={styles.gameCard}>
      <h2>Quiz Over!</h2>
      <p>
        You got {correctTitle} titles and {correctArtist} artists right out of {totalQuestions}.
      </p>
      {missed.length > 0 && (
        <>
          <strong>You missed:</strong>
          <ul className={styles.missedList}>
            {missed.map((song, i) => (
              <li key={i} className={styles.missedListItem}>
                {formatArtist(song.artist)} - {song.title}
              </li>
            ))}
          </ul>
        </>
      )}
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

// A fully custom audio player component
function CustomAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Autoplay failed:", e));
    }
  }, [src]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(newProgress || 0);
  };

  const handleSongEnd = () => {
    setIsPlaying(false);
  }

  return (
    <div className={styles.customPlayer}>
      <audio
        ref={audioRef}
        src={src}
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        hidden
      />
      <button onClick={togglePlayPause} className={styles.playButton}>
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}


// Component for the main game UI
function GameUI({ song, current, totalQuestions, onSubmit }) {
  const [guess, setGuess] = useState('');
  const [guessArtist, setGuessArtist] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(guess, guessArtist);
    setGuess('');
    setGuessArtist('');
  };

  if (!song) {
    return <div className={styles.gameCard}>Loading song...</div>;
  }

  return (
    <div className={styles.gameCard}>
      <p className={styles.progress}>
        Question {current + 1} of {totalQuestions}
      </p>
      <CustomAudioPlayer src={song.preview_url} />
      
      <form onSubmit={handleSubmit} className={styles.guessForm}>
          <input
            className={styles.input}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter song title..."
          />
          <input
            className={styles.input}
            value={guessArtist}
            onChange={(e) => setGuessArtist(e.target.value)}
            placeholder="Enter artist..."
          />
          <button type="submit" className={styles.submitButton}>
            Submit Guess
          </button>
      </form>
    </div>
  );
}

// Component for displaying feedback
function Feedback({ message, type }) {
  if (!message) return <div className={styles.feedbackContainer}></div>;

  const feedbackClasses = `
    ${styles.feedbackContainer} 
    ${styles.feedbackVisible} 
    ${type === 'success' ? styles.feedbackSuccess : styles.feedbackError}
  `;

  return <div className={feedbackClasses}>{message}</div>;
}


// --- Container Component ---

function GuessGame({ songs }) {
  const totalQuestions = 10;
  const [current, setCurrent] = useState(0);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [scores, setScores] = useState({ title: 0, artist: 0 });
  const [missed, setMissed] = useState([]);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
    setSelectedSongs(shuffled);
    
    return () => {
      clearTimeout(feedbackTimeoutRef.current);
    }
  }, [songs]);

  // Game logic with the final robust artist check
  const handleSubmitGuess = useCallback((guessTitle, guessArtist) => {
    clearTimeout(feedbackTimeoutRef.current);

    const currentSong = selectedSongs[current];
    if (!currentSong) return;

    const normalize = (str) =>
      str.toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

    const isTitleCorrect = normalize(guessTitle) && normalize(currentSong.title).includes(normalize(guessTitle));
    
    // --- THE FINAL, CORRECT ARTIST LOGIC ---
    // 1. Create a clean string of the user's entire guess.
    const normalizedUserGuess = normalize(guessArtist);

    // 2. Create a clean list of all correct artist names.
    const correctArtistParts = (Array.isArray(currentSong.artist) ? currentSong.artist : currentSong.artist.split(/,|&|feat\.|ft\.|and/i))
      .map(a => normalize(a.trim())).filter(Boolean);

    // 3. The guess is correct if the user's string CONTAINS at least ONE of the full correct artist names.
    const isArtistCorrect = 
      normalizedUserGuess.length > 0 &&
      correctArtistParts.some(part => normalizedUserGuess.includes(part));
    // --- END OF FIX ---

    let feedbackParts = [];
    if (isTitleCorrect) {
      setScores(prev => ({ ...prev, title: prev.title + 1 }));
      feedbackParts.push('✅ Correct title!');
    } else {
      feedbackParts.push(`❌ Wrong title: ${currentSong.title}`);
    }

    if (isArtistCorrect) {
      setScores(prev => ({ ...prev, artist: prev.artist + 1 }));
      feedbackParts.push('✅ Correct artist!');
    } else {
      const formattedArtist = Array.isArray(currentSong.artist) ? currentSong.artist.join(', ') : currentSong.artist;
      feedbackParts.push(`❌ Wrong artist: ${formattedArtist}`);
    }

    const isOverallCorrect = isTitleCorrect && isArtistCorrect;
    setFeedback({ message: feedbackParts.join(' | '), type: isOverallCorrect ? 'success' : 'error' });

    if (!isOverallCorrect) {
      setMissed(prev => [...prev, currentSong]);
    }
    
    if (current + 1 === totalQuestions) {
        feedbackTimeoutRef.current = setTimeout(() => setDone(true), 1500); 
        return;
    }

    setCurrent(prev => prev + 1);

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 2500);

  }, [current, selectedSongs, totalQuestions]);
  
  const handlePlayAgain = () => {
    clearTimeout(feedbackTimeoutRef.current);
    setDone(false);
    setCurrent(0);
    setScores({ title: 0, artist: 0 });
    setMissed([]);
    setFeedback({ message: '', type: '' });
    const shuffled = [...songs].sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
    setSelectedSongs(shuffled);
  };

  // The final render logic
  return (
    <div className={styles.gameContainer}>
      {done ? (
        <GameSummary
          correctTitle={scores.title}
          correctArtist={scores.artist}
          totalQuestions={totalQuestions}
          missed={missed}
          onPlayAgain={handlePlayAgain}
        />
      ) : (
        <div className={styles.gameArea}>
          <Feedback message={feedback.message} type={feedback.type} />
          <GameUI
            song={selectedSongs[current]}
            current={current}
            totalQuestions={totalQuestions}
            onSubmit={handleSubmitGuess}
          />
        </div>
      )}
    </div>
  );
}

export default GuessGame;