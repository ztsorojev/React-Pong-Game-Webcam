import { Vec, Rect } from './Rect';

export default class Ball extends Rect
{
	
    constructor()
    {
        super(10, 10);
        this.vel = new Vec();
		this.trailX = [];
		this.trailY = [];
		this.trailLimit = 3;
    }

    render(context) {

    	//coordinates of ball
    	let center_x = this.left + this.size.x / 2;
    	let center_y = this.top - this.size.y / 2;

    	context.beginPath();
		context.arc(center_x, center_y, this.size.x/2, 0, 2 * Math.PI);
		context.fillStyle = '#fff';
		context.fill();
		context.stroke();
		
		this.trailX.push(center_x);
		this.trailY.push(center_y);
		if(this.trailX.length > this.trailLimit || this.trailY.length > this.trailLimit) {
			this.trailX.shift();
			this.trailY.shift();
		}
		
		for(var i = this.trailX.length-1; i >= 0; --i) {
			var currentSize = this.size.x/(this.trailX.length - i + 1); // Current size of the trail
			context.beginPath();
			context.arc(this.trailX[i], this.trailY[i], currentSize, 0, 2 * Math.PI);
			
			if(center_x > context.canvas.width/2) { //If the ball is in the right side of the canvas, change color of trail
				context.fillStyle = '#7acfd6';
			}
			else {
				context.fillStyle = '#b11a21';
			}
			
			context.fill();
			context.stroke();
		}
    }
}