const mainMenu = document.querySelector("#mainMenu");
const gameScreen = document.querySelector("#gameScreen");

const startGameBtn = document.querySelector("#startGameBtn");
const mainMenuBtn = document.querySelector("#mainMenuBtn");
const leaderboardBtn = document.querySelector("#leaderboardBtn");
const closeLeaderboard = document.querySelector("#closeLeaderboard");
const tryAgainBtn = document.querySelector("#tryAgainBtn");
const jumpscareTryAgain = document.querySelector("#jumpscareTryAgain");
const nextStageBtn = document.querySelector("#nextStageBtn");

const leaderboardModal = document.querySelector("#leaderboardModal");
const leaderboardList = document.querySelector("#leaderboardList");

const jumpscare = document.querySelector("#jumpscare");
const remainingPests = document.querySelector("#remainingPests");

const winScreen = document.querySelector("#winScreen");
const winScore = document.querySelector("#winScore");
const stageTitle = document.querySelector("#stageTitle");

const playerNameInput = document.querySelector("#playerName");
const gameMessage = document.querySelector("#gameMessage");
const searchesText = document.querySelector("#searches");
const pestsFoundText = document.querySelector("#pestsFound");

const hotspots = document.querySelectorAll(".hotspot");
const pestImages = document.querySelectorAll(".pest-image");

let searches = 4;
let pestsFound = 0;
let currentPlayer = "";
let foundBugs = new Set();

const pestFiles = {
  roach: "assets/images/roach.png",
  spider: "assets/images/spider.png",
  centipede: "assets/images/centipede.png",
};

let scores = JSON.parse(localStorage.getItem("pestScores")) || [
  {
    name: "Guest539",
    score: 30,
    result: "Passed",
  },
  {
    name: "cam",
    score: 20,
    result: "Failed",
  },
];

function resetGame() {
  searches = 4;
  pestsFound = 0;
  foundBugs = new Set();

  searchesText.textContent = searches;
  pestsFoundText.textContent = pestsFound;

  gameMessage.textContent = "Search the objects to find the pests.";

  jumpscare.classList.add("hidden");
  winScreen.classList.add("hidden");
  remainingPests.innerHTML = "";

  hotspots.forEach((object) => {
    object.disabled = false;
    object.classList.remove("removed");
  });

  pestImages.forEach((pest) => {
    pest.classList.remove("visible");
  });
}

function startGame() {
  currentPlayer =
    playerNameInput.value.trim() ||
    `Guest${Math.floor(Math.random() * 900) + 100}`;

  stageTitle.textContent = "STAGE 1: UNDER THE KITCHEN SINK";

  resetGame();

  mainMenu.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

function returnToMainMenu() {
  gameScreen.classList.add("hidden");
  mainMenu.classList.remove("hidden");
}

function revealPest(bugName) {
  foundBugs.add(bugName);

  const pest = document.querySelector(`[data-pest-image="${bugName}"]`);

  if (!pest) {
    return;
  }

  pest.classList.add("visible");

  setTimeout(() => {
    pest.classList.remove("visible");
  }, 2000);
}

function showJumpscare() {
  remainingPests.innerHTML = "";

  Object.keys(pestFiles).forEach((bugName) => {
    if (!foundBugs.has(bugName)) {
      const pestImage = document.createElement("img");

      pestImage.className = "jumpscare-pest";
      pestImage.src = pestFiles[bugName];
      pestImage.alt = bugName;

      remainingPests.appendChild(pestImage);
    }
  });

  jumpscare.classList.remove("hidden");
}

function showWinScreen() {
  winScore.textContent = `Your score: ${pestsFound * 10} points`;

  winScreen.classList.remove("hidden");
}

function loseGame() {
  finishGame("Failed", "You ran out of searches.");
  showJumpscare();
}

function searchObject(event) {
  const object = event.currentTarget;

  if (object.disabled || searches <= 0) {
    return;
  }

  object.disabled = true;
  object.classList.add("removed");

  searches--;
  searchesText.textContent = searches;

  const bugName = object.dataset.bug;

  if (bugName) {
    pestsFound++;
    pestsFoundText.textContent = pestsFound;

    revealPest(bugName);

    gameMessage.textContent = "You found a pest hiding behind the object!";

    if (pestsFound === 3) {
      finishGame("Passed", "You found all three pests!");
      showWinScreen();
      return;
    }

    if (searches === 0) {
      loseGame();
    }

    return;
  }

  gameMessage.textContent = "Nothing was hiding behind that object.";

  if (searches === 0 && pestsFound < 3) {
    loseGame();
  }
}

function finishGame(result, message) {
  hotspots.forEach((object) => {
    object.disabled = true;
  });

  gameMessage.textContent = `${message} ${result}`;

  scores.push({
    name: currentPlayer,
    score: pestsFound * 10,
    result: result,
  });

  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);

  localStorage.setItem("pestScores", JSON.stringify(scores));
}

function startFinalStage() {
  winScreen.classList.add("hidden");

  stageTitle.textContent = "FINAL STAGE: THE DRAIN";

  searches = 4;
  pestsFound = 0;
  foundBugs = new Set();

  searchesText.textContent = searches;
  pestsFoundText.textContent = pestsFound;

  gameMessage.textContent = "The final stage begins. Find the remaining pests.";

  hotspots.forEach((object) => {
    object.disabled = false;
    object.classList.remove("removed");
  });

  pestImages.forEach((pest) => {
    pest.classList.remove("visible");
  });
}

function showLeaderboard() {
  leaderboardList.innerHTML = "";

  scores.forEach((entry) => {
    const item = document.createElement("li");

    item.textContent = `${entry.name}: ${entry.score} points | ${entry.result}`;

    leaderboardList.appendChild(item);
  });

  leaderboardModal.classList.remove("hidden");
}

hotspots.forEach((object) => {
  object.addEventListener("click", searchObject);
});

startGameBtn.addEventListener("click", startGame);

mainMenuBtn.addEventListener("click", returnToMainMenu);

tryAgainBtn.addEventListener("click", resetGame);

jumpscareTryAgain.addEventListener("click", resetGame);

nextStageBtn.addEventListener("click", startFinalStage);

leaderboardBtn.addEventListener("click", showLeaderboard);

closeLeaderboard.addEventListener("click", () => {
  leaderboardModal.classList.add("hidden");
});

leaderboardModal.addEventListener("click", (event) => {
  if (event.target === leaderboardModal) {
    leaderboardModal.classList.add("hidden");
  }
});
