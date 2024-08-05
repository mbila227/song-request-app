import React, { useState } from "react";
import { Button, ListGroup, Form, Image } from "react-bootstrap";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import getAuthToken from "./spotifyAuth"; // Adjust the import path as needed
import Autosuggest from "react-autosuggest";

const SpotifySearch = ({ userId, setRequests, setError, setSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const getSuggestions = async (value) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: value,
          type: "track",
          limit: 5,
        },
      });
      setSuggestions(response.data.tracks.items);
    } catch (err) {
      console.error("Error fetching songs: ", err);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setSelectedTrack(suggestion);
  };

  const handleSearchChange = (e, { newValue }) => {
    setSearchQuery(newValue);
    setSelectedTrack(null); // Clear selected track when search query changes
  };

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

    try {
      const q = query(
        collection(db, "songRequests"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const existingRequests = querySnapshot.docs.map((doc) => doc.data());

      if (existingRequests.some(
        (request) => request.songName === track.name && request.artistName === track.artists[0].name
      )) {
        setError("Song already queued. Please pick another song.");
        return;
      }

      await addDoc(collection(db, "songRequests"), {
        userId,
        songName: track.name,
        artistName: track.artists[0].name,
        albumCover: track.album.images[1].url,
        timestamp: new Date(),
      });
      setSuccess("Song request added successfully");

      const updatedRequestsSnapshot = await getDocs(q);
      const updatedRequestsData = updatedRequestsSnapshot.docs.map((doc) => doc.data());
      setRequests(updatedRequestsData);

      setSearchQuery("");
      setSearchResults([]);
      setSelectedTrack(null);
    } catch (error) {
      setError("Failed to add song request");
      console.error("Error adding song request: ", error);
    }
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => (
    <div>
      <Image
        src={suggestion.album.images[1].url}
        rounded
        style={{ width: '50px', height: '50px', marginRight: '10px' }}
      />
      <strong>{suggestion.name}</strong> by {suggestion.artists[0].name}
    </div>
  );

  const inputProps = {
    placeholder: "Search for a Song",
    value: searchQuery,
    onChange: handleSearchChange,
    required: true,
  };

  return (
    <div>
      <Form onSubmit={searchSongs}>
        <Form.Group id="searchQuery">
          <Form.Label>Search for a Song</Form.Label>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            onSuggestionSelected={onSuggestionSelected}
            inputProps={inputProps}
            renderInputComponent={(inputProps) => (
              <Form.Control {...inputProps} />
            )}
            theme={{
              container: "react-autosuggest__container",
              suggestionsContainer: "react-autosuggest__suggestions-container",
              suggestionsList: "list-group",
              suggestion: "list-group-item",
            }}
          />
          <Button type="submit" className="mt-2">
            Search
          </Button>
        </Form.Group>
      </Form>

      {selectedTrack && (
        <ListGroup className="mt-3">
          <ListGroup.Item key={selectedTrack.id}>
            <Image
              src={selectedTrack.album.images[1].url}
              rounded
              style={{ width: '50px', height: '50px', marginRight: '10px' }}
            />
            <strong>{selectedTrack.name}</strong> by {selectedTrack.artists[0].name}
            <Button
              variant="link"
              className="float-end"
              onClick={() => handleAddRequest(selectedTrack)}
            >
              Add Request
            </Button>
          </ListGroup.Item>
        </ListGroup>
      )}

      {searchResults.length > 0 && (
        <ListGroup className="mt-3">
          {searchResults.map((track) => (
            <ListGroup.Item key={track.id}>
              <Image
                src={track.album.images[1].url}
                rounded
                style={{ width: '50px', height: '50px', marginRight: '10px' }}
              />
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
