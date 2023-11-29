import { DEFAULTS } from "./enums/audio-defaults.enum"

let audioCtx : AudioContext,
element : HTMLAudioElement, 
sourceNode:MediaElementAudioSourceNode, 
analyserNode : AnalyserNode, 
gainNode: GainNode, 
biquadFilter:BiquadFilterNode,
lowShelfBiquadFilter:BiquadFilterNode;

const setupWebaudio = (filePath: string) => {
  const AudioContext = window.AudioContext;
  audioCtx = new AudioContext();
  element = new Audio();

  // point at a sound file
  loadSoundFile(filePath);

  // create an a source node that points at the <audio> element
  sourceNode = audioCtx.createMediaElementSource(element);

  biquadFilter = audioCtx.createBiquadFilter();
	biquadFilter.type = "highshelf";

	lowShelfBiquadFilter = audioCtx.createBiquadFilter();
	lowShelfBiquadFilter.type = "lowshelf";

  // create an analyser node
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = DEFAULTS.NumSamples;

  // create a gain (volume) node
  gainNode = audioCtx.createGain();
  gainNode.gain.value = DEFAULTS.Gain;

  // connect the nodes 
  sourceNode.connect(biquadFilter);
  biquadFilter.connect(lowShelfBiquadFilter);
  lowShelfBiquadFilter.connect(analyserNode);
  analyserNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
};

const loadSoundFile = (filePath:string) => {
  element.src = filePath;
};
const playCurrentSound = () => {
  element.play();
};

const pauseCurrentSound = () => {
  element.pause();
};

const setVolume = (value:number) => {
  gainNode.gain.value = value;
};
// treble and bass toggle filters
const toggleHighshelf = (highshelf:boolean) => {
  if(highshelf){
    biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
  }else{
    biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
  }
};
const toggleLowshelf = (lowshelf:boolean) => {
  if(lowshelf){
    lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
  }else{
    lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
  }
};

export{audioCtx, toggleHighshelf, toggleLowshelf,setupWebaudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume,analyserNode};