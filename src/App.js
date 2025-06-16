import React, { useState, useEffect } from 'react';
import Menu from './components/Menu';
import GuessGame from './components/GuessGame';
import SingasongGame from './components/SingasongGame';
import MatchTheSnippet from './components/Matchthesnippet';
import './index.css';

function App() {
  const [mode, setMode] = useState(0);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
  fetch(process.env.PUBLIC_URL + '/assets/songs.json')
    .then(res => res.json())
    .then(data => setSongs(data))
    .catch(err => console.error("Error loading songs:", err));
  }, []);


  if (!songs.length) return <p>Loading...</p>;

  return (
    <div className="App">
      {mode === 0 && <Menu onStart={setMode} />}
      {mode === 1 && <GuessGame songs={songs} />}
      {mode === 2 && <SingasongGame songs={songs}/>}
      {mode === 3 && <MatchTheSnippet songs={songs} />}
    </div>
  );
}

export default App;
