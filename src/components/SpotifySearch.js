// src/SpotifySearch.js
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, ListGroup } from 'react-bootstrap';
import getAuthToken from './spotifyAuth';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const SpotifySearch = ({ userId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { currentUser } = useAuth();

  const searchSongs = async (e) => {
    e.preventDefault();

    const token = await getAuthToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'track'
      }
    });

    setResults(response.data.tracks.items);
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
      alert('Song request added successfully');
    } catch (error) {
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit">Search</Button>
      </Form>
      <ListGroup>
        {results.map((track) => (
          <ListGroup.Item key={track.id}>
            <div>
              <strong>{track.name}</strong> by {track.artists[0].name}
              <Button variant="link" onClick={() => addSongRequest(track)}>Add</Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default SpotifySearch;
