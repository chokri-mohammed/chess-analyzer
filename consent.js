// ==========================================
// CHESSMOVELAB COOKIE / ANALYTICS CONSENT
// ==========================================

const CONSENT_KEY = "chessmovelab_cookie_consent";
const GA_ID = "G-0X8LCSW310";


// ==========================================
// LOAD GOOGLE ANALYTICS
// ==========================================

function loadGoogleAnalytics() {

    if (window.chessMoveLabAnalyticsLoaded) {
        return;
    }

    window.chessMoveLabAnalyticsLoaded = true;

    const script = document.createElement("script");

    script.async = true;
    script.src =
        "https://www.googletagmanager.com/gtag/js?id=" +
        GA_ID;

    document.head.appendChild(script);


    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
        window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());

    window.gtag(
        "config",
        GA_ID,
        {
            anonymize_ip: true
        }
    );
}


// ==========================================
// SAVE CONSENT
// ==========================================

function saveConsent(value) {

    localStorage.setItem(
        CONSENT_KEY,
        value
    );
}


// ==========================================
// REMOVE BANNER
// ==========================================

function removeConsentBanner() {

    const banner =
        document.querySelector(
            "#cookieConsentBanner"
        );

    if (banner) {
        banner.remove();
    }
}


// ==========================================
// ACCEPT
// ==========================================

function acceptAnalytics() {

    saveConsent("accepted");

    removeConsentBanner();

    loadGoogleAnalytics();
}


// ==========================================
// REJECT
// ==========================================

function rejectAnalytics() {

    saveConsent("rejected");

    removeConsentBanner();
}


// ==========================================
// CREATE BANNER
// ==========================================

function showConsentBanner() {

    if (
        document.querySelector(
            "#cookieConsentBanner"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.textContent = `
        .cml-cookie-banner {
            position: fixed;
            left: 20px;
            right: 20px;
            bottom: 20px;
            z-index: 999999;

            width: min(760px, calc(100% - 40px));
            margin: auto;

            padding: 22px;

            border-radius: 18px;

            border:
                1px solid
                rgba(255, 255, 255, 0.12);

            background:
                rgba(13, 20, 36, 0.97);

            box-shadow:
                0 20px 60px
                rgba(0, 0, 0, 0.45);

            backdrop-filter: blur(16px);

            color: #ffffff;

            font-family:
                Arial,
                Helvetica,
                sans-serif;
        }


        .cml-cookie-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 25px;
        }


        .cml-cookie-text {
            flex: 1;
        }


        .cml-cookie-title {
            margin: 0 0 8px;

            font-size: 18px;
            font-weight: 800;
        }


        .cml-cookie-description {
            margin: 0;

            color: #b9c3d5;

            font-size: 14px;
            line-height: 1.6;
        }


        .cml-cookie-description a {
            color: #9daaff;
            text-decoration: none;
        }


        .cml-cookie-description a:hover {
            text-decoration: underline;
        }


        .cml-cookie-actions {
            display: flex;
            gap: 10px;
            flex-shrink: 0;
        }


        .cml-cookie-button {
            border: 0;

            padding:
                11px
                17px;

            border-radius: 10px;

            cursor: pointer;

            font-size: 14px;
            font-weight: 700;

            transition:
                transform 0.15s ease,
                opacity 0.15s ease;
        }


        .cml-cookie-button:hover {
            transform:
                translateY(-1px);
        }


        .cml-cookie-reject {
            color: #ffffff;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.08
                );

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.12
                );
        }


        .cml-cookie-accept {
            color: #ffffff;

            background:
                linear-gradient(
                    135deg,
                    #6674ff,
                    #945cff
                );
        }


        @media (
            max-width: 650px
        ) {

            .cml-cookie-banner {
                left: 12px;
                right: 12px;
                bottom: 12px;

                width:
                    calc(
                        100% - 24px
                    );

                padding: 18px;
            }


            .cml-cookie-content {
                flex-direction:
                    column;

                align-items:
                    stretch;
            }


            .cml-cookie-actions {
                width: 100%;
            }


            .cml-cookie-button {
                flex: 1;
            }
        }
    `;

    document.head.appendChild(style);


    const banner =
        document.createElement("div");

    banner.id =
        "cookieConsentBanner";

    banner.className =
        "cml-cookie-banner";


    banner.innerHTML = `
        <div class="cml-cookie-content">

            <div class="cml-cookie-text">

                <p class="cml-cookie-title">
                    Analytics & Privacy
                </p>

                <p class="cml-cookie-description">
                    ChessMoveLab uses Google Analytics
                    to understand how visitors use the
                    website and improve the experience.
                    You can accept or reject analytics.
                    <a href="privacy.html">
                        Privacy Policy
                    </a>
                </p>

            </div>


            <div class="cml-cookie-actions">

                <button
                    id="rejectAnalyticsBtn"
                    class="
                        cml-cookie-button
                        cml-cookie-reject
                    "
                    type="button"
                >
                    Reject
                </button>

                <button
                    id="acceptAnalyticsBtn"
                    class="
                        cml-cookie-button
                        cml-cookie-accept
                    "
                    type="button"
                >
                    Accept
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        banner
    );


    document
        .querySelector(
            "#acceptAnalyticsBtn"
        )
        .addEventListener(
            "click",
            acceptAnalytics
        );


    document
        .querySelector(
            "#rejectAnalyticsBtn"
        )
        .addEventListener(
            "click",
            rejectAnalytics
        );
}


// ==========================================
// COOKIE SETTINGS
// ==========================================

window.openCookieSettings =
    function () {

        localStorage.removeItem(
            CONSENT_KEY
        );

        removeConsentBanner();

        showConsentBanner();
    };


// ==========================================
// INITIALIZE
// ==========================================

function initializeConsent() {

    const consent =
        localStorage.getItem(
            CONSENT_KEY
        );


    if (
        consent ===
        "accepted"
    ) {

        loadGoogleAnalytics();

        return;
    }


    if (
        consent ===
        "rejected"
    ) {

        return;
    }


    showConsentBanner();
}


// ==========================================
// START
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeConsent
    );

} else {

    initializeConsent();
}