import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { callApi } from "../utils/callApi";

interface Flashcard {
  id: number;
  english: string;
  welsh: string;
  pronunciation: string;
  audio_url?: string; // optional field
}

export default function Flashcards() {
  const { id } = useParams(); // category ID
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        //const res = await API.get(`/flashcards/${id}`);
        //setFlashcards(res.data);
      } catch {
        navigate("/login");
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleFlip = () => setFlipped(!flipped);

  const handleAudio = () => {
    const audio = flashcards[current]?.audio_url;
    if (audio) new Audio(audio).play();
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1 < flashcards.length ? prev + 1 : 0));
    setFlipped(false);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  if (flashcards.length === 0) return <p>Loading flashcards...</p>;

  const card = flashcards[current];

  return (
    <div className="text-center">
      <h2 className="mb-4">Flashcards</h2>
      <div
        className="card p-4 mb-3"
        style={{ cursor: "pointer", minHeight: "150px" }}
        onClick={handleFlip}
      >
        <h4>{flipped ? card.welsh : card.english}</h4>
        {flipped && (
          <>
            <p className="text-muted">/{card.pronunciation}/</p>
            {card.audio_url && (
              <button className="btn btn-outline-secondary" onClick={handleAudio}>
                🔊 Play
              </button>
            )}
          </>
        )}
      </div>
      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={handlePrev}>Previous</button>
        <button className="btn btn-primary" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
