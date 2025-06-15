$(function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token) return window.location.href = "index.html";

  $("#welcomeMsg").text(`Welcome back, ${username}!`);

  $.ajax({
    url: "http://localhost:5000/api/categories",
    headers: { Authorization: "Bearer " + token },
    success: function (categories) {
      categories.forEach((cat) => {
        $("#categoryList").append(`
          <div class="card mb-3 p-3">
            <h5>${cat.name}</h5>
            <div class="progress mb-2">
              <div class="progress-bar" style="width: ${cat.progress}%"></div>
            </div>
            <a class="btn btn-sm btn-primary" href="flashcards.html?category=${cat.id}">Start</a>
          </div>
        `);
      });
    },
    error: function () {
      alert("Error loading categories");
    }
  });
});