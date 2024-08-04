import React, { useState } from "react";
import { Button, ListGroup, Alert, Form } from "react-bootstrap";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import getAuthToken from "./spotifyAuth"; // Adjust the import path as needed

const SpotifySearch = ({ userId, setRequests, setError, setSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const searchSongs = async (e) => {
    e.preventDefault();
    setError("");
    setSearchResults([]);

    try {
      const token = await getAuthToken();
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchQuery,
          type: "track",
        },
      });
      setSearchResults(response.data.tracks.items);
    } catch (err) {
      setError("Failed to fetch songs from Spotify");
      console.error("Error fetching songs: ", err);
    }
  };

  const handleAddRequest = async (track) => {
    setError("");
    setSuccess("");

    // Fetch current requests to check for duplicates
    try {
      const q = query(
        collection(db, "songRequests"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const existingRequests = querySnapshot.docs.map((doc) => doc.data());

      // Check if the selected track is already in the requests list
      if (existingRequests.some(
        (request) => request.songName === track.name && request.artistName === track.artists[0].name
      )) {
        setError("Song already queued. Please pick another song.");
        return;
      }

      // Add the new request
      await addDoc(collection(db, "songRequests"), {
        userId,
        songName: track.name,
        artistName: track.artists[0].name,
        timestamp: new Date(),
      });
      setSuccess("Song request added successfully");

      // Update the requests list
      const updatedRequestsSnapshot = await getDocs(q);
      const updatedRequestsData = updatedRequestsSnapshot.docs.map((doc) => doc.data());
      setRequests(updatedRequestsData);

      // Clear the search input and results
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      setError("Failed to add song request");
      console.error("Error adding song request: ", error);
    }
  };

  return (
    <div>
      <Form onSubmit={searchSongs}>
        <Form.Group id="searchQuery">
          <Form.Label>Search for a Song</Form.Label>
          <Form.Control
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <Button type="submit" className="mt-2">
            Search
          </Button>
        </Form.Group>
      </Form>

      {searchResults.length > 0 && (
        <ListGroup className="mt-3">
          {searchResults.map((track) => (
            <ListGroup.Item key={track.id}>
              <strong>{track.name}</strong> by {track.artists[0].name}
              <Button
                variant="link"
                className="float-end"
                onClick={() => handleAddRequest(track)}
              >
                Add Request
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SpotifySearch;
