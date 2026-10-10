$(function () {
  const items = $(".item");

  const resultModal = new bootstrap.Modal(
    document.querySelector("#result-modal")
  );

  const STORAGE_KEY = "pestScores";

  let searches = 4;
  let bugsFound = 0;
  let playing = false;
  let playerName = "";

  // One shared score list for every object and game.
  let scores = loadScores();

  function loadScores() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "[]"
      );

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved
        .filter(function (entry) {
          return (
            entry &&
            typeof entry.name === "string" &&
            Number.isFinite(entry.score)
          );
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })
        .slice(0, 10);
    } catch {
      return [];
    }
  }

  function updateCounters() {
    $("#searches").text(searches);
    $("#bugs-found").text(bugsFound);
    $("#score").text(bugsFound * 10);
  }

  function startGame() {
    // Do not restart an active game.
    if (playing) {
      return;
    }

    playerName = $("#player-name").val().trim();

    if (playerName === "") {
      playerName =
        "Guest" + Math.floor(Math.random() * 1000);
    }

    searches = 4;
    bugsFound = 0;
    playing = true;

    $("#greeting").text(
      "Good luck, " + playerName + "!"
    );

    $("#message").text(
      "Drag an object aside or click it to search."
    );

    $("#start-button").prop("disabled", true);
    $("#reset-button").prop("disabled", true);
    $("#player-name").prop("disabled", true);

    items.each(function () {
      $(this)
        .data("searched", false)
        .prop("disabled", false)
        .css({
          visibility: "visible",
          top: 0,
          left: 0
        });
    });

    $(".bug").prop("hidden", true);

    items.draggable("enable");

    updateCounters();
    items.first().trigger("focus");
  }

  function searchItem(item) {
    const object = $(item);

    if (
      !playing ||
      searches <= 0 ||
      object.data("searched")
    ) {
      return;
    }

    // Each object can use only one search.
    object.data("searched", true);
    object.prop("disabled", true);
    object.css("visibility", "hidden");

    searches = searches - 1;

    if (object.attr("data-bug") === "true") {
      object
        .parent()
        .find(".bug")
        .prop("hidden", false);

      bugsFound = bugsFound + 1;

      $("#message").text("You found a bug!");
    } else {
      $("#message").text("Nothing here!");
    }

    updateCounters();

    // Check winning first: the fourth search can still win.
    if (bugsFound === 3) {
      finishGame(true);
    } else if (searches === 0) {
      finishGame(false);
    }
  }

  function finishGame(won) {
    playing = false;

    items.draggable("disable");
    items.prop("disabled", true);

    $("#start-button").prop("disabled", false);
    $("#reset-button").prop("disabled", false);
    $("#player-name").prop("disabled", false);

    const result = won ? "Passed" : "Failed";

    const message = won
      ? "Job completed! You found all 3 bugs!"
      : "You lose! The pests got you!";

    $("#message").text(
      message + " Final score: " + bugsFound * 10 + "."
    );

    saveScore(result);

    $("#result-title").text(
      won ? "You won!" : "You lost!"
    );

    $("#result-message").text(
      playerName + ", " + message
    );

    $("#result-score").text(bugsFound * 10);

    resultModal.show();
  }

  function saveScore(result) {
    scores.push({
      name: playerName,
      score: bugsFound * 10,
      result: result
    });

    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    scores = scores.slice(0, 10);

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(scores)
      );
    } catch {
      // Keep the in-memory leaderboard working if storage fails.
    }

    showLeaderboard();
  }

  function showLeaderboard() {
    const list = $("#leaderboard");

    list.empty();

    $("#empty-leaderboard").prop(
      "hidden",
      scores.length > 0
    );

    scores.forEach(function (entry) {
      // Supports older saved scores that lack a result field.
      const result =
        entry.result ||
        (entry.score === 30 ? "Passed" : "Failed");

      const row = $("<li>");

      row.text(
        entry.name +
        ": " +
        entry.score +
        " points | " +
        result
      );

      list.append(row);
    });
  }

  /* jQuery UI dragging */

  items.draggable({
    disabled: true,

    // Allow our button elements to be dragged.
    cancel: false,

    distance: 10,
    scroll: false,

    start: function () {
      if (!playing || $(this).data("searched")) {
        return false;
      }

      $(this).css("z-index", 10);
    },

    stop: function (event, ui) {
      const distance = Math.hypot(
        ui.position.left - ui.originalPosition.left,
        ui.position.top - ui.originalPosition.top
      );

      $(this).css({
        top: 0,
        left: 0,
        "z-index": 1
      });

      if (distance >= 30) {
        searchItem(this);
      }
    }
  });

  // Clicking also works, including Enter/Space on a focused button.
  items.on("click", function () {
    searchItem(this);
  });

  $("#player-form").on("submit", function (event) {
    event.preventDefault();
    startGame();
  });

  $("#reset-button").on("click", function () {
    startGame();
  });

  $("#modal-play-again").on("click", function () {
    // Wait until Bootstrap finishes closing the modal.
    $("#result-modal").one(
      "hidden.bs.modal",
      function () {
        startGame();
      }
    );

    resultModal.hide();
  });

  $("#result-modal").on("hidden.bs.modal", function () {
    if (!playing) {
      $("#reset-button").trigger("focus");
    }
  });

  updateCounters();
  showLeaderboard();
});
