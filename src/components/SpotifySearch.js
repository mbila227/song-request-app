import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, ListGroup } from 'react-bootstrap';
import getAuthToken from './spotifyAuth';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const SpotifySearch = ({ userId, setRequests, setError, setSuccess }) => {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);
  const { currentUser } = useAuth();

  const searchSongs = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = await getAuthToken();

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: queryText,
          type: 'track'
        }
      });

      setResults(response.data.tracks.items);
    } catch (error) {
      setError('Error fetching songs from Spotify');
      console.error('Error fetching songs from Spotify: ', error);
    }
  };

  const addSongRequest = async (track) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'songRequests'), {
        userId: currentUser.uid,
        songName: track.name,
        artistName: track.artists[0].name,
        timestamp: new Date()
      });

      setSuccess('Song request added successfully');

      // Fetch updated requests
      const q = query(collection(db, "songRequests"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map((doc) => doc.data());
      setRequests(requestsData);

      // Clear results and query after adding song
      setResults([]);
      setQueryText('');
    } catch (error) {
      setError('Error adding song request');
      console.error('Error adding song request: ', error);
    }
  };

  return (
    <div>
      <Form onSubmit={searchSongs}>
        <Form.Group>
          <Form.Label>Search for a Song</Form.Label>
          <Form.Control
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit">Search</Button>
      </Form>
      {results.length > 0 && (
        <ListGroup className="mt-3">
          {results.map((track) => (
            <ListGroup.Item key={track.id}>
              <div>
                <strong>{track.name}</strong> by {track.artists[0].name}
                <Button variant="link" onClick={() => addSongRequest(track)}>Add</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SpotifySearch;

