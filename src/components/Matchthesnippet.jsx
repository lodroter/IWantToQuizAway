import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Matchthesnippet.module.css';

// --- Reusable Components ---

// UPDATED: The player is a "dumb" component controlled entirely by props.
function CustomAudioPlayer({ src, isPlaying }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // This effect synchronizes the audio element with the parent's state
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Autoplay failed:", e));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, src]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(p || 0);
  };
  
  // When the src changes, reset the progress
  useEffect(() => {
    setProgress(0);
  }, [src]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0, pointerEvents: 'none' }}>
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} hidden />
      <button style={{ all: 'unset', fontSize: '1.5rem' }}>
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <div style={{ width: '100%', height: '6px', backgroundColor: '#555', borderRadius: '3px' }}>
        <div style={{ height: '100%', backgroundColor: '#1db954', borderRadius: '3px', width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

// --- Main Game Component ---

function MatchTheSnippet({ songs }) {
  const TOTAL_QUESTIONS = 10;
  const [gameSongs, setGameSongs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // State to manage which player is active
  const [activePlayerSrc, setActivePlayerSrc] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const availableSongs = songs.filter(song => song.preview_url);
    setGameSongs(availableSongs.sort(() => 0.5 - Math.random()));
  }, [songs]);
  
  // Smarter decoy selection logic
  const loadNextQuestion = useCallback(() => {
    if (current >= TOTAL_QUESTIONS || current >= gameSongs.length) {
      setDone(true);
      return;
    }
    
    setActivePlayerSrc(null); // Stop any playing audio for the new question

    const correctSong = gameSongs[current];
    let decoys = [];
    
    // Priority 1 - Find decoys by the same artist
    const sameArtistDecoys = gameSongs.filter(s => 
        (Array.isArray(s.artist) ? s.artist.join('') : s.artist) === (Array.isArray(correctSong.artist) ? correctSong.artist.join('') : correctSong.artist) 
        && s.title !== correctSong.title
    );
    decoys.push(...sameArtistDecoys.sort(() => 0.5 - Math.random()).slice(0, 3));

    // Fallback - Fill remaining slots with random songs
    while (decoys.length < 3) {
      const randomSong = gameSongs[Math.floor(Math.random() * gameSongs.length)];
      if (randomSong.title !== correctSong.title && !decoys.some(d => d.title === randomSong.title)) {
        decoys.push(randomSong);
      }
    }
    
    const choices = [...decoys, correctSong].sort(() => 0.5 - Math.random());

    setQuestion({ correctSong, choices });
    setIsAnswered(false);
    setCurrent(prev => prev + 1);
  }, [current, gameSongs]);

  useEffect(() => {
    if (gameSongs.length > 0 && !question) {
      loadNextQuestion();
    }
  }, [gameSongs, question, loadNextQuestion]);

  // NEW, SIMPLIFIED GAME FLOW LOGIC
  const handleChoiceClick = (choice) => {
    if (isAnswered) return;

    // If clicking the currently playing snippet, it's a confirmation
    if (activePlayerSrc === choice.preview_url) {
      setIsAnswered(true);
      setActivePlayerSrc(null); // Stop audio on confirm

      if (choice.title === question.correctSong.title) {
        setScore(prev => prev + 1);
      }

      setTimeout(() => {
        loadNextQuestion();
      }, 2000);
    } else {
      // Otherwise, it's a preview click
      setActivePlayerSrc(choice.preview_url);
    }
  };

  const handlePlayAgain = () => {
    setCurrent(0);
    setScore(0);
    setDone(false);
    setQuestion(null);
    setGameSongs(gameSongs.sort(() => 0.5 - Math.random()));
  };

  // --- Render Logic ---
  if (done) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.gameCard}>
          <h2>Quiz Complete!</h2>
          <p style={{ fontSize: '1.5rem', color: '#b3b3b3' }}>You scored {score} out of {TOTAL_QUESTIONS}!</p>
          <div className={styles.buttonGroup}>
            <button className={`${styles.submitButton} ${styles.secondaryButton}`} onClick={() => window.location.reload()}>Back to Menu</button>
            <button className={styles.submitButton} onClick={handlePlayAgain}>Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return <div className={styles.gameContainer}><div className={styles.gameCard}>Loading Game...</div></div>;
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameCard}>
        <div className={styles.header}>
          <p className={styles.progress}>Question {current} / {TOTAL_QUESTIONS}</p>
          <p className={styles.score}>Score: {score}</p>
        </div>
        
        <p className={styles.questionText}>
          Which snippet is <span>{question.correctSong.title}</span> by <span>{Array.isArray(question.correctSong.artist) ? question.correctSong.artist.join(', ') : question.correctSong.artist}</span>?
        </p>
        <p style={{marginTop: '-1rem', color: '#a0a0a0'}}>Click a choice to listen, click it again to confirm.</p>

        <div className={styles.choicesGrid}>
          {question.choices.map((choice, index) => {
            const isSelected = activePlayerSrc === choice.preview_url;
            let choiceClass = styles.choiceButton;
            if (isAnswered) {
              if (choice.title === question.correctSong.title) {
                choiceClass += ` ${styles.choiceCorrect}`;
              } else if (isSelected) {
                choiceClass += ` ${styles.choiceIncorrect}`;
              }
            } else if (isSelected) {
                choiceClass += ` ${styles.choiceActive}`; // You can add a style for the active choice if you want
            }

            return (
              <button
                key={index}
                className={choiceClass}
                onClick={() => handleChoiceClick(choice)}
                disabled={isAnswered}
              >
                <CustomAudioPlayer 
                  src={choice.preview_url}
                  isPlaying={isSelected}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MatchTheSnippet;