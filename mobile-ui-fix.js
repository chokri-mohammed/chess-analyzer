// =====================================================
// CHESSMOVELAB
// MOBILE UI FIXES
//
// Fixes Try Mode banner on small screens.
// Does not modify chess logic.
// =====================================================


(function addChessMoveLabMobileFixes() {

    if (
        document.querySelector(
            "#cmlMobileUiFixStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "cmlMobileUiFixStyles";


    style.textContent = `

        /* ==========================================
           TRY MODE BANNER
           ========================================== */

        @media (max-width: 560px) {

            .explore-banner {

                display: flex;

                flex-direction: column;

                align-items: stretch;

                gap: 10px;

                padding: 12px;

                margin-bottom: 10px;
            }


            .explore-banner > span {

                display: block;

                width: 100%;

                text-align: center;

                line-height: 1.45;

                font-size: 11px;
            }


            .explore-banner-buttons {

                display: grid;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );

                width: 100%;

                gap: 8px;
            }


            .explore-banner button {

                width: 100%;

                min-width: 0;

                padding: 9px 8px;

                white-space: nowrap;

                font-size: 10px;
            }

        }


        /* ==========================================
           VERY SMALL PHONES
           ========================================== */

        @media (max-width: 350px) {

            .explore-banner-buttons {

                grid-template-columns:
                    1fr;
            }


            .explore-banner button {

                font-size: 11px;
            }

        }

    `;


    document.head.appendChild(
        style
    );

})();