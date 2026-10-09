const items = document.querySelectorAll(".item");

let searches = 4;
let bugsFound = 0;
let playing = false;
let playerName = "";

function updateCounters() {
  document.querySelector("#searches").textContent = searches;
  document.querySelector("#bugs-found").textContent = bugsFound;
}

function startGame() {
  playerName = document.querySelector("#player-name").value.trim();

  if (playerName === "") {
    playerName = "Guest" + Math.floor(Math.random() * 1000);
  }

  searches = 4;
  bugsFound = 0;
  playing = true;

  document.querySelector("#greeting").textContent =
    "Good luck, " + playerName + "!";

  document.querySelector("#message").textContent =
    "Drag an object aside to search behind it.";

  items.forEach(function (item) {
    item.style.visibility = "visible";
    item.style.transform = "";
  });

  document.querySelectorAll(".bug").forEach(function (bug) {
    bug.hidden = true;
  });

  updateCounters();
}

document.querySelector("#start-button").onclick = startGame;
document.querySelector("#reset-button").onclick = startGame;

items.forEach(function (item) {
  let dragging = false;
  let startX = 0;
  let startY = 0;

  item.onpointerdown = function (event) {
    if (!playing || event.button !== 0) {
      return;
    }

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    item.setPointerCapture(event.pointerId);
  };

  item.onpointermove = function (event) {
    if (!dragging) {
      return;
    }

    const x = event.clientX - startX;
    const y = event.clientY - startY;

    item.style.transform = "translate(" + x + "px, " + y + "px)";
  };

  item.onpointerup = function (event) {
    if (!dragging) {
      return;
    }

    dragging = false;
    item.style.transform = "";

    const distance = Math.hypot(event.clientX - startX, event.clientY - startY);

    // A small click or movement does not use a search.
    if (!playing || distance < 30) {
      return;
    }

    // Remove the searched object from the board.
    item.style.visibility = "hidden";
    searches = searches - 1;

    if (item.dataset.bug === "true") {
      item.parentElement.querySelector(".bug").hidden = false;
      bugsFound = bugsFound + 1;
      document.querySelector("#message").textContent = "You found a bug!";
    } else {
      document.querySelector("#message").textContent = "Nothing here!";
    }

    updateCounters();

    // Check for a win first so the last search can still win.
    if (bugsFound === 3) {
      playing = false;
      document.querySelector("#message").textContent =
        "Job completed! You found all the bugs!";
      saveScore();
    } else if (searches === 0) {
      playing = false;
      document.querySelector("#message").textContent =
        "You lose! The pests got you! Click Try Again.";
      saveScore();
    }
  };

  item.onpointercancel = function () {
    dragging = false;
    item.style.transform = "";
  };

  let scores = JSON.parse(sessionStorage.getItem("pestScores")) || [];

  function showLeaderboard() {
    const list = document.querySelector("#leaderboard");
    list.textContent = "";

    scores.forEach(function (entry) {
      const row = document.createElement("li");
      const result = entry.score === 30 ? "Passed" : "Failed";

      row.textContent = entry.name + ": " + entry.score + " points | " + result;
      list.appendChild(row);
    });
  }

  function saveScore() {
    scores.push({
      name: playerName,
      score: bugsFound * 10,
    });

    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    sessionStorage.setItem("pestScores", JSON.stringify(scores));
    showLeaderboard();
  }

  showLeaderboard();
});
