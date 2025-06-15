let cards = [], index = 0, flipped = false;

$(function () {
  const token = localStorage.getItem("token");
  const categoryId = new URLSearchParams(window.location.search).get("category");

  if (!token) return window.location.href = "index.html";

  $.ajax({
    url: `http://localhost:5000/api/cards/${categoryId}`,
    headers: { Authorization: "Bearer " + token },
    success: function (data) {
      cards = data;
      showCard();
    },
    error: function () {
      alert("Error loading cards");
    }
  });

  $("#cardBox").click(() => {
    flipped = !flipped;
    showCard();
  });

  $("#prevBtn").click(() => {
    if (index > 0) index--;
    flipped = false;
    showCard();
  });

  $("#nextBtn").click(() => {
    if (index < cards.length - 1) index++;
    flipped = false;
    showCard();
  });
});

function showCard() {
  const card = cards[index];
  const html = flipped
    ? `<h3>${card.welsh}</h3><p>${card.pronunciation}</p><button class="btn btn-sm btn-info mt-2" onclick="playAudio('${card.audio_url}')">🔊 Hear it</button>`
    : `<h3>${card.english}</h3>`;
  $("#cardBox").html(html);
}

function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
}
