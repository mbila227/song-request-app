import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Alert, ListGroup, Form } from "react-bootstrap";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function Requests() {
  const { userId } = useParams(); // Extract userId from the URL
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requests, setRequests] = useState([]);
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "songRequests"), {
        userId,
        songName,
        artistName,
        timestamp: new Date(),
      });
      setSuccess("Song request added successfully");
      setSongName("");
      setArtistName("");

      // Refetch the song requests to update the list
      const q = query(
        collection(db, "songRequests"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map((doc) => doc.data());
      setRequests(requestsData);
    } catch (error) {
      setError("Failed to add song request");
      console.error("Error adding song request: ", error);
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Song Requests for User</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="songName">
              <Form.Label>Song Name</Form.Label>
              <Form.Control
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="artistName">
              <Form.Label>Artist Name</Form.Label>
              <Form.Control
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
              />
            </Form.Group>
            <Button disabled={false} className="w-100 mt-2" type="submit">
              Add Song
            </Button>
          </Form>
          <hr />
          {requests.length === 0 ? (
            <p>No song requests found.</p>
          ) : (
            <ListGroup>
              {requests.map((request, index) => (
                <ListGroup.Item key={index}>
                  <strong>{request.songName}</strong> by {request.artistName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
