import * as audio from './audio';
import * as utils from './utils';
import * as canvas from './visualizer';
import Sprite from './classes/Sprite';
import { DrawParams } from './interfaces/drawParams.interface';
import { JSONObject } from './interfaces/jsonObject.interface';
import { DEFAULTS } from './enums/main-defaults.enum';

let highshelf = false;
let lowshelf = false;
let dataType = "frequency";

let json:JSONObject;

let sprites: Sprite[];

const drawParams:DrawParams = {
  showCircles  : true,
  showNoise    : false,
  showInvert   : false,
  showEmboss   : false
};

const init = () => {
  sprites = [];
  loadJSON();
  audio.setupWebaudio(DEFAULTS.sound1);
	let canvasElement = document.querySelector("canvas");
	setupUI(canvasElement);
  canvas.setupCanvas(canvasElement,audio.analyserNode);
  loop();
};

const loop = () => {
  // change runtime to 60 fps
  setTimeout(loop,1000/60);

  canvas.draw(drawParams, dataType);
  sprites.forEach(s => {
    s.update();
    s.draw(canvas.ctx);
  })
};

const setupUI = (canvasElement:HTMLCanvasElement) => {
  // fullscreen button
  const fsButton = document.querySelector("#btn-fs") as HTMLButtonElement;
  fsButton.onclick = () => {
    utils.goFullscreen(canvasElement);
  };
  // play button
  const playButton = document.querySelector("#btn-play") as HTMLButtonElement;
  playButton.onclick = e => {
    const target = e.target as HTMLInputElement;
    if(audio.audioCtx.state == "suspended"){
        audio.audioCtx.resume();
    }
    if(target.dataset.playing == "no"){
        audio.playCurrentSound();
        target.dataset.playing = "yes";
    }else{
        audio.pauseCurrentSound();
        target.dataset.playing = "no";
    }
  };

  // volume slider
  let volumeSlider = document.querySelector("#slider-volume") as HTMLInputElement;
  let volumeLabel = document.querySelector("#label-volume") as HTMLBodyElement;
  volumeSlider.oninput = e => {
    const target = e.target as HTMLInputElement;
    audio.setVolume(Number(target.value));
    volumeLabel.innerHTML = String(Math.round((Number(target.value)/2 * 100)));
  };

  volumeSlider.dispatchEvent(new Event("input"));
	
  // track select
  let trackSelect = document.querySelector('#select-track') as HTMLInputElement;
  trackSelect.onchange = e => {
    const target = e.target as HTMLInputElement;
    audio.loadSoundFile(target.value);
    if(playButton.dataset.playing == "yes"){
        playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // treble and bass toggle checkboxes
  let highshelfCB = document.querySelector('#cb-highshelf') as HTMLInputElement;
  highshelfCB.onchange = e => {
    const target = e.target as HTMLInputElement;
    highshelf = target.checked;
    audio.toggleHighshelf(highshelf);
  };
  let lowshelfCB = document.querySelector('#cb-lowshelf') as HTMLInputElement;
  lowshelfCB.onchange = e => {
    const target = e.target as HTMLInputElement;
    lowshelf = target.checked;
    audio.toggleLowshelf(lowshelf);
  };
  audio.toggleHighshelf(highshelf);
  audio.toggleLowshelf(lowshelf);

  // visualization toggle
  let dataToggle = document.querySelector("#data-toggle") as HTMLInputElement;
  dataToggle.onchange = () =>{
    let radioBtns = document.querySelectorAll(".audio-data");
    for(let i = 0; i < radioBtns.length; i++){
      let btn = radioBtns[i] as HTMLInputElement;
      if(btn.checked) dataType = btn.value;
    }
  };

  let circlesCB = document.querySelector("#cb-circles") as HTMLInputElement;
  circlesCB.onclick = e => {
    const target = e.target as HTMLInputElement;
    drawParams.showCircles = target.checked;
  };
  let noiseCB = document.querySelector("#cb-noise") as HTMLInputElement;
  noiseCB.onclick = e => {
    const target = e.target as HTMLInputElement;
    drawParams.showNoise = target.checked;
  };
  let invertCB = document.querySelector("#cb-invert") as HTMLInputElement;
  invertCB.onclick = e => {
    const target = e.target as HTMLInputElement;
    drawParams.showInvert = target.checked;
  };
  let embossCB = document.querySelector("#cb-emboss") as HTMLInputElement;
  embossCB.onclick = e => {
    const target = e.target as HTMLInputElement;
    drawParams.showEmboss = target.checked;
  };

}; // end setupUI

const loadJSON = () => {
  const url = "./data/av-data.json";
  const xhr = new XMLHttpRequest();

  xhr.onload = () => parseJSON(xhr);
  xhr.open("GET", url);
  xhr.send();
};

const parseJSON = (xhr: XMLHttpRequest) => {
  const string = xhr.responseText;

  try{
    json = JSON.parse(string);
  }
  catch{
    console.log("Bad JSON");
  }
  //set title of html page from json file
  let title = document.querySelector("title") as HTMLElement; 
  title.innerHTML = json.title;

  //set each track to track selector
  let html = "";
  for(let i = 0; i < json.tracks.length;i++){
    html += `<option value="${json.tracks[i].url}">${json.tracks[i].name}</option>`;
  }
  let trackSelect = document.querySelector('#select-track') as HTMLInputElement;
  trackSelect.innerHTML = html;
    
  // set up sprites on canvas
  for(let i = 0; i < json.data.length;i++){
    sprites.push(new Sprite({x: json.data[i].x, 
                             y: json.data[i].y, 
                             fillStyle: json.data[i].color, 
                             audioData: canvas.audioData, 
                             canvasWidth: canvas.canvasWidth, 
                             rotation: 0.05}));
  }
};

export {init};