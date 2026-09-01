// =====================================================
// DOM
// =====================================================

const boardElement = document.querySelector("#chessBoard");
const gameResult = document.querySelector("#gameResult");
const playerName = document.querySelector("#playerName");
const playerRating = document.querySelector("#playerRating");
const opponentName = document.querySelector("#opponentName");
const opponentRating = document.querySelector("#opponentRating");
const moveCounter = document.querySelector("#moveCounter");
const totalMoves = document.querySelector("#totalMoves");
const movesList = document.querySelector("#movesList");
const firstMoveBtn = document.querySelector("#firstMoveBtn");
const previousMoveBtn = document.querySelector("#previousMoveBtn");
const nextMoveBtn = document.querySelector("#nextMoveBtn");
const lastMoveBtn = document.querySelector("#lastMoveBtn");
const moveQuality = document.querySelector("#moveQuality");
const movePlayed = document.querySelector("#movePlayed");
const evaluation = document.querySelector("#evaluation");
const bestMove = document.querySelector("#bestMove");
const engineMessage = document.querySelector("#engineMessage");


// =====================================================
// SAVED GAME
// =====================================================

const savedGame =
    localStorage.getItem("selectedChessGame");

const savedUsername =
    localStorage.getItem("chessUsername");


if (!savedGame) {

    alert("No game selected.");

    window.location.href =
        "index.html";
}


const selectedGame =
    JSON.parse(savedGame);

const username =
    savedUsername || "";


// =====================================================
// SETTINGS
// =====================================================

const ENGINE_DEPTH =
    12;


const OPENING_BOOK_URL =
    "https://cdn.jsdelivr.net/npm/chess-eco-codes@0.0.0/codes.json";


// =====================================================
// GAME STATE
// =====================================================

let moves = [];

let positions = [];

let currentMoveIndex =
    0;


let playerColor =
    "w";


let boardFlipped =
    false;


let playerGameRating =
    null;


let playerGameResult =
    "Draw";


// =====================================================
// EXPLORE MODE STATE
// (user-controlled "what if I play this" preview)
// =====================================================

let isExploring =
    false;


let exploreChess =
    null;


let explorePreviousIndex =
    null;


let selectedSquare =
    null;


let legalMoveSquares =
    [];


let currentDisplayChess =
    null;


let pendingExploreFen =
    null;


let lastRequestedExploreFen =
    null;


let explorePreviousResult =
    null;


let explorePreviousFen =
    null;


// Stack of every position visited in the current sandbox line,
// including the real-game branch point at index 0. Each entry:
// { fen, result }. Lets "undo" step back one move at a time
// instead of dumping straight back to the real game.

let exploreStack =
    [];


// =====================================================
// PIECES
// =====================================================

const pieceImages = {

    wp: "pieces/wP.png",
    wn: "pieces/wN.png",
    wb: "pieces/wB.png",
    wr: "pieces/wR.png",
    wq: "pieces/wQ.png",
    wk: "pieces/wK.png",

    bp: "pieces/bP.png",
    bn: "pieces/bN.png",
    bb: "pieces/bB.png",
    br: "pieces/bR.png",
    bq: "pieces/bQ.png",
    bk: "pieces/bK.png"
};


// =====================================================
// EXTRA UI
// =====================================================

injectExtraStyles();

injectExploreStyles();

createBoardMeta();

createGameReportSection();

createExploreBanner();


// =====================================================
// NEW ELEMENTS
// =====================================================

const boardOrientationInfo =
    document.querySelector(
        "#boardOrientationInfo"
    );


const openingInfoText =
    document.querySelector(
        "#openingInfoText"
    );


const gameReportStatus =
    document.querySelector(
        "#gameReportStatus"
    );


const reportProgressBar =
    document.querySelector(
        "#reportProgressBar"
    );


const reportGameRating =
    document.querySelector(
        "#reportGameRating"
    );


const reportPerformance =
    document.querySelector(
        "#reportPerformance"
    );


const reportAccuracy =
    document.querySelector(
        "#reportAccuracy"
    );


const reportAverageLoss =
    document.querySelector(
        "#reportAverageLoss"
    );


const reportOpening =
    document.querySelector(
        "#reportOpening"
    );


const reportBest =
    document.querySelector(
        "#reportBest"
    );


const reportGreat =
    document.querySelector(
        "#reportGreat"
    );


const reportGood =
    document.querySelector(
        "#reportGood"
    );


const reportInaccuracy =
    document.querySelector(
        "#reportInaccuracy"
    );


const reportMistake =
    document.querySelector(
        "#reportMistake"
    );


const reportBlunder =
    document.querySelector(
        "#reportBlunder"
    );


const reportMiss =
    document.querySelector(
        "#reportMiss"
    );


// =====================================================
// EXTRA CSS
// =====================================================

function injectExtraStyles() {

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        .chess-board {
            position: relative;
        }


        .square {
            position: relative;
        }


        .piece {
            position: relative;

            z-index: 5;
        }


        /* =========================
           BOARD BADGE
        ========================= */

        .board-quality-badge {

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

            font-family:
                Arial,
                sans-serif;

            font-size: 12px;

            font-weight: 900;

            color: white;

            z-index: 30;

            pointer-events: none;

            border:
                2px solid
                rgba(
                    255,
                    255,
                    255,
                    0.92
                );

            box-shadow:
                0 3px 9px
                rgba(
                    0,
                    0,
                    0,
                    0.4
                );
        }


        .board-quality-opening {

            background:
                #7658d8;

            min-width: 28px;
        }


        .board-quality-best {

            background:
                #2fbfae;
        }


        .board-quality-great {

            background:
                #319fd5;
        }


        .board-quality-good {

            background:
                #4bae63;
        }


        .board-quality-inaccuracy {

            background:
                #d3a92d;

            color:
                #151515;
        }


        .board-quality-mistake {

            background:
                #e07b38;
        }


        .board-quality-blunder {

            background:
                #d84d5b;
        }


        .board-quality-miss {

            background:
                #9a66d7;
        }


        .quality-opening {

            color:
                #b9a5ff;
        }


        .quality-miss {

            color:
                #c69cff;
        }


        /* =========================
           MOVE HISTORY
        ========================= */

        .move-item {

            position: relative;

            display: flex;

            align-items: center;

            width: 100%;
        }


        .move-san {

            min-width: 0;

            overflow: hidden;

            text-overflow:
                ellipsis;
        }


        .history-quality-badge {

            margin-left: auto;

            flex-shrink: 0;

            min-width: 21px;
            height: 21px;

            padding: 0 4px;

            display: none;

            align-items: center;
            justify-content: center;

            border-radius:
                999px;

            color:
                white;

            font-size:
                10px;

            font-weight:
                900;

            line-height:
                1;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.55
                );

            box-shadow:
                0 2px 5px
                rgba(
                    0,
                    0,
                    0,
                    0.25
                );
        }


        .history-quality-badge.visible {

            display:
                flex;
        }


        .history-quality-opening {

            background:
                #7658d8;
        }


        .history-quality-best {

            background:
                #2fbfae;
        }


        .history-quality-great {

            background:
                #319fd5;
        }


        .history-quality-good {

            background:
                #4bae63;
        }


        .history-quality-inaccuracy {

            background:
                #d3a92d;

            color:
                #161616;
        }


        .history-quality-mistake {

            background:
                #e07b38;
        }


        .history-quality-blunder {

            background:
                #d84d5b;
        }


        .history-quality-miss {

            background:
                #9a66d7;
        }


        /* =========================
           ARROW
        ========================= */

        .best-move-arrow-layer {

            position:
                absolute;

            inset:
                0;

            width:
                100%;

            height:
                100%;

            z-index:
                15;

            pointer-events:
                none;

            overflow:
                visible;
        }


        .best-arrow-line {

            stroke:
                #45cbea;

            stroke-width:
                10;

            stroke-linecap:
                round;

            opacity:
                0.78;
        }


        .best-arrow-head {

            fill:
                #45cbea;

            opacity:
                0.9;
        }


        .best-arrow-start {

            fill:
                #45cbea;

            opacity:
                0.72;
        }


        /* =========================
           BOARD META
        ========================= */

        .board-meta {

            width:
                100%;

            margin-top:
                6px;

            display:
                flex;

            justify-content:
                space-between;

            gap:
                10px;

            color:
                #77819c;

            font-size:
                10px;
        }


        #openingInfoText {

            text-align:
                right;

            overflow:
                hidden;

            text-overflow:
                ellipsis;

            white-space:
                nowrap;
        }


        /* =========================
           GAME REPORT
        ========================= */

        .game-report-section {

            margin-top:
                16px;

            padding:
                16px;

            background:
                linear-gradient(
                    145deg,
                    #171d2e,
                    #0d1220
                );

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.08
                );

            border-radius:
                15px;
        }


        .game-report-top {

            display:
                flex;

            justify-content:
                space-between;

            align-items:
                center;

            gap:
                12px;

            margin-bottom:
                10px;
        }


        .game-report-top h2 {

            margin:
                0;

            font-size:
                20px;
        }


        .game-report-status {

            color:
                #8f99b7;

            font-size:
                12px;
        }


        .report-progress {

            width:
                100%;

            height:
                7px;

            margin-bottom:
                14px;

            overflow:
                hidden;

            border-radius:
                999px;

            background:
                #0a0f1c;
        }


        .report-progress-bar {

            width:
                0%;

            height:
                100%;

            border-radius:
                inherit;

            background:
                linear-gradient(
                    90deg,
                    #6675ff,
                    #8d62ff
                );

            transition:
                width 0.2s;
        }


        .report-main-stats {

            display:
                grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:
                8px;

            margin-bottom:
                12px;
        }


        .report-stat {

            padding:
                11px;

            border-radius:
                10px;

            background:
                #0d1322;
        }


        .report-stat span {

            display:
                block;

            margin-bottom:
                5px;

            color:
                #818aa4;

            font-size:
                9px;

            font-weight:
                800;
        }


        .report-stat strong {

            font-size:
                18px;
        }


        .report-quality-grid {

            display:
                grid;

            grid-template-columns:
                repeat(
                    8,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:
                7px;
        }


        .report-quality-item {

            padding:
                9px 6px;

            border-radius:
                9px;

            background:
                #0d1322;

            text-align:
                center;
        }


        .report-quality-item strong {

            display:
                block;

            margin-bottom:
                3px;

            font-size:
                17px;
        }


        .report-quality-item span {

            color:
                #8f99b7;

            font-size:
                9px;
        }


        .report-note {

            margin:
                11px 0 0;

            color:
                #747e98;

            font-size:
                10px;

            line-height:
                1.4;
        }


        @media (
            max-width:
            850px
        ) {

            .report-main-stats {

                grid-template-columns:
                    repeat(
                        2,
                        1fr
                    );
            }


            .report-quality-grid {

                grid-template-columns:
                    repeat(
                        4,
                        1fr
                    );
            }
        }


        @media (
            max-width:
            560px
        ) {

            .board-quality-badge {

                right:
                    2px;

                top:
                    2px;

                min-width:
                    19px;

                height:
                    19px;

                padding:
                    0 3px;

                font-size:
                    9px;

                border-width:
                    1px;
            }


            .history-quality-badge {

                min-width:
                    18px;

                height:
                    18px;

                padding:
                    0 3px;

                font-size:
                    8px;
            }


            .best-arrow-line {

                stroke-width:
                    8;
            }


            .board-meta {

                flex-direction:
                    column;

                gap:
                    2px;
            }


            #openingInfoText {

                text-align:
                    left;

                white-space:
                    normal;
            }


            .game-report-top {

                flex-direction:
                    column;

                align-items:
                    flex-start;
            }


            .report-quality-grid {

                grid-template-columns:
                    repeat(
                        2,
                        1fr
                    );
            }
        }

    `;


    document.head.appendChild(
        style
    );
}


// =====================================================
// EXPLORE MODE CSS
// =====================================================

function injectExploreStyles() {

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        .square {
            cursor: pointer;
        }


        .square.selected-square {

            box-shadow:
                inset 0 0 0 3px
                #f5c451;
        }


        .square.legal-move-square::after {

            content: "";

            position: absolute;

            top: 50%;
            left: 50%;

            width: 22%;
            height: 22%;

            transform:
                translate(-50%, -50%);

            border-radius: 50%;

            background:
                rgba(69, 203, 234, 0.55);

            pointer-events: none;

            z-index: 20;
        }


        .square.legal-capture-square::after {

            content: "";

            position: absolute;

            inset: 6%;

            border-radius: 50%;

            border:
                4px solid
                rgba(216, 77, 91, 0.8);

            pointer-events: none;

            z-index: 20;
        }


        .square.king-in-check {

            box-shadow:
                inset 0 0 0 3px
                #d84d5b;
        }


        .explore-banner {

            display: flex;

            align-items: center;

            justify-content:
                space-between;

            gap: 10px;

            margin-bottom: 8px;

            padding: 8px 12px;

            border-radius: 10px;

            background:
                linear-gradient(
                    145deg,
                    #21305a,
                    #131c33
                );

            border:
                1px solid
                rgba(255, 255, 255, 0.08);

            color: #cdd6f4;

            font-size: 12px;
        }


        .explore-banner-buttons {

            display: flex;

            gap: 8px;

            flex-shrink: 0;
        }


        .explore-banner button {

            padding: 6px 12px;

            border-radius: 8px;

            border: none;

            background: #45cbea;

            color: #071019;

            font-weight: 800;

            font-size: 11px;

            cursor: pointer;
        }


        .explore-banner #undoExploreBtn {

            background: transparent;

            color: #cdd6f4;

            border:
                1px solid
                rgba(255, 255, 255, 0.25);
        }

    `;


    document.head.appendChild(
        style
    );
}


// =====================================================
// EXPLORE BANNER (Back to game)
// =====================================================

function createExploreBanner() {

    const boardArea =
        document.querySelector(
            ".board-area"
        );


    if (!boardArea) {

        return;
    }


    const old =
        document.querySelector(
            "#exploreBanner"
        );


    if (old) {

        old.remove();
    }


    const banner =
        document.createElement(
            "div"
        );


    banner.className =
        "explore-banner";


    banner.id =
        "exploreBanner";


    banner.style.display =
        "none";


    banner.innerHTML = `

        <span>
            Ghatlaeb b piece ta3ek dyalek — tema chnou raytra
        </span>


        <div
            class="explore-banner-buttons"
        >

            <button
                id="undoExploreBtn"
                type="button"
            >
                Undo move
            </button>


            <button
                id="exitExploreBtn"
                type="button"
            >
                Back to game
            </button>

        </div>

    `;


    boardArea.insertBefore(

        banner,

        boardArea.firstChild
    );


    document

        .querySelector(
            "#undoExploreBtn"
        )

        .addEventListener(

            "click",

            undoExploreMove
        );


    document

        .querySelector(
            "#exitExploreBtn"
        )

        .addEventListener(

            "click",

            exitExploreMode
        );
}


// =====================================================
// BOARD META
// =====================================================

function createBoardMeta() {

    const boardArea =
        document.querySelector(
            ".board-area"
        );


    if (!boardArea) {

        return;
    }


    const old =
        document.querySelector(
            ".board-meta"
        );


    if (old) {

        old.remove();
    }


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "board-meta";


    meta.innerHTML = `

        <span
            id="boardOrientationInfo"
        >
            -
        </span>


        <span
            id="openingInfoText"
        >
            Opening book loading...
        </span>

    `;


    boardArea.appendChild(
        meta
    );
}


// =====================================================
// GAME REPORT
// =====================================================

function createGameReportSection() {

    const analysisLayout =
        document.querySelector(
            ".analysis-layout"
        );


    if (!analysisLayout) {

        return;
    }


    const old =
        document.querySelector(
            ".game-report-section"
        );


    if (old) {

        old.remove();
    }


    const report =
        document.createElement(
            "section"
        );


    report.className =
        "game-report-section";


    report.innerHTML = `

        <div
            class="game-report-top"
        >

            <div>

                <p
                    class="small-title"
                >
                    GAME REPORT
                </p>

                <h2>
                    Your Performance
                </h2>

            </div>


            <div
                id="gameReportStatus"
                class="game-report-status"
            >
                Waiting for Stockfish...
            </div>

        </div>


        <div
            class="report-progress"
        >

            <div
                id="reportProgressBar"
                class="report-progress-bar"
            ></div>

        </div>


        <div
            class="report-main-stats"
        >


            <div
                class="report-stat"
            >

                <span>
                    MATCH RATING
                </span>

                <strong
                    id="reportGameRating"
                >
                    -
                </strong>

            </div>


            <div
                class="report-stat"
            >

                <span>
                    EST. PERFORMANCE
                </span>

                <strong
                    id="reportPerformance"
                >
                    -
                </strong>

            </div>


            <div
                class="report-stat"
            >

                <span>
                    EST. ACCURACY
                </span>

                <strong
                    id="reportAccuracy"
                >
                    -
                </strong>

            </div>


            <div
                class="report-stat"
            >

                <span>
                    AVG EVAL LOSS
                </span>

                <strong
                    id="reportAverageLoss"
                >
                    -
                </strong>

            </div>


        </div>


        <div
            class="report-quality-grid"
        >


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportOpening"
                >
                    0
                </strong>

                <span>
                    Opening
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportBest"
                >
                    0
                </strong>

                <span>
                    Best
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportGreat"
                >
                    0
                </strong>

                <span>
                    Great
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportGood"
                >
                    0
                </strong>

                <span>
                    Good
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportInaccuracy"
                >
                    0
                </strong>

                <span>
                    Inaccuracy
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportMistake"
                >
                    0
                </strong>

                <span>
                    Mistake
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportBlunder"
                >
                    0
                </strong>

                <span>
                    Blunder
                </span>

            </div>


            <div
                class="report-quality-item"
            >

                <strong
                    id="reportMiss"
                >
                    0
                </strong>

                <span>
                    Miss
                </span>

            </div>


        </div>


        <p
            class="report-note"
        >
            Opening moves come from an ECO opening book.
            Estimated performance and accuracy are unofficial
            values calculated by this analyzer using Stockfish.
        </p>

    `;


    analysisLayout.insertAdjacentElement(
        "afterend",
        report
    );
}


// =====================================================
// OPENING BOOK STATE
// =====================================================

let openingBookReady =
    false;


let openingBookFailed =
    false;


const openingPrefixSet =
    new Set();


const openingExactMap =
    new Map();


const openingFenMap =
    new Map();


const openingByMove =
    new Map();


// =====================================================
// LOAD OPENING BOOK
// =====================================================

async function loadOpeningBook() {

    openingInfoText.textContent =
        "Opening book loading...";


    try {

        const response =
            await fetch(
                OPENING_BOOK_URL
            );


        if (!response.ok) {

            throw new Error(
                "Opening book HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        buildOpeningIndexes(
            data
        );


        openingBookReady =
            true;


        detectGameOpenings();


        moveClassificationCache.clear();


        applyOpeningClassifications();


        refreshClassificationsFromCache();


        renderCurrentAnalysis();


        updateGameReport();


        updateOpeningInfo();


    } catch (error) {

        console.error(
            "Opening book error:",
            error
        );


        openingBookFailed =
            true;


        openingInfoText.textContent =
            "Opening book unavailable";
    }
}


// =====================================================
// BUILD OPENING INDEXES
// =====================================================

function buildOpeningIndexes(
    data
) {

    for (
        const [
            fen,
            rawInfo
        ]
        of
        Object.entries(
            data || {}
        )
    ) {

        const info = {

            code:
                rawInfo?.code ||
                rawInfo?.eco ||
                "",

            name:
                rawInfo?.name ||
                "Opening Theory",

            moves:
                rawInfo?.moves ||
                ""
        };


        openingFenMap.set(

            normalizeFenForBook(
                fen
            ),

            info
        );


        const tokens =
            normalizeOpeningMoves(
                info.moves
            );


        if (
            !tokens.length
        ) {

            continue;
        }


        for (
            let i = 1;
            i <= tokens.length;
            i++
        ) {

            const prefix =
                tokens
                    .slice(
                        0,
                        i
                    )
                    .join(
                        " "
                    );


            openingPrefixSet.add(
                prefix
            );
        }


        openingExactMap.set(

            tokens.join(
                " "
            ),

            info
        );
    }
}


// =====================================================
// NORMALIZE OPENING MOVES
// =====================================================

function normalizeOpeningMoves(
    text
) {

    return String(
        text || ""
    )

        .replace(
            /\{[^}]*\}/g,
            " "
        )

        .replace(
            /\([^)]*\)/g,
            " "
        )

        .split(
            /\s+/
        )

        .map(
            function(token) {

                return token.replace(
                    /^\d+\.(?:\.\.)?/,
                    ""
                );
            }
        )

        .map(
            cleanSanToken
        )

        .filter(
            Boolean
        )

        .filter(
            function(token) {

                return ![
                    "1-0",
                    "0-1",
                    "1/2-1/2",
                    "*"
                ].includes(
                    token
                );
            }
        );
}


// =====================================================
// CLEAN SAN
// =====================================================

function cleanSanToken(
    token
) {

    return String(
        token || ""
    )

        .trim()

        .replace(
            /[+#?!]+$/g,
            ""
        )

        .replace(
            /\s+/g,
            ""
        );
}


// =====================================================
// NORMALIZE FEN
// =====================================================

function normalizeFenForBook(
    fen
) {

    return String(
        fen || ""
    )

        .trim()

        .split(
            /\s+/
        )

        .slice(
            0,
            4
        )

        .join(
            " "
        );
}


// =====================================================
// DETECT OPENING MOVES
// =====================================================

function detectGameOpenings() {

    openingByMove.clear();


    const gameTokens =
        [];


    let lastNamedOpening =
        null;


    for (
        let i = 1;
        i <= moves.length;
        i++
    ) {

        gameTokens.push(

            cleanSanToken(
                moves[
                    i - 1
                ].san
            )
        );


        const prefix =
            gameTokens.join(
                " "
            );


        const exactInfo =
            openingExactMap.get(
                prefix
            ) ||
            null;


        const fenInfo =
            openingFenMap.get(

                normalizeFenForBook(
                    positions[i].fen
                )

            ) ||
            null;


        const info =
            exactInfo ||
            fenInfo;


        if (info) {

            lastNamedOpening =
                info;
        }


        const isOpening =

            openingPrefixSet.has(
                prefix
            ) ||

            Boolean(
                fenInfo
            );


        if (isOpening) {

            openingByMove.set(

                i,

                info ||

                lastNamedOpening ||

                {
                    code:
                        "",

                    name:
                        "Opening Theory",

                    moves:
                        ""
                }
            );
        }
    }
}


// =====================================================
// OPENING CLASSIFICATION
// =====================================================

function applyOpeningClassifications() {

    for (
        const [
            index,
            info
        ]
        of
        openingByMove.entries()
    ) {

        const classification =
            makeOpeningClassification(
                info
            );


        moveClassificationCache.set(
            index,
            classification
        );


        updateMoveHistoryQuality(
            index,
            classification
        );
    }
}


// =====================================================
// MAKE OPENING LABEL
// =====================================================

function makeOpeningClassification(
    info
) {

    const codePart =
        info?.code
            ? info.code +
              " - "
            : "";


    const name =
        info?.name ||
        "Opening Theory";


    return {

        label:
            "Opening",

        className:
            "quality-opening",

        lossCp:
            0,

        isOpening:
            true,

        message:
            "Opening book: " +
            codePart +
            name,

        openingInfo:
            info ||
            null
    };
}


// =====================================================
// OPENING NAME UNDER BOARD
// =====================================================

function updateOpeningInfo() {

    if (
        openingBookFailed
    ) {

        openingInfoText.textContent =
            "Opening book unavailable";

        return;
    }


    if (
        !openingBookReady
    ) {

        openingInfoText.textContent =
            "Opening book loading...";

        return;
    }


    let latest =
        null;


    const limit =
        currentMoveIndex > 0
            ? currentMoveIndex
            : moves.length;


    for (
        let i = 1;
        i <= limit;
        i++
    ) {

        if (
            openingByMove.has(
                i
            )
        ) {

            latest =
                openingByMove.get(
                    i
                );
        }
    }


    if (!latest) {

        openingInfoText.textContent =
            "No ECO opening detected";

        return;
    }


    const code =
        latest.code
            ? latest.code +
              " - "
            : "";


    openingInfoText.textContent =
        code +
        latest.name;
}


// =====================================================
// STOCKFISH STATE
// =====================================================

let stockfish =
    null;


let engineReady =
    false;


let engineBusy =
    false;


let engineCurrentIndex =
    null;


let engineQueue =
    [];


let engineScoreCp =
    null;


let engineMate =
    null;


let engineBestMove =
    null;


const engineCache =
    new Map();


const moveClassificationCache =
    new Map();


// =====================================================
// START
// =====================================================

loadSelectedGame();


// =====================================================
// LOAD GAME
// =====================================================

function loadSelectedGame() {

    if (
        !selectedGame.pgn
    ) {

        engineMessage.textContent =
            "This game does not contain PGN data.";

        return;
    }


    const chess =
        new Chess();


    const loaded =
        chess.load_pgn(
            selectedGame.pgn
        );


    if (!loaded) {

        engineMessage.textContent =
            "Could not read this game.";

        return;
    }


    moves =
        chess.history({
            verbose:
                true
        });


    buildPositions();


    showGameInformation();


    buildMovesList();


    showPosition(
        0
    );


    startStockfish();


    loadOpeningBook();


    updateGameReport();
}


// =====================================================
// BUILD POSITIONS
// =====================================================

function buildPositions() {

    positions =
        [];


    const chess =
        new Chess();


    positions.push({

        fen:
            chess.fen(),

        move:
            null
    });


    moves.forEach(
        function(move) {

            chess.move(
                move.san
            );


            positions.push({

                fen:
                    chess.fen(),

                move:
                    move
            });
        }
    );
}


// =====================================================
// GAME INFORMATION
// =====================================================

function showGameInformation() {

    const normalizedUsername =
        username.toLowerCase();


    const whiteUsername =
        selectedGame.white
            ?.username
            ?.toLowerCase();


    let player;

    let opponent;


    if (
        whiteUsername ===
        normalizedUsername
    ) {

        player =
            selectedGame.white;


        opponent =
            selectedGame.black;


        playerColor =
            "w";

    } else {

        player =
            selectedGame.black;


        opponent =
            selectedGame.white;


        playerColor =
            "b";
    }


    boardFlipped =
        playerColor ===
        "b";


    boardOrientationInfo.textContent =
        playerColor === "w"
            ? "You are White"
            : "You are Black";


    playerGameRating =
        player?.rating ??
        null;


    playerGameResult =
        getGameResult(
            player?.result
        );


    playerName.textContent =
        player?.username ||
        username ||
        "-";


    playerRating.textContent =
        "Rating " +
        (
            playerGameRating ??
            "-"
        );


    opponentName.textContent =
        opponent?.username ||
        "-";


    opponentRating.textContent =
        "Rating " +
        (
            opponent?.rating ??
            "-"
        );


    gameResult.textContent =
        playerGameResult;


    gameResult.className =
        "result-badge " +
        playerGameResult
            .toLowerCase();


    reportGameRating.textContent =
        playerGameRating ??
        "-";
}


// =====================================================
// RESULT
// =====================================================

function getGameResult(
    result
) {

    if (
        result ===
        "win"
    ) {

        return "Win";
    }


    const draws = [

        "agreed",

        "repetition",

        "stalemate",

        "insufficient",

        "50move",

        "timevsinsufficient"
    ];


    return draws.includes(
        result
    )
        ? "Draw"
        : "Loss";
}


// =====================================================
// SHOW POSITION
// =====================================================

function showPosition(
    index
) {

    resetExploreState();


    currentMoveIndex =
        Math.max(

            0,

            Math.min(

                index,

                positions.length -
                1
            )
        );


    const chess =
        new Chess(

            positions[
                currentMoveIndex
            ].fen
        );


    drawBoard(
        chess
    );


    updateNavigation();


    updateMoveInformation();


    updateOpeningInfo();


    requestCurrentAnalysis();
}


// =====================================================
// DRAW BOARD
// =====================================================

function drawBoard(
    chess
) {

    currentDisplayChess =
        chess;


    boardElement.innerHTML =
        "";


    const board =
        chess.board();


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


            const square =
                document.createElement(
                    "div"
                );


            square.classList.add(
                "square"
            );


            const squareName =
                getSquareName(

                    actualRow,

                    actualCol
                );


            square.dataset.square =
                squareName;


            if (
                (
                    actualRow +
                    actualCol
                ) % 2 ===
                0
            ) {

                square.classList.add(
                    "light"
                );

            } else {

                square.classList.add(
                    "dark"
                );
            }


            if (
                selectedSquare ===
                squareName
            ) {

                square.classList.add(
                    "selected-square"
                );
            }


            if (
                legalMoveSquares.includes(
                    squareName
                )
            ) {

                square.classList.add(

                    board[
                        actualRow
                    ][
                        actualCol
                    ]

                        ? "legal-capture-square"

                        : "legal-move-square"
                );
            }


            const piece =
                board[
                    actualRow
                ][
                    actualCol
                ];


            if (
                piece &&
                piece.type ===
                "k" &&
                piece.color ===
                chess.turn() &&
                chess.in_check()
            ) {

                square.classList.add(
                    "king-in-check"
                );
            }


            if (piece) {

                const pieceElement =
                    document.createElement(
                        "img"
                    );


                pieceElement.classList.add(
                    "piece"
                );


                const key =
                    piece.color +
                    piece.type;


                pieceElement.src =
                    pieceImages[key];


                pieceElement.alt =
                    key;


                pieceElement.draggable =
                    false;


                square.appendChild(
                    pieceElement
                );
            }


            if (
                currentMoveIndex >
                0
            ) {

                const move =
                    positions[
                        currentMoveIndex
                    ].move;


                if (
                    move &&
                    (
                        squareName ===
                        move.from ||

                        squareName ===
                        move.to
                    )
                ) {

                    square.classList.add(
                        "current-move"
                    );
                }
            }


            square.addEventListener(

                "click",

                function() {

                    handleSquareClick(

                        squareName,

                        chess
                    );
                }
            );


            boardElement.appendChild(
                square
            );
        }
    }


    drawCurrentBoardFeedback();
}


// =====================================================
// SQUARE NAME
// =====================================================

function getSquareName(
    row,
    col
) {

    const files =
        "abcdefgh";


    return (
        files[col] +
        (
            8 -
            row
        )
    );
}


// =====================================================
// EXPLORE MODE - SQUARE CLICK
// =====================================================

function handleSquareClick(
    squareName,
    displayedChess
) {

    if (!displayedChess) {

        return;
    }


    // A legal destination is already highlighted -> play it

    if (
        selectedSquare &&

        legalMoveSquares.includes(
            squareName
        )
    ) {

        playExploratoryMove(

            selectedSquare,

            squareName,

            displayedChess
        );


        return;
    }


    // Clicking the same piece again -> deselect

    if (
        selectedSquare ===
        squareName
    ) {

        clearSelection();


        redrawActiveBoard();


        return;
    }


    const piece =
        displayedChess.get(
            squareName
        );


    // Select a piece that belongs to the side to move

    if (
        piece &&
        piece.color ===
        displayedChess.turn()
    ) {

        selectedSquare =
            squareName;


        legalMoveSquares =
            displayedChess

                .moves({
                    square:
                        squareName,

                    verbose:
                        true
                })

                .map(
                    function(m) {

                        return m.to;
                    }
                );


        redrawActiveBoard();


        return;
    }


    clearSelection();


    redrawActiveBoard();
}


// =====================================================
// EXPLORE MODE - SELECTION HELPERS
// =====================================================

function clearSelection() {

    selectedSquare =
        null;


    legalMoveSquares =
        [];
}


function redrawActiveBoard() {

    if (
        currentDisplayChess
    ) {

        drawBoard(
            currentDisplayChess
        );
    }
}


// =====================================================
// EXPLORE MODE - PLAY A SANDBOX MOVE
// =====================================================

function playExploratoryMove(
    from,
    to,
    displayedChess
) {

    if (
        !isExploring
    ) {

        exploreChess =
            new Chess(

                displayedChess.fen()
            );


        explorePreviousIndex =
            currentMoveIndex;


        isExploring =
            true;


        // If this real position was already analyzed by the
        // background engine, reuse that eval as the "before" for
        // classifying the very first sandbox move. If it wasn't
        // analyzed yet, we simply won't badge this first move -
        // every move after it will chain off its own eval instead.

        explorePreviousResult =
            engineCache.get(
                currentMoveIndex
            ) ||
            null;


        explorePreviousFen =
            displayedChess.fen();


        exploreStack =
            [
                {
                    fen:
                        explorePreviousFen,

                    result:
                        explorePreviousResult
                }
            ];


        const banner =
            document.querySelector(
                "#exploreBanner"
            );


        if (banner) {

            banner.style.display =
                "flex";
        }
    }


    const movingPiece =
        exploreChess.get(
            from
        );


    let promotion =
        undefined;


    if (
        movingPiece &&
        movingPiece.type ===
        "p" &&
        (
            to[1] === "8" ||
            to[1] === "1"
        )
    ) {

        promotion =
            promptPromotionChoice();
    }


    const moveResult =
        exploreChess.move({

            from:
                from,

            to:
                to,

            promotion:
                promotion ||
                "q"
        });


    clearSelection();


    if (!moveResult) {

        // Illegal move attempt, just redraw as-is

        redrawActiveBoard();


        return;
    }


    // Record this new position on the stack (result filled in once
    // the engine finishes evaluating it - see renderExploreAnalysis).

    exploreStack.push(
        {
            fen:
                exploreChess.fen(),

            result:
                null
        }
    );


    refreshExploreBoard();


    requestExploreAnalysis();
}


// =====================================================
// PROMOTION PICKER
// =====================================================

function promptPromotionChoice() {

    const answer =
        window.prompt(

            "Promote to (q, r, b, n):",

            "q"
        );


    const clean =
        String(
            answer ||
            "q"
        )

            .trim()

            .toLowerCase();


    return [
        "q",
        "r",
        "b",
        "n"
    ].includes(
        clean
    )
        ? clean
        : "q";
}


// =====================================================
// EXPLORE MODE - BOARD / STATE RESET
// =====================================================

function refreshExploreBoard() {

    drawBoard(
        exploreChess
    );
}


function resetExploreState() {

    isExploring =
        false;


    exploreChess =
        null;


    explorePreviousIndex =
        null;


    pendingExploreFen =
        null;


    lastRequestedExploreFen =
        null;


    explorePreviousResult =
        null;


    explorePreviousFen =
        null;


    exploreStack =
        [];


    clearSelection();


    const banner =
        document.querySelector(
            "#exploreBanner"
        );


    if (banner) {

        banner.style.display =
            "none";
    }
}


function exitExploreMode() {

    resetExploreState();


    showPosition(
        currentMoveIndex
    );
}


// =====================================================
// EXPLORE MODE - UNDO ONE SANDBOX MOVE
// =====================================================

function undoExploreMove() {

    if (
        !isExploring ||

        exploreStack.length <=
        1
    ) {

        // Already at the branch point, nothing left to undo.
        // Stay in explore mode - "Back to game" is what actually exits.

        return;
    }


    // Drop the current position, land on the one before it

    exploreStack.pop();


    const target =
        exploreStack[
            exploreStack.length -
            1
        ];


    exploreChess =
        new Chess(
            target.fen
        );


    clearSelection();


    refreshExploreBoard();


    if (
        target.result
    ) {

        // We already have this position's eval cached from when we
        // played through it forward - reuse it, no engine round trip.

        lastRequestedExploreFen =
            target.fen;


        moveQuality.textContent =
            "Exploring";


        moveQuality.className =
            "quality-opening";


        movePlayed.textContent =
            describeExploreLastMove();


        renderExploreAnalysis(
            target.result
        );

    } else {

        requestExploreAnalysis();
    }
}


// =====================================================
// EXPLORE MODE - ENGINE PREVIEW
// =====================================================

function requestExploreAnalysis() {

    if (
        !exploreChess
    ) {

        return;
    }


    pendingExploreFen =
        exploreChess.fen();


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


    // If the engine is mid-search (either the background full-game
    // analysis or a previous, now outdated, explore preview), don't
    // just wait for it to finish naturally - that search can take a
    // long time and made it LOOK like analysis had frozen. Ask the
    // engine to yield immediately so it can move on to this position.

    if (
        engineBusy &&
        stockfish
    ) {

        stockfish.postMessage(
            "stop"
        );


        return;
    }


    tryRunExploreAnalysis();
}


function tryRunExploreAnalysis() {

    if (
        !engineReady ||
        engineBusy ||
        !pendingExploreFen
    ) {

        return;
    }


    const fen =
        pendingExploreFen;


    pendingExploreFen =
        null;


    analyzeExplorePosition(
        fen
    );
}


function analyzeExplorePosition(
    fen
) {

    engineBusy =
        true;


    engineCurrentIndex =
        "explore";


    lastRequestedExploreFen =
        fen;


    engineScoreCp =
        null;


    engineMate =
        null;


    engineBestMove =
        null;


    stockfish.postMessage(

        "position fen " +

        fen
    );


    stockfish.postMessage(

        "go depth " +

        ENGINE_DEPTH
    );
}


function renderExploreAnalysis(
    result
) {

    if (
        !exploreChess
    ) {

        return;
    }


    // This result may belong to a search that was interrupted by
    // "stop" because the user already played another move. If so,
    // just drop it silently - processEngineQueue() will already be
    // moving on to the up-to-date position.

    if (
        lastRequestedExploreFen !==
        exploreChess.fen()
    ) {

        return;
    }


    evaluation.textContent =
        formatExploreEvaluation(
            result
        );


    bestMove.textContent =
        convertUciToSan(

            exploreChess.fen(),

            result.bestMoveUci
        );


    const history =
        exploreChess.history({

            verbose:
                true
        });


    const lastMove =
        history[
            history.length -
            1
        ];


    // Fill in the result for the position we just reached, so a
    // later "undo" can redisplay it without asking the engine again.

    if (
        exploreStack.length
    ) {

        exploreStack[
            exploreStack.length -
            1
        ].result =
            result;
    }


    const beforeEntry =
        exploreStack[
            exploreStack.length -
            2
        ];


    let classification =
        null;


    if (
        lastMove &&
        beforeEntry &&
        beforeEntry.result
    ) {

        classification =
            classifyExploreMove(

                lastMove,

                beforeEntry.fen,

                beforeEntry.result,

                exploreChess.fen(),

                result
            );


        moveQuality.textContent =
            classification.label;


        moveQuality.className =
            classification.className;


        drawBadgeOnSquare(

            lastMove.to,

            classification
        );


        // Only show the "here's what you should have played"
        // arrow when the move wasn't already the top choice.

        if (
            ![
                "Best",
                "Great"
            ].includes(
                classification.label
            )
        ) {

            const bestUci =
                normalizeUci(

                    beforeEntry.result
                        .bestMoveUci
                );


            if (
                bestUci &&
                bestUci !==
                "(none)" &&
                bestUci.length >=
                4
            ) {

                drawCleanArrow(

                    bestUci.substring(
                        0,
                        2
                    ),

                    bestUci.substring(
                        2,
                        4
                    )
                );
            }
        }
    }


    if (
        exploreChess.in_checkmate()
    ) {

        engineMessage.textContent =
            "Checkmate on the board.";

    } else if (
        exploreChess.in_check()
    ) {

        engineMessage.textContent =

            classification

                ? classification.message +
                  " It also gives check."

                : "That move gives check.";

    } else {

        engineMessage.textContent =

            classification

                ? classification.message

                : "This is what the engine thinks after your move.";
    }
}


function formatExploreEvaluation(
    result
) {

    const sideToMove =

        exploreChess
            .fen()

            .split(
                " "
            )[1];


    const direction =

        sideToMove ===
        "w"

            ? 1

            : -1;


    if (
        result.mate !== null &&

        result.mate !== undefined
    ) {

        const mate =

            result.mate *

            direction;


        return (
            mate >
            0
        )

            ? "+M" +
              Math.abs(
                  mate
              )

            : "-M" +
              Math.abs(
                  mate
              );
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


    return (
        score >
        0
    )

        ? "+" +
          score.toFixed(
              2
          )

        : score.toFixed(
            2
        );
}


function describeExploreLastMove() {

    const history =
        exploreChess.history({

            verbose:
                true
        });


    const last =
        history[
            history.length -
            1
        ];


    if (!last) {

        return "Exploring from this position";
    }


    return (

        (
            last.color ===
            "w"

                ? "White"

                : "Black"
        )

        +

        " played "

        +

        last.san

        +

        " (your move)"
    );
}


// =====================================================
// QUALITY VISUALS
// =====================================================

function getQualityVisual(
    label
) {

    const visuals = {

        Opening: {

            icon:
                "📖",

            boardClass:
                "board-quality-opening",

            historyClass:
                "history-quality-opening"
        },


        Best: {

            icon:
                "★",

            boardClass:
                "board-quality-best",

            historyClass:
                "history-quality-best"
        },


        Great: {

            icon:
                "!",

            boardClass:
                "board-quality-great",

            historyClass:
                "history-quality-great"
        },


        Good: {

            icon:
                "✓",

            boardClass:
                "board-quality-good",

            historyClass:
                "history-quality-good"
        },


        Inaccuracy: {

            icon:
                "?!",

            boardClass:
                "board-quality-inaccuracy",

            historyClass:
                "history-quality-inaccuracy"
        },


        Mistake: {

            icon:
                "?",

            boardClass:
                "board-quality-mistake",

            historyClass:
                "history-quality-mistake"
        },


        Blunder: {

            icon:
                "??",

            boardClass:
                "board-quality-blunder",

            historyClass:
                "history-quality-blunder"
        },


        Miss: {

            icon:
                "×",

            boardClass:
                "board-quality-miss",

            historyClass:
                "history-quality-miss"
        }
    };


    return (
        visuals[label] ||
        null
    );
}


// =====================================================
// CLEAR BOARD FEEDBACK
// =====================================================

function clearBoardFeedback() {

    boardElement

        .querySelectorAll(
            ".board-quality-badge"
        )

        .forEach(
            function(element) {

                element.remove();
            }
        );


    boardElement

        .querySelectorAll(
            ".best-move-arrow-layer"
        )

        .forEach(
            function(element) {

                element.remove();
            }
        );
}


// =====================================================
// DRAW BOARD FEEDBACK
// =====================================================

function drawCurrentBoardFeedback() {

    clearBoardFeedback();


    // While exploring a sandbox line, currentMoveIndex is frozen
    // at the real position we branched from. Drawing its badge/
    // arrow here would make the LAST REAL move's indicator keep
    // reappearing on every explore redraw, which looks like it's
    // "stuck". Explore mode draws its own badge/arrow separately,
    // once the engine has actually evaluated the sandbox move.

    if (
        isExploring
    ) {

        return;
    }


    drawCurrentMoveQualityOnBoard();


    drawBestMoveArrowOnBoard();
}


// =====================================================
// QUALITY BADGE ON BOARD
// =====================================================

function drawCurrentMoveQualityOnBoard() {

    if (
        currentMoveIndex ===
        0
    ) {

        return;
    }


    const classification =
        moveClassificationCache.get(
            currentMoveIndex
        );


    if (!classification) {

        return;
    }


    const move =
        moves[
            currentMoveIndex -
            1
        ];


    if (!move) {

        return;
    }


    const destinationSquare =
        boardElement.querySelector(

            `[data-square="${move.to}"]`
        );


    if (
        !destinationSquare
    ) {

        return;
    }


    const visual =
        getQualityVisual(
            classification.label
        );


    if (!visual) {

        return;
    }


    const badge =
        document.createElement(
            "div"
        );


    badge.classList.add(

        "board-quality-badge",

        visual.boardClass
    );


    badge.textContent =
        visual.icon;


    badge.title =
        classification.label;


    destinationSquare.appendChild(
        badge
    );
}


// =====================================================
// QUALITY BADGE FOR AN EXPLORE-MODE MOVE
// (same visual as above, but targets any square directly
// instead of reading from the moves[] array)
// =====================================================

function drawBadgeOnSquare(
    squareName,
    classification
) {

    const destinationSquare =
        boardElement.querySelector(

            `[data-square="${squareName}"]`
        );


    if (
        !destinationSquare
    ) {

        return;
    }


    const visual =
        getQualityVisual(
            classification.label
        );


    if (!visual) {

        return;
    }


    const badge =
        document.createElement(
            "div"
        );


    badge.classList.add(

        "board-quality-badge",

        visual.boardClass
    );


    badge.textContent =
        visual.icon;


    badge.title =
        classification.label;


    destinationSquare.appendChild(
        badge
    );
}


// =====================================================
// BEST MOVE ARROW
// =====================================================

function drawBestMoveArrowOnBoard() {

    if (
        currentMoveIndex ===
        0
    ) {

        return;
    }


    const classification =
        moveClassificationCache.get(
            currentMoveIndex
        );


    if (!classification) {

        return;
    }


    // OPENING / BEST / GREAT
    // MA KANWRIWCH ALTERNATIVE ARROW

    if (
        [
            "Opening",
            "Best",
            "Great"
        ].includes(
            classification.label
        )
    ) {

        return;
    }


    const beforeResult =
        engineCache.get(

            currentMoveIndex -
            1
        );


    if (
        !beforeResult
            ?.bestMoveUci
    ) {

        return;
    }


    const uci =
        normalizeUci(

            beforeResult
                .bestMoveUci
        );


    if (
        !uci ||

        uci ===
        "(none)" ||

        uci.length <
        4
    ) {

        return;
    }


    drawCleanArrow(

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


// =====================================================
// CLEAN ARROW
// =====================================================

function drawCleanArrow(
    from,
    to
) {

    const start =
        squareToSvgPoint(
            from
        );


    const end =
        squareToSvgPoint(
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
        distance <
        1
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


    const lineStartX =
        start.x +
        ux *
        startPadding;


    const lineStartY =
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


    const svgNS =
        "http://www.w3.org/2000/svg";


    const svg =
        document.createElementNS(
            svgNS,
            "svg"
        );


    svg.classList.add(
        "best-move-arrow-layer"
    );


    svg.setAttribute(
        "viewBox",
        "0 0 800 800"
    );


    svg.setAttribute(
        "preserveAspectRatio",
        "none"
    );


    const startCircle =
        document.createElementNS(
            svgNS,
            "circle"
        );


    startCircle.classList.add(
        "best-arrow-start"
    );


    startCircle.setAttribute(
        "cx",
        lineStartX
    );


    startCircle.setAttribute(
        "cy",
        lineStartY
    );


    startCircle.setAttribute(
        "r",
        "9"
    );


    svg.appendChild(
        startCircle
    );


    const line =
        document.createElementNS(
            svgNS,
            "line"
        );


    line.classList.add(
        "best-arrow-line"
    );


    line.setAttribute(
        "x1",
        lineStartX
    );


    line.setAttribute(
        "y1",
        lineStartY
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


    const arrowHead =
        document.createElementNS(
            svgNS,
            "polygon"
        );


    arrowHead.classList.add(
        "best-arrow-head"
    );


    arrowHead.setAttribute(

        "points",

        `${tipX},${tipY} ` +

        `${leftX},${leftY} ` +

        `${rightX},${rightY}`
    );


    svg.appendChild(
        arrowHead
    );


    boardElement.appendChild(
        svg
    );
}


// =====================================================
// SQUARE -> SVG POINT
// =====================================================

function squareToSvgPoint(
    square
) {

    const files =
        "abcdefgh";


    if (
        !square ||
        square.length <
        2
    ) {

        return null;
    }


    const fileIndex =
        files.indexOf(
            square[0]
        );


    const rank =
        Number(
            square[1]
        );


    if (
        fileIndex <
        0 ||

        rank <
        1 ||

        rank >
        8
    ) {

        return null;
    }


    if (
        !boardFlipped
    ) {

        return {

            x:
                fileIndex *
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
                fileIndex
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


// =====================================================
// MOVE HISTORY
// =====================================================

function buildMovesList() {

    movesList.innerHTML =
        "";


    totalMoves.textContent =
        moves.length;


    moves.forEach(
        function(
            move,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.classList.add(
                "move-item"
            );


            button.dataset.moveIndex =
                index +
                1;


            const moveNumber =
                Math.floor(
                    index /
                    2
                ) +
                1;


            const isBlack =
                index %
                2 ===
                1;


            button.innerHTML = `

                <span
                    class="move-number"
                >

                    ${moveNumber}${isBlack ? "..." : "."}

                </span>


                <strong
                    class="move-san"
                >

                    ${move.san}

                </strong>


                <span
                    class="history-quality-badge"
                    data-quality-index="${index + 1}"
                ></span>

            `;


            button.addEventListener(

                "click",

                function() {

                    showPosition(
                        index +
                        1
                    );
                }
            );


            movesList.appendChild(
                button
            );
        }
    );
}


// =====================================================
// HISTORY QUALITY
// =====================================================

function updateMoveHistoryQuality(
    index,
    classification
) {

    const badge =
        movesList.querySelector(

            `[data-quality-index="${index}"]`
        );


    if (
        !badge ||
        !classification
    ) {

        return;
    }


    const visual =
        getQualityVisual(
            classification.label
        );


    if (!visual) {

        return;
    }


    badge.className =

        "history-quality-badge visible " +

        visual.historyClass;


    badge.textContent =
        visual.icon;


    badge.title =
        classification.label;
}


// =====================================================
// KEEP MOVE VISIBLE
// =====================================================

function keepMoveVisible(
    activeButton
) {

    if (!activeButton) {

        return;
    }


    const buttonTop =
        activeButton.offsetTop;


    const buttonBottom =
        buttonTop +
        activeButton.offsetHeight;


    const visibleTop =
        movesList.scrollTop;


    const visibleBottom =
        visibleTop +
        movesList.clientHeight;


    if (
        buttonTop <
        visibleTop
    ) {

        movesList.scrollTop =
            Math.max(

                0,

                buttonTop -
                8
            );

    } else if (
        buttonBottom >
        visibleBottom
    ) {

        movesList.scrollTop =

            buttonBottom -

            movesList.clientHeight +

            8;
    }
}


// =====================================================
// MOVE INFORMATION
// =====================================================

function updateMoveInformation() {

    const buttons =
        document.querySelectorAll(
            ".move-item"
        );


    buttons.forEach(
        function(button) {

            button.classList.remove(
                "active"
            );
        }
    );


    if (
        currentMoveIndex ===
        0
    ) {

        moveQuality.textContent =
            "Start Position";


        moveQuality.className =
            "";


        movePlayed.textContent =
            "No move selected";


        evaluation.textContent =
            "...";


        bestMove.textContent =
            "...";


        clearBoardFeedback();


        return;
    }


    const move =
        moves[
            currentMoveIndex -
            1
        ];


    const activeButton =
        buttons[
            currentMoveIndex -
            1
        ];


    if (
        activeButton
    ) {

        activeButton.classList.add(
            "active"
        );


        keepMoveVisible(
            activeButton
        );
    }


    movePlayed.textContent =

        (
            move.color ===
            "w"

                ? "White"

                : "Black"
        )

        +

        " played "

        +

        move.san;


    const classification =
        moveClassificationCache.get(
            currentMoveIndex
        );


    if (
        classification
    ) {

        moveQuality.textContent =
            classification.label;


        moveQuality.className =
            classification.className;


        drawCurrentBoardFeedback();

    } else {

        moveQuality.textContent =
            "Analyzing...";


        moveQuality.className =
            "";


        clearBoardFeedback();
    }


    evaluation.textContent =
        "...";


    bestMove.textContent =
        "...";
}


// =====================================================
// START STOCKFISH
// =====================================================

function startStockfish() {

    engineMessage.textContent =
        "Loading Stockfish...";


    gameReportStatus.textContent =
        "Loading Stockfish...";


    try {

        stockfish =
            new Worker(

                "engine/stockfish-18-lite-single.js"
            );


        stockfish.onmessage =
            handleStockfishMessage;


        stockfish.onerror =
            function(error) {

                console.error(
                    "Stockfish error:",
                    error
                );


                engineMessage.textContent =
                    "Stockfish failed to load.";


                gameReportStatus.textContent =
                    "Stockfish failed.";
            };


        stockfish.postMessage(
            "uci"
        );


    } catch (error) {

        console.error(
            error
        );


        engineMessage.textContent =
            "Stockfish failed to start.";
    }
}


// =====================================================
// STOCKFISH MESSAGE
// =====================================================

function handleStockfishMessage(
    event
) {

    const line =
        String(
            event.data ||
            ""
        );


    if (
        line.includes(
            "uciok"
        )
    ) {

        stockfish.postMessage(
            "isready"
        );


        return;
    }


    if (
        line.includes(
            "readyok"
        )
    ) {

        engineReady =
            true;


        engineMessage.textContent =
            "Stockfish ready.";


        requestCurrentAnalysis();


        queueFullGameAnalysis();


        processEngineQueue();


        return;
    }


    if (
        !engineBusy ||

        engineCurrentIndex ===
        null
    ) {

        return;
    }


    if (
        line.startsWith(
            "info "
        )
    ) {

        readEngineInfo(
            line
        );


        return;
    }


    if (
        line.startsWith(
            "bestmove "
        )
    ) {

        finishEnginePosition(
            line
        );
    }
}


// =====================================================
// READ ENGINE INFO
// =====================================================

function readEngineInfo(
    line
) {

    const scoreMatch =
        line.match(

            /\bscore\s+(cp|mate)\s+(-?\d+)/
        );


    if (
        scoreMatch
    ) {

        if (
            scoreMatch[1] ===
            "cp"
        ) {

            engineScoreCp =
                Number(
                    scoreMatch[2]
                );


            engineMate =
                null;

        } else {

            engineMate =
                Number(
                    scoreMatch[2]
                );


            engineScoreCp =
                null;
        }
    }


    const pvMatch =
        line.match(

            /\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/
        );


    if (
        pvMatch
    ) {

        engineBestMove =
            pvMatch[1];
    }
}


// =====================================================
// ENGINE QUEUE
// =====================================================

function queueAnalysis(
    index,
    priority = false
) {

    if (
        index <
        0 ||

        index >=
        positions.length
    ) {

        return;
    }


    if (
        engineCache.has(
            index
        )
    ) {

        return;
    }


    if (
        engineCurrentIndex ===
        index
    ) {

        return;
    }


    engineQueue =
        engineQueue.filter(
            function(item) {

                return (
                    item !==
                    index
                );
            }
        );


    if (
        priority
    ) {

        engineQueue.unshift(
            index
        );

    } else {

        engineQueue.push(
            index
        );
    }
}


// =====================================================
// FULL GAME ANALYSIS
// =====================================================

function queueFullGameAnalysis() {

    for (
        let i = 0;
        i < positions.length;
        i++
    ) {

        queueAnalysis(
            i
        );
    }


    updateGameReport();
}


// =====================================================
// CURRENT MOVE ANALYSIS
// =====================================================

function requestCurrentAnalysis() {

    if (
        !engineReady
    ) {

        return;
    }


    if (
        currentMoveIndex ===
        0
    ) {

        queueAnalysis(
            0,
            true
        );

    } else {

        queueAnalysis(
            currentMoveIndex,
            true
        );


        queueAnalysis(

            currentMoveIndex -
            1,

            true
        );
    }


    renderCurrentAnalysis();


    processEngineQueue();
}


// =====================================================
// PROCESS ENGINE QUEUE
// =====================================================

function processEngineQueue() {

    if (
        !engineReady ||
        engineBusy
    ) {

        return;
    }


    if (
        pendingExploreFen
    ) {

        tryRunExploreAnalysis();


        return;
    }


    while (
        engineQueue.length >
        0
    ) {

        const index =
            engineQueue.shift();


        if (
            engineCache.has(
                index
            )
        ) {

            continue;
        }


        analyzeEnginePosition(
            index
        );


        return;
    }
}


// =====================================================
// ANALYZE POSITION
// =====================================================

function analyzeEnginePosition(
    index
) {

    engineBusy =
        true;


    engineCurrentIndex =
        index;


    engineScoreCp =
        null;


    engineMate =
        null;


    engineBestMove =
        null;


    stockfish.postMessage(

        "position fen " +

        positions[index].fen
    );


    stockfish.postMessage(

        "go depth " +

        ENGINE_DEPTH
    );
}


// =====================================================
// FINISH POSITION
// =====================================================

function finishEnginePosition(
    line
) {

    const index =
        engineCurrentIndex;


    const bestMoveMatch =
        line.match(

            /^bestmove\s+(\S+)/
        );


    const result = {

        scoreCp:
            engineScoreCp,

        mate:
            engineMate,

        bestMoveUci:

            bestMoveMatch

                ? bestMoveMatch[1]

                : engineBestMove
    };


    // EXPLORE MODE PREVIEW
    // (not a real game move, don't cache it by index)

    if (
        index ===
        "explore"
    ) {

        engineBusy =
            false;


        engineCurrentIndex =
            null;


        renderExploreAnalysis(
            result
        );


        processEngineQueue();


        return;
    }


    engineCache.set(
        index,
        result
    );


    engineBusy =
        false;


    engineCurrentIndex =
        null;


    refreshClassificationsFromCache();


    renderCurrentAnalysis();


    updateGameReport();


    processEngineQueue();
}


// =====================================================
// REFRESH CLASSIFICATIONS
// =====================================================

function refreshClassificationsFromCache() {

    for (
        let i = 1;
        i <= moves.length;
        i++
    ) {

        // OPENING ALWAYS HAS PRIORITY

        if (
            openingByMove.has(
                i
            )
        ) {

            const openingClassification =
                makeOpeningClassification(

                    openingByMove.get(
                        i
                    )
                );


            moveClassificationCache.set(

                i,

                openingClassification
            );


            updateMoveHistoryQuality(

                i,

                openingClassification
            );


            continue;
        }


        const before =
            engineCache.get(
                i -
                1
            );


        const after =
            engineCache.get(
                i
            );


        if (
            !before ||
            !after
        ) {

            continue;
        }


        const classification =
            classifyMove(

                i,

                before,

                after
            );


        moveClassificationCache.set(
            i,
            classification
        );


        updateMoveHistoryQuality(
            i,
            classification
        );
    }
}


// =====================================================
// RENDER CURRENT ANALYSIS
// =====================================================

function renderCurrentAnalysis() {

    if (
        currentMoveIndex ===
        0
    ) {

        const result =
            engineCache.get(
                0
            );


        if (
            !result
        ) {

            engineMessage.textContent =
                "Analyzing start position...";


            return;
        }


        moveQuality.textContent =
            "Start Position";


        moveQuality.className =
            "";


        evaluation.textContent =
            formatEvaluation(
                0,
                result
            );


        bestMove.textContent =
            convertUciToSan(

                positions[0].fen,

                result.bestMoveUci
            );


        engineMessage.textContent =
            "Stockfish analysis ready.";


        return;
    }


    // =================================================
    // OPENING MOVE
    // =================================================

    const openingInfo =
        openingByMove.get(
            currentMoveIndex
        );


    if (
        openingInfo
    ) {

        const classification =
            makeOpeningClassification(
                openingInfo
            );


        moveClassificationCache.set(

            currentMoveIndex,

            classification
        );


        updateMoveHistoryQuality(

            currentMoveIndex,

            classification
        );


        moveQuality.textContent =
            "Opening";


        moveQuality.className =
            "quality-opening";


        bestMove.textContent =
            "Book move";


        const after =
            engineCache.get(
                currentMoveIndex
            );


        evaluation.textContent =

            after

                ? formatEvaluation(

                    currentMoveIndex,

                    after
                )

                : "...";


        engineMessage.textContent =
            classification.message;


        drawCurrentBoardFeedback();


        return;
    }


    // =================================================
    // NORMAL STOCKFISH MOVE
    // =================================================

    const before =
        engineCache.get(

            currentMoveIndex -
            1
        );


    const after =
        engineCache.get(
            currentMoveIndex
        );


    if (
        !before ||
        !after
    ) {

        moveQuality.textContent =
            "Analyzing...";


        engineMessage.textContent =
            "Analyzing move...";


        return;
    }


    const classification =
        classifyMove(

            currentMoveIndex,

            before,

            after
        );


    moveClassificationCache.set(

        currentMoveIndex,

        classification
    );


    updateMoveHistoryQuality(

        currentMoveIndex,

        classification
    );


    moveQuality.textContent =
        classification.label;


    moveQuality.className =
        classification.className;


    evaluation.textContent =
        formatEvaluation(

            currentMoveIndex,

            after
        );


    bestMove.textContent =
        convertUciToSan(

            positions[
                currentMoveIndex -
                1
            ].fen,

            before.bestMoveUci
        );


    engineMessage.textContent =
        classification.message;


    drawCurrentBoardFeedback();
}


// =====================================================
// CLASSIFY MOVE
// =====================================================

function classifyMove(
    index,
    before,
    after
) {

    // OPENING FIRST

    if (
        openingByMove.has(
            index
        )
    ) {

        return makeOpeningClassification(

            openingByMove.get(
                index
            )
        );
    }


    const move =
        moves[
            index -
            1
        ];


    const beforeWhite =
        resultToWhiteCentipawns(

            index -
            1,

            before
        );


    const afterWhite =
        resultToWhiteCentipawns(

            index,

            after
        );


    const beforePlayer =

        move.color ===
        "w"

            ? beforeWhite

            : -beforeWhite;


    const afterPlayer =

        move.color ===
        "w"

            ? afterWhite

            : -afterWhite;


    return classifyMoveQuality(

        move,

        beforePlayer,

        afterPlayer,

        before.bestMoveUci
    );
}


// =====================================================
// SHARED QUALITY THRESHOLDS
// (used by both real game moves and explore-mode moves)
// =====================================================

function classifyMoveQuality(
    move,
    beforePlayer,
    afterPlayer,
    bestMoveUci
) {

    let loss =
        beforePlayer -
        afterPlayer;


    if (
        !Number.isFinite(
            loss
        ) ||

        loss <
        0
    ) {

        loss =
            0;
    }


    const exactBest =

        normalizeUci(

            moveToUci(
                move
            )

        ) ===

        normalizeUci(

            bestMoveUci
        );


    const missedWinningChance =

        beforePlayer >=
        300 &&

        loss >=
        180 &&

        afterPlayer <
        150;


    // BEST

    if (
        exactBest ||
        loss <=
        12
    ) {

        return {

            label:
                "Best",

            className:
                "quality-best",

            lossCp:
                loss,

            message:

                exactBest

                    ? "You played Stockfish's top choice."

                    : "Excellent move."
        };
    }


    // MISS

    if (
        missedWinningChance
    ) {

        return {

            label:
                "Miss",

            className:
                "quality-miss",

            lossCp:
                loss,

            message:
                "A strong winning opportunity was missed."
        };
    }


    // GREAT

    if (
        loss <=
        35
    ) {

        return {

            label:
                "Great",

            className:
                "quality-great",

            lossCp:
                loss,

            message:
                "Very strong move."
        };
    }


    // GOOD

    if (
        loss <=
        90
    ) {

        return {

            label:
                "Good",

            className:
                "quality-good",

            lossCp:
                loss,

            message:
                "Solid move."
        };
    }


    // INACCURACY

    if (
        loss <=
        180
    ) {

        return {

            label:
                "Inaccuracy",

            className:
                "quality-inaccuracy",

            lossCp:
                loss,

            message:
                "The position became slightly worse."
        };
    }


    // MISTAKE

    if (
        loss <=
        350
    ) {

        return {

            label:
                "Mistake",

            className:
                "quality-mistake",

            lossCp:
                loss,

            message:
                "This move lost a significant part of the position."
        };
    }


    // BLUNDER

    return {

        label:
            "Blunder",

        className:
            "quality-blunder",

        lossCp:
            loss,

        message:
            "Major evaluation drop."
    };
}


// =====================================================
// CLASSIFY AN EXPLORE-MODE (SANDBOX) MOVE
// =====================================================

function classifyExploreMove(
    move,
    beforeFen,
    beforeResult,
    afterFen,
    afterResult
) {

    const beforeWhite =
        resultToWhiteCentipawnsFromFen(

            beforeFen,

            beforeResult
        );


    const afterWhite =
        resultToWhiteCentipawnsFromFen(

            afterFen,

            afterResult
        );


    const beforePlayer =

        move.color ===
        "w"

            ? beforeWhite

            : -beforeWhite;


    const afterPlayer =

        move.color ===
        "w"

            ? afterWhite

            : -afterWhite;


    return classifyMoveQuality(

        move,

        beforePlayer,

        afterPlayer,

        beforeResult.bestMoveUci
    );
}


// =====================================================
// GAME REPORT
// =====================================================

function updateGameReport() {

    if (
        !positions.length
    ) {

        return;
    }


    const analyzed =
        engineCache.size;


    const total =
        positions.length;


    const progress =
        Math.min(

            100,

            analyzed /
            total *
            100
        );


    reportProgressBar.style.width =
        progress +
        "%";


    if (
        analyzed <
        total
    ) {

        gameReportStatus.textContent =

            `Analyzing ${analyzed}/${total} positions`;

    } else {

        gameReportStatus.textContent =
            "Game report ready";
    }


    const counts = {

        Opening:
            0,

        Best:
            0,

        Great:
            0,

        Good:
            0,

        Inaccuracy:
            0,

        Mistake:
            0,

        Blunder:
            0,

        Miss:
            0
    };


    let scoredPlayerMoves =
        0;


    let totalLoss =
        0;


    for (
        let i = 1;
        i <= moves.length;
        i++
    ) {

        const move =
            moves[
                i -
                1
            ];


        if (
            move.color !==
            playerColor
        ) {

            continue;
        }


        const classification =
            moveClassificationCache.get(
                i
            );


        if (
            !classification
        ) {

            continue;
        }


        if (
            counts[
                classification.label
            ] !==
            undefined
        ) {

            counts[
                classification.label
            ]++;
        }


        // OPENING MOVES
        // MA KAN7SBOHOMCH
        // F AVG LOSS

        if (
            classification.label ===
            "Opening"
        ) {

            continue;
        }


        scoredPlayerMoves++;


        totalLoss +=
            classification.lossCp;
    }


    reportOpening.textContent =
        counts.Opening;


    reportBest.textContent =
        counts.Best;


    reportGreat.textContent =
        counts.Great;


    reportGood.textContent =
        counts.Good;


    reportInaccuracy.textContent =
        counts.Inaccuracy;


    reportMistake.textContent =
        counts.Mistake;


    reportBlunder.textContent =
        counts.Blunder;


    reportMiss.textContent =
        counts.Miss;


    if (
        scoredPlayerMoves ===
        0
    ) {

        reportPerformance.textContent =
            "-";


        reportAccuracy.textContent =
            "-";


        reportAverageLoss.textContent =
            "-";


        return;
    }


    const averageLoss =
        totalLoss /
        scoredPlayerMoves;


    const accuracy =
        Math.max(

            0,

            Math.min(

                100,

                100 *

                Math.exp(

                    -averageLoss /
                    220
                )
            )
        );


    reportAverageLoss.textContent =

        (
            averageLoss /
            100
        ).toFixed(
            2
        );


    reportAccuracy.textContent =

        accuracy.toFixed(
            1
        )

        +

        "%";


    if (
        playerGameRating ===
        null ||

        playerGameRating ===
        undefined
    ) {

        reportPerformance.textContent =
            "-";


        return;
    }


    let resultAdjustment =
        0;


    if (
        playerGameResult ===
        "Win"
    ) {

        resultAdjustment =
            80;

    } else if (
        playerGameResult ===
        "Loss"
    ) {

        resultAdjustment =
            -80;
    }


    const performance =
        Math.round(

            playerGameRating +

            (
                accuracy -
                72
            ) *

            9 +

            resultAdjustment
        );


    reportPerformance.textContent =
        Math.max(

            100,

            Math.min(

                3200,

                performance
            )
        );
}


// =====================================================
// MOVE -> UCI
// =====================================================

function moveToUci(
    move
) {

    let uci =
        move.from +
        move.to;


    if (
        move.promotion
    ) {

        uci +=
            move.promotion;
    }


    return uci;
}


// =====================================================
// NORMALIZE UCI
// =====================================================

function normalizeUci(
    uci
) {

    return String(
        uci ||
        ""
    )

        .trim()

        .toLowerCase();
}


// =====================================================
// RESULT -> WHITE CENTIPAWNS
// =====================================================

function resultToWhiteCentipawns(
    index,
    result
) {

    const sideToMove =

        positions[index]
            .fen

            .split(
                " "
            )[1];


    const direction =

        sideToMove ===
        "w"

            ? 1

            : -1;


    if (
        result.mate !== null &&

        result.mate !== undefined
    ) {

        const mateForWhite =

            result.mate *

            direction;


        if (
            mateForWhite >
            0
        ) {

            return (

                100000 -

                Math.min(

                    Math.abs(
                        mateForWhite
                    ),

                    100
                ) *

                100
            );
        }


        if (
            mateForWhite <
            0
        ) {

            return (

                -100000 +

                Math.min(

                    Math.abs(
                        mateForWhite
                    ),

                    100
                ) *

                100
            );
        }


        return 0;
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


// =====================================================
// RESULT -> WHITE CENTIPAWNS (BY FEN)
// (same as above, but works for explore-mode positions
// that don't live in the positions[] array)
// =====================================================

function resultToWhiteCentipawnsFromFen(
    fen,
    result
) {

    const sideToMove =

        String(
            fen ||
            ""
        )

            .split(
                " "
            )[1];


    const direction =

        sideToMove ===
        "w"

            ? 1

            : -1;


    if (
        result.mate !== null &&

        result.mate !== undefined
    ) {

        const mateForWhite =

            result.mate *

            direction;


        if (
            mateForWhite >
            0
        ) {

            return (

                100000 -

                Math.min(

                    Math.abs(
                        mateForWhite
                    ),

                    100
                ) *

                100
            );
        }


        if (
            mateForWhite <
            0
        ) {

            return (

                -100000 +

                Math.min(

                    Math.abs(
                        mateForWhite
                    ),

                    100
                ) *

                100
            );
        }


        return 0;
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


// =====================================================
// FORMAT EVALUATION
// =====================================================

function formatEvaluation(
    index,
    result
) {

    const sideToMove =

        positions[index]
            .fen

            .split(
                " "
            )[1];


    const direction =

        sideToMove ===
        "w"

            ? 1

            : -1;


    if (
        result.mate !== null &&

        result.mate !== undefined
    ) {

        const mate =

            result.mate *

            direction;


        return (
            mate >
            0
        )

            ? "+M" +
              Math.abs(
                  mate
              )

            : "-M" +
              Math.abs(
                  mate
              );
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


    return (
        score >
        0
    )

        ? "+" +
          score.toFixed(
              2
          )

        : score.toFixed(
            2
        );
}


// =====================================================
// UCI -> SAN
// =====================================================

function convertUciToSan(
    fen,
    uci
) {

    if (
        !uci ||

        uci ===
        "(none)" ||

        uci.length <
        4
    ) {

        return "-";
    }


    try {

        const chess =
            new Chess(
                fen
            );


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
            uci.length >=
            5
        ) {

            moveData.promotion =
                uci[4];
        }


        const move =
            chess.move(
                moveData
            );


        if (
            move
        ) {

            return move.san;
        }


    } catch (error) {

        console.error(
            "SAN conversion error:",
            error
        );
    }


    return uci;
}


// =====================================================
// NAVIGATION
// =====================================================

function updateNavigation() {

    moveCounter.textContent =

        `Move ${currentMoveIndex} / ${moves.length}`;


    firstMoveBtn.disabled =
        currentMoveIndex ===
        0;


    previousMoveBtn.disabled =
        currentMoveIndex ===
        0;


    nextMoveBtn.disabled =
        currentMoveIndex ===
        moves.length;


    lastMoveBtn.disabled =
        currentMoveIndex ===
        moves.length;
}


// =====================================================
// BUTTONS
// =====================================================

firstMoveBtn.addEventListener(

    "click",

    function() {

        showPosition(
            0
        );
    }
);


previousMoveBtn.addEventListener(

    "click",

    function() {

        showPosition(

            currentMoveIndex -
            1
        );
    }
);


nextMoveBtn.addEventListener(

    "click",

    function() {

        showPosition(

            currentMoveIndex +
            1
        );
    }
);


lastMoveBtn.addEventListener(

    "click",

    function() {

        showPosition(
            moves.length
        );
    }
);


// =====================================================
// KEYBOARD
// =====================================================

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.key ===
            "ArrowLeft"
        ) {

            showPosition(

                currentMoveIndex -
                1
            );
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            showPosition(

                currentMoveIndex +
                1
            );
        }
    }
);


// =====================================================
// CLOSE ENGINE
// =====================================================

window.addEventListener(

    "beforeunload",

    function() {

        if (
            stockfish
        ) {

            stockfish.terminate();
        }
    }
);