/* pp-circlefrenzy
 *
 * clear the screen of circles as quick as possible
 */

// State and Configuration -------------------------
var ppp = {
  world:{
    creatures:undefined,
    players:undefined
  },
  canvas:undefined,
  ctx:undefined,
  W:640,
  H:480,
  gamecomplete:false,
  settings: {
    fps:60,
    playerSize:50,
    numberOfCreatures:42,
    maxSpeed:4,
    maxRadius:8,
    boundsMargin:5,
  },
  screenrefresh:{
    start:undefined,
    now:undefined,
    then:undefined,
    interval:undefined,
    delta:undefined
  }
};

// Models ------------------------------------------

// Particle model
function Particle(x, y, vx, vy, r) {
  var x = x;
  var y = y;
  var vx = vx;
  var vy = vy;
  var r = r;
  this.updateVelocity = function() {
    x += vx;
    y += vy;
  }
  this.updateBoundary = function() {
    var B = ppp.settings.boundsMargin;
    if(p.x < 0) p.vx *= -1;
		if(p.y < 0) p.vy *= -1;
		if(p.x > ppp.W) p.vx *= -1;
		if(p.y > ppp.H) p.vy *= -1;
    }
  }
  this.getX = function() {
    return x;
  }
  this.getY = function() {
    return y;
  }

}

// Player model
function Player(x, y, vx, vy, r) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.r = r;
}

// Game World Loading -----------------------------

// generate the creatures
function generateParticles(n) {
  ppp.world.creatures = [];
  for(var i=0; i<n;i++) {
    var x = Math.random()*ppp.W;
    var y = Math.random()*ppp.H;
    var vx = Math.random()*ppp.settings.maxSpeed*2-ppp.settings.maxSpeed;
    var vy = Math.random()*ppp.settings.maxSpeed*2-ppp.settings.maxSpeed;
    var r = Math.random()*ppp.settings.maxRadius;
    ppp.world.creatures.push(new Particle(x,y, vx, vy, r));
  }
}

// generate the players
// TODO: add multiplayer support with multiple touches? networking?
function generatePlayers() {
  ppp.world.players = [];

  var x = Math.random()*ppp.W;
  var y = Math.random()*ppp.H;
  ppp.world.players.push(new Player(x,y,0,0,ppp.settings.playerSize));
}

// generate the world
function initializeWorld() {
  generateParticles(ppp.settings.numberOfCreatures);
  generatePlayers();
}

// Game World Updating ---------------------------
function printFPS() {
  //TODO
}


// the repeating game loop
function loop() {
  if(!ppp.gamecomplete) {
    window.requestAnimationFrame(loop);

    var s = ppp.screenrefresh;
    s.now = Date.now();
    s.delta = s.now - s.then;

    if (s.delta > s.interval) {
        s.then = s.now - (s.delta % s.interval);
        update();
        draw();
        printFPS();
    }
  }
}

// Collision check helper method
function boxesIntersect(a, b) {
  return (Math.abs(a.x - b.x) * 2 < (a.r + b.r)) &&
         (Math.abs(a.y - b.y) * 2 < (a.r + b.r));
}

function checkGameCompletion() {
  if(ppp.world.creatures == 0) {
    ppp.gamecomplete = true;
    setTimeout(function() {

    ppp.ctx.clearRect(0,0,ppp.W,ppp.H);
    var score = Date.now() - ppp.screenrefresh.start
    ppp.ctx.font = '50pt sans-serif';
    ppp.ctx.fillText('Congratulations!', ppp.W/2, ppp.H/2);
    ppp.ctx.font = '30pt sans-serif';
    ppp.ctx.fillText(score/1000 + ' seconds have passed', ppp.W/2, ppp.H/2+60);
    ppp.ctx.fillText('while clearing the screen of circles', ppp.W/2, ppp.H/2+100);

},10);
  } 
}

function updateCollisions(p) {
  for (var i = 0; i<ppp.world.players.length;i++) {
    var cp = ppp.world.players[i];
    if(boxesIntersect(cp,p)) {
      //hit! kill the creature
      ppp.world.creatures.splice(ppp.world.creatures.indexOf(p), 1);
      checkGameCompletion();
    }
  }

}

//update the scene
function update() {
  // update the players
  for (var i = 0; i<ppp.world.players.length;i++) {
    var p = ppp.world.players[i];
    //velocity
    p.updateVelocity();

    //boundary check
    p.updateBoundary();
  }

  // update the particlees
  for (var i = 0; i<ppp.world.creatures.length;i++) {
    var p = ppp.world.creatures[i];
    //velocity
    updateVelocity(p);

    //boundary check
    updateBoundary(p);

    //collission detection
    updateCollisions(p);
  }
}

//draw the scene
function draw() {
 ppp.ctx.clearRect(0, 0, ppp.canvas.width, ppp.canvas.height);
  //background color
  ppp.ctx.fillStyle = "grey";
  ppp.ctx.fillRect(0, 0, ppp.W, ppp.H);

  // draw the particles 
  for(var i = 0; i<ppp.world.creatures.length;i++) {
    var currentParticle = ppp.world.creatures[i];
    ppp.ctx.beginPath();
    ppp.ctx.fillStyle = "white";
    ppp.ctx.arc(currentParticle.x, 
                currentParticle.y, 
                currentParticle.r, 
                Math.PI*2, 
                false);
    ppp.ctx.fill();
    ppp.ctx.stroke();
  }
  
  // draw the players 
  for(var i = 0; i<ppp.world.players.length;i++) {
    var c = ppp.world.players[i];
    ppp.ctx.beginPath();
    ppp.ctx.fillStyle = "darkgrey";
    ppp.ctx.rect(c.x - c.r/2, 
                c.y - c.r/2, 
                c.r, 
                c.r, 
                Math.PI*2, 
                false);
    ppp.ctx.fill();
    ppp.ctx.stroke();
  }
    
    // draw the score labels
    var score = ppp.world.creatures.length;
    var time = Date.now() - ppp.screenrefresh.start
    ppp.ctx.font = '30pt sans-serif';
    ppp.ctx.fillText(Math.floor(time/1000) + 's', ppp.W/2, ppp.H-25);
    ppp.ctx.font = '10pt sans-serif';
    ppp.ctx.fillText(score + ' left', ppp.W/2, ppp.H-10);
}

// add event listeners for input
function initInputEvents () {
  function mousemove(event) {
     var currentPlayer = ppp.world.players[0]; 
     currentPlayer.x = event.x;
     currentPlayer.y = event.y;
  }

  function touchmove(event) {
     event.preventDefault();
     var currentPlayer = ppp.world.players[0]; 
     currentPlayer.x = event.touches[0].pageX;
     currentPlayer.y = event.touches[0].pageY;
  }
  ppp.canvas.addEventListener("touchmove", touchmove);
  ppp.canvas.addEventListener("mousemove", mousemove);

}

function requestAnimationFramePolyfill() {
    /**
    * Provides requestAnimationFrame in a cross browser way.
    * @author paulirish / http://paulirish.com/
    */
    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                window.setTimeout( callback, 1000 / 60 );
            };
        } )();
    }
}

// set the game timers and refresh interval
function initializeTimers() {
  ppp.screenrefresh.then = ppp.screenrefresh.start = Date.now();
  ppp.screenrefresh.interval = 1000/ppp.settings.fps;
}

// Initialize the canvas
function initializeCanvas() {
  ppp.canvas = document.getElementById("myCanvas");
  ppp.canvas.width = document.width;
  ppp.canvas.height = document.height;
  ppp.W = ppp.canvas.width;
  ppp.H = ppp.canvas.height;
  ppp.ctx = ppp.canvas.getContext("2d");

  //Initialize fonts
  ppp.ctx.font = '50pt sans-serif';
  ppp.ctx.textAlign = 'center';
}

// Entry point of application, runs when window is ready
window.onload = function() {
  requestAnimationFramePolyfill();
  initializeCanvas();
  initializeTimers();
  initializeWorld();
  initInputEvents();
  loop();
}
