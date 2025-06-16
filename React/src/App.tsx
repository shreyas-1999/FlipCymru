// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Flashcards from "./pages/Flashcards";
// import CreateFlashcards from "./pages/CreateFlashcards";
import Header from "./components/Header";
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const hideLayout = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flashcards/:id" element={<Flashcards />} />
          {/* <Route path="/create" element={<CreateFlashcards />} /> */}
        </Routes>
      </div>
      {!hideLayout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
