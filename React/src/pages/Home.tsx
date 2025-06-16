import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../utils/callApi";

interface Category {
  id: number;
  name: string;
  progress?: number;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found. Redirecting to login.");
      navigate("/");
      return;
    }

    const fetchCategories = async () => {
      try {
        const data = await callApi<Category[]>("/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        navigate("/");
      }
    };

    fetchCategories();
  }, [navigate]);

  const username = localStorage.getItem("username");

  return (
    <div>
      <h2 className="mb-4">Welcome back, {username}!</h2>
      {categories.length === 0 ? (
        <p>No categories available.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat.id} className="card mb-3 p-3">
            <h5>{cat.name}</h5>
            <div className="progress mb-2">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${cat.progress || 0}%` }}
              >
                {cat.progress || 0}%
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/flashcards/${cat.id}`)}
            >
              Start
            </button>
          </div>
        ))
      )}
    </div>
  );
}
