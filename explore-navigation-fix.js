// =====================================================
// CHESSMOVELAB
// EXPLORE MODE NAVIGATION FIX
//
// - Undo one sandbox move
// - Redo one sandbox move
// - Reuse previous Stockfish result
// - Do NOT return to real game accidentally
// =====================================================


// =====================================================
// REDO STATE
// =====================================================

let cmlExploreRedoStack =
    [];


// =====================================================
// FEN KEY
// =====================================================

function cmlFenKey(fen) {

    return String(
        fen || ""
    )
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join(" ");
}


// =====================================================
// COPY MOVE
// =====================================================

function cmlCopyMove(move) {

    if (!move) {

        return null;
    }


    return {

        from:
            move.from,

        to:
            move.to,

        promotion:
            move.promotion ||
            undefined,

        color:
            move.color ||
            null,

        san:
            move.san ||
            null
    };
}


// =====================================================
// FIND MOVE BETWEEN TWO FENS
//
// Fallback bach ila chi stack entry
// ma fihach move info,
// n9dro n3rfo achmen move wassel
// men position A l position B.
// =====================================================

function cmlFindMoveBetweenFens(
    beforeFen,
    afterFen
) {

    try {

        const baseChess =
            new Chess(
                beforeFen
            );


        const legalMoves =
            baseChess.moves({
                verbose: true
            });


        for (
            const legalMove
            of legalMoves
        ) {

            const testChess =
                new Chess(
                    beforeFen
                );


            const played =
                testChess.move({

                    from:
                        legalMove.from,

                    to:
                        legalMove.to,

                    promotion:
                        legalMove.promotion ||
                        "q"
                });


            if (!played) {

                continue;
            }


            if (
                cmlFenKey(
                    testChess.fen()
                ) ===
                cmlFenKey(
                    afterFen
                )
            ) {

                return cmlCopyMove(
                    played
                );
            }
        }

    } catch (error) {

        console.error(
            "Could not recover explore move:",
            error
        );
    }


    return null;
}


// =====================================================
// GET MOVE FOR STACK ENTRY
// =====================================================

function cmlGetEntryMove(
    entryIndex
) {

    if (
        entryIndex <= 0 ||
        entryIndex >=
        exploreStack.length
    ) {

        return null;
    }


    const entry =
        exploreStack[
            entryIndex
        ];


    if (
        entry &&
        entry.cmlMove
    ) {

        return cmlCopyMove(
            entry.cmlMove
        );
    }


    const previousEntry =
        exploreStack[
            entryIndex -
            1
        ];


    if (
        !entry ||
        !previousEntry
    ) {

        return null;
    }


    return cmlFindMoveBetweenFens(

        previousEntry.fen,

        entry.fen
    );
}


// =====================================================
// NAVIGATION BUTTON STATE
// =====================================================

function updateExploreNavigationButtons() {

    if (
        !previousMoveBtn ||
        !nextMoveBtn
    ) {

        return;
    }


    // =========================
    // EXPLORE MODE
    // =========================

    if (isExploring) {

        previousMoveBtn.textContent =
            "← Undo Move";


        previousMoveBtn.disabled =
            exploreStack.length <=
            1;


        nextMoveBtn.textContent =
            "Redo Move →";


        nextMoveBtn.disabled =
            cmlExploreRedoStack.length ===
            0;


        if (firstMoveBtn) {

            firstMoveBtn.disabled =
                true;
        }


        if (lastMoveBtn) {

            lastMoveBtn.disabled =
                true;
        }


        return;
    }


    // =========================
    // NORMAL GAME
    // =========================

    previousMoveBtn.textContent =
        "← Previous";


    nextMoveBtn.textContent =
        "Next →";


    previousMoveBtn.disabled =
        currentMoveIndex ===
        0;


    nextMoveBtn.disabled =
        currentMoveIndex ===
        moves.length;


    if (firstMoveBtn) {

        firstMoveBtn.disabled =
            currentMoveIndex ===
            0;
    }


    if (lastMoveBtn) {

        lastMoveBtn.disabled =
            currentMoveIndex ===
            moves.length;
    }
}


// =====================================================
// SAVE ORIGINAL PLAY FUNCTION
// =====================================================

const cmlOriginalPlayExploratoryMove =
    playExploratoryMove;


// =====================================================
// PLAY SANDBOX MOVE
// =====================================================

playExploratoryMove =
    function (
        from,
        to,
        displayedChess
    ) {

        // =============================================
        // USER JUST UNDID A MOVE AND IS PLAYING
        // THE EXACT SAME MOVE AGAIN.
        //
        // Reuse redo result instead of asking
        // Stockfish to calculate it again.
        // =============================================

        if (
            isExploring &&
            cmlExploreRedoStack.length >
            0
        ) {

            const redoEntry =
                cmlExploreRedoStack[
                    cmlExploreRedoStack.length -
                    1
                ];


            if (
                redoEntry &&
                redoEntry.move &&
                redoEntry.move.from ===
                from &&
                redoEntry.move.to ===
                to
            ) {

                redoExploreMove();

                return;
            }
        }


        // =============================================
        // THIS IS A NEW BRANCH.
        //
        // Old redo positions are no longer valid.
        // =============================================

        cmlExploreRedoStack =
            [];


        const previousStackLength =
            exploreStack.length;


        const output =
            cmlOriginalPlayExploratoryMove(

                from,

                to,

                displayedChess
            );


        // =============================================
        // SAVE MOVE INSIDE THE NEW STACK ENTRY
        // =============================================

        if (
            isExploring &&
            exploreChess &&
            exploreStack.length >
            previousStackLength
        ) {

            const history =
                exploreChess.history({
                    verbose: true
                });


            const lastMove =
                history[
                    history.length -
                    1
                ];


            const currentEntry =
                exploreStack[
                    exploreStack.length -
                    1
                ];


            if (
                currentEntry &&
                lastMove
            ) {

                currentEntry.cmlMove =
                    cmlCopyMove(
                        lastMove
                    );
            }
        }


        updateExploreNavigationButtons();


        return output;
    };


// =====================================================
// SAVE ORIGINAL UNDO FUNCTION
// =====================================================

const cmlOriginalUndoExploreMove =
    undoExploreMove;


// =====================================================
// UNDO ONE EXPLORE MOVE
// =====================================================

undoExploreMove =
    function () {

        if (
            !isExploring ||
            exploreStack.length <=
            1
        ) {

            updateExploreNavigationButtons();

            return;
        }


        const currentIndex =
            exploreStack.length -
            1;


        const currentEntry =
            exploreStack[
                currentIndex
            ];


        const currentMove =
            cmlGetEntryMove(
                currentIndex
            );


        // =============================================
        // SAVE POSITION FOR REDO
        // INCLUDING STOCKFISH RESULT
        // =============================================

        cmlExploreRedoStack.push({

            fen:
                currentEntry.fen,

            result:
                currentEntry.result ||
                null,

            move:
                currentMove
        });


        // =============================================
        // ORIGINAL UNDO
        // =============================================

        cmlOriginalUndoExploreMove();


        updateExploreNavigationButtons();
    };


// =====================================================
// REDO ONE EXPLORE MOVE
// =====================================================

function redoExploreMove() {

    if (
        !isExploring ||
        cmlExploreRedoStack.length ===
        0 ||
        exploreStack.length ===
        0
    ) {

        updateExploreNavigationButtons();

        return;
    }


    const redoEntry =
        cmlExploreRedoStack[
            cmlExploreRedoStack.length -
            1
        ];


    if (
        !redoEntry ||
        !redoEntry.move
    ) {

        cmlExploreRedoStack.pop();

        updateExploreNavigationButtons();

        return;
    }


    const baseEntry =
        exploreStack[
            exploreStack.length -
            1
        ];


    if (!baseEntry) {

        return;
    }


    let chess;


    try {

        chess =
            new Chess(
                baseEntry.fen
            );


        const playedMove =
            chess.move({

                from:
                    redoEntry.move.from,

                to:
                    redoEntry.move.to,

                promotion:
                    redoEntry.move
                        .promotion ||
                    "q"
            });


        if (!playedMove) {

            console.warn(
                "Redo move is no longer legal."
            );


            cmlExploreRedoStack =
                [];


            updateExploreNavigationButtons();

            return;
        }


        // =============================================
        // REMOVE FROM REDO STACK
        // =============================================

        cmlExploreRedoStack.pop();


        // =============================================
        // MAKE THIS THE ACTIVE EXPLORE POSITION
        // =============================================

        exploreChess =
            chess;


        clearSelection();


        pendingExploreFen =
            null;


        lastRequestedExploreFen =
            exploreChess.fen();


        // =============================================
        // RESTORE STACK ENTRY
        // =============================================

        exploreStack.push({

            fen:
                exploreChess.fen(),

            result:
                redoEntry.result ||
                null,

            cmlMove:
                cmlCopyMove(
                    playedMove
                )
        });


        // =============================================
        // DRAW BOARD
        // =============================================

        refreshExploreBoard();


        movePlayed.textContent =
            describeExploreLastMove();


        // =============================================
        // WE ALREADY ANALYZED THIS POSITION
        //
        // Reuse result instantly.
        // NO NEW STOCKFISH SEARCH.
        // =============================================

        if (
            redoEntry.result
        ) {

            renderExploreAnalysis(
                redoEntry.result
            );

        } else {

            // Only analyze when this position
            // genuinely never had a result.

            requestExploreAnalysis();
        }


    } catch (error) {

        console.error(
            "Explore redo failed:",
            error
        );
    }


    updateExploreNavigationButtons();
}


// =====================================================
// PREVIOUS BUTTON
// =====================================================

previousMoveBtn.addEventListener(

    "click",

    function (event) {

        if (!isExploring) {

            return;
        }


        // Stop old real-game navigation.

        event.preventDefault();

        event.stopImmediatePropagation();


        if (
            exploreStack.length >
            1
        ) {

            undoExploreMove();
        }
    },

    true
);


// =====================================================
// NEXT BUTTON
// =====================================================

nextMoveBtn.addEventListener(

    "click",

    function (event) {

        if (!isExploring) {

            return;
        }


        // Stop old:
        // showPosition(currentMoveIndex + 1)

        event.preventDefault();

        event.stopImmediatePropagation();


        if (
            cmlExploreRedoStack.length >
            0
        ) {

            redoExploreMove();
        }
    },

    true
);


// =====================================================
// FIRST BUTTON
// Do not accidentally exit sandbox.
// =====================================================

if (firstMoveBtn) {

    firstMoveBtn.addEventListener(

        "click",

        function (event) {

            if (!isExploring) {

                return;
            }


            event.preventDefault();

            event.stopImmediatePropagation();
        },

        true
    );
}


// =====================================================
// LAST BUTTON
// Do not accidentally exit sandbox.
// =====================================================

if (lastMoveBtn) {

    lastMoveBtn.addEventListener(

        "click",

        function (event) {

            if (!isExploring) {

                return;
            }


            event.preventDefault();

            event.stopImmediatePropagation();
        },

        true
    );
}


// =====================================================
// KEYBOARD LEFT / RIGHT
// =====================================================

document.addEventListener(

    "keydown",

    function (event) {

        if (!isExploring) {

            return;
        }


        // =============================================
        // LEFT = UNDO
        // =============================================

        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            event.stopImmediatePropagation();


            if (
                exploreStack.length >
                1
            ) {

                undoExploreMove();
            }


            return;
        }


        // =============================================
        // RIGHT = REDO
        // =============================================

        if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            event.stopImmediatePropagation();


            if (
                cmlExploreRedoStack.length >
                0
            ) {

                redoExploreMove();
            }
        }
    },

    true
);


// =====================================================
// REFRESH BOARD HOOK
// =====================================================

const cmlOriginalRefreshExploreBoard =
    refreshExploreBoard;


refreshExploreBoard =
    function () {

        const output =
            cmlOriginalRefreshExploreBoard();


        updateExploreNavigationButtons();


        return output;
    };


// =====================================================
// RESET EXPLORE HOOK
// =====================================================

const cmlOriginalResetExploreState =
    resetExploreState;


resetExploreState =
    function () {

        cmlExploreRedoStack =
            [];


        const output =
            cmlOriginalResetExploreState();


        updateExploreNavigationButtons();


        return output;
    };


// =====================================================
// START
// =====================================================

updateExploreNavigationButtons();