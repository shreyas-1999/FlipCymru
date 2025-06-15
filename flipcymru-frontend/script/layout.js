function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
  }
  
  function loadLayout() {
    $("#header").load("partials/header.html", async () => {
      const username = localStorage.getItem("username");
      if (username) {
        $("#welcomeMsg").text(`Welcome back, ${username}!`);
      }
  
      const token = localStorage.getItem("token");
      if (!token) return;
  
      // Populate categories dropdown
      const res = await fetch("http://localhost:5000/api/categories", {
        headers: { Authorization: "Bearer " + token }
      });
      const categories = await res.json();
      const list = $("#categoryDropdown");
      categories.forEach(cat => {
        list.append(`<li><a class="dropdown-item" href="flashcards.html?category=${cat.id}">${cat.name}</a></li>`);
      });
  
      $("#logoutBtn").click(logout);
    });
  
    $("#footer").load("partials/footer.html");
  }
  