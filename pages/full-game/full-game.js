const $ = (id) => document.getElementById(id);

/* STAGE SETTINGS */

const stages = {
  1: {
    scene: $("sinkScene"),
    title: "STAGE 1: UNDER THE KITCHEN SINK",
    searches: 4,
    pests: ["roach", "spider", "centipede"],
    instruction: "Search the objects to find the pests."
  },

  2: {
    scene: $("bedScene"),
    title: "LEVEL 1 — FINAL STAGE: UNDER THE BED",
    searches: 3,
    pests: ["gopher-rat"],
    instruction: "Find the gopher rat. You have only 3 searches!"
  }
};

const pestFiles = {
  roach: "assets/images/roach.png",
  spider: "assets/images/spider.png",
  centipede: "assets/images/centipede.png",
  "gopher-rat": "assets/images/gopher-rat.png"
};

const REVEAL_MS = 2000;
const SCARE_MS = 2200;

let currentStage = 1;
let searches = 4;
let foundBugs = new Set();

let currentPlayer = "";
let stageOneScore = 0;
let phase = "menu";

let audioContext;
let activeSound;

const timers = new Set();

/* LEADERBOARD STORAGE */

function readScores() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("pestScores") || "[]"
    );

    return Array.isArray(saved)
      ? saved
          .filter((entry) =>
            entry &&
            typeof entry.name === "string" &&
            Number.isFinite(entry.score)
          )
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

let scores = readScores();

/* TIMERS */

function later(callback, delay) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    callback();
  }, delay);

  timers.add(timer);
}

function clearEffects() {
  timers.forEach(clearTimeout);
  timers.clear();

  if (activeSound) {
    activeSound();
    activeSound = null;
  }

  document.querySelectorAll(".pest-image").forEach((pest) => {
    pest.classList.remove("visible");
  });

  $("jumpscare").classList.add("hidden");

  $("jumpscare").classList.remove(
    "boss-scare",
    "scare-playing"
  );

  $("lossDetails").classList.remove("hidden");
  $("winScreen").classList.add("hidden");
  $("remainingPests").replaceChildren();
}

/* RAT SCREECH */

function prepareAudio() {
  try {
    const AudioEngine =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioEngine) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioEngine();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
  } catch {
    // The game still works if audio is unavailable.
  }
}

function playScreech() {
  if (
    !audioContext ||
    audioContext.state !== "running"
  ) {
    return;
  }

  try {
    const ctx = audioContext;
    const start = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const volume = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(
      650,
      start
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      1800,
      start + 0.12
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      450,
      start + 0.85
    );

    filter.type = "lowpass";
    filter.frequency.value = 2400;

    volume.gain.setValueAtTime(
      0,
      start
    );

    volume.gain.linearRampToValueAtTime(
      0.09,
      start + 0.04
    );

    volume.gain.exponentialRampToValueAtTime(
      0.001,
      start + 0.9
    );

    oscillator.connect(filter);
    filter.connect(volume);
    volume.connect(ctx.destination);

    const stop = () => {
      try {
        oscillator.stop();
      } catch {}

      oscillator.disconnect();
      filter.disconnect();
      volume.disconnect();
    };

    activeSound = stop;

    oscillator.onended = () => {
      stop();

      if (activeSound === stop) {
        activeSound = null;
      }
    };

    oscillator.start(start);
    oscillator.stop(start + 0.95);
  } catch {
    // Audio failure must not prevent the loss screen.
  }
}

/* STAGE SETUP */

function updateCounters() {
  $("searches").textContent = searches;
  $("pestsFound").textContent = foundBugs.size;

  $("pestsTotal").textContent =
    stages[currentStage].pests.length;
}

function loadStage(number) {
  clearEffects();

  currentStage = number;
  phase = "playing";
  searches = stages[number].searches;
  foundBugs = new Set();

  if (number === 1) {
    stageOneScore = 0;
  }

  $("mainMenu").classList.add("hidden");
  $("gameScreen").classList.remove("hidden");

  $("gameScreen").classList.toggle(
    "boss-stage",
    number === 2
  );

  $("leaderboardModal").classList.add("hidden");

  $("sinkScene").classList.toggle(
    "hidden",
    number !== 1
  );

  $("bedScene").classList.toggle(
    "hidden",
    number !== 2
  );

  $("stageTitle").textContent =
    stages[number].title;

  $("gameMessage").textContent =
    stages[number].instruction;

  stages[number].scene
    .querySelectorAll(".hotspot")
    .forEach((object) => {
      object.disabled = false;
      object.classList.remove("removed");
    });

  updateCounters();
  $("stageTitle").focus();
}

function startGame() {
  prepareAudio();

  currentPlayer =
    $("playerName").value.trim() ||
    `Guest${Math.floor(Math.random() * 900) + 100}`;

  loadStage(1);
}

function returnToMainMenu() {
  clearEffects();
  phase = "menu";

  $("gameScreen").classList.add("hidden");
  $("leaderboardModal").classList.add("hidden");
  $("mainMenu").classList.remove("hidden");

  $("startGameBtn").focus();
}

function lockStage() {
  stages[currentStage].scene
    .querySelectorAll(".hotspot")
    .forEach((object) => {
      object.disabled = true;
    });
}

/* SCORING */

function totalScore() {
  return (
    (currentStage === 2 ? stageOneScore : 0) +
    foundBugs.size * 10
  );
}

function saveResult(result) {
  scores.push({
    name: currentPlayer,
    score: totalScore(),
    result
  });

  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);

  try {
    localStorage.setItem(
      "pestScores",
      JSON.stringify(scores)
    );
  } catch {
    // Keep scores in memory if storage is unavailable.
  }
}

/* PEST REVEAL */

function revealPest(name) {
  const pest = stages[currentStage].scene.querySelector(
    `[data-pest-image="${name}"]`
  );

  if (!pest) {
    return;
  }

  pest.classList.add("visible");

  later(() => {
    pest.classList.remove("visible");
  }, REVEAL_MS);
}

/* WIN SCREEN */

function winStage() {
  phase = "ending";
  lockStage();

  const finalStage = currentStage === 2;

  if (!finalStage) {
    stageOneScore = foundBugs.size * 10;
  } else {
    saveResult("Level 1 Complete");
  }

  $("gameMessage").textContent = finalStage
    ? "You found the gopher rat! Level 1 complete!"
    : "You found all three pests! Stage complete!";

  // Keep the final pest visible before displaying the result.
  later(() => {
    phase = "won";

    $("winTitle").textContent = finalStage
      ? "LEVEL 1 COMPLETE"
      : "STAGE COMPLETE";

    $("winMessage").textContent = finalStage
      ? "You found the gopher rat and cleared both stages!"
      : "You found all three pests! The final stage is next.";

    $("winScore").textContent =
      `Your score: ${totalScore()} points`;

    $("nextStageBtn").classList.toggle(
      "hidden",
      finalStage
    );

    $("winScreen").classList.remove("hidden");

    $(finalStage ? "winMenuBtn" : "nextStageBtn").focus();
  }, REVEAL_MS + 350);
}

/* LOSS SCREEN */

function loseStage() {
  phase = "lost";
  lockStage();

  saveResult("Failed");

  $("gameMessage").textContent =
    "You ran out of searches. You lost!";

  const boss = currentStage === 2;
  const overlay = $("jumpscare");

  $("remainingPests").replaceChildren();

  stages[currentStage].pests
    .filter((name) => !foundBugs.has(name))
    .forEach((name) => {
      const image = document.createElement("img");

      image.className = boss
        ? "jumpscare-pest boss-rat"
        : "jumpscare-pest";

      image.src = pestFiles[name];
      image.alt = name.replaceAll("-", " ");

      $("remainingPests").appendChild(image);
    });

  $("lossTitle").textContent = boss
    ? "THE GOPHER RAT GOT YOU!"
    : "THE PESTS GOT YOU!";

  $("lossMessage").textContent = boss
    ? "You used all 3 searches without finding the rat."
    : "You missed some of the pests.";

  overlay.classList.toggle(
    "boss-scare",
    boss
  );

  overlay.classList.toggle(
    "scare-playing",
    boss
  );

  $("lossDetails").classList.toggle(
    "hidden",
    boss
  );

  overlay.classList.remove("hidden");
  overlay.focus();

  if (boss) {
    playScreech();

    // Show retry and menu buttons after the animation ends.
    later(() => {
      overlay.classList.remove("scare-playing");
      $("lossDetails").classList.remove("hidden");
      $("jumpscareTryAgain").focus();
    }, SCARE_MS);
  } else {
    $("jumpscareTryAgain").focus();
  }
}

/* SEARCH OBJECTS */

function searchObject(event) {
  const object = event.currentTarget;

  if (
    phase !== "playing" ||
    object.disabled ||
    searches <= 0 ||
    !stages[currentStage].scene.contains(object)
  ) {
    return;
  }

  object.disabled = true;
  object.classList.add("removed");

  searches--;

  const name = object.dataset.bug;

  if (
    name &&
    stages[currentStage].pests.includes(name) &&
    !foundBugs.has(name)
  ) {
    foundBugs.add(name);
    revealPest(name);

    $("gameMessage").textContent = currentStage === 2
      ? "You found the gopher rat!"
      : "You found a pest hiding behind the object!";
  } else {
    $("gameMessage").textContent =
      "Nothing was hiding behind that object.";
  }

  updateCounters();

  // Finding the last pest on the last search is still a win.
  if (
    foundBugs.size === stages[currentStage].pests.length
  ) {
    winStage();
  } else if (searches === 0) {
    loseStage();
  }
}

/* RETRY ONLY AFTER A LOSS */

function retryStage() {
  if (
    phase !== "lost" ||
    $("jumpscare").classList.contains("scare-playing")
  ) {
    return;
  }

  prepareAudio();
  loadStage(currentStage);
}

/* LEADERBOARD */

function showLeaderboard() {
  $("leaderboardList").replaceChildren();

  $("leaderboardEmpty").classList.toggle(
    "hidden",
    scores.length > 0
  );

  scores.forEach((entry) => {
    const item = document.createElement("li");

    item.textContent =
      `${entry.name}: ${entry.score} points | ` +
      `${entry.result || "Completed"}`;

    $("leaderboardList").appendChild(item);
  });

  $("leaderboardModal").classList.remove("hidden");
  $("closeLeaderboard").focus();
}

function hideLeaderboard() {
  $("leaderboardModal").classList.add("hidden");
  $("leaderboardBtn").focus();
}

/* BUTTON EVENTS */

document.querySelectorAll(".hotspot").forEach((object) => {
  object.addEventListener("click", searchObject);
});

$("startGameBtn").addEventListener(
  "click",
  startGame
);

$("mainMenuBtn").addEventListener(
  "click",
  returnToMainMenu
);

$("lossMenuBtn").addEventListener(
  "click",
  returnToMainMenu
);

$("winMenuBtn").addEventListener(
  "click",
  returnToMainMenu
);

// The loss screen is the only place with a Try Again button.
$("jumpscareTryAgain").addEventListener(
  "click",
  retryStage
);

$("nextStageBtn").addEventListener("click", () => {
  if (phase === "won" && currentStage === 1) {
    prepareAudio();
    loadStage(2);
  }
});

$("leaderboardBtn").addEventListener(
  "click",
  showLeaderboard
);

$("closeLeaderboard").addEventListener(
  "click",
  hideLeaderboard
);

$("leaderboardModal").addEventListener("click", (event) => {
  if (event.target === $("leaderboardModal")) {
    hideLeaderboard();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !$("leaderboardModal").classList.contains("hidden")
  ) {
    hideLeaderboard();
  }
});