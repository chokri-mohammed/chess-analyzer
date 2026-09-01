// =====================================================
// CHESSMOVELAB
// SAFE MOVE EFFECTS + SOUND
//
// IMPORTANT:
// This file does NOT modify drawBoard()
// or chess click logic.
// =====================================================


// =====================================================
// STYLES
// =====================================================

(function injectMoveEffectStyles() {

    if (
        document.querySelector(
            "#cmlMoveEffectStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "cmlMoveEffectStyles";


    style.textContent = `

        @keyframes cmlPieceLand {

            0% {
                transform:
                    scale(0.84)
                    translateY(-5px);

                opacity: 0.65;
            }

            55% {
                transform:
                    scale(1.07)
                    translateY(1px);

                opacity: 1;
            }

            100% {
                transform:
                    scale(1)
                    translateY(0);

                opacity: 1;
            }
        }


        @keyframes cmlSquareImpact {

            0% {
                box-shadow:
                    inset 0 0 0 999px
                    rgba(
                        69,
                        203,
                        234,
                        0.46
                    );
            }

            100% {
                box-shadow:
                    inset 0 0 0 999px
                    rgba(
                        255,
                        226,
                        77,
                        0.28
                    );
            }
        }


        @keyframes cmlCaptureImpact {

            0% {
                box-shadow:
                    inset 0 0 0 999px
                    rgba(
                        216,
                        77,
                        91,
                        0.55
                    );
            }

            100% {
                box-shadow:
                    inset 0 0 0 999px
                    rgba(
                        255,
                        226,
                        77,
                        0.28
                    );
            }
        }


        .cml-piece-land {
            animation:
                cmlPieceLand
                180ms
                ease-out;
        }


        .cml-move-impact {
            animation:
                cmlSquareImpact
                300ms
                ease-out;
        }


        .cml-capture-impact {
            animation:
                cmlCaptureImpact
                320ms
                ease-out;
        }

    `;


    document.head.appendChild(
        style
    );
})();


// =====================================================
// AUDIO
// =====================================================

let cmlAudioContext =
    null;


let cmlAudioUnlocked =
    false;


// =====================================================
// GET AUDIO CONTEXT
// =====================================================

function getCmlAudioContext() {

    if (cmlAudioContext) {

        return cmlAudioContext;
    }


    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContextClass) {

        return null;
    }


    try {

        cmlAudioContext =
            new AudioContextClass();

    } catch (error) {

        console.warn(
            "Audio unavailable:",
            error
        );


        return null;
    }


    return cmlAudioContext;
}


// =====================================================
// UNLOCK AUDIO
// =====================================================

function unlockCmlAudio() {

    cmlAudioUnlocked =
        true;


    const context =
        getCmlAudioContext();


    if (
        context &&
        context.state ===
        "suspended"
    ) {

        context.resume()
            .catch(
                function () {}
            );
    }
}


document.addEventListener(
    "pointerdown",
    unlockCmlAudio,
    {
        once: true
    }
);


document.addEventListener(
    "keydown",
    unlockCmlAudio,
    {
        once: true
    }
);


// =====================================================
// PLAY BOARD SOUND
// =====================================================

function playCmlMoveSound(
    isCapture
) {

    if (!cmlAudioUnlocked) {

        return;
    }


    const context =
        getCmlAudioContext();


    if (!context) {

        return;
    }


    if (
        context.state ===
        "suspended"
    ) {

        context.resume()
            .catch(
                function () {}
            );
    }


    const now =
        context.currentTime;


    const oscillator =
        context.createOscillator();


    const gain =
        context.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.setValueAtTime(

        isCapture
            ? 150
            : 190,

        now
    );


    oscillator.frequency.exponentialRampToValueAtTime(

        isCapture
            ? 80
            : 105,

        now + 0.055
    );


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain.exponentialRampToValueAtTime(

        isCapture
            ? 0.15
            : 0.10,

        now + 0.004
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.075
    );


    oscillator.connect(
        gain
    );


    gain.connect(
        context.destination
    );


    oscillator.start(
        now
    );


    oscillator.stop(
        now + 0.08
    );
}


// =====================================================
// POSITION KEY
// =====================================================

function getCmlPositionKey() {

    try {

        // =============================
        // TRY / EXPLORE MODE
        // =============================

        if (
            typeof isExploring !==
                "undefined" &&
            isExploring &&
            typeof exploreChess !==
                "undefined" &&
            exploreChess
        ) {

            return (
                "explore:" +
                exploreChess.fen()
            );
        }


        // =============================
        // NORMAL GAME
        // =============================

        if (
            typeof currentDisplayChess !==
                "undefined" &&
            currentDisplayChess
        ) {

            return (
                "game:" +
                currentDisplayChess.fen()
            );
        }


        if (
            typeof positions !==
                "undefined" &&
            typeof currentMoveIndex !==
                "undefined" &&
            positions[
                currentMoveIndex
            ]
        ) {

            return (
                "game:" +
                positions[
                    currentMoveIndex
                ].fen
            );
        }

    } catch (error) {

        return null;
    }


    return null;
}


// =====================================================
// CURRENT MOVE
// =====================================================

function getCmlCurrentMove() {

    try {

        // =============================
        // EXPLORE MODE
        // =============================

        if (
            typeof isExploring !==
                "undefined" &&
            isExploring
        ) {

            if (
                typeof exploreStack !==
                    "undefined" &&
                exploreStack.length >
                    1
            ) {

                const entry =
                    exploreStack[
                        exploreStack.length -
                        1
                    ];


                if (
                    entry &&
                    entry.cmlMove
                ) {

                    return entry.cmlMove;
                }
            }


            if (
                typeof exploreChess !==
                    "undefined" &&
                exploreChess
            ) {

                const history =
                    exploreChess.history({
                        verbose: true
                    });


                if (
                    history.length >
                    0
                ) {

                    return history[
                        history.length -
                        1
                    ];
                }
            }
        }


        // =============================
        // NORMAL GAME
        // =============================

        if (
            typeof currentMoveIndex !==
                "undefined" &&
            currentMoveIndex >
                0 &&
            typeof positions !==
                "undefined"
        ) {

            const position =
                positions[
                    currentMoveIndex
                ];


            if (
                position &&
                position.move
            ) {

                return position.move;
            }
        }

    } catch (error) {

        console.warn(
            "Could not detect move:",
            error
        );
    }


    return null;
}


// =====================================================
// CAPTURE?
// =====================================================

function isCmlCaptureMove(
    move
) {

    if (!move) {

        return false;
    }


    if (move.captured) {

        return true;
    }


    const flags =
        String(
            move.flags ||
            ""
        );


    return (
        flags.includes("c") ||
        flags.includes("e")
    );
}


// =====================================================
// ANIMATE MOVE
// =====================================================

function animateCmlMove(
    move
) {

    if (
        !move ||
        !move.to ||
        !boardElement
    ) {

        return;
    }


    const square =
        boardElement.querySelector(

            `[data-square="${move.to}"]`
        );


    if (!square) {

        return;
    }


    const piece =
        square.querySelector(
            ".piece"
        );


    const capture =
        isCmlCaptureMove(
            move
        );


    square.classList.remove(
        "cml-move-impact",
        "cml-capture-impact"
    );


    if (piece) {

        piece.classList.remove(
            "cml-piece-land"
        );
    }


    // Restart CSS animation safely

    void square.offsetWidth;


    square.classList.add(

        capture
            ? "cml-capture-impact"
            : "cml-move-impact"
    );


    if (piece) {

        piece.classList.add(
            "cml-piece-land"
        );
    }


    playCmlMoveSound(
        capture
    );


    window.setTimeout(
        function () {

            square.classList.remove(
                "cml-move-impact",
                "cml-capture-impact"
            );


            if (piece) {

                piece.classList.remove(
                    "cml-piece-land"
                );
            }

        },
        350
    );
}


// =====================================================
// INITIAL POSITION
// =====================================================

let cmlLastPositionKey =
    getCmlPositionKey();


// =====================================================
// BOARD OBSERVER
//
// We only WATCH the board.
// We never replace drawBoard().
// =====================================================

let cmlObserverScheduled =
    false;


function checkCmlBoardChange() {

    cmlObserverScheduled =
        false;


    const newKey =
        getCmlPositionKey();


    if (!newKey) {

        return;
    }


    // Same FEN means:
    // user selected a piece,
    // legal moves appeared,
    // badge changed,
    // etc.
    //
    // NO SOUND / NO MOVE EFFECT.

    if (
        newKey ===
        cmlLastPositionKey
    ) {

        return;
    }


    cmlLastPositionKey =
        newKey;


    const move =
        getCmlCurrentMove();


    if (!move) {

        return;
    }


    window.requestAnimationFrame(
        function () {

            animateCmlMove(
                move
            );
        }
    );
}


// =====================================================
// START OBSERVING BOARD
// =====================================================

if (boardElement) {

    const cmlBoardObserver =
        new MutationObserver(
            function () {

                if (
                    cmlObserverScheduled
                ) {

                    return;
                }


                cmlObserverScheduled =
                    true;


                window.requestAnimationFrame(
                    checkCmlBoardChange
                );
            }
        );


    cmlBoardObserver.observe(
        boardElement,
        {
            childList: true
        }
    );
}