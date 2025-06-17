# I Want To Quiz Away

This is a simple React app consisting of three music quiz games.  
The data for the games is fetched from a JSON file, which itself is generated based on data retrieved from the Spotify API. The app does **not** directly query the Spotify API during gameplay.

## Games

1. **Guess the Song**  
   Guess the song title and artist from a short snippet.  
   - You must write the full artist name (e.g., *Olivia Rodrigo* is correct, *Olivia* is incorrect).  
   - If there are multiple artists, you don't need to list them all, but at least one full, correct artist name is required.

2. **100 Songs in 10 Minutes**  
   A recreation of the popular YouTube challenge by the React channel.  
   - The goal is to sing 100 songs within 10 minutes.  
   - For each song, click **Know** if you recognize it and can sing it, or **Skip** if you don’t.  
   - The game ends when you reach 100 songs marked as known, or the 10-minute timer runs out.

3. **Match the Snippet**  
   You are given a song title and artist, plus 4 audio snippets.  
   - Your task is to match the correct snippet with the given song and artist.  
   - There is no time limit per question.

## Tech Stack

- React  
- JSON as a data source (with pre-fetched Spotify data)  
- HTML5 Audio for playing snippets  
- CSS for styling

## Future Improvements

- Add new games  
- Expand the dataset
- Clean and improve the existing data  
- Add a database backend for better data management  
- Add additional metadata that can’t be obtained from the Spotify API  
- Improve UI/UX and responsiveness  
