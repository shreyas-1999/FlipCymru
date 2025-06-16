// src/components/Footer.tsx
export default function Footer() {
    return (
      <footer className="bg-light text-center py-3 mt-auto">
        <div className="mb-2">
          <button className="btn btn-link" onClick={() => window.location.href = "/"}>Categories</button>
          <button className="btn btn-link" onClick={() => window.location.href = "/create"}>Create Flashcards</button>
          <button className="btn btn-link" onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}>Logout</button>
        </div>
        <small>&copy; 2025 FlipCymru. All rights reserved.</small>
      </footer>
    );
  }
  