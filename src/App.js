import React, { Component } from 'react';
import Ball from './Ball';
import Player from './Player';
import VisionRecognition from './VisionRecognition';
import './App.css';

let gameWidth=600, gameHeight=400;


class App extends Component {

  constructor(props)
  {
    super(props);
    this.state = {
      canvas: null,
      context: null,
      vision: null,
      gameActive: false,
      direction: 2   //0 = UP, 1 = DOWN, 2 = IDDLE
    }
    this.initialSpeed = 250;
    this.ball = null;
    this.players = [];
  }

  //React native fct: invoked immediately after a component is mounted (inserted into the tree)
  componentDidMount() {
    /*
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize',  this.handleResize.bind(this, false));
    */

    const context = this.refs.canvas.getContext('2d');
    this.setState({ context: context });
    this.startGame();
    requestAnimationFrame(() => {this.update()});
  }

  update() {

    let dt = 0.005;
    const cvs = this.refs.canvas;
    const context = this.state.context;
    const ball = this.ball;
    ball.pos.x += ball.vel.x * dt;
    ball.pos.y += ball.vel.y * dt;

    if (ball.right < 0 || ball.left > cvs.width) {
        ++this.players[ball.vel.x < 0 | 0].score;
        this.reset(cvs);
    }

    if ((ball.vel.y < 0 && ball.top < 0) || (ball.vel.y > 0 && ball.bottom > cvs.height)) {
        ball.vel.y = -ball.vel.y;
    }

    if((this.players[0].pos.y - this.players[0].size.y/2) <= 0) this.players[0].pos.y = this.players[0].size.y/2;
    else if(this.players[0].pos.y >= (cvs.height - this.players[0].size.y/2))  this.players[0].pos.y = (cvs.height - this.players[0].size.y/2);

    this.players[1].pos.y = ball.pos.y;

    this.players.forEach(player => {
        player.update(dt);
        this.collide(player, ball);
    });

    //draw board
    context.fillStyle = '#202020'; //Darkish gray
    context.fillRect(0, 0, cvs.width, cvs.height);
	
	context.shadowBlur=10;  //Add some shadows to every element
	context.shadowColor="#ddd"; //Silver
	
	//Draw the middle line
	context.beginPath();
	context.strokeStyle="#ddd";
	context.moveTo(cvs.width / 2, 0);
	context.lineTo(cvs.width / 2, cvs.height);
	context.stroke();

    this.ball.render(context);
    //this.players.forEach(player => player.render(context));
	if(this.players.length > 1) {
		this.players[0].renderPlayer1(context);
		this.players[1].renderPlayer2(context);
	}
	else {
		console.log("Error, fewer than 2 players initialized.");
	}
	

    this.renderScore();


    this.setState({
      direction: this.state.vision.direction
    });

    this.movePlayer();

    //console.log(this.state.direction);

    // Next frame
    requestAnimationFrame(() => {this.update()});
  }

  startGame(){

    const cvs = this.refs.canvas;
    const context = cvs.getContext('2d');

    //Display webcam + training model for recognition
    let vision = new VisionRecognition();
    console.log("direction: "+ vision.direction);

    this.setState({
      canvas: cvs,
      context: context,
      vision: vision,
      gameActive: true,
      scorePlayer: 0,
      scoreAI: 0,
    });

    //Creat ball and players
    this.ball = new Ball();
    this.players = [new Player(), new Player()];

    this.players[0].pos.x = 40;
    this.players[0].pos.y = 0;
    this.players[1].pos.x = cvs.width - 40;
    this.players.forEach(p => {
      p.pos.y = cvs.height / 2
    });

    this.reset(cvs);
    this.listen(cvs);

    

  }

  reset(cvs)
  {
    const b = this.ball;
    b.vel.x = 0;
    b.vel.y = 0;
    b.pos.x = cvs.width / 2;
    b.pos.y = cvs.height / 2;
  }

  collide(player, ball)
  {
    if (player.left < ball.right && player.right > ball.left &&
      player.top < ball.bottom && player.bottom > ball.top) {
      ball.vel.x = -ball.vel.x * 1.05;
      const len = ball.vel.len;
      ball.vel.y += player.vel.y * .2;
      ball.vel.len = len;
    }
  }

  listen(canvas) 
  {
    canvas.addEventListener('click', () => this.play());
    /*
    canvas.addEventListener('mousemove', event => {
      const scale = event.offsetY / event.target.getBoundingClientRect().height;
      this.players[0].pos.y = canvas.height * scale;
    }); */

  }

  play()
  {
    const b = this.ball;
    if (b.vel.x === 0 && b.vel.y === 0) {
        b.vel.x = 200 * (Math.random() > .5 ? 1 : -1);
        b.vel.y = 200 * (Math.random() * 2 - 1);
        b.vel.len = this.initialSpeed;
    }
  }

  movePlayer() {
    if(this.state.direction == 0) {
      this.players[0].pos.y -= 10;
    } 
    else if(this.state.direction == 1) {
      this.players[0].pos.y += 10;
    }
  }

  renderScore() {
    let canvas = this.state.canvas;
    let ctx = this.state.context;
	const fontSize = 40;
    ctx.font = fontSize + "px oswald";
    ctx.fillStyle = "#fff";
    ctx.fillText(this.players[0].score, (canvas.width / 2) - 50 - fontSize/2, 50);
    ctx.fillText(this.players[1].score, (canvas.width / 2 + 50), 50);
  }

  render() {
    return (
      <canvas ref="canvas" width={gameWidth} height={gameHeight} id="pong" />
    );
  }
}

export default App;

