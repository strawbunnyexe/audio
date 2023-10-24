import * as audio from './audio.js';
import * as utils from './utils.js';
import * as canvas from './visualizer.js';

class Sprite{
  constructor(x, y, fillStyle, audioData, canvasWidth, rotation){
    this.x = x;
    this.y = y;
    this.fillStyle = fillStyle;
    this.audioData = audioData;
    this.canvasWidth = canvasWidth;
    this.rotation = rotation;
  }
  update(){
    //update rotation for some movement
    this.rotation += 0.01;
  }
  draw(ctx){
    let barHeight;
    let barWidth = (this.canvasWidth/2)/this.audioData.length;
    let increment = 0;
    for(let i = 0; i < this.audioData.length;i++){
      barHeight = this.audioData[i] * 0.5;
      //draw center
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(i + Math.PI * 2/this.audioData.length);
      ctx.fillStyle = "yellow";
      ctx.fillRect(0,0,barWidth,15);

      //draw bars that will be rotated with update
      ctx.save();
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.fillStyle;
      ctx.fillRect(0,0,barWidth,barHeight);
      ctx.restore();

      increment+= barWidth;
      ctx.restore();
    }
  }
}

let highshelf = false;
let lowshelf = false;
let dataType = "frequency";

let json;

let sprites = [];

const drawParams = {
  showCircles  : true,
  showNoise    : false,
  showInvert   : false,
  showEmboss   : false
};

const DEFAULTS = Object.freeze({
	sound1  :  "media/New Adventure Theme.mp3"
});

const init = () => {
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

const setupUI = canvasElement => {
  // fullscreen button
  const fsButton = document.querySelector("#btn-fs");
  fsButton.onclick = e => {
    utils.goFullscreen(canvasElement);
  };
  // play button
  const playButton = document.querySelector("#btn-play");
  playButton.onclick = e => {
    if(audio.audioCtx.state == "suspended"){
        audio.audioCtx.resume();
    }
    if(e.target.dataset.playing == "no"){
        audio.playCurrentSound();
        e.target.dataset.playing = "yes";
    }else{
        audio.pauseCurrentSound();
        e.target.dataset.playing = "no";
    }
  };

  // volume slider
  let volumeSlider = document.querySelector("#slider-volume");
  let volumeLabel = document.querySelector("#label-volume");

  volumeSlider.oninput = e => {
    audio.setVolume(e.target.value);
    volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
  };

  volumeSlider.dispatchEvent(new Event("input"));
	
  // track select
  let trackSelect = document.querySelector('#select-track');
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    if(playButton.dataset.playing == "yes"){
        playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // treble and bass toggle checkboxes
  document.querySelector('#cb-highshelf').onchange = e => {
    highshelf = e.target.checked;
    audio.toggleHighshelf(highshelf);
  };
  document.querySelector('#cb-lowshelf').onchange = e => {
    lowshelf = e.target.checked;
    audio.toggleLowshelf(lowshelf);
  };
  audio.toggleHighshelf(highshelf);
  audio.toggleLowshelf(lowshelf);

  // visualization toggle
  document.querySelector("#data-toggle").onchange = e =>{
    let radioBtns = document.querySelectorAll(".audio-data");
    for(let i = 0; i < radioBtns.length; i++){
      if(radioBtns[i].checked) dataType = radioBtns[i].value;
    }
  };

  document.querySelector("#cb-circles").onclick = e => {
    drawParams.showCircles = e.target.checked;
  };
  document.querySelector("#cb-noise").onclick = e => {
    drawParams.showNoise = e.target.checked;
  };
  document.querySelector("#cb-invert").onclick = e => {
    drawParams.showInvert = e.target.checked;
  };
  document.querySelector("#cb-emboss").onclick = e => {
    drawParams.showEmboss = e.target.checked;
  };

}; // end setupUI

const loadJSON = () => {
  const url = "./data/av-data.json";
  const xhr = new XMLHttpRequest();

  xhr.onload = e => {
    //let json;
    try{
      json = JSON.parse(e.target.responseText);
    }
    catch{
      console.log("Bad JSON");
    }

    //set title of html page from json file
    document.querySelector("title").innerHTML = json.title;

    //set each track to track selector
    let html = "";
    for(let i = 0; i < json.tracks.length;i++){
      html += `<option value="${json.tracks[i].url}">${json.tracks[i].name}</option>`;
    }
    document.querySelector('#select-track').innerHTML = html;
    
    // set up sprites on canvas
    for(let i = 0; i < json.data.length;i++){
      sprites.push(new Sprite(json.data[i].x,json.data[i].y,json.data[i].color,canvas.audioData,canvas.canvasWidth, 0.05));
    }

  }
  xhr.onerror = e => console.log(`In onerror - HTTP Status Code = ${e.target.status}`);
  xhr.open("GET", url);
  xhr.send();
};

export {init};