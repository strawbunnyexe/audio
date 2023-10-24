import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

let barWidth,barHeight;

const setupCanvas = (canvasElement,analyserNodeRef) => {
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;

	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"rgba(14,14,14,1) "},{percent:1,color:"rgba(125,126,125,1)"}]);

	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);

	barWidth = (canvasWidth/2)/audioData.length;
};

const draw = (params={}, dataType) => {
	// get currently selected data type of audio (frequency or waveform data)
	if(dataType == "frequency") analyserNode.getByteFrequencyData(audioData);
	if(dataType == "wave") analyserNode.getByteTimeDomainData(audioData);

	// draw background
	ctx.save();
	ctx.fillStyle = gradient;
	ctx.globalAlpha = .1;
	ctx.fillRect(0,0,canvasWidth,canvasHeight);
	ctx.restore();

	// draw circles if checked by user
	if(params.showCircles){
		let maxRadius = canvasHeight/2 * 1.5;
		ctx.save();
		ctx.globalAlpha = 0.5;
		for(let i=0; i<audioData.length; i++){
			let percent = audioData[i] / 255;
			let circleRadius = percent * maxRadius;
			ctx.beginPath();
			ctx.fillStyle=utils.makeColor(136,92,164,.34-percent/3.0);
			ctx.arc(canvasWidth/2,canvasHeight,circleRadius, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle=utils.makeColor(96,52,80,.10-percent/10.0);
			ctx.arc(canvasWidth/2,canvasHeight,circleRadius * 1.5, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle=utils.makeColor(60,64,140,.5-percent/5.0);
			ctx.arc(canvasWidth/2,canvasHeight,circleRadius * .50, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		}
		ctx.restore();
	}
	
	// draw bars
	ctx.save();
	let x = 0;
	let padding = 4;
	//draw bars from center to left side of canvas
	for(let i=0; i<audioData.length;i++){
		barHeight = audioData[i];
		ctx.save();
		ctx.fillStyle = "white";
		ctx.fillRect(canvasWidth/2-x, canvasHeight - barHeight -15, barWidth, 10);
		ctx.restore();
		
		ctx.save();
		ctx.fillStyle = `rgb(${audioData[i]},${audioData[i]-128},${255-audioData[i]})`;
		ctx.fillRect(canvasWidth/2-x, canvasHeight - barHeight, barWidth, barHeight);
		ctx.restore();

		x += barWidth;
		ctx.translate(-padding,0);
	}
	ctx.restore();
	//draw bars from center to right side of canvas
	ctx.save();
	for(let i=0; i<audioData.length;i++){
		barHeight = audioData[i];
		ctx.save();
		ctx.fillStyle = "white";
		ctx.fillRect(x, canvasHeight - barHeight -15, barWidth, 10);
		ctx.restore();

		ctx.save();
		ctx.fillStyle = `rgb(${audioData[i]},${audioData[i]-128},${255-audioData[i]})`;
		ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
		ctx.restore();

		x += barWidth;
		ctx.translate(padding,0);
	}	
	ctx.restore();

	// bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
	let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
	let data = imageData.data;
	let length = data.length;
	let width = imageData.width;
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
	for(let i=0; i < length; i+=4){
		if(params.showNoise && Math.random() < .05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i+1] = data[i+2] = 0;// zero out the red and green and blue channels
			data[i+3] = 200;
		} // end if

		//invert
		if(params.showInvert){
			let red = data[i], green = data[i+1], blue = data[i+2];
			data[i] = 255 - red;
			data[i+1] = 255 - green;
			data[i+2] = 255 - blue;
		}
	}   // end for
	if(params.showEmboss){
		for(let i = 0; i < length; i++){
			if(i%4 == 3) continue;
			data[i] = 127 + 2*data[i] - data[i+4] - data[i + width *4];
		}
	}
	// D) copy image data back to canvas
	ctx.putImageData(imageData,0,0);
}

export {setupCanvas,draw,ctx,audioData,canvasWidth};