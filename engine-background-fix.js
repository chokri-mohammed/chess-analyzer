// =====================================================
// CHESSMOVELAB
// INDEPENDENT TRY MODE ENGINE
//
// Main Stockfish:
//     keeps analyzing the full real game.
//
// Second Stockfish:
//     handles Try / Explore mode only.
//
// This prevents sandbox moves from stopping
// the background full-game analysis.
// =====================================================


// =====================================================
// EXPLORE ENGINE STATE
// =====================================================

let cmlExploreWorker =
    null;


let cmlExploreWorkerReady =
    false;


let cmlExploreWorkerBusy =
    false;


let cmlExploreActiveFen =
    null;


let cmlExplorePendingFen =
    null;


let cmlExploreScoreCp =
    null;


let cmlExploreMate =
    null;


let cmlExploreBestMove =
    null;


// =====================================================
// ENGINE DEPTH
// =====================================================

function cmlGetExploreDepth() {

    if (
        typeof ENGINE_DEPTH !==
        "undefined"
    ) {

        return ENGINE_DEPTH;
    }


    return 12;
}


// =====================================================
// CREATE SECOND STOCKFISH WORKER
// =====================================================

function cmlStartExploreWorker() {

    if (cmlExploreWorker) {

        return;
    }


    try {

        cmlExploreWorker =
            new Worker(
                "engine/stockfish-18-lite-single.js"
            );


        cmlExploreWorker.onmessage =
            cmlHandleExploreWorkerMessage;


        cmlExploreWorker.onerror =
            function (error) {

                console.error(
                    "Explore Stockfish error:",
                    error
                );


                cmlExploreWorkerReady =
                    false;


                cmlExploreWorkerBusy =
                    false;


                cmlExploreActiveFen =
                    null;


                if (
                    typeof engineMessage !==
                    "undefined"
                ) {

                    engineMessage.textContent =
                        "Try Mode engine failed.";
                }
            };


        cmlExploreWorker.postMessage(
            "uci"
        );

    } catch (error) {

        console.error(
            "Could not start Explore Stockfish:",
            error
        );
    }
}


// =====================================================
// HANDLE SECOND ENGINE MESSAGES
// =====================================================

function cmlHandleExploreWorkerMessage(
    event
) {

    const line =
        String(
            event.data ||
            ""
        );


    // =============================================
    // UCI READY
    // =============================================

    if (
        line.includes(
            "uciok"
        )
    ) {

        cmlExploreWorker.postMessage(
            "isready"
        );


        return;
    }


    // =============================================
    // ENGINE READY
    // =============================================

    if (
        line.includes(
            "readyok"
        )
    ) {

        cmlExploreWorkerReady =
            true;


        cmlRunPendingExploreAnalysis();


        return;
    }


    // Ignore normal output
    // when no Explore search is active.

    if (
        !cmlExploreWorkerBusy
    ) {

        return;
    }


    // =============================================
    // ENGINE INFO
    // =============================================

    if (
        line.startsWith(
            "info "
        )
    ) {

        cmlReadExploreEngineInfo(
            line
        );


        return;
    }


    // =============================================
    // SEARCH FINISHED
    // =============================================

    if (
        line.startsWith(
            "bestmove "
        )
    ) {

        cmlFinishExploreSearch(
            line
        );
    }
}


// =====================================================
// READ SCORE + PV
// =====================================================

function cmlReadExploreEngineInfo(
    line
) {

    const scoreMatch =
        line.match(
            /\bscore\s+(cp|mate)\s+(-?\d+)/
        );


    if (scoreMatch) {

        if (
            scoreMatch[1] ===
            "cp"
        ) {

            cmlExploreScoreCp =
                Number(
                    scoreMatch[2]
                );


            cmlExploreMate =
                null;

        } else {

            cmlExploreMate =
                Number(
                    scoreMatch[2]
                );


            cmlExploreScoreCp =
                null;
        }
    }


    const pvMatch =
        line.match(
            /\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/
        );


    if (pvMatch) {

        cmlExploreBestMove =
            pvMatch[1];
    }
}


// =====================================================
// START LATEST PENDING POSITION
// =====================================================

function cmlRunPendingExploreAnalysis() {

    if (
        !cmlExploreWorkerReady ||
        cmlExploreWorkerBusy ||
        !cmlExplorePendingFen
    ) {

        return;
    }


    const fen =
        cmlExplorePendingFen;


    cmlExplorePendingFen =
        null;


    cmlExploreActiveFen =
        fen;


    cmlExploreWorkerBusy =
        true;


    cmlExploreScoreCp =
        null;


    cmlExploreMate =
        null;


    cmlExploreBestMove =
        null;


    // Used by the normal Explore renderer
    // to verify that the result belongs
    // to the position currently displayed.

    lastRequestedExploreFen =
        fen;


    cmlExploreWorker.postMessage(
        "position fen " +
        fen
    );


    cmlExploreWorker.postMessage(
        "go depth " +
        cmlGetExploreDepth()
    );
}


// =====================================================
// FINISH SEARCH
// =====================================================

function cmlFinishExploreSearch(
    line
) {

    const finishedFen =
        cmlExploreActiveFen;


    const bestMoveMatch =
        line.match(
            /^bestmove\s+(\S+)/
        );


    const result = {

        scoreCp:
            cmlExploreScoreCp,

        mate:
            cmlExploreMate,

        bestMoveUci:
            bestMoveMatch
                ? bestMoveMatch[1]
                : cmlExploreBestMove
    };


    cmlExploreWorkerBusy =
        false;


    cmlExploreActiveFen =
        null;


    // =============================================
    // CHECK IF RESULT IS STILL CURRENT
    // =============================================

    let currentFen =
        null;


    try {

        if (
            typeof isExploring !==
                "undefined" &&
            isExploring &&
            typeof exploreChess !==
                "undefined" &&
            exploreChess
        ) {

            currentFen =
                exploreChess.fen();
        }

    } catch (error) {

        currentFen =
            null;
    }


    // Only render if the result belongs
    // to the sandbox position still visible.

    if (
        finishedFen &&
        currentFen &&
        finishedFen ===
            currentFen &&
        !cmlExplorePendingFen
    ) {

        lastRequestedExploreFen =
            finishedFen;


        renderExploreAnalysis(
            result
        );
    }


    // If user already played another move
    // while this search was running,
    // immediately analyze the newest position.

    cmlRunPendingExploreAnalysis();
}


// =====================================================
// NEW REQUEST EXPLORE ANALYSIS
// =====================================================
//
// IMPORTANT:
// This REPLACES the original requestExploreAnalysis().
//
// It NEVER sends "stop" to the main Stockfish worker.
// =====================================================

requestExploreAnalysis =
    function () {

        if (
            typeof exploreChess ===
                "undefined" ||
            !exploreChess
        ) {

            return;
        }


        const fen =
            exploreChess.fen();


        // =============================================
        // VERY IMPORTANT
        //
        // Keep original main-engine pending Explore
        // variable empty so processEngineQueue()
        // remains dedicated to the real game.
        // =============================================

        pendingExploreFen =
            null;


        // Latest sandbox position wins.

        cmlExplorePendingFen =
            fen;


        moveQuality.textContent =
            "Exploring";


        moveQuality.className =
            "quality-opening";


        movePlayed.textContent =
            describeExploreLastMove();


        evaluation.textContent =
            "...";


        bestMove.textContent =
            "...";


        engineMessage.textContent =
            "Analyzing your move...";


        // Start second worker lazily
        // only when Try Mode is actually used.

        cmlStartExploreWorker();


        if (
            !cmlExploreWorkerReady
        ) {

            return;
        }


        // =============================================
        // PREVIOUS TRY SEARCH STILL RUNNING
        // =============================================
        //
        // Stop ONLY the Try Mode worker.
        // Main full-game Stockfish is untouched.
        // =============================================

        if (
            cmlExploreWorkerBusy
        ) {

            try {

                cmlExploreWorker.postMessage(
                    "stop"
                );

            } catch (error) {

                console.warn(
                    "Could not stop old Explore search:",
                    error
                );
            }


            return;
        }


        cmlRunPendingExploreAnalysis();
    };


// =====================================================
// RESET / EXIT TRY MODE
// =====================================================

const cmlBackgroundFixOriginalResetExploreState =
    resetExploreState;


resetExploreState =
    function () {

        // Forget queued sandbox position.

        cmlExplorePendingFen =
            null;


        // Original main-engine Explore queue
        // must also stay empty.

        pendingExploreFen =
            null;


        // If Try engine is currently calculating,
        // stop ONLY that second engine.

        if (
            cmlExploreWorker &&
            cmlExploreWorkerBusy
        ) {

            try {

                cmlExploreWorker.postMessage(
                    "stop"
                );

            } catch (error) {

                console.warn(
                    "Could not stop Explore engine:",
                    error
                );
            }
        }


        return cmlBackgroundFixOriginalResetExploreState();
    };


// =====================================================
// PAGE CLEANUP
// =====================================================

window.addEventListener(
    "beforeunload",
    function () {

        if (
            cmlExploreWorker
        ) {

            try {

                cmlExploreWorker.terminate();

            } catch (error) {

                // Nothing needed.
            }
        }
    }
);