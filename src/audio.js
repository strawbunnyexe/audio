let audioCtx;

let element, sourceNode, analyserNode, gainNode, biquadFilter,lowShelfBiquadFilter;

const DEFAULTS = Object.freeze({
    gain        :   .5,
    numSamples  :   256
});

const setupWebaudio = filePath => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
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
    analyserNode.fftSize = DEFAULTS.numSamples;

    // create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // connect the nodes 
    sourceNode.connect(biquadFilter);
    biquadFilter.connect(lowShelfBiquadFilter);
    lowShelfBiquadFilter.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
};

const loadSoundFile = filePath => {
    element.src = filePath;
};
const playCurrentSound = () => {
    element.play();
};

const pauseCurrentSound = () => {
    element.pause();
};

const setVolume = value => {
    value = Number(value);
    gainNode.gain.value = value;
};
// treble and bass toggle filters
const toggleHighshelf = highshelf => {
    if(highshelf){
      biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    }else{
      biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
};
const toggleLowshelf = lowshelf => {
    if(lowshelf){
      lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    }else{
      lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
};

export{audioCtx, toggleHighshelf, toggleLowshelf,setupWebaudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume,analyserNode};