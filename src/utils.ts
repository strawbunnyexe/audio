import { ColorStop } from "./interfaces/colorStop.interface";

const makeColor = (red:number, green:number, blue:number, alpha = 1) => {
  return `rgba(${red},${green},${blue},${alpha})`;
};
  
const getRandom = (min:number, max:number) => {
  return Math.random() * (max - min) + min;
};
  
const getRandomColor = () => {
  const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor,255-floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};
  
const getLinearGradient = (ctx:CanvasRenderingContext2D,startX:number,startY:number,endX:number,endY:number,colorStops:ColorStop[]) => {
  let lg = ctx.createLinearGradient(startX,startY,endX,endY);
  for(let stop of colorStops){
    lg.addColorStop(stop.percent,stop.color);
  }
  return lg;
};
  
const goFullscreen = (element:HTMLCanvasElement) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
};
  
export {makeColor, getRandomColor, getLinearGradient, goFullscreen};