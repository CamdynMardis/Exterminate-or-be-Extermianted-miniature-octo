# Exterminate or Be Exterminated

Find hidden pests before your searches run out - or be exterminated!

## Play the Game

- [Concept Game](https://camdynmardis.github.io/Exterminate-or-be-Extermianted-miniature-octo/index.html)
- [Full Game](https://camdynmardis.github.io/Exterminate-or-be-Extermianted-miniature-octo/pages/full-game/index.html)
- [GitHub Repository](https://github.com/CamdynMardis/Exterminate-or-be-Extermianted-miniature-octo)

## Authorship

- **Author:** [Camdyn Mardis](https://github.com/CamdynMardis)
- **Updated:** October 9, 2026
- **Version:** 1.0 — Level 1

## User Story

As a player who enjoys horror games and searching for hidden objects, I want to move objects and find pests with a limited number of searches so that I can clear each stage before the pests get me.

## Narrative

You are an exterminator searching places where pests like to hide. Each object could be hiding a pest, but you do not have enough searches to check everything.

Level 1 begins under a kitchen sink. Find all three bugs before your four searches run out. If you succeed, you move to the final stage under a cluttered bed. This time, you have three searches to find one oversized gopher rat hidden behind six bedroom objects.

If you run out of searches, the remaining pests appear in a jumpscare. Finding the gopher rat completes Level 1.

## About the Two Versions

### Concept Game

The concept is a simple version of the main game idea.

- Enter a player name or leave it blank for a random guest name.
- Drag an object aside or click it to search.
- Find three bugs using four searches.
- Earn 10 points for each bug found.
- View the result in a Bootstrap modal.
- Compare the top 10 scores from the current browser-tab session.

The concept uses jQuery and jQuery UI for interactions. Its leaderboard uses `sessionStorage`.

### Full Game

The full game develops the concept into a horror-themed experience with AI-generated artwork and AI-assisted code.

- Stage 1: Search under the kitchen sink for three pests using four searches.
- Stage 2: Search under the bed for the gopher rat using three searches.
- Found pests appear briefly so the player can notice them.
- Losing triggers a jumpscare.
- The gopher rat loss includes a short animation and screech.
- Completing Stage 1 unlocks the final stage.
- Completing both stages finishes Level 1.
- A completed level is worth 40 points.

The full game uses JavaScript for its game logic and `localStorage` for its leaderboard. Pest locations are currently fixed.

Both versions include navigation between the concept and full game.

## Planning and Wireframe

- [Game Ideas and Planning](https://github.com/CamdynMardis/Exterminate-or-be-Extermianted-miniature-octo/issues/1)
- [Game Wireframe Wiki](https://github.com/CamdynMardis/Exterminate-or-be-Extermianted-miniature-octo/wiki/Game-Wireframe)
- [Wireframe Image](wireframe.png)

## Directory Structure

```text
Exterminate-or-be-Extermianted-miniature-octo/
├── index.html
├── README.md
├── wireframe.png
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
└── pages/
    └── full-game/
        ├── index.html
        ├── full-game.css
        ├── full-game.js
        └── assets/
            └── images/
                ├── main-menu-bg.png
                ├── title-art.png
                ├── under-sink-bg.png
                ├── spray-bottle.png
                ├── sponge.png
                ├── bucket.png
                ├── trash-bag.png
                ├── soap.png
                ├── roach.png
                ├── spider.png
                ├── centipede.png
                ├── under-bed-bg.png
                ├── bed-shoes.png
                ├── bed-trash.png
                ├── bed-controller.png
                ├── bed-clothes.png
                ├── bed-backpack.png
                ├── bed-shoebox.png
                └── gopher-rat.png
```

## Technologies and Tools

- **HTML:** Page structure, game objects, buttons, and dialogs.
- **CSS:** Layout, colors, object placement, and animations.
- **JavaScript:** Searches, pest reveals, scoring, stage changes, and results.
- **jQuery:** Concept-game events and DOM updates.
- **jQuery UI:** Draggable objects in the concept game.
- **Bootstrap 5:** Concept-game results modal.
- **Bootstrap Icons:** Title and leaderboard icons.
- **Web Storage:** Browser-based leaderboards.
- **Web Audio API:** Full-game loss sound.
- **Visual Studio Code and Live Server:** Editing and local testing.
- **GitHub and GitHub Pages:** Repository, planning, documentation, and hosting.
- **Nu HTML Checker and Lighthouse:** Validation and automated checks.
- **OpenAI tools:** AI-generated artwork and coding assistance.

## Code Example: Updating the Game Counters

The concept game displays the remaining searches, bugs found, and current score:

```html
<div class="counters">
  <p>Searches remaining: <span id="searches">4</span></p>
  <p>Bugs found: <span id="bugs-found">0</span> / 3</p>
  <p>Your score: <span id="score">0</span></p>
</div>
```

Clicking an object calls the search function:

```javascript
items.on("click", function () {
  searchItem(this);
});
```

After processing a search, the game calls `updateCounters()`:

```javascript
function updateCounters() {
  $("#searches").text(searches);
  $("#bugs-found").text(bugsFound);
  $("#score").text(bugsFound * 10);
}
```

This connects a player action to a function that changes the page. The counters update without reloading, and each bug adds 10 points.

## Validation and Accessibility

Testing was performed on the published GitHub Pages versions on October 9, 2026.

### HTML Validation

Both pages passed the Nu HTML Checker with no errors or warnings.

- [Check Concept HTML](https://validator.w3.org/nu/?doc=https%3A%2F%2Fcamdynmardis.github.io%2FExterminate-or-be-Extermianted-miniature-octo%2Findex.html)
- [Check Full-Game HTML](https://validator.w3.org/nu/?doc=https%3A%2F%2Fcamdynmardis.github.io%2FExterminate-or-be-Extermianted-miniature-octo%2Fpages%2Ffull-game%2Findex.html)

### Lighthouse Results

| Version | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Concept | 95 | 100 | 96 | 90 |
| Full Game | 80 | 100 | 96 | 91 |

- [Concept Lighthouse Screenshot](docs/testing/concept-lighthouse.png)
- [Full-Game Lighthouse Screenshot](docs/testing/full-game-lighthouse.png)

These scores describe the recorded test runs. Lighthouse scores can change between runs.

The concept report included a browser error from the SmarterProctoring Chrome extension. The full-game report identified large image downloads as an area for improvement.

An accessibility score of 100 means the automated checks passed for the tested page state. It does not confirm that every gameplay screen or interaction is fully accessible.

### Gameplay Testing

I tested both published games and the navigation between them. I also checked player names, leaderboard results, winning, losing, and retrying.

## Future Improvements - Sprint 99

The [sprint99 milestone](https://github.com/CamdynMardis/Exterminate-or-be-Extermianted-miniature-octo/milestone/1) contains three open issues for future improvements:

1. **Randomize pest locations**
   - Change hiding spots between rounds so players cannot memorize the answers.

2. **Add more levels and pest mutations**
   - Introduce new environments, objects, and increasingly mutated pests in later levels.

3. **Improve image loading**
   - Compress images and reduce unnecessary downloads to improve performance.

These improvements are planned for future development and have not been implemented.
