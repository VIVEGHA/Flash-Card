import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const FlashcardCustomizer = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [level, setLevel] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);

  
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await axios.get('http://localhost:5005/flashcards');
        setFlashcards(response.data);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      }
    };

    fetchFlashcards();
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer || !level) return;

    const newCard = { question, answer, level };

    try {
      const response = await axios.post('http://localhost:5005/flashcards', newCard);
      setFlashcards((prevFlashcards) => [...prevFlashcards, response.data.flashcard]);
      setQuestion('');
      setAnswer('');
      setLevel('');
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  
  const handleUpdate = async (index) => {
    const updatedQuestion = prompt('Update Question:', flashcards[index].question);
    const updatedAnswer = prompt('Update Answer:', flashcards[index].answer);
    const updatedLevel = prompt('Update Level:', flashcards[index].level);

    if (updatedQuestion && updatedAnswer !== null) {
      const updatedFlashcard = {
        question: updatedQuestion,
        answer: updatedAnswer,
        level: updatedLevel,
      };

      try {
        const response = await axios.put(
          `http://localhost:5005/flashcards/${flashcards[index]._id}`,
          updatedFlashcard
        );
        setFlashcards((prevFlashcards) =>
          prevFlashcards.map((card, i) =>
            i === index ? { ...card, ...updatedFlashcard } : card
          )
        );
      } catch (error) {
        console.error('Error updating flashcard:', error);
      }
    }
  };


  const handleDelete = async (index) => {
    try {
      await axios.delete(`http://localhost:5005/flashcards/${flashcards[index]._id}`);
      setFlashcards(flashcards.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const handleFlip = (index) => {
    setFlashcards(
      flashcards.map((card, i) =>
        i === index ? { ...card, isFlipped: !card.isFlipped, flipCount: card.flipCount + 1 } : card
      )
    );
  };

  return (
    <div className="container">
      <h1>Flashcard Customizer</h1>

      <form onSubmit={handleSubmit}>
        <label>Question:</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <label>Answer:</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />

        <label>Level:</label>
        <textarea
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
        />

        <button type="submit">Add Flashcard</button>
      </form>

      <button onClick={() => setShowFlashcards(!showFlashcards)}>
        {showFlashcards ? 'Hide Flashcards' : 'Show Flashcards'}
      </button>

      {showFlashcards && (
        <div className="flashcards">
          {flashcards.map((card, index) => (
            <div key={index} className="card-wrapper">
              <div className="card-buttons">
                <button onClick={() => handleUpdate(index)}>Update</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </div>

              <div className={`card ${card.isFlipped ? 'flipped' : ''}`} onMouseEnter={() => handleFlip(index)}>
                <div className="card-inner">
                  {!card.isFlipped ? (
                    <div className="card-front">
                      <p><strong>Question:</strong> {card.question}</p>
                    </div>
                  ) : (
                    <div className="card-back">
                      <p><strong>Answer:</strong> {card.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

<button className="hide-flashcards" onClick={() => setShowFlashcards(false)}>
  Hide Flashcards
</button>

        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <FlashcardCustomizer />
    </div>
  );
}

export default App;
