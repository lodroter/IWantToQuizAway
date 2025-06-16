import React from 'react';
// Import the new CSS module
import styles from './Menu.module.css';
// Import the specific icons we want to use
import { FaHeadphonesAlt, FaRegClock,} from 'react-icons/fa';
import { BsMusicNoteBeamed } from 'react-icons/bs';

const Menu = ({ onStart }) => (
  <div className={styles.menuContainer}>
    <div className={styles.menuCard}>
      <h1 className={styles.title}>I Want To Quiz Away</h1>
      <p className={styles.tagline}>How well do you know your music?</p>

      <div className={styles.buttonContainer}>
        <button className={styles.menuButton} onClick={() => onStart(1)}>
          <FaHeadphonesAlt /> 
          Guess the Song
        </button>
        <button className={styles.menuButton} onClick={() => onStart(2)}>
          <FaRegClock />
          Know the Title
        </button>
        <button className={styles.menuButton} onClick={() => onStart(3)}>
            <BsMusicNoteBeamed />
            Match the Snippet
        </button>
      </div>
    </div>
  </div>
);

export default Menu;