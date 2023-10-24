class Sprite{
    constructor(x, y, fillStyle, audioData, canvasWidth, rotation=0){
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

export {Sprite};