import React, { useState, useEffect } from "react";
import { Card, Button, Alert, ListGroup, Image } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import QRCode from "qrcode.react";
import SpotifySearch from "./SpotifySearch";
import "./Dashboard.css"; // Import the CSS file

export default function Dashboard() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requests, setRequests] = useState([]);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userUrl, setUserUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); // State to manage dark mode

  useEffect(() => {
    if (currentUser) {
      setUserUrl(generateUserUrl(currentUser.uid));

      const fetchRequests = async () => {
        try {
          const q = query(
            collection(db, "songRequests"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc")
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
    }

    // Apply dark mode class to body when isDarkMode changes
    document.body.className = isDarkMode ? "dark-mode" : "light-mode";

    return () => {
      // Clean up the class when the component unmounts
      document.body.className = "";
    };
  }, [currentUser, isDarkMode]);

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!currentUser) {
    return (
      <div className="w-100 text-center mt-2">
        <p>No user is currently logged in.</p>
        <Link to="/login">Log In</Link>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Song Requests</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <div className="text-center mb-4">
            <h5>Your Song Request QR Code</h5>
            <QRCode value={userUrl} />
            <p>{userUrl}</p>
          </div>
          <SpotifySearch 
            userId={currentUser.uid} 
            setRequests={setRequests} 
            setError={setError} 
            setSuccess={setSuccess} 
          />
          <hr />
          {requests.length === 0 ? (
            <p>No song requests found.</p>
          ) : (
            <ListGroup>
              {requests.map((request, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex align-items-center">
                    {request.albumCover && (
                      <Image
                        src={request.albumCover}
                        rounded
                        style={{ width: '50px', height: '50px', marginRight: '10px' }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <strong>{request.songName}</strong> by {request.artistName}
                    </div>
                    {request.spotifyUrl && (
                      <Button
                        variant="link"
                        className="ms-2"
                        href={request.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Listen on Spotify
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={toggleDarkMode}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Button>
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </>
  );
}

const generateUserUrl = (userId) => {
  return `${window.location.origin}/requests/${userId}`;
};

