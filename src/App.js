import React, { Component } from 'react';
import Ball from './Ball';
import Player from './Player';
import VisionRecognition from './VisionRecognition';
import './App.css';

let gameWidth=600, gameHeight=400;
let rounds = [5, 3, 1];
let colors = ['#202020', '#2ecc71', '#3498db'];

class App extends Component {

  constructor(props)
  {
    super(props);
    this.state = {
      canvas: null,
      context: null,
      vision: null,
      gameActive: false,
      round: 0,
      boardColor: "#202020",
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
    this.setVisionRecognition();
    this.initialize();
    requestAnimationFrame(() => {this.update()});
  }

  update() {

    const cvs = this.state.canvas;
    const context = this.state.context;

    if(this.state.gameActive) 
    {
      let dt = 0.02;
      const ball = this.ball;
      ball.pos.x += ball.vel.x * dt;
      ball.pos.y += ball.vel.y * dt;

      if (ball.right < 0 || ball.left > cvs.width) {
          ++this.players[ball.vel.x < 0 | 0].score;
          this.reset(cvs);
          this.play();
      }

      if ((ball.vel.y < 0 && ball.top < 0) || (ball.vel.y > 0 && ball.bottom > cvs.height)) {
          ball.vel.y = -ball.vel.y;

          //avoid having the ball bouncing vertically
          if(ball.vel.x < 10 && ball.vel.x > -10) ball.vel.x += 30;
      }

      //the AI will follow the ball with an offset factor that decreases after each round
      this.players[1].pos.y = ball.pos.y * (1.4 - this.state.round/10);

      //prevent the paddles from going outside the board region
      this.players.forEach(player => {
          if((player.pos.y - player.size.y/2) <= 0) player.pos.y = player.size.y/2;
          else if(player.pos.y >= (cvs.height - player.size.y/2))  player.pos.y = (cvs.height - player.size.y/2);
      });

      

      this.players.forEach(player => {
          player.update(dt);
          this.collide(player, ball);
      });

      //draw the board, the ball and the players
      this.draw();

      this.renderScore();

      this.setState({
        direction: this.state.vision.direction
      });

      this.movePlayer();

    }

    //if the player won the round
    if(this.players[0].score == rounds[this.state.round]) 
    {
      //if it's the last round, stop the game
      if(!rounds[this.state.round + 1]) {
        setTimeout(() => { this.drawText("Congrats! You won the game!"); }, 1000);
        this.setState({
          gameActive: false
        });
        cvs.addEventListener('click', () => {
          this.initialize();
        });
      } else {
        //if there are rounds left, reset score and increase difficulty (speed)
        //setTimeout(() => { this.drawText("You won this round! On to the next one!"); }, 1000);
        
        this.players.forEach(player => player.score = 0);
        
        this.ball.vel.x *= 1.3;
        this.ball.vel.y *= 1.3;

        let nextRound = this.state.round + 1;
        this.setState({
          round: nextRound,
          boardColor: colors[nextRound]
        });
      }
    }

    //if the AI won the game
    else if(this.players[1].score == rounds[this.state.round]) {
      this.setState({ gameActive: false });
      setTimeout(() => { this.drawText("Game over!"); }, 500);
      cvs.addEventListener('click', () => {
          this.initialize();
        });
    }

    // Next frame
    requestAnimationFrame(() => {this.update()});

  }

  setVisionRecognition() {
    //Display webcam + training model for recognition
    let vision = new VisionRecognition();

    this.setState({
      vision: vision
    });

  }

  initialize()
  {
    const cvs = this.refs.canvas;
    const context = cvs.getContext('2d');
    
    this.setState({
      canvas: cvs,
      context: context,
      gameActive: true,
      round: 0,
      boardColor: "#202020",
      direction: 2
    });

    //Create ball and players
    this.ball = new Ball();
    this.players = [new Player(), new Player()];

    this.players[0].pos.x = 40;
    this.players[0].pos.y = 0;
    this.players[1].pos.x = cvs.width - 40;
    this.players.forEach(p => {
      p.pos.y = cvs.height / 2
    });

    document.getElementById("game_menu").innerHTML = "Train the images for UP, DOWN, and IDLE" + 
                           "<br />"+ "<span>Then click the game to begin!</span>"; 

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
    
    canvas.addEventListener('mousemove', event => {
      const scale = event.offsetY / event.target.getBoundingClientRect().height;
      this.players[0].pos.y = canvas.height * scale;
    });

  }

  play()
  {
    document.getElementById("game_menu").innerHTML = "";  
    const b = this.ball;
    if (b.vel.x === 0 && b.vel.y === 0) {
        b.vel.x = 200 * (Math.random() > .5 ? 1 : -1);
        b.vel.y = 200 * (Math.random() * 2 - 1);
        b.vel.len = this.initialSpeed;
    }
  }

  /*
   * If ball in certain region of player, we automatically move player to block the ball
   */
  helpPlayer() {
    let playerPosX = this.players[0].pos.x;
    let playerPosY = this.players[0].pos.y;
    let playerHeight = this.players[0].size.y;
    let ballPosX = this.ball.pos.x;
    let ballPosY = this.ball.pos.y;
    let margin = 30;

    let topLimit = playerPosY + playerHeight/2 + margin;
    let bottLimit = playerPosY - playerHeight/2 - margin;

    let cdt1 = (ballPosY > playerPosY + playerHeight/2 && ballPosY < topLimit);
    let cdt2 = (ballPosY > bottLimit && ballPosY < playerPosY - playerHeight/2);

    if( (cdt1 || cdt2) && ballPosX < playerPosX + 30) {
      if(ballPosY > playerPosY) this.players[0].pos.y += 15;
      else this.players[0].pos.y -= 15;
    }
  }

  movePlayer() {
    this.helpPlayer();
    if(this.state.direction == 0) {
      this.players[0].pos.y -= 10;
    } 
    else if(this.state.direction == 1) {
      this.players[0].pos.y += 10;
    }
  }

  draw() {
    //draw board
    let cvs = this.state.canvas;
    let ctx = this.state.context;
    
    ctx.fillStyle = this.state.boardColor;
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    let img = new Image();
    img.src = "./img/texture-background-wallpaper-black-wood1-1920x1080.jpg";
    img.onload = function(){
      ctx.drawImage(img,0,0);   
    }

    ctx.shadowBlur=5;  //Add some shadows to every element
    ctx.shadowColor="#ddd"; //Silver
    
    //Draw the middle line
    ctx.beginPath();
    ctx.strokeStyle="#ddd";
    ctx.moveTo(cvs.width / 2, 60);
    ctx.lineTo(cvs.width / 2, cvs.height);
    ctx.stroke();

    this.ball.render(ctx);
    //this.players.forEach(player => player.render(context));
    this.players[0].renderPlayer1(ctx);
    this.players[1].renderPlayer2(ctx);
  }

  renderScore() {
    let canvas = this.state.canvas;
    let ctx = this.state.context;

    //round info
    let roundText = "Round " + (this.state.round + 1);
    let roundPts = rounds[this.state.round] + " pts";
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 0;
    ctx.font = 15 + "px oswald";
    ctx.textAlign = "center";
    ctx.fillText(roundText, (canvas.width / 2), 20);
    ctx.fillText(roundPts, (canvas.width / 2), 40);

    //score
    const fontSize = 40;
    ctx.font = fontSize + "px oswald";
    ctx.fillStyle = "#fff";
    ctx.fillText(this.players[0].score, (canvas.width / 2) - 100, 80);
    ctx.fillText(this.players[1].score, (canvas.width / 2 + 100), 80);

  }

  drawText(text) {
    let canvas = this.state.canvas;
    let ctx = this.state.context;
    const fontSize = 30;
    ctx.font = fontSize + "px oswald";
    ctx.shadowBlur = 2;
    ctx.shadowColor="#0086f8";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center"; 
    ctx.fillText(text, canvas.width/2, canvas.height/2);
  }

  render() {
    return (
      <canvas ref="canvas" width={gameWidth} height={gameHeight} id="pong" />
    );
  }
}

export default App;

