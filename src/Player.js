import { Vec, Rect } from './Rect';

export default class Player extends Rect
{
    constructor()
    {
        super(5, 40);
        this.vel = new Vec();
        this.score = 0;

        this._lastPos = new Vec();
    }

    update(dt)
    {
        this.vel.y = (this.pos.y - this._lastPos.y) / dt;
        this._lastPos.y = this.pos.y;
    }

    render(context) 
    {
        context.fillStyle = '#fff';
        context.fillRect(this.left, this.top, this.size.x, this.size.y);
    }
}