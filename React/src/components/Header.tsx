// src/components/Header.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../utils/callApi";

export default function Header() {
  const [categories, setCategories] = useState([]);
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    //API.get("/categories").then(res => setCategories(res.data));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-light p-3 d-flex justify-content-between align-items-center">
      <div>{username && <strong>Welcome back, {username}!</strong>}</div>
      <div className="btn-group">
        <button className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">Categories</button>
        <ul className="dropdown-menu">
          {categories.map((cat: any) => (
            <li key={cat.id}>
              <a className="dropdown-item" href={`/flashcards/${cat.id}`}>{cat.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button className="btn btn-outline-success me-2" onClick={() => navigate("/create")}>Create Flashcards</button>
        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
