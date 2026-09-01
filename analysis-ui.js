(function () {

    const backBtn =
        document.querySelector(
            "#backToGamesBtn"
        );

    const topPlayerElo =
        document.querySelector(
            "#topPlayerElo"
        );

    const topGameRating =
        document.querySelector(
            "#topGameRating"
        );


    // =============================================
    // BACK -> PREVIOUS GAMES LIST
    // =============================================

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            function () {

                if (window.history.length > 1) {

                    window.history.back();

                } else {

                    window.location.href =
                        "index.html";
                }

            }
        );
    }


    // =============================================
    // PLAYER ELO
    // =============================================

    function updatePlayerElo() {

        const storedUsername =
            localStorage.getItem(
                "chessUsername"
            );


        const storedGame =
            localStorage.getItem(
                "selectedChessGame"
            );


        if (!storedGame) {

            return;
        }


        try {

            const game =
                JSON.parse(
                    storedGame
                );


            const username =
                String(
                    storedUsername || ""
                ).toLowerCase();


            const whiteName =
                String(
                    game.white?.username || ""
                ).toLowerCase();


            const blackName =
                String(
                    game.black?.username || ""
                ).toLowerCase();


            let rating =
                null;


            if (
                username &&
                username === whiteName
            ) {

                rating =
                    game.white?.rating;

            } else if (
                username &&
                username === blackName
            ) {

                rating =
                    game.black?.rating;
            }


            if (
                rating !== null &&
                rating !== undefined
            ) {

                topPlayerElo.textContent =
                    rating;

            } else {

                topPlayerElo.textContent =
                    "-";
            }


        } catch (error) {

            console.error(
                "Could not read game rating:",
                error
            );
        }
    }


    // =============================================
    // COPY GAME PERFORMANCE
    // FROM GAME REPORT TO TOP CARD
    // =============================================

    function syncGameRating() {

        const original =
            document.querySelector(
                "#reportPerformance"
            );


        if (!original) {

            return;
        }


        const value =
            original.textContent.trim();


        if (
            value &&
            value !== "-"
        ) {

            topGameRating.textContent =
                value;


            topGameRating.classList.remove(
                "loading"
            );

        } else {

            topGameRating.textContent =
                "Analyzing...";


            topGameRating.classList.add(
                "loading"
            );
        }
    }


    // =============================================
    // REPORT CHANGES WHEN STOCKFISH FINISHES
    // =============================================

    function watchGameRating() {

        const report =
            document.querySelector(
                "#reportPerformance"
            );


        if (!report) {

            setTimeout(
                watchGameRating,
                150
            );

            return;
        }


        syncGameRating();


        const observer =
            new MutationObserver(
                function () {

                    syncGameRating();
                }
            );


        observer.observe(
            report,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );
    }


    updatePlayerElo();

    watchGameRating();

})();