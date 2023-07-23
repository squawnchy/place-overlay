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

const CANVAS_MAIN_CONTAINER_SELECTOR = 'garlic-bread-embed';
const CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR = 'garlic-bread-canvas';

const CANVAS_STYLE = {
  pointerEvents: 'none',
  position: 'absolute',
  imageRendering: 'pixelated',
  top: '0px',
  left: '0px',
  width: '2000px',
  height: '1500px',
  zIndex: '100',
};

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
  backgroundImage: 'linear-gradient(to bottom, black, black 33%, red 33%, red 66%, yellow 66%)', // Deutschlandfahne
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
    const STORAGE_KEY = 'place-germany-2023-ostate';
    const OVERLAYS = [
      ['https://place.army/overlay_target.png', 'KLEINE PIXEL'],
      ['https://place.army/default_target.png', 'GROßE PIXEL'],
      [null, 'OVERLAY AUS'],
    ];

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

    const saveState = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oState));
    };

    const incrementOverlayIndex = () => {
      oState.overlayIdx++;
      oState.overlayIdx %= OVERLAYS.length;
    };
    
    const initializeSwitchOverlayButton = (switchOverlay) => {
      const button = document.createElement('button');
      const setTextToOverlayTitle = () => {
        const [_, overlayTitle] = OVERLAYS[oState.overlayIdx];
        button.innerText = overlayTitle;
      };
      button.onclick = () => {
        incrementOverlayIndex();
        switchOverlay();
        setTextToOverlayTitle();
        saveState();
      };
      setTextToOverlayTitle();
      
      return button;
    };
    
    const initializeOpacitySlider = (changeOpacity) => {
      const opacitySlider = document.createElement('input');
      opacitySlider.type = 'range';
      opacitySlider.min = 0;
      opacitySlider.max = 100;
      opacitySlider.value = oState.opacity;
      opacitySlider.oninput = (e) => {
        oState.opacity = e.target.value;
        changeOpacity();
        saveState();
      };
      
      return opacitySlider;
    };
    
    const run = () => {
      const canvasCoverImage = document.createElement('img');
      const [overlayURL, _] = OVERLAYS[oState.overlayIdx];
      canvasCoverImage.src = overlayURL + '?' + Date.now();
      setStyle(canvasCoverImage, CANVAS_STYLE);
      canvasCoverImage.onload = () => {
        canvasCoverImage.style.opacity = oState.opacity / 100;
      };

      const mainContainer = document
        .querySelector(CANVAS_MAIN_CONTAINER_SELECTOR)
        .shadowRoot.querySelector('.layout');
      const positionContainer = mainContainer
        .querySelector(CANVAS_MAIN_CONTAINER_SHADOW_ROOT_SELECTOR)
        .shadowRoot.querySelector('.container');

      const buttonContainer = document.createElement('div');
      setStyle(buttonContainer, SWITCHER_BUTTON_WRAPPER_STYLE);
      
      const switchOverlay = () => {
        const [overlayURL, _] = OVERLAYS[oState.overlayIdx];
        if (
          overlayURL === null ||
          overlayURL === undefined ||
          overlayURL === ''
        ) {
          canvasCoverImage.style.opacity = 0;
        } else {
          canvasCoverImage.style.opacity = oState.opacity / 100;
          canvasCoverImage.src = overlayURL + '?' + Date.now();
        }
      };

      const updateOverlayOpacity = () => {
        canvasCoverImage.style.opacity = oState.opacity / 100;
      };
      
      const button = initializeSwitchOverlayButton(switchOverlay);
      setStyle(button, SWITCHER_BUTTON_STYLE);

      const sliderContainer = document.createElement('div');
      sliderContainer.innerText = 'Transparenz';
      setStyle(sliderContainer, OPACITY_WRAPPER_STYLE);

      const slider = initializeOpacitySlider(updateOverlayOpacity);
      setStyle(slider, OPACITY_SLIDER_STYLE);
      
      positionContainer.appendChild(canvasCoverImage);
      buttonContainer.appendChild(button);
      sliderContainer.appendChild(slider);
      buttonContainer.appendChild(sliderContainer);
      mainContainer.appendChild(buttonContainer);
    };
    
    run();
  });
}
