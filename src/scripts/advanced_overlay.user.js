// ==UserScript==
// @name         r/place 2023 Canada Overlay with German tiles
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script that adds a button to toggle an hardcoded image shown in the 2023's r/place canvas
// @author       max-was-here and placeDE Devs
// @match        https://garlic-bread.reddit.com/embed*
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png
// @updateURL    https://github.com/PlaceDE-Official/place-overlay/raw/main/src/scripts/advanced-overlay.user.js
// @downloadURL  https://github.com/PlaceDE-Official/place-overlay/raw/main/src/scripts/advanced-overlay.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const CANVAS_MAIN_CONTAINER_SELECTOR = "garlic-bread-embed";
  const CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR = "garlic-bread-canvas";
  const STORAGE_KEY = "place-germany-2023-ostate";
  const CANVAS_STYLE_DIMENSIONS = { width: "2000px", height: "1500px" };
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
   * @param {HTMLElement} positionContainer The container that holds the canvas
   * @param {Object} state The state object
   * @returns {HTMLImageElement} The canvas cover image
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
   */
  function createCanvasCoverImage(positionContainer, state) {
    const CANVAS_STYLE = {
      ...CANVAS_STYLE_DIMENSIONS,
      pointerEvents: "none",
      position: "absolute",
      imageRendering: "pixelated",
      top: "0px",
      left: "0px",
      zIndex: "100",
    };

    const canvasCoverImage = applyStyles(document.createElement("img"), CANVAS_STYLE);
    canvasCoverImage.onload = () => {
      canvasCoverImage.style.opacity = state.opacity / 100;
    };
    positionContainer.appendChild(canvasCoverImage);
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
      height: "65px",
      backgroundColor: "#555",
      color: "white",
      border: "var(--pixel-border)",
      boxShadow: "var(--pixel-box-shadow)",
      fontFamily: "var(--garlic-bread-font-pixel)",
      backgroundImage:
        "linear-gradient(to bottom, black, black 33%, red 33%, red 66%, yellow 66%)",
    };

    const button = applyStyles(document.createElement("button"), SWITCHER_BUTTON_STYLE);
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
      width: "95px",
      borderRadius: "5px",
      background: "#d3d3d3",
      outline: "none",
    };

    const opacitySlider = applyStyles(document.createElement("input"), OPACITY_SLIDER_STYLE);
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
    const state = getStateFromStorage();

    const mainContainer = document.querySelector(
      CANVAS_MAIN_CONTAINER_SELECTOR
    );
    if (!mainContainer) {
      console.error("Main container not found");
      return;
    }

    const shadowMainContainer =
      mainContainer.shadowRoot.querySelector(".layout");
    if (!shadowMainContainer) {
      console.error("Shadow main container not found");
      return;
    }

    const positionContainer = shadowMainContainer
      .querySelector(CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR)
      .shadowRoot.querySelector(".container");
    if (!positionContainer) {
      console.error("Position container not found");
      return;
    }

    const canvasCoverImage = createCanvasCoverImage(positionContainer, state);

    const renderOverlay = () => {
      const [overlayURL] = OVERLAYS[state.overlayIdx];
      if (!overlayURL) {
        canvasCoverImage.style.opacity = 0;
        return;
      }
      canvasCoverImage.style.opacity = state.opacity / 100;
      canvasCoverImage.src = overlayURL;
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

    const OPACITY_CONTAINER_STYLE = {
      width: "100px",
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

    shadowMainContainer.appendChild(fragment);

    renderOverlay();
  }

  if (window.top !== window.self) {
    window.addEventListener("load", run);
  }
})();
