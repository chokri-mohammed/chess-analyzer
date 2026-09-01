(function () {

    let tryMode = false;
    let tryBaseIndex = 0;

    let tryChess = null;
    let trySelectedSquare = null;

    let tryMoves = [];
    let tryLastMove = null;

    let tryEngine = null;
    let tryEngineReady = false;
    let tryEngineBusy = false;
    let tryEngineActiveFen = null;

    let tryEngineQueue = [];

    let tryScoreCp = null;
    let tryMate = null;
    let tryBestUci = null;

    const tryCache = new Map();

    const TRY_ENGINE_DEPTH = 13;


    // =================================================
    // ORIGINAL FUNCTIONS
    // =================================================

    const normalRenderCurrentAnalysis =
        renderCurrentAnalysis;

    const normalDrawCurrentBoardFeedback =
        drawCurrentBoardFeedback;


    renderCurrentAnalysis = function () {

        if (tryMode) {
            return;
        }

        return normalRenderCurrentAnalysis();
    };


    drawCurrentBoardFeedback = function () {

        if (tryMode) {
            return;
        }

        return normalDrawCurrentBoardFeedback();
    };


    // =================================================
    // CSS
    // =================================================

    addTryStyles();


    function addTryStyles() {

        const style =
            document.createElement("style");


        style.textContent = `

            .try-controls {
                width: 100%;
                margin-top: 8px;

                display: flex;
                gap: 7px;
                flex-wrap: wrap;
            }


            .try-control-btn {
                flex: 1;

                min-height: 36px;

                padding: 7px 10px;

                border:
                    1px solid
                    rgba(255,255,255,0.09);

                border-radius: 8px;

                background: #171d2e;

                color: white;

                font-size: 11px;
                font-weight: 800;

                cursor: pointer;
            }


            .try-control-btn:hover {
                background: #222b42;
            }


            .try-main-btn {
                background:
                    linear-gradient(
                        135deg,
                        #6675ff,
                        #8c63ff
                    );
            }


            .try-danger-btn {
                background:
                    rgba(220,70,70,0.14);

                color: #ffaaaa;
            }


            .try-hidden {
                display: none !important;
            }


            .try-panel {
                width: 100%;

                margin-top: 7px;

                padding: 10px 12px;

                border:
                    1px solid
                    rgba(255,255,255,0.08);

                border-radius: 9px;

                background: #0d1322;

                color: #aeb6cb;

                font-size: 11px;
                line-height: 1.45;
            }


            .try-panel strong {
                color: white;
            }


            .try-mode-active {
                border-color:
                    rgba(102,117,255,0.55)
                    !important;

                box-shadow:
                    0 0 0 2px
                    rgba(102,117,255,0.14);
            }


            .square.try-selectable {
                cursor: pointer;
            }


            .square.try-selected {
                box-shadow:
                    inset 0 0 0 999px
                    rgba(87,190,255,0.32)
                    !important;
            }


            .square.try-legal::after {
                content: "";

                position: absolute;

                width: 22%;
                height: 22%;

                border-radius: 50%;

                background:
                    rgba(30,30,30,0.38);

                z-index: 12;

                pointer-events: none;
            }


            .square.try-capture::after {
                content: "";

                position: absolute;
                inset: 5px;

                border:
                    5px solid
                    rgba(210,65,65,0.60);

                border-radius: 50%;

                z-index: 12;

                pointer-events: none;
            }


            .try-last-move {
                box-shadow:
                    inset 0 0 0 999px
                    rgba(255,220,70,0.25);
            }


            /* =========================================
               TRY MOVE QUALITY BADGE
            ========================================= */

            .try-quality-badge {
                position: absolute;

                right: 4px;
                top: 4px;

                min-width: 24px;
                height: 24px;

                padding: 0 5px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 999px;

                font-size: 12px;
                font-weight: 900;

                color: white;

                z-index: 35;

                pointer-events: none;

                border:
                    2px solid
                    rgba(255,255,255,0.92);

                box-shadow:
                    0 3px 9px
                    rgba(0,0,0,0.4);
            }


            .try-quality-best {
                background: #2fbfae;
            }


            .try-quality-great {
                background: #319fd5;
            }


            .try-quality-good {
                background: #4bae63;
            }


            .try-quality-inaccuracy {
                background: #d3a92d;
                color: #151515;
            }


            .try-quality-mistake {
                background: #e07b38;
            }


            .try-quality-blunder {
                background: #d84d5b;
            }


            .try-quality-miss {
                background: #9a66d7;
            }


            /* =========================================
               VARIATION MOVE BADGES
            ========================================= */

            .try-variation-move {
                display: inline-flex;
                align-items: center;

                gap: 4px;

                margin: 4px 5px 0 0;

                padding: 4px 7px;

                border-radius: 7px;

                background: #171d2e;
            }


            .try-variation-badge {
                min-width: 18px;
                height: 18px;

                padding: 0 3px;

                display: inline-flex;
                align-items: center;
                justify-content: center;

                border-radius: 999px;

                color: white;

                font-size: 9px;
                font-weight: 900;
            }


            /* =========================================
               BEST MOVE ARROW
            ========================================= */

            .try-best-arrow-layer {
                position: absolute;

                inset: 0;

                width: 100%;
                height: 100%;

                z-index: 18;

                pointer-events: none;
            }


            .try-best-line {
                stroke: #50dcff;

                stroke-width: 10;

                stroke-linecap: round;

                opacity: 0.8;
            }


            .try-best-head {
                fill: #50dcff;

                opacity: 0.92;
            }


            .try-best-start {
                fill: #50dcff;

                opacity: 0.76;
            }


            @media (max-width: 560px) {

                .try-controls {
                    display: grid;

                    grid-template-columns:
                        repeat(2, 1fr);
                }


                .try-main-btn {
                    grid-column: 1 / -1;
                }


                .try-quality-badge {
                    right: 2px;
                    top: 2px;

                    min-width: 19px;
                    height: 19px;

                    padding: 0 3px;

                    font-size: 9px;

                    border-width: 1px;
                }


                .try-best-line {
                    stroke-width: 8;
                }
            }

        `;


        document.head.appendChild(style);
    }


    // =================================================
    // CONTROLS
    // =================================================

    const navigation =
        document.querySelector(
            ".navigation-controls"
        );


    const tryControls =
        document.createElement("div");


    tryControls.className =
        "try-controls";


    tryControls.innerHTML = `

        <button
            id="startTryBtn"
            class="try-control-btn try-main-btn"
        >
            ♟ Try a Move
        </button>


        <button
            id="undoTryBtn"
            class="try-control-btn try-hidden"
        >
            ↶ Undo
        </button>


        <button
            id="resetTryBtn"
            class="try-control-btn try-hidden"
        >
            Reset Variation
        </button>


        <button
            id="exitTryBtn"
            class="try-control-btn try-danger-btn try-hidden"
        >
            Exit Try Mode
        </button>

    `;


    navigation.insertAdjacentElement(
        "afterend",
        tryControls
    );


    const tryPanel =
        document.createElement("div");


    tryPanel.className =
        "try-panel try-hidden";


    tryPanel.innerHTML = `

        <strong>
            What If?
        </strong>

        <span id="tryStatus">
            Choose a piece and try another move.
        </span>

        <div id="tryLine"></div>

    `;


    tryControls.insertAdjacentElement(
        "afterend",
        tryPanel
    );


    const startTryBtn =
        document.querySelector(
            "#startTryBtn"
        );

    const undoTryBtn =
        document.querySelector(
            "#undoTryBtn"
        );

    const resetTryBtn =
        document.querySelector(
            "#resetTryBtn"
        );

    const exitTryBtn =
        document.querySelector(
            "#exitTryBtn"
        );

    const tryStatus =
        document.querySelector(
            "#tryStatus"
        );

    const tryLine =
        document.querySelector(
            "#tryLine"
        );


    // =================================================
    // EVENTS
    // =================================================

    startTryBtn.addEventListener(
        "click",
        startTryMode
    );

    undoTryBtn.addEventListener(
        "click",
        undoTryMove
    );

    resetTryBtn.addEventListener(
        "click",
        resetTryVariation
    );

    exitTryBtn.addEventListener(
        "click",
        exitTryMode
    );


    // =================================================
    // START TRY MODE
    // =================================================

    function startTryMode() {

        if (tryMode) {
            return;
        }


        tryMode = true;

        tryBaseIndex =
            currentMoveIndex;


        tryChess =
            new Chess(
                positions[
                    tryBaseIndex
                ].fen
            );


        trySelectedSquare =
            null;

        tryMoves = [];

        tryLastMove =
            null;


        boardElement
            .parentElement
            .classList.add(
                "try-mode-active"
            );


        startTryBtn.classList.add(
            "try-hidden"
        );

        undoTryBtn.classList.remove(
            "try-hidden"
        );

        resetTryBtn.classList.remove(
            "try-hidden"
        );

        exitTryBtn.classList.remove(
            "try-hidden"
        );

        tryPanel.classList.remove(
            "try-hidden"
        );


        disableNormalNavigation();


        moveQuality.textContent =
            "What If Mode";


        moveQuality.className =
            "quality-great";


        movePlayed.textContent =
            "Choose a piece and try a legal move.";


        evaluation.textContent =
            "...";


        bestMove.textContent =
            "...";


        engineMessage.textContent =
            "Analyzing test position...";


        initTryEngine();


        queueTryAnalysis(
            tryChess.fen(),
            true
        );


        processTryEngineQueue();


        renderTryBoard();


        updateTryLine();
    }


    // =================================================
    // EXIT
    // =================================================

    function exitTryMode() {

        if (!tryMode) {
            return;
        }


        tryMode = false;

        trySelectedSquare =
            null;


        boardElement
            .parentElement
            .classList.remove(
                "try-mode-active"
            );


        startTryBtn.classList.remove(
            "try-hidden"
        );

        undoTryBtn.classList.add(
            "try-hidden"
        );

        resetTryBtn.classList.add(
            "try-hidden"
        );

        exitTryBtn.classList.add(
            "try-hidden"
        );

        tryPanel.classList.add(
            "try-hidden"
        );


        enableNormalNavigation();


        showPosition(
            tryBaseIndex
        );
    }


    // =================================================
    // RESET
    // =================================================

    function resetTryVariation() {

        if (!tryMode) {
            return;
        }


        tryChess =
            new Chess(
                positions[
                    tryBaseIndex
                ].fen
            );


        trySelectedSquare =
            null;

        tryMoves = [];

        tryLastMove =
            null;


        moveQuality.textContent =
            "What If Mode";


        moveQuality.className =
            "quality-great";


        movePlayed.textContent =
            "Variation reset. Try another move.";


        evaluation.textContent =
            "...";


        bestMove.textContent =
            "...";


        renderTryBoard();

        updateTryLine();


        queueTryAnalysis(
            tryChess.fen(),
            true
        );


        processTryEngineQueue();


        showTryAnalysis();
    }


    // =================================================
    // UNDO
    // =================================================

    function undoTryMove() {

        if (
            !tryMode ||
            !tryChess ||
            tryMoves.length === 0
        ) {

            return;
        }


        tryChess.undo();


        tryMoves.pop();


        tryLastMove =
            tryMoves.length

                ? tryMoves[
                    tryMoves.length - 1
                ]

                : null;


        trySelectedSquare =
            null;


        renderTryBoard();

        updateTryLine();


        queueTryAnalysis(
            tryChess.fen(),
            true
        );


        processTryEngineQueue();


        showTryAnalysis();
    }


    // =================================================
    // NAVIGATION
    // =================================================

    function disableNormalNavigation() {

        firstMoveBtn.disabled = true;
        previousMoveBtn.disabled = true;
        nextMoveBtn.disabled = true;
        lastMoveBtn.disabled = true;


        movesList.style.pointerEvents =
            "none";


        movesList.style.opacity =
            "0.6";
    }


    function enableNormalNavigation() {

        movesList.style.pointerEvents =
            "";


        movesList.style.opacity =
            "";


        updateNavigation();
    }


    document.addEventListener(

        "keydown",

        function (event) {

            if (
                tryMode &&
                (
                    event.key ===
                    "ArrowLeft" ||

                    event.key ===
                    "ArrowRight"
                )
            ) {

                event.preventDefault();

                event.stopImmediatePropagation();
            }

        },

        true
    );


    // =================================================
    // DRAW TRY BOARD
    // =================================================

    function renderTryBoard() {

        if (
            !tryMode ||
            !tryChess
        ) {

            return;
        }


        boardElement.innerHTML =
            "";


        const board =
            tryChess.board();


        const legalTargets =
            getSelectedLegalTargets();


        for (
            let displayRow = 0;
            displayRow < 8;
            displayRow++
        ) {

            for (
                let displayCol = 0;
                displayCol < 8;
                displayCol++
            ) {

                const actualRow =
                    boardFlipped

                        ? 7 -
                          displayRow

                        : displayRow;


                const actualCol =
                    boardFlipped

                        ? 7 -
                          displayCol

                        : displayCol;


                const squareName =
                    getSquareName(
                        actualRow,
                        actualCol
                    );


                const square =
                    document.createElement(
                        "div"
                    );


                square.classList.add(
                    "square"
                );


                square.dataset.square =
                    squareName;


                if (
                    (
                        actualRow +
                        actualCol
                    ) % 2 === 0
                ) {

                    square.classList.add(
                        "light"
                    );

                } else {

                    square.classList.add(
                        "dark"
                    );
                }


                const piece =
                    board[
                        actualRow
                    ][
                        actualCol
                    ];


                if (piece) {

                    const pieceImage =
                        document.createElement(
                            "img"
                        );


                    pieceImage.classList.add(
                        "piece"
                    );


                    pieceImage.src =
                        pieceImages[
                            piece.color +
                            piece.type
                        ];


                    pieceImage.alt =
                        piece.color +
                        piece.type;


                    pieceImage.draggable =
                        false;


                    square.appendChild(
                        pieceImage
                    );


                    if (
                        piece.color ===
                        tryChess.turn()
                    ) {

                        square.classList.add(
                            "try-selectable"
                        );
                    }
                }


                if (
                    trySelectedSquare ===
                    squareName
                ) {

                    square.classList.add(
                        "try-selected"
                    );
                }


                if (
                    legalTargets.has(
                        squareName
                    )
                ) {

                    const target =
                        legalTargets.get(
                            squareName
                        );


                    if (
                        target.capture
                    ) {

                        square.classList.add(
                            "try-capture"
                        );

                    } else {

                        square.classList.add(
                            "try-legal"
                        );
                    }
                }


                if (
                    tryLastMove &&
                    (
                        squareName ===
                        tryLastMove.from ||

                        squareName ===
                        tryLastMove.to
                    )
                ) {

                    square.classList.add(
                        "try-last-move"
                    );
                }


                square.addEventListener(

                    "click",

                    function () {

                        handleTrySquareClick(
                            squareName
                        );
                    }
                );


                boardElement.appendChild(
                    square
                );
            }
        }


        drawTryMoveBadge();

        drawCachedTryBestArrow();
    }


    // =================================================
    // LEGAL TARGETS
    // =================================================

    function getSelectedLegalTargets() {

        const result =
            new Map();


        if (
            !trySelectedSquare ||
            !tryChess
        ) {

            return result;
        }


        const legal =
            tryChess.moves({

                square:
                    trySelectedSquare,

                verbose:
                    true
            });


        legal.forEach(
            function (move) {

                result.set(

                    move.to,

                    {
                        capture:

                            Boolean(
                                move.captured
                            )

                            ||

                            String(
                                move.flags ||
                                ""
                            ).includes(
                                "e"
                            )
                    }
                );
            }
        );


        return result;
    }


    // =================================================
    // CLICK SQUARE
    // =================================================

    function handleTrySquareClick(
        squareName
    ) {

        if (
            !tryMode ||
            !tryChess
        ) {

            return;
        }


        const piece =
            tryChess.get(
                squareName
            );


        if (!trySelectedSquare) {

            if (
                piece &&
                piece.color ===
                tryChess.turn()
            ) {

                trySelectedSquare =
                    squareName;


                renderTryBoard();
            }


            return;
        }


        if (
            piece &&
            piece.color ===
            tryChess.turn()
        ) {

            trySelectedSquare =
                squareName;


            renderTryBoard();

            return;
        }


        const legalMoves =
            tryChess.moves({

                square:
                    trySelectedSquare,

                verbose:
                    true
            });


        const matching =
            legalMoves.filter(

                move =>
                    move.to ===
                    squareName
            );


        if (
            matching.length === 0
        ) {

            trySelectedSquare =
                null;


            renderTryBoard();

            return;
        }


        playTryMove(

            trySelectedSquare,

            squareName,

            matching
        );
    }


    // =================================================
    // PLAY MOVE
    // =================================================

    function playTryMove(
        from,
        to,
        matchingMoves
    ) {

        const beforeFen =
            tryChess.fen();


        let promotion =
            undefined;


        const promotionMoves =
            matchingMoves.filter(
                move =>
                    move.promotion
            );


        if (
            promotionMoves.length
        ) {

            let choice =
                window.prompt(
                    "Promotion: q, r, b or n",
                    "q"
                );


            choice =
                String(
                    choice || "q"
                )
                    .toLowerCase()
                    .trim();


            if (
                ![
                    "q",
                    "r",
                    "b",
                    "n"
                ].includes(
                    choice
                )
            ) {

                choice = "q";
            }


            promotion =
                choice;
        }


        const playedMove =
            tryChess.move({

                from:
                    from,

                to:
                    to,

                promotion:
                    promotion
            });


        if (!playedMove) {

            trySelectedSquare =
                null;


            renderTryBoard();

            return;
        }


        const afterFen =
            tryChess.fen();


        const testMove = {

            san:
                playedMove.san,

            color:
                playedMove.color,

            from:
                playedMove.from,

            to:
                playedMove.to,

            promotion:
                playedMove.promotion,

            beforeFen:
                beforeFen,

            afterFen:
                afterFen,

            classification:
                null
        };


        tryMoves.push(
            testMove
        );


        tryLastMove =
            testMove;


        trySelectedSquare =
            null;


        moveQuality.textContent =
            "Analyzing...";


        moveQuality.className =
            "";


        movePlayed.textContent =
            "You tried " +
            playedMove.san;


        evaluation.textContent =
            "...";


        bestMove.textContent =
            "...";


        engineMessage.textContent =
            "Stockfish is analyzing your move...";


        queueTryAnalysis(
            beforeFen,
            true
        );


        queueTryAnalysis(
            afterFen,
            true
        );


        processTryEngineQueue();


        renderTryBoard();

        updateTryLine();

        showTryAnalysis();
    }


    // =================================================
    // MOVE QUALITY
    // =================================================

    function refreshTryClassifications() {

        for (
            let i = 0;
            i < tryMoves.length;
            i++
        ) {

            const move =
                tryMoves[i];


            const beforeResult =
                tryCache.get(
                    move.beforeFen
                );


            const afterResult =
                tryCache.get(
                    move.afterFen
                );


            if (
                !beforeResult ||
                !afterResult
            ) {

                continue;
            }


            move.classification =
                classifyTryMove(
                    move,
                    beforeResult,
                    afterResult
                );
        }
    }


    function classifyTryMove(
        move,
        beforeResult,
        afterResult
    ) {

        const beforeWhite =
            tryResultToWhiteCp(
                move.beforeFen,
                beforeResult
            );


        const afterWhite =
            tryResultToWhiteCp(
                move.afterFen,
                afterResult
            );


        const beforePlayer =
            move.color === "w"

                ? beforeWhite

                : -beforeWhite;


        const afterPlayer =
            move.color === "w"

                ? afterWhite

                : -afterWhite;


        let loss =
            beforePlayer -
            afterPlayer;


        if (
            !Number.isFinite(
                loss
            ) ||
            loss < 0
        ) {

            loss = 0;
        }


        const playedUci =

            move.from +

            move.to +

            (
                move.promotion ||
                ""
            );


        const bestUci =
            String(
                beforeResult.bestMoveUci ||
                ""
            )
                .trim()
                .toLowerCase();


        const exactBest =
            playedUci
                .toLowerCase() ===
            bestUci;


        const missedWinningChance =

            beforePlayer >= 300 &&

            loss >= 180 &&

            afterPlayer < 150;


        if (
            exactBest ||
            loss <= 12
        ) {

            return {

                label:
                    "Best",

                icon:
                    "★",

                css:
                    "try-quality-best",

                lossCp:
                    loss
            };
        }


        if (
            missedWinningChance
        ) {

            return {

                label:
                    "Miss",

                icon:
                    "×",

                css:
                    "try-quality-miss",

                lossCp:
                    loss
            };
        }


        if (
            loss <= 35
        ) {

            return {

                label:
                    "Great",

                icon:
                    "!",

                css:
                    "try-quality-great",

                lossCp:
                    loss
            };
        }


        if (
            loss <= 90
        ) {

            return {

                label:
                    "Good",

                icon:
                    "✓",

                css:
                    "try-quality-good",

                lossCp:
                    loss
            };
        }


        if (
            loss <= 180
        ) {

            return {

                label:
                    "Inaccuracy",

                icon:
                    "?!",

                css:
                    "try-quality-inaccuracy",

                lossCp:
                    loss
            };
        }


        if (
            loss <= 350
        ) {

            return {

                label:
                    "Mistake",

                icon:
                    "?",

                css:
                    "try-quality-mistake",

                lossCp:
                    loss
            };
        }


        return {

            label:
                "Blunder",

            icon:
                "??",

            css:
                "try-quality-blunder",

            lossCp:
                loss
        };
    }


    // =================================================
    // DRAW BADGE ON TEST MOVE
    // =================================================

    function drawTryMoveBadge() {

        if (
            !tryLastMove ||
            !tryLastMove.classification
        ) {

            return;
        }


        const square =
            boardElement.querySelector(

                `[data-square="${tryLastMove.to}"]`
            );


        if (!square) {
            return;
        }


        const badge =
            document.createElement(
                "div"
            );


        badge.classList.add(

            "try-quality-badge",

            tryLastMove
                .classification
                .css
        );


        badge.textContent =
            tryLastMove
                .classification
                .icon;


        badge.title =
            tryLastMove
                .classification
                .label;


        square.appendChild(
            badge
        );
    }


    // =================================================
    // VARIATION LINE
    // =================================================

    function updateTryLine() {

        if (
            tryMoves.length === 0
        ) {

            tryStatus.textContent =
                " Choose a piece and try a legal move.";


            tryLine.textContent =
                "Variation: Start from move " +
                tryBaseIndex;


            return;
        }


        tryStatus.textContent =
            " Keep playing to test the variation.";


        tryLine.innerHTML =
            "";


        tryMoves.forEach(
            function (move) {

                const item =
                    document.createElement(
                        "span"
                    );


                item.className =
                    "try-variation-move";


                const moveText =
                    document.createElement(
                        "strong"
                    );


                moveText.textContent =
                    move.san;


                item.appendChild(
                    moveText
                );


                if (
                    move.classification
                ) {

                    const badge =
                        document.createElement(
                            "span"
                        );


                    badge.classList.add(

                        "try-variation-badge",

                        move.classification.css
                    );


                    badge.textContent =
                        move.classification.icon;


                    badge.title =
                        move.classification.label;


                    item.appendChild(
                        badge
                    );
                }


                tryLine.appendChild(
                    item
                );
            }
        );
    }


    // =================================================
    // TRY ENGINE
    // =================================================

    function initTryEngine() {

        if (tryEngine) {
            return;
        }


        tryEngine =
            new Worker(
                "engine/stockfish-18-lite-single.js"
            );


        tryEngine.onmessage =
            handleTryEngineMessage;


        tryEngine.onerror =
            function (error) {

                console.error(
                    "What If Stockfish:",
                    error
                );


                engineMessage.textContent =
                    "What If engine failed to load.";
            };


        tryEngine.postMessage(
            "uci"
        );
    }


    function handleTryEngineMessage(
        event
    ) {

        const line =
            String(
                event.data || ""
            );


        if (
            line.includes(
                "uciok"
            )
        ) {

            tryEngine.postMessage(
                "isready"
            );


            return;
        }


        if (
            line.includes(
                "readyok"
            )
        ) {

            tryEngineReady =
                true;


            processTryEngineQueue();


            return;
        }


        if (
            !tryEngineBusy ||
            !tryEngineActiveFen
        ) {

            return;
        }


        if (
            line.startsWith(
                "info "
            )
        ) {

            readTryEngineInfo(
                line
            );


            return;
        }


        if (
            line.startsWith(
                "bestmove "
            )
        ) {

            finishTryAnalysis(
                line
            );
        }
    }


    function readTryEngineInfo(
        line
    ) {

        const score =
            line.match(
                /\bscore\s+(cp|mate)\s+(-?\d+)/
            );


        if (score) {

            if (
                score[1] === "cp"
            ) {

                tryScoreCp =
                    Number(
                        score[2]
                    );


                tryMate =
                    null;

            } else {

                tryMate =
                    Number(
                        score[2]
                    );


                tryScoreCp =
                    null;
            }
        }


        const pv =
            line.match(
                /\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/
            );


        if (pv) {

            tryBestUci =
                pv[1];
        }
    }


    // =================================================
    // ENGINE QUEUE
    // =================================================

    function queueTryAnalysis(
        fen,
        priority = false
    ) {

        if (
            !fen ||
            tryCache.has(
                fen
            )
        ) {

            return;
        }


        if (
            tryEngineActiveFen ===
            fen
        ) {

            return;
        }


        tryEngineQueue =
            tryEngineQueue.filter(
                item =>
                    item !== fen
            );


        if (priority) {

            tryEngineQueue.unshift(
                fen
            );

        } else {

            tryEngineQueue.push(
                fen
            );
        }
    }


    function processTryEngineQueue() {

        if (
            !tryEngineReady ||
            tryEngineBusy
        ) {

            return;
        }


        while (
            tryEngineQueue.length
        ) {

            const fen =
                tryEngineQueue.shift();


            if (
                tryCache.has(
                    fen
                )
            ) {

                continue;
            }


            startTryAnalysis(
                fen
            );


            return;
        }
    }


    function startTryAnalysis(
        fen
    ) {

        tryEngineBusy =
            true;


        tryEngineActiveFen =
            fen;


        tryScoreCp =
            null;


        tryMate =
            null;


        tryBestUci =
            null;


        tryEngine.postMessage(
            "position fen " +
            fen
        );


        tryEngine.postMessage(
            "go depth " +
            TRY_ENGINE_DEPTH
        );
    }


    function finishTryAnalysis(
        line
    ) {

        const fen =
            tryEngineActiveFen;


        const best =
            line.match(
                /^bestmove\s+(\S+)/
            );


        const result = {

            scoreCp:
                tryScoreCp,

            mate:
                tryMate,

            bestMoveUci:
                best
                    ? best[1]
                    : tryBestUci
        };


        tryCache.set(
            fen,
            result
        );


        tryEngineBusy =
            false;


        tryEngineActiveFen =
            null;


        // IMPORTANT
        // MLLI ENGINE YKML,
        // CLASSIFY MOVES DYAL TRY MODE

        refreshTryClassifications();


        if (
            tryMode &&
            tryChess
        ) {

            showTryAnalysis();

            renderTryBoard();

            updateTryLine();
        }


        processTryEngineQueue();
    }


    // =================================================
    // SHOW ANALYSIS
    // =================================================

    function showTryAnalysis() {

        if (
            !tryMode ||
            !tryChess
        ) {

            return;
        }


        const fen =
            tryChess.fen();


        const result =
            tryCache.get(
                fen
            );


        if (!result) {

            evaluation.textContent =
                "...";


            bestMove.textContent =
                "...";


            engineMessage.textContent =
                "Stockfish is analyzing this test position...";


            return;
        }


        evaluation.textContent =
            formatTryEvaluation(
                fen,
                result
            );


        const responseSan =
            tryUciToSan(
                fen,
                result.bestMoveUci
            );


        bestMove.textContent =
            responseSan;


        if (
            tryLastMove &&
            tryLastMove.classification
        ) {

            const quality =
                tryLastMove.classification;


            moveQuality.textContent =
                quality.label;


            moveQuality.className =
                getMainQualityClass(
                    quality.label
                );


            const pawns =
                quality.lossCp /
                100;


            engineMessage.textContent =

                "Your test move: " +

                quality.label +

                ". Eval loss: " +

                pawns.toFixed(2) +

                ". Best response: " +

                responseSan +

                ".";

        } else {

            moveQuality.textContent =
                "Analyzing...";


            moveQuality.className =
                "";


            engineMessage.textContent =
                "Best move from this position: " +
                responseSan;
        }


        drawCachedTryBestArrow();
    }


    // =================================================
    // MAIN QUALITY CLASS
    // =================================================

    function getMainQualityClass(
        label
    ) {

        const map = {

            Best:
                "quality-best",

            Great:
                "quality-great",

            Good:
                "quality-good",

            Inaccuracy:
                "quality-inaccuracy",

            Mistake:
                "quality-mistake",

            Blunder:
                "quality-blunder",

            Miss:
                "quality-miss"
        };


        return (
            map[label] ||
            ""
        );
    }


    // =================================================
    // FORMAT EVAL
    // =================================================

    function formatTryEvaluation(
        fen,
        result
    ) {

        const side =
            fen.split(" ")[1];


        const direction =
            side === "w"
                ? 1
                : -1;


        if (
            result.mate !== null &&
            result.mate !== undefined
        ) {

            const mate =
                result.mate *
                direction;


            return mate > 0

                ? "+M" +
                  Math.abs(mate)

                : "-M" +
                  Math.abs(mate);
        }


        if (
            result.scoreCp === null ||
            result.scoreCp === undefined
        ) {

            return "-";
        }


        const score =
            result.scoreCp *
            direction /
            100;


        return score > 0

            ? "+" +
              score.toFixed(2)

            : score.toFixed(2);
    }


    function tryResultToWhiteCp(
        fen,
        result
    ) {

        const side =
            fen.split(" ")[1];


        const direction =
            side === "w"
                ? 1
                : -1;


        if (
            result.mate !== null &&
            result.mate !== undefined
        ) {

            const mate =
                result.mate *
                direction;


            if (mate > 0) {

                return 100000;

            } else {

                return -100000;
            }
        }


        if (
            result.scoreCp === null ||
            result.scoreCp === undefined
        ) {

            return 0;
        }


        return (
            result.scoreCp *
            direction
        );
    }


    // =================================================
    // UCI -> SAN
    // =================================================

    function tryUciToSan(
        fen,
        uci
    ) {

        if (
            !uci ||
            uci === "(none)" ||
            uci.length < 4
        ) {

            return "-";
        }


        try {

            const chess =
                new Chess(fen);


            const moveData = {

                from:
                    uci.substring(
                        0,
                        2
                    ),

                to:
                    uci.substring(
                        2,
                        4
                    )
            };


            if (
                uci.length >= 5
            ) {

                moveData.promotion =
                    uci[4];
            }


            const move =
                chess.move(
                    moveData
                );


            return move
                ? move.san
                : uci;


        } catch (error) {

            return uci;
        }
    }


    // =================================================
    // DRAW BEST RESPONSE
    // =================================================

    function drawCachedTryBestArrow() {

        boardElement
            .querySelectorAll(
                ".try-best-arrow-layer"
            )
            .forEach(
                element =>
                    element.remove()
            );


        if (
            !tryMode ||
            !tryChess
        ) {

            return;
        }


        const result =
            tryCache.get(
                tryChess.fen()
            );


        if (
            !result ||
            !result.bestMoveUci
        ) {

            return;
        }


        const uci =
            String(
                result.bestMoveUci
            )
                .toLowerCase()
                .trim();


        if (
            uci.length < 4 ||
            uci === "(none)"
        ) {

            return;
        }


        drawTryArrow(

            uci.substring(
                0,
                2
            ),

            uci.substring(
                2,
                4
            )
        );
    }


    // =================================================
    // ARROW
    // =================================================

    function drawTryArrow(
        from,
        to
    ) {

        const start =
            trySquareToPoint(
                from
            );


        const end =
            trySquareToPoint(
                to
            );


        if (
            !start ||
            !end
        ) {

            return;
        }


        const dx =
            end.x -
            start.x;


        const dy =
            end.y -
            start.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance < 1
        ) {

            return;
        }


        const ux =
            dx /
            distance;


        const uy =
            dy /
            distance;


        const px =
            -uy;


        const py =
            ux;


        const startPadding =
            22;


        const endPadding =
            18;


        const sx =
            start.x +
            ux *
            startPadding;


        const sy =
            start.y +
            uy *
            startPadding;


        const tipX =
            end.x -
            ux *
            endPadding;


        const tipY =
            end.y -
            uy *
            endPadding;


        const headLength =
            27;


        const headWidth =
            17;


        const baseX =
            tipX -
            ux *
            headLength;


        const baseY =
            tipY -
            uy *
            headLength;


        const leftX =
            baseX +
            px *
            headWidth;


        const leftY =
            baseY +
            py *
            headWidth;


        const rightX =
            baseX -
            px *
            headWidth;


        const rightY =
            baseY -
            py *
            headWidth;


        const ns =
            "http://www.w3.org/2000/svg";


        const svg =
            document.createElementNS(
                ns,
                "svg"
            );


        svg.classList.add(
            "try-best-arrow-layer"
        );


        svg.setAttribute(
            "viewBox",
            "0 0 800 800"
        );


        svg.setAttribute(
            "preserveAspectRatio",
            "none"
        );


        const dot =
            document.createElementNS(
                ns,
                "circle"
            );


        dot.classList.add(
            "try-best-start"
        );


        dot.setAttribute(
            "cx",
            sx
        );


        dot.setAttribute(
            "cy",
            sy
        );


        dot.setAttribute(
            "r",
            "9"
        );


        svg.appendChild(
            dot
        );


        const line =
            document.createElementNS(
                ns,
                "line"
            );


        line.classList.add(
            "try-best-line"
        );


        line.setAttribute(
            "x1",
            sx
        );


        line.setAttribute(
            "y1",
            sy
        );


        line.setAttribute(
            "x2",
            baseX +
            ux * 3
        );


        line.setAttribute(
            "y2",
            baseY +
            uy * 3
        );


        svg.appendChild(
            line
        );


        const head =
            document.createElementNS(
                ns,
                "polygon"
            );


        head.classList.add(
            "try-best-head"
        );


        head.setAttribute(

            "points",

            `${tipX},${tipY} ` +
            `${leftX},${leftY} ` +
            `${rightX},${rightY}`
        );


        svg.appendChild(
            head
        );


        boardElement.appendChild(
            svg
        );
    }


    // =================================================
    // SQUARE -> SVG
    // =================================================

    function trySquareToPoint(
        square
    ) {

        const files =
            "abcdefgh";


        const file =
            files.indexOf(
                square[0]
            );


        const rank =
            Number(
                square[1]
            );


        if (
            file < 0 ||
            rank < 1 ||
            rank > 8
        ) {

            return null;
        }


        if (!boardFlipped) {

            return {

                x:
                    file *
                    100 +
                    50,

                y:
                    (
                        8 -
                        rank
                    ) *
                    100 +
                    50
            };
        }


        return {

            x:
                (
                    7 -
                    file
                ) *
                100 +
                50,

            y:
                (
                    rank -
                    1
                ) *
                100 +
                50
        };
    }


    // =================================================
    // CLEAN
    // =================================================

    window.addEventListener(

        "beforeunload",

        function () {

            if (tryEngine) {

                tryEngine.terminate();
            }
        }
    );

})();