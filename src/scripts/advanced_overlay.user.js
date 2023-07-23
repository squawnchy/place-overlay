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

const SWITCHER_BUTTON_STYLE = {
  width: '100px',
  height: '65px',
  backgroundColor: '#555',
  color: 'white',
  border: 'var(--pixel-border)',
  boxShadow: 'var(--pixel-box-shadow)',
  fontFamily: 'var(--garlic-bread-font-pixel)',
  backgroundImage:
    'linear-gradient(to bottom, black, black 33%, red 33%, red 66%, yellow 66%)',
};

const OPACITY_WRAPPER_STYLE = {
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
      console.log('loaded');
      img.style.opacity = oState.opacity / 100;
    };

    const mainContainer = document
      .querySelector('garlic-bread-embed')
      .shadowRoot.querySelector('.layout');
    const positionContainer = mainContainer
      .querySelector('garlic-bread-canvas')
      .shadowRoot.querySelector('.container');
    positionContainer.appendChild(img);

    // ==============================================
    // Add buttons to toggle overlay

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.style.position = 'absolute';
    buttonsWrapper.style.bottom = '25px';
    buttonsWrapper.style.right = '25px';
    mainContainer.appendChild(buttonsWrapper);

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

    const initializeButton = (onClick) => {
      const button = document.createElement('button');
      button.onclick = onClick;
      button.style = Object.entries(SWITCHER_BUTTON_STYLE)
      return button;
    };

    const setTextToOverlayTitle = (button) => {
      const [_, overlayTitle] = OVERLAYS[oState.overlayIdx];
      button.innerText = overlayTitle;
    };

    const renderSwitchOverlayButton = () => {
      let button;
      const onClick = () => {
        incrementOverlayIndex();
        renderCurrentOverlay();
        setTextToOverlayTitle(button);
      }
      button = initializeButton(onClick);
      buttonsWrapper.appendChild(button);
      setTextToOverlayTitle(button);
    };

    const renderOpacitySlider = (val, onChange) => {
      const opacityWrapper = document.createElement('div');
      opacityWrapper.style = Object.entries(OPACITY_WRAPPER_STYLE);
      opacityWrapper.innerText = 'Transparenz';

      const opacitySlider = document.createElement('input');
      opacitySlider.type = 'range';
      opacitySlider.min = 0;
      opacitySlider.max = 100;
      opacitySlider.value = val;
      opacitySlider.style = Object.entries(OPACITY_SLIDER_STYLE);
      opacitySlider.oninput = onChange;

      opacityWrapper.appendChild(opacitySlider);
      buttonsWrapper.appendChild(opacityWrapper);
    };

    renderSwitchOverlayButton();
    renderOpacitySlider(oState.opacity, changeOpacity);
  });
}
