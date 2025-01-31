import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Flashcards from "./Flashcards";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/flashcards" element={<Flashcards />} />
      </Routes>
    </Router>
  );
}

export default App;
