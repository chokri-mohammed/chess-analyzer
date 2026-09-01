// =====================================================
// CHESSMOVELAB - ANALYSIS FIXES
// 1) Best = Stockfish top move ONLY
// 2) Live White / Black evaluation bar
// =====================================================


// =====================================================
// FIX MOVE CLASSIFICATION
// =====================================================

classifyMoveQuality = function (
    move,
    beforePlayer,
    afterPlayer,
    bestMoveUci
) {

    let loss =
        beforePlayer -
        afterPlayer;


    if (
        !Number.isFinite(loss) ||
        loss < 0
    ) {

        loss = 0;
    }


    const playedUci =
        normalizeUci(
            moveToUci(move)
        );


    const normalizedBestUci =
        normalizeUci(
            bestMoveUci
        );


    const hasValidBestMove =
        /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(
            normalizedBestUci
        );


    const exactBest =
        hasValidBestMove &&
        playedUci ===
        normalizedBestUci;


    const missedWinningChance =
        beforePlayer >= 300 &&
        loss >= 180 &&
        afterPlayer < 150;


    // =========================
    // BEST
    // =========================
    // Best ONLY when the played
    // move is Stockfish's exact
    // top move.

    if (exactBest) {

        return {

            label:
                "Best",

            className:
                "quality-best",

            lossCp:
                loss,

            message:
                "You played Stockfish's top choice."
        };
    }


    // =========================
    // MISS
    // =========================

    if (missedWinningChance) {

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


    // =========================
    // GREAT
    // =========================

    if (loss <= 35) {

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


    // =========================
    // GOOD
    // =========================

    if (loss <= 90) {

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


    // =========================
    // INACCURACY
    // =========================

    if (loss <= 180) {

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


    // =========================
    // MISTAKE
    // =========================

    if (loss <= 350) {

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


    // =========================
    // BLUNDER
    // =========================

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
};


// =====================================================
// EVALUATION BAR STYLES
// =====================================================

(function injectEvaluationBarStyles() {

    if (
        document.querySelector(
            "#cmlEvaluationBarStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "cmlEvaluationBarStyles";


    style.textContent = `

        .board-evaluation-shell {
            width: 100%;

            display: flex;
            align-items: stretch;
            justify-content: center;

            gap: 8px;

            margin: 0 auto;
        }


        .board-evaluation-shell
        .board-frame {
            margin: 0;
        }


        .evaluation-bar {
            position: relative;

            width: 28px;
            min-width: 28px;

            overflow: hidden;

            border-radius: 9px;

            background: #171717;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.16
                );

            box-shadow:
                0 10px 30px
                rgba(
                    0,
                    0,
                    0,
                    0.28
                );
        }


        .evaluation-white-fill {
            position: absolute;

            left: 0;
            right: 0;
            bottom: 0;

            height: 50%;

            background: #f2f2f2;

            transition:
                height
                0.28s
                ease;
        }


        .evaluation-bar.flipped
        .evaluation-white-fill {
            top: 0;
            bottom: auto;
        }


        .evaluation-bar-label {
            position: absolute;

            left: 50%;

            transform:
                translateX(-50%);

            z-index: 4;

            font-family:
                Arial,
                sans-serif;

            font-size: 10px;
            font-weight: 900;

            line-height: 1;

            pointer-events: none;

            text-shadow:
                0 1px 2px
                rgba(
                    0,
                    0,
                    0,
                    0.35
                );
        }


        .evaluation-bar-label.top {
            top: 8px;
        }


        .evaluation-bar-label.bottom {
            bottom: 8px;
        }


        .evaluation-bar:not(.flipped)
        .evaluation-bar-label.top {
            color: #ffffff;
        }


        .evaluation-bar:not(.flipped)
        .evaluation-bar-label.bottom {
            color: #111111;
            text-shadow: none;
        }


        .evaluation-bar.flipped
        .evaluation-bar-label.top {
            color: #111111;
            text-shadow: none;
        }


        .evaluation-bar.flipped
        .evaluation-bar-label.bottom {
            color: #ffffff;
        }


        .evaluation-bar-value {
            position: absolute;

            left: 50%;
            top: 50%;

            transform:
                translate(
                    -50%,
                    -50%
                )
                rotate(-90deg);

            z-index: 5;

            min-width: 44px;

            padding: 4px 6px;

            border-radius: 999px;

            background:
                rgba(
                    8,
                    13,
                    24,
                    0.84
                );

            color: #ffffff;

            text-align: center;

            font-family:
                Arial,
                sans-serif;

            font-size: 10px;
            font-weight: 900;

            line-height: 1;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.18
                );

            pointer-events: none;
        }


        @media (max-width: 560px) {

            .board-evaluation-shell {
                gap: 5px;
            }


            .evaluation-bar {
                width: 22px;
                min-width: 22px;

                border-radius: 7px;
            }


            .evaluation-bar-label {
                font-size: 8px;
            }


            .evaluation-bar-label.top {
                top: 6px;
            }


            .evaluation-bar-label.bottom {
                bottom: 6px;
            }


            .evaluation-bar-value {
                min-width: 38px;

                padding: 3px 5px;

                font-size: 8px;
            }
        }

    `;


    document.head.appendChild(
        style
    );
})();


// =====================================================
// CREATE EVALUATION BAR
// =====================================================

function createCmlEvaluationBar() {

    const boardFrame =
        document.querySelector(
            ".board-frame"
        );


    if (!boardFrame) {

        return;
    }


    if (
        document.querySelector(
            "#evaluationBar"
        )
    ) {

        return;
    }


    const shell =
        document.createElement(
            "div"
        );


    shell.className =
        "board-evaluation-shell";


    boardFrame.parentNode.insertBefore(
        shell,
        boardFrame
    );


    const bar =
        document.createElement(
            "div"
        );


    bar.id =
        "evaluationBar";


    bar.className =
        "evaluation-bar";


    bar.setAttribute(
        "role",
        "img"
    );


    bar.setAttribute(
        "aria-label",
        "Position evaluation is loading"
    );


    bar.innerHTML = `

        <div
            id="evaluationWhiteFill"
            class="evaluation-white-fill"
        ></div>

        <span
            id="evaluationTopLabel"
            class="evaluation-bar-label top"
        >
            B
        </span>

        <span
            id="evaluationBottomLabel"
            class="evaluation-bar-label bottom"
        >
            W
        </span>

        <span
            id="evaluationBarValue"
            class="evaluation-bar-value"
        >
            ...
        </span>

    `;


    shell.appendChild(
        bar
    );


    shell.appendChild(
        boardFrame
    );


    updateCmlEvaluationBarOrientation();

    setCmlEvaluationBarLoading();
}


// =====================================================
// BAR ORIENTATION
// =====================================================

function updateCmlEvaluationBarOrientation() {

    const bar =
        document.querySelector(
            "#evaluationBar"
        );


    const topLabel =
        document.querySelector(
            "#evaluationTopLabel"
        );


    const bottomLabel =
        document.querySelector(
            "#evaluationBottomLabel"
        );


    if (
        !bar ||
        !topLabel ||
        !bottomLabel
    ) {

        return;
    }


    bar.classList.toggle(
        "flipped",
        boardFlipped
    );


    topLabel.textContent =
        boardFlipped
            ? "W"
            : "B";


    bottomLabel.textContent =
        boardFlipped
            ? "B"
            : "W";
}


// =====================================================
// BAR LOADING
// =====================================================

function setCmlEvaluationBarLoading() {

    const fill =
        document.querySelector(
            "#evaluationWhiteFill"
        );


    const value =
        document.querySelector(
            "#evaluationBarValue"
        );


    const bar =
        document.querySelector(
            "#evaluationBar"
        );


    if (fill) {

        fill.style.height =
            "50%";
    }


    if (value) {

        value.textContent =
            "...";
    }


    if (bar) {

        bar.setAttribute(
            "aria-label",
            "Position evaluation is loading"
        );


        bar.title =
            "Analyzing position...";
    }
}


// =====================================================
// CENTIPAWNS -> BAR PERCENTAGE
// =====================================================

function getCmlWhiteShare(
    whiteCp,
    isMate
) {

    if (
        !Number.isFinite(
            whiteCp
        )
    ) {

        return 50;
    }


    if (isMate) {

        if (
            whiteCp >
            0
        ) {

            return 100;
        }


        if (
            whiteCp <
            0
        ) {

            return 0;
        }


        return 50;
    }


    const share =
        50 +
        49 *
        Math.tanh(
            whiteCp /
            500
        );


    return Math.max(

        2,

        Math.min(
            98,
            share
        )
    );
}


// =====================================================
// DRAW BAR
// =====================================================

function updateCmlEvaluationBarVisual(
    whiteCp,
    displayValue,
    isMate
) {

    const fill =
        document.querySelector(
            "#evaluationWhiteFill"
        );


    const value =
        document.querySelector(
            "#evaluationBarValue"
        );


    const bar =
        document.querySelector(
            "#evaluationBar"
        );


    if (
        !fill ||
        !value ||
        !bar
    ) {

        return;
    }


    const whiteShare =
        getCmlWhiteShare(
            whiteCp,
            isMate
        );


    fill.style.height =
        whiteShare +
        "%";


    value.textContent =
        displayValue ||
        "0.00";


    let advantage =
        "Position is approximately equal";


    if (
        whiteCp >=
        35
    ) {

        advantage =
            "White has the advantage";

    } else if (
        whiteCp <=
        -35
    ) {

        advantage =
            "Black has the advantage";
    }


    bar.setAttribute(

        "aria-label",

        advantage +

        ". Evaluation " +

        (
            displayValue ||
            "0.00"
        )
    );


    bar.title =
        advantage;
}


// =====================================================
// REAL GAME -> BAR
// =====================================================

function refreshCmlEvaluationBar() {

    if (isExploring) {

        return;
    }


    updateCmlEvaluationBarOrientation();


    const result =
        engineCache.get(
            currentMoveIndex
        );


    if (!result) {

        setCmlEvaluationBarLoading();

        return;
    }


    const whiteCp =
        resultToWhiteCentipawns(

            currentMoveIndex,

            result
        );


    updateCmlEvaluationBarVisual(

        whiteCp,

        formatEvaluation(

            currentMoveIndex,

            result
        ),

        result.mate !== null &&
        result.mate !== undefined
    );
}


// =====================================================
// TRY / EXPLORE MODE -> BAR
// =====================================================

function refreshCmlExploreEvaluationBar(
    result
) {

    if (
        !exploreChess ||
        !result
    ) {

        return;
    }


    updateCmlEvaluationBarOrientation();


    const whiteCp =
        resultToWhiteCentipawnsFromFen(

            exploreChess.fen(),

            result
        );


    updateCmlEvaluationBarVisual(

        whiteCp,

        formatExploreEvaluation(
            result
        ),

        result.mate !== null &&
        result.mate !== undefined
    );
}


// =====================================================
// HOOK NORMAL ANALYSIS
// =====================================================

const cmlOriginalRenderCurrentAnalysis =
    renderCurrentAnalysis;


renderCurrentAnalysis =
    function () {

        cmlOriginalRenderCurrentAnalysis();

        refreshCmlEvaluationBar();
    };


// =====================================================
// HOOK MOVE NAVIGATION
// =====================================================

const cmlOriginalShowPosition =
    showPosition;


showPosition =
    function (index) {

        const result =
            cmlOriginalShowPosition(
                index
            );


        refreshCmlEvaluationBar();


        return result;
    };


// =====================================================
// HOOK TRY / EXPLORE ANALYSIS
// =====================================================

const cmlOriginalRenderExploreAnalysis =
    renderExploreAnalysis;


renderExploreAnalysis =
    function (result) {

        const output =
            cmlOriginalRenderExploreAnalysis(
                result
            );


        refreshCmlExploreEvaluationBar(
            result
        );


        return output;
    };


const cmlOriginalRequestExploreAnalysis =
    requestExploreAnalysis;


requestExploreAnalysis =
    function () {

        setCmlEvaluationBarLoading();


        return cmlOriginalRequestExploreAnalysis();
    };


// =====================================================
// START BAR
// =====================================================

createCmlEvaluationBar();

refreshCmlEvaluationBar();


// =====================================================
// REBUILD CLASSIFICATIONS
// =====================================================

moveClassificationCache.clear();


if (openingBookReady) {

    applyOpeningClassifications();
}


refreshClassificationsFromCache();

renderCurrentAnalysis();

updateGameReport();