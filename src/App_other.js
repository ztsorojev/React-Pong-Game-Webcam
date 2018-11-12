let gameWidth = document.documentElement.clientWidth,
    gameHeight = document.documentElement.clientHeight;
if(gameWidth > 800){
  gameWidth = 800;
}
let player1Score = 0,
    player2Score = 0,
    gameOver = false,
    winner = "",
    monkey = false;

var Game = React.createClass({
  componentDidMount: function(){
    $(".buttonRight").hide();
    $("#butt2").hide();
    this.update();
  },
  update: function(){
    const Width = gameWidth,
          Height = gameHeight,
          ctx = this.refs.canvas.getContext('2d'),
          fps = 60,
          paddleWidth = 100;
    let ballY = Height/2,
        ballX = Width/2,
        ballRadius = 6,
        ballSpeedY = 0,
        ballSpeedX = Height/75;
    let paddle1Y = Height / 2 - (paddleWidth/2),
        paddle2Y = Height / 2 - (paddleWidth/2),
        paddleSpeed = 6;    
    
    function KeyListener() {
      this.pressedKeys = [];
      this.keydown = function(e) { this.pressedKeys[e.keyCode] = true };
      this.keyup = function(e) { this.pressedKeys[e.keyCode] = false };
      document.addEventListener("keydown", this.keydown.bind(this));
      document.addEventListener("keyup", this.keyup.bind(this));
    }
    KeyListener.prototype.isPressed = function(key){
      return this.pressedKeys[key] ? true : false;
    };
    KeyListener.prototype.addKeyPressListener = function(keyCode, callback){
      document.addEventListener("keypress", function(e) {
        if (e.keyCode == keyCode)
          callback(e);
      });
    };   
    var keys = new KeyListener();
    
    var reset = function(){
      ballY = Height/2;
      ballX = Width/2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = 0;
    }
    // draw everything on screen
    var drawAll = function(){
      // screen
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, Width, Height);      
      // middle dashed line
      ctx.strokeStyle = "#fff";
      ctx.setLineDash([10]);
      ctx.beginPath();
      ctx.moveTo(Width / 2,0);
      ctx.lineTo(Width / 2, Height);
      ctx.stroke();
      // score
      ctx.font = "30px Orbitron";
      ctx.fillStyle = "#888";
      ctx.fillText(player1Score,((Width/2)/2),100);
      ctx.fillText(player2Score,((Width/2)*1.5),100);
      // 2 rects
      ctx.fillStyle = "#fff";    
      ctx.fillRect(0, paddle1Y, 10, paddleWidth);    
      ctx.fillRect(Width -10, paddle2Y, 10, paddleWidth);
      // ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
      ctx.fill();
    }
    // move stuff begore drawing again
    var moveAll = function(){
      // ball movement
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      
      // horizontal 
      if(ballX > Width || ballX < 0){
        // right side collision
        if(ballX > Width/2 &&
           (ballY >= paddle2Y && ballY <= paddle2Y + paddleWidth)){
          ballSpeedX = -ballSpeedX;
          let deltaY = ballY - (paddle2Y + paddleWidth/2);
          ballSpeedY = deltaY * 0.35;
        }else if(ballX < Width/2 &&
           (ballY >= paddle1Y && ballY <= paddle1Y + paddleWidth)){
          ballSpeedX = -ballSpeedX;
          let deltaY = ballY - (paddle1Y + paddleWidth/2);
          ballSpeedY = deltaY * 0.35;
        }
        else{
          if(ballX < Width/2){
            player2Score++;
            if(player2Score === 11){
              winner = "PLAYER2"
              gameOver = true;
            }
          }else{
            player1Score++;
            if(player1Score === 11){
              winner = "PLAYER1"
              gameOver = true;
            }
          }
          reset();          
        }
      }// vertical 
      if(ballY > Height || ballY < 0){        
        ballSpeedY = -ballSpeedY;
      }
      // ai paddle movement, limits at canvas boundaries to make it more efficient
      if(!monkey){
        if(ballY > paddle2Y+paddleWidth/3 && (paddle2Y + paddleWidth) < Height){
          paddle2Y += paddleSpeed;
        }else if(ballY < paddle2Y+paddleWidth/3 && paddle2Y > 0){
          paddle2Y -= paddleSpeed;
        }
      }else{
          if (keys.isPressed(40) && (paddle2Y + paddleWidth) < Height) { // DOWN
          paddle2Y += paddleSpeed;
        } else if (keys.isPressed(38) && paddle2Y > 0) { // UP
          paddle2Y -= paddleSpeed;
        }
      }
      // player1 paddle movement thanks to
      // http://blog.mailson.org/2013/02/simple-pong-game-using-html5-and-canvas
      // same limits as ai for efficiency 
      if (keys.isPressed(83) && (paddle1Y + paddleWidth) < Height) { // DOWN
        paddle1Y += paddleSpeed;
      } else if (keys.isPressed(87) && paddle1Y > 0) { // UP
        paddle1Y -= paddleSpeed;
      }
    }
    // draw default if changing game type, else save last draw 
    var GameOver = function(){
      ballSpeedY = 0;
      paddle1Y = Height/2 - paddleWidth/2;
      paddle2Y = Height/2 - paddleWidth/2;
      player1Score = 0;
      player2Score = 0;
      ctx.textAlign = "center";
      if(winner !== ""){
        ctx.fillStyle = "#888";
        ctx.font = "36px Orbitron";
        ctx.fillText(winner + " WON!",Width/2,150);
      }else{
        ballY = Height/2;
        ballX = Width/2;
        drawAll();
        gameOver = true;
      }
      ctx.font = "14px Roboto Mono";
      ctx.fillText("Click anywhere to start a new game.",Width/2,200);
      document.addEventListener("mousedown",function(){
        gameOver = false;
        winner = "";
      });
    }
    // trigger 2 monkeys
    $("#butt1").click(function(){
      ballY = Height/2;
      ballX = Width/2;
      GameOver();
      monkey = true;
      $(this).hide();
      $("#butt2").show();
      $(".buttonRight").show();
    })
    // trigger AI
    $("#butt2").click(function(){
      GameOver();
      monkey = false;
      $(this).hide();
      $("#butt1").show();
      $(".buttonRight").hide();
    })
    // to block automatic start
    GameOver();
    // default 60fps
    setInterval(function(){
      if(gameOver === false){
        moveAll();
        drawAll();
      }else{
        GameOver();
      }
    }, 1000/fps);
  },
  render: function(){
    return(
      <div>
        <canvas ref="canvas" width={gameWidth}
          height={gameHeight} id="gameCanvas" />
        <div className="buttons buttonLeft">W</div>
        <div className="buttons buttonLeft" id="buttonS">S</div>
        <div className="buttons buttonRight" id="buttonUp">Up</div>
        <div className="buttons buttonRight">Down</div>
        <button className="buttons" id="butt1">vs Computer</button>
        <button className="buttons" id="butt2">2 Players</button>
      </div>
      )
  }
});

ReactDOM.render(<Game />,
document.getElementById('app'));