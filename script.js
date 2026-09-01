const usernameInput =
    document.querySelector("#username");

const searchBtn =
    document.querySelector("#searchBtn");

const message =
    document.querySelector("#message");

const gamesSection =
    document.querySelector("#gamesSection");

const gamesList =
    document.querySelector("#gamesList");

const gamesCount =
    document.querySelector("#gamesCount");


searchBtn.addEventListener(
    "click",
    searchPlayerGames
);


usernameInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            searchPlayerGames();
        }
    }
);


// ==========================
// SEARCH PLAYER
// ==========================

async function searchPlayerGames() {

    const username =
        usernameInput.value.trim();


    if (username === "") {

        message.textContent =
            "Please enter your Chess.com username.";

        return;
    }


    message.textContent =
        "Searching for games...";

    gamesSection.hidden = true;

    gamesList.innerHTML = "";


    searchBtn.disabled = true;

    searchBtn.textContent =
        "Searching...";


    try {

        // ==========================
        // GET PLAYER ARCHIVES
        // ==========================

        const archivesResponse =
            await fetch(
                `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`
            );


        if (!archivesResponse.ok) {

            if (archivesResponse.status === 404) {

                throw new Error(
                    "Player not found. Check the username."
                );
            }


            throw new Error(
                "Could not connect to Chess.com."
            );
        }


        const archivesData =
            await archivesResponse.json();


        const archives =
            archivesData.archives;


        if (
            !archives ||
            archives.length === 0
        ) {

            message.textContent =
                "No games found for this player.";

            return;
        }


        // ==========================
        // GET LATEST MONTH
        // ==========================

        const latestArchive =
            archives[archives.length - 1];


        message.textContent =
            "Loading recent games...";


        const gamesResponse =
            await fetch(latestArchive);


        if (!gamesResponse.ok) {

            throw new Error(
                "Could not load the player's games."
            );
        }


        const gamesData =
            await gamesResponse.json();


        const games =
            gamesData.games || [];


        if (games.length === 0) {

            message.textContent =
                "No recent games found.";

            return;
        }


        // ==========================
        // SORT NEWEST FIRST
        // ==========================

        games.sort(
            function(a, b) {

                return (
                    (b.end_time || 0) -
                    (a.end_time || 0)
                );
            }
        );


        // ==========================
        // SAVE DATA
        // ==========================

        localStorage.setItem(
            "chessUsername",
            username
        );


        localStorage.setItem(
            "chessGames",
            JSON.stringify(games)
        );


        // ==========================
        // SHOW GAMES
        // ==========================

        showGames(
            games,
            username
        );


        message.textContent =
            `${games.length} games found.`;


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message;


    } finally {

        searchBtn.disabled = false;

        searchBtn.textContent =
            "Find My Games";
    }
}


// ==========================
// SHOW GAMES
// ==========================

function showGames(
    games,
    username
) {

    gamesList.innerHTML = "";


    gamesCount.textContent =
        `${games.length} games`;


    gamesSection.hidden = false;


    games.forEach(
        function(game, index) {

            const playerData =
                getPlayerData(
                    game,
                    username
                );


            if (!playerData) {
                return;
            }


            const card =
                document.createElement("article");


            card.classList.add(
                "game-result-card"
            );


            const resultClass =
                playerData.result.toLowerCase();


            card.innerHTML = `
                <div class="game-main-info">

                    <div>

                        <span class="game-result ${resultClass}">
                            ${playerData.result}
                        </span>

                        <h3>
                            vs ${escapeHTML(playerData.opponent)}
                        </h3>

                        <p>
                            Your rating:
                            <strong>
                                ${playerData.playerRating}
                            </strong>

                            &nbsp; • &nbsp;

                            Opponent:
                            <strong>
                                ${playerData.opponentRating}
                            </strong>
                        </p>

                        <p class="game-meta">
                            ${formatDate(game.end_time)}
                            &nbsp; • &nbsp;
                            ${formatTimeControl(game.time_class)}
                        </p>

                    </div>


                    <button
                        class="analyze-btn"
                        data-index="${index}"
                    >
                        Analyze
                    </button>

                </div>
            `;


            gamesList.appendChild(card);
        }
    );


    const analyzeButtons =
        document.querySelectorAll(
            ".analyze-btn"
        );


    analyzeButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const gameIndex =
                        Number(
                            button.dataset.index
                        );


                    openAnalysis(
                        games[gameIndex]
                    );
                }
            );
        }
    );
}


// ==========================
// PLAYER DATA
// ==========================

function getPlayerData(
    game,
    username
) {

    const normalizedUsername =
        username.toLowerCase();


    const whiteUsername =
        game.white?.username
            ?.toLowerCase();


    const blackUsername =
        game.black?.username
            ?.toLowerCase();


    let player;
    let opponent;


    if (
        whiteUsername ===
        normalizedUsername
    ) {

        player =
            game.white;

        opponent =
            game.black;

    } else if (
        blackUsername ===
        normalizedUsername
    ) {

        player =
            game.black;

        opponent =
            game.white;

    } else {

        return null;
    }


    return {
        result:
            getGameResult(
                player.result
            ),

        opponent:
            opponent.username ||
            "Unknown",

        playerRating:
            player.rating ||
            "-",

        opponentRating:
            opponent.rating ||
            "-"
    };
}


// ==========================
// RESULT
// ==========================

function getGameResult(result) {

    const winResults = [
        "win"
    ];


    const drawResults = [
        "agreed",
        "repetition",
        "stalemate",
        "insufficient",
        "50move",
        "timevsinsufficient"
    ];


    if (
        winResults.includes(result)
    ) {

        return "Win";
    }


    if (
        drawResults.includes(result)
    ) {

        return "Draw";
    }


    return "Loss";
}


// ==========================
// DATE
// ==========================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Unknown date";
    }


    const date =
        new Date(
            timestamp * 1000
        );


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


// ==========================
// TIME CONTROL
// ==========================

function formatTimeControl(
    timeClass
) {

    if (!timeClass) {
        return "Chess";
    }


    const names = {
        bullet: "Bullet",
        blitz: "Blitz",
        rapid: "Rapid",
        daily: "Daily"
    };


    return (
        names[timeClass] ||
        timeClass
    );
}


// ==========================
// ANALYZE BUTTON
// ==========================

function openAnalysis(game) {

    localStorage.setItem(
        "selectedChessGame",
        JSON.stringify(game)
    );


    window.location.href =
        "analysis.html";
}


// ==========================
// SAFETY FOR TEXT
// ==========================

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}