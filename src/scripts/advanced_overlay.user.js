// ==UserScript==
// @name         r/place 2023 Canada Overlay with German tiles
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Script that adds a button to toggle an hardcoded image shown in the 2023's r/place canvas
// @author       max-was-here and placeDE Devs
// @match        https://garlic-bread.reddit.com/embed*
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png
// @updateURL    https://github.com/PlaceDE-Official/place-overlay/raw/main/src/scripts/advanced-overlay.user.js
// @downloadURL  https://github.com/PlaceDE-Official/place-overlay/raw/main/src/scripts/advanced-overlay.user.js
// @grant        none
// ==/UserScript==

const CANVAS_WIDTH = '2000px';
const CANVAS_HEIGHT = '1500px';

const SWITCHER_BUTTON_WRAPPER_STYLE = {
  position: 'absolute',
  bottom: '25px',
  right: '25px',
};

const SWITCHER_BUTTON_STYLE = {
  width: '100px',
  height: '65px',
  backgroundColor: '#555',
  color: 'white',
  border: 'var(--pixel-border)',
  boxShadow: 'var(--pixel-box-shadow)',
  fontFamily: 'var(--garlic-bread-font-pixel)',
  // Deutschlandfahne
  backgroundImage:
    'linear-gradient(to bottom, black, black 33%, red 33%, red 66%, yellow 66%)',
};

const OPACITY_WRAPPER_STYLE = {
  width: '100px',
  height: '45px',
  backgroundColor: '#555',
  color: 'white',
  border: 'var(--pixel-border)',
  boxShadow: 'var(--pixel-box-shadow)',
  fontFamily: 'var(--garlic-bread-font-pixel)',
  marginTop: '15px',
  textAlign: 'center',
};

const OPACITY_SLIDER_STYLE = {
  webkitAppearance: 'none',
  appearance: 'none',
  height: '15px',
  width: '95px',
  borderRadius: '5px',
  background: '#d3d3d3',
  outline: 'none',
};


if (window.top !== window.self) {
  addEventListener('load', () => {
    // ==============================================
    const STORAGE_KEY = 'place-germany-2023-ostate';
    const OVERLAYS = [
      ['https://place.army/overlay_target.png', 'KLEINE PIXEL'],
      ['https://place.army/default_target.png', 'GROßE PIXEL'],
      [null, 'OVERLAY AUS'],
    ];
    const getConfig = (text) => {
      return text + '?' + Date.now();
    };

    const setStyle = (element, style) => {
      Object.entries(style).forEach(([key, value]) => {
        element.style[key] = value;
      });
    };

    let oState = {
      opacity: 100,
      overlayIdx: 0,
    };

    const oStateStorage = localStorage.getItem(STORAGE_KEY);
    if (oStateStorage !== null) {
      try {
        oState = Object.assign({}, oState, JSON.parse(oStateStorage));
      } catch (e) {}
    }

    const img = document.createElement('img');
    img.style.pointerEvents = 'none';
    img.style.position = 'absolute';
    img.style.imageRendering = 'pixelated';
    img.src = OVERLAYS[oState.overlayIdx][0];
    img.style.opacity = oState.opacity;
    img.style.top = '0px';
    img.style.left = '0px';
    img.style.width = CANVAS_WIDTH;
    img.style.height = CANVAS_HEIGHT;
    img.style.zIndex = '100';
    img.onload = () => {
      img.style.opacity = oState.opacity / 100;
    };

    const mainContainer = document
      .querySelector('garlic-bread-embed')
      .shadowRoot.querySelector('.layout');
    const positionContainer = mainContainer
      .querySelector('garlic-bread-canvas')
      .shadowRoot.querySelector('.container');
    positionContainer.appendChild(img);

    const saveState = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oState));
    };

    const changeOpacity = (e) => {
      oState.opacity = e.target.value;
      img.style.opacity = oState.opacity / 100;
      saveState();
    };

    const incrementOverlayIndex = () => {
      oState.overlayIdx++;
      oState.overlayIdx = oState.overlayIdx % OVERLAYS.length;
    };

    const renderCurrentOverlay = () => {
      const [overlayURL, _] = OVERLAYS[oState.overlayIdx];
      if (
        overlayURL === null ||
        overlayURL === undefined ||
        overlayURL === ''
      ) {
        img.style.opacity = 0;
        saveState();
        return;
      }
      img.style.opacity = oState.opacity / 100;
      img.src = getConfig(overlayURL);
      saveState();
    };

    

    const initializeSwitchOverlayButton = () => {
      const button = document.createElement('button');
      const setTextToOverlayTitle = () => {
        const [_, overlayTitle] = OVERLAYS[oState.overlayIdx];
        button.innerText = overlayTitle;
      };
      button.onclick = () => {
        incrementOverlayIndex();
        renderCurrentOverlay();
        setTextToOverlayTitle(button);
      };
      setTextToOverlayTitle(button);
      
      return button;
    };
    
    const initializeOpacitySlider = () => {
      const opacitySlider = document.createElement('input');
      opacitySlider.type = 'range';
      opacitySlider.min = 0;
      opacitySlider.max = 100;
      opacitySlider.value = oState.opacity;
      opacitySlider.oninput = changeOpacity;
      
      return opacitySlider;
    };
    
    const run = () => {
      const buttonContainer = document.createElement('div');
      setStyle(buttonContainer, SWITCHER_BUTTON_WRAPPER_STYLE);
      
      const button = initializeSwitchOverlayButton();
      setStyle(button, SWITCHER_BUTTON_STYLE);

      const sliderContainer = document.createElement('div');
      sliderContainer.innerText = 'Transparenz';
      setStyle(sliderContainer, OPACITY_WRAPPER_STYLE);

      const slider = initializeOpacitySlider();
      setStyle(slider, OPACITY_SLIDER_STYLE);
      
      buttonContainer.appendChild(button);
      sliderContainer.appendChild(slider);
      buttonContainer.appendChild(sliderContainer);
      mainContainer.appendChild(buttonContainer);
    };
    
    run();
  });
}
