import { Vec, Rect } from './Rect';

export default class Ball extends Rect
{
    constructor()
    {
        super(5, 5);
        this.vel = new Vec();
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
    }
}