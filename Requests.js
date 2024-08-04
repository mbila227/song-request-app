import axios from "axios";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, ListGroup } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import getAuthToken from "./spotifyAuth"; // Adjust the import path as needed

export default function Requests() {
  const { userId } = useParams(); // Extract userId from the URL
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "songRequests"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => doc.data());
        setRequests(requestsData);
      } catch (error) {
        setError("Failed to load song requests");
        console.error("Error fetching song requests: ", error);
      }
    };

    fetchRequests();
  }, [userId]);

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

    // Check if the selected track is already in the requests list
    if (requests.some((request) => request.songName === track.name && request.artistName === track.artists[0].name)) {
      setError("Song already queued. Please pick another song.");
      return;
    }

    try {
      await addDoc(collection(db, "songRequests"), {
        userId,
        songName: track.name,
        artistName: track.artists[0].name,
        timestamp: new Date(),
      });
      setSuccess("Song request added successfully");

      // Refetch the song requests to update the list
      const q = query(
        collection(db, "songRequests"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map((doc) => doc.data());
      setRequests(requestsData);

      // Clear the search input and results
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      setError("Failed to add song request");
      console.error("Error adding song request: ", error);
    }
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Submit a Song Request</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

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

          <hr />
        </Card.Body>
      </Card>
    </>
  );
}
