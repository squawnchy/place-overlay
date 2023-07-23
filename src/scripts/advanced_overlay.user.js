// ==UserScript==
// @name         r/place 2023 Canada Overlay with German tiles
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Script that adds a button to toggle an hardcoded image shown in the 2023's r/place canvas
// @author       max-was-here and placeDE Devs
// @match        https://garlic-bread.reddit.com/embed*
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png
// @updateURL    https://github.com/PlaceDE-Official/place-overlay/raw/main/src/scripts/advanced-overlay.user.js
// @downloadURL  https://github.com/PlaceDE-Official/place-overlay/raw/main/src/scripts/advanced-overlay.user.js
// @grant        none
// ==/UserScript==

/**
 * This code is wrapped in an anonymous function (also known as a "self-invoking" or "immediately-invoked function expression").
 * This structure isolates the code from the global context, preventing variables and functions from leaking into the global namespace,
 * which could potentially conflict with other scripts on the page.
 *
 * "use strict"; enables strict mode in JavaScript, which makes the code parsing more rigorous.
 * This helps avoid some common errors, like preventing variables from being declared without 'var', 'let', or 'const'.
 */
(function () {
  "use strict";

  const CANVAS_MAIN_CONTAINER_SELECTOR = "garlic-bread-embed";
  const CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR = "garlic-bread-canvas";
  const STORAGE_KEY = "place-germany-2023-ostate";
  const SWITCHER_BUTTON_POSITION = { bottom: "25px", right: "25px" };

  // [overlayURL, overlayName]
  const OVERLAYS = Object.freeze([
    ["https://place.army/overlay_target.png", "KLEINE PIXEL"],
    ["https://place.army/default_target.png", "GROßE PIXEL"],
    [null, "OVERLAY AUS"],
  ]);

  /**
   * Applies the given styles to the given element.
   *
   * @param {HTMLElement} element The element to apply the styles to
   * @param {Object} styles The styles to apply
   * @returns {HTMLElement} The element with the applied styles
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   * @example
   * const element = document.createElement("div");
   * applyStyles(element, { width: "100px", height: "100px" });
   *
   * const element2 = applyStyles(document.createElement("div"), { width: "100px", height: "100px" });
   */
  function applyStyles(element, styles) {
    /**
     * Copies all enumerable own properties from one or more source objects to a target object.
     *
     * @see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     */
    Object.assign(element.style, styles);
    return element;
  }

  /**
   * Gets the state from localStorage.
   *
   * @returns {Object} The state object
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   */
  function getStateFromStorage() {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (!storedState) return { overlayIdx: 0, opacity: 50 };
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error("Error parsing state from localStorage", error);
      return { overlayIdx: 0, opacity: 50 };
    }
  }

  /**
   * Stores the state to localStorage.
   *
   * @param {Object} state The state object
   * @returns {void}
   */
  function storeStateToStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error storing state to localStorage", error);
    }
  }

  /**
   * Creates the canvas image that is shown on top of the canvas.
   *
   * @param {HTMLElement} container The container that holds the canvas
   * @param {Object} state The state object
   * @returns {HTMLImageElement} The canvas cover image
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
   */
  function createOverlayImage(state) {
    const CANVAS_STYLE = {
      pointerEvents: "none",
      imageRendering: "pixelated",
      top: "0px",
      left: "0px",
      zIndex: "100",
      position: "absolute",
    };

    const canvasCoverImage = applyStyles(
      document.createElement("img"),
      CANVAS_STYLE
    );
    canvasCoverImage.onload = () => {
      canvasCoverImage.style.opacity = state.opacity / 100;
    };
    return canvasCoverImage;
  }

  /**
   * Creates the switcher button that toggles the overlay.
   *
   * @param {Object} state The state object
   * @param {Function} changeOverlay The function to change the overlay
   * @returns {HTMLButtonElement} The switcher button
   */
  function createSwitcherButton(state, changeOverlay) {
    const SWITCHER_BUTTON_STYLE = {
      ...SWITCHER_BUTTON_POSITION,
      width: "100px",
      height: "85px",
      backgroundColor: "#fff",
      color: "black",
      border: "var(--pixel-border)",
      boxShadow: "var(--pixel-box-shadow)",
      fontFamily: "var(--garlic-bread-font-pixel)",
      backgroundImage: 'url(https://static.miraheze.org/greatcharacterswiki/thumb/d/df/Png-transparent-fluttershy-pony-rarity-rainbow-dash-applejack-my-little-pony-mammal-vertebrate-equestria.png/290px-Png-transparent-fluttershy-pony-rarity-rainbow-dash-applejack-my-little-pony-mammal-vertebrate-equestria.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      cursor: "pointer",
      outline: "none",
    };

    const button = applyStyles(
      document.createElement("button"),
      SWITCHER_BUTTON_STYLE
    );
    button.onclick = () => {
      state.overlayIdx = (state.overlayIdx + 1) % OVERLAYS.length;
      changeOverlay();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      button.textContent = OVERLAYS[state.overlayIdx][1];
    };
    button.textContent = OVERLAYS[state.overlayIdx][1];
    return button;
  }

  /**
   * Creates the opacity slider that changes the opacity of the overlay.
   *
   * @param {Object} state The state object
   * @param {Function} changeOverlay The function to change the overlay
   * @returns {HTMLInputElement} The opacity slider
   */
  function createOpacitySlider(state, changeOverlay) {
    const OPACITY_SLIDER_STYLE = {
      webkitAppearance: "none",
      appearance: "none",
      height: "15px",
      width: "90px",
      borderRadius: "15px",
      backgroundImage:
        "linear-gradient(to bottom, red, red 14%, orange 14%, orange 28%, yellow 28%, yellow 42%, green 42%, green 57%, blue 57%, blue 71%, indigo 71%, indigo 85%, violet 85%)",
      outline: "none",
      opacity: "0.7",
      transition: "opacity .2s",
      cursor: "pointer",
    };

    const opacitySlider = applyStyles(
      document.createElement("input"),
      OPACITY_SLIDER_STYLE
    );
    opacitySlider.type = "range";
    opacitySlider.min = 0;
    opacitySlider.max = 100;
    opacitySlider.value = state.opacity;
    opacitySlider.oninput = () => {
      state.opacity = opacitySlider.value;
      changeOverlay();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    return opacitySlider;
  }

  /**
   * Main function that runs the script. It is called when the page is loaded. It gets the state
   * from localStorage, creates the canvas cover image, the switcher button and the opacity
   * slider and appends them to the page.
   *
   * @returns {void}
   */
  function run() {
    // Get state from localStorage or create a new one
    const state = getStateFromStorage();

    //---------------------------------------------------------------------------------------------
    // Setup canvas cover image
    //---------------------------------------------------------------------------------------------
    const canvasContainer = document
      .querySelector(CANVAS_MAIN_CONTAINER_SELECTOR)
      .shadowRoot.querySelector(".layout")
      .querySelector(CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR)
      .shadowRoot.querySelector(".container");
    const canvas = canvasContainer.querySelector("canvas");
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const overlayImage = createOverlayImage(state);
    // Adjust the overlay image to the canvas size
    overlayImage.style.width = `${canvas.width}px`;
    overlayImage.style.height = `${canvas.height}px`;

    // Observer that observes the canvas size and adjusts the overlay image accordingly
    const canvasObserver = new MutationObserver(() => {
      overlayImage.style.width = `${canvas.width}px`;
      overlayImage.style.height = `${canvas.height}px`;
    });
    canvasObserver.observe(canvas, {
      attributes: true,
      attributeFilter: ["width", "height"],
    });
    canvasContainer.appendChild(overlayImage);

    /**
     * Renders the overlay.
     * If the overlay is disabled, the opacity is set to 0.
     * @returns {void}
     */
    const renderOverlay = () => {
      const [overlayURL] = OVERLAYS[state.overlayIdx];
      if (!overlayURL) {
        overlayImage.style.opacity = 0;
        return;
      }
      overlayImage.style.opacity = state.opacity / 100;
      overlayImage.src = overlayURL;
    };

    /**
     * Creates a new empty DocumentFragment. DocumentFragments are lightweight and efficient
     * containers for temporary groupings of nodes. They improve performance by not forcing
     * reflow and layout of their containing page when manipulated. They also allow for
     * efficient movement of nodes between documents, whether within a single window or
     * between windows.
     *
     * @see https://developer.mozilla.org/de/docs/Web/API/Document/createDocumentFragment
     */
    const fragment = document.createDocumentFragment();

    //---------------------------------------------------------------------------------------------
    // Setup switcher button
    //---------------------------------------------------------------------------------------------
    const SWITCHER_BUTTON_CONTAINER_STYLE = {
      position: "absolute",
      bottom: "25px",
      right: "25px",
    };
    const buttonContainer = applyStyles(
      document.createElement("div"),
      SWITCHER_BUTTON_CONTAINER_STYLE
    );
    const button = createSwitcherButton(state, renderOverlay);
    button.onclick = () => {
      state.overlayIdx = (state.overlayIdx + 1) % OVERLAYS.length;
      renderOverlay();
      storeStateToStorage(state);
      button.textContent = OVERLAYS[state.overlayIdx][1];
    };
    buttonContainer.appendChild(button);
    fragment.appendChild(buttonContainer);

    //---------------------------------------------------------------------------------------------
    // Setup opacity slider
    //---------------------------------------------------------------------------------------------
    const OPACITY_CONTAINER_STYLE = {
      width: "95px",
      height: "45px",
      backgroundColor: "#555",
      color: "white",
      border: "var(--pixel-border)",
      boxShadow: "var(--pixel-box-shadow)",
      fontFamily: "var(--garlic-bread-font-pixel)",
      marginTop: "15px",
      textAlign: "center",
    };
    const sliderContainer = applyStyles(
      document.createElement("div"),
      OPACITY_CONTAINER_STYLE
    );
    sliderContainer.textContent = "Transparenz";
    const opacitySlider = createOpacitySlider(state, renderOverlay);
    opacitySlider.oninput = () => {
      state.opacity = opacitySlider.value;
      renderOverlay();
      storeStateToStorage(state);
    };
    sliderContainer.appendChild(opacitySlider);
    buttonContainer.appendChild(sliderContainer);

    // Append the fragment to the page
    const shadowMainContainer = document
      .querySelector(CANVAS_MAIN_CONTAINER_SELECTOR)
      .shadowRoot.querySelector("div.layout");
    shadowMainContainer.appendChild(fragment);

    // Render the overlay once on load
    renderOverlay();
  }

  if (window.top !== window.self) {
    window.addEventListener("load", run);
  }
})();
