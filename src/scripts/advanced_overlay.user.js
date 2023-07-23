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

(function() {
  'use strict';

  const CANVAS_MAIN_CONTAINER_SELECTOR = 'garlic-bread-embed';
  const CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR = 'garlic-bread-canvas';

  const CANVAS_STYLE = Object.freeze({
    pointerEvents: 'none',
    position: 'absolute',
    imageRendering: 'pixelated',
    top: '0px',
    left: '0px',
    width: '2000px',
    height: '1500px',
    zIndex: '100',
  });

  const SWITCHER_BUTTON_WRAPPER_STYLE = Object.freeze({
    position: 'absolute',
    bottom: '25px',
    right: '25px',
  });

  const SWITCHER_BUTTON_STYLE = Object.freeze({
    width: '100px',
    height: '65px',
    backgroundColor: '#555',
    color: 'white',
    border: 'var(--pixel-border)',
    boxShadow: 'var(--pixel-box-shadow)',
    fontFamily: 'var(--garlic-bread-font-pixel)',
    backgroundImage: 'linear-gradient(to bottom, black, black 33%, red 33%, red 66%, yellow 66%)', // Deutschlandfahne
  });

  const OPACITY_WRAPPER_STYLE = Object.freeze({
    width: '100px',
    height: '45px',
    backgroundColor: '#555',
    color: 'white',
    border: 'var(--pixel-border)',
    boxShadow: 'var(--pixel-box-shadow)',
    fontFamily: 'var(--garlic-bread-font-pixel)',
    marginTop: '15px',
    textAlign: 'center',
  });

  const OPACITY_SLIDER_STYLE = Object.freeze({
    webkitAppearance: 'none',
    appearance: 'none',
    height: '15px',
    width: '95px',
    borderRadius: '5px',
    background: '#d3d3d3',
    outline: 'none',
  });

  const OVERLAYS = Object.freeze([
    ['https://place.army/overlay_target.png', 'KLEINE PIXEL'],
    ['https://place.army/default_target.png', 'GROßE PIXEL'],
    [null, 'OVERLAY AUS'],
  ]);

  function applyStyles(element, styles) {
    for (const [key, value] of Object.entries(styles)) {
      element.style[key] = value;
    }
  }

  function initializeState() {
    const STORAGE_KEY = 'place-germany-2023-ostate';
    let initialState = {
      opacity: 100,
      overlayIdx: 0,
    };

    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState !== null) {
      try {
        initialState = { ...initialState, ...JSON.parse(storedState) };
      } catch (_) {
        console.error('Failed to parse stored state');
      }
    }
    return [STORAGE_KEY, initialState];
  }

  function saveState(key, state) {
    localStorage.setItem(key, JSON.stringify(state));
  }

  function run() {
    let [STORAGE_KEY, state] = initializeState();
  
    const mainContainer = document
      .querySelector(CANVAS_MAIN_CONTAINER_SELECTOR)
      .shadowRoot.querySelector('.layout');
  
    const positionContainer = mainContainer
      .querySelector(CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR)
      .shadowRoot.querySelector('.container');
  
    const canvasCoverImage = document.createElement('img');
    applyStyles(canvasCoverImage, CANVAS_STYLE);
    canvasCoverImage.onload = () => {
      canvasCoverImage.style.opacity = state.opacity / 100;
    };
    positionContainer.appendChild(canvasCoverImage);
  
    const changeOverlay = () => {
      const [overlayURL] = OVERLAYS[state.overlayIdx];
      if (overlayURL === null || overlayURL === undefined || overlayURL === '') {
        canvasCoverImage.style.opacity = 0;
        return;
      }
      canvasCoverImage.style.opacity = state.opacity / 100;
      canvasCoverImage.src = overlayURL;
    };
  
    const button = document.createElement('button');
    applyStyles(button, SWITCHER_BUTTON_STYLE);
    button.onclick = () => {
      state.overlayIdx = (state.overlayIdx + 1) % OVERLAYS.length;
      changeOverlay();
      saveState(STORAGE_KEY, state);
      button.textContent = OVERLAYS[state.overlayIdx][1];
    };
    button.textContent = OVERLAYS[state.overlayIdx][1];
  
    const buttonContainer = document.createElement('div');
    applyStyles(buttonContainer, SWITCHER_BUTTON_WRAPPER_STYLE);
    buttonContainer.appendChild(button);
    mainContainer.appendChild(buttonContainer);
  
    const sliderContainer = document.createElement('div');
    sliderContainer.textContent = 'Transparenz';
    applyStyles(sliderContainer, OPACITY_WRAPPER_STYLE);
  
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = 0;
    opacitySlider.max = 100;
    opacitySlider.value = state.opacity;
    opacitySlider.oninput = () => {
      state.opacity = opacitySlider.value;
      changeOverlay();
      saveState(STORAGE_KEY, state);
    };
    applyStyles(opacitySlider, OPACITY_SLIDER_STYLE);
  
    sliderContainer.appendChild(opacitySlider);
    buttonContainer.appendChild(sliderContainer);
  
    changeOverlay();
  }
  
  if (window.top !== window.self) {
    window.addEventListener('load', run);
  }
})();
