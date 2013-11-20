/* pp-circlefrenzy
 *
 * clear the screen of circles as quick as possible
 * @author Peter Peerdeman
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
        minRadius:2,
        maxRadius:10,
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
    var _x = x;
    var _y = y;
    var _vx = vx;
    var _vy = vy;
    var _r = r;

    // private functions
    function _updateVelocity() {
        _x += _vx;
        _y += _vy;
    }
    function _updateBoundary() {
        var B = ppp.settings.boundsMargin;
        if(_x < 0) _vx *= -1;
        if(_y < 0) _vy *= -1;
        if(_x > ppp.W) _vx *= -1;
        if(_y > ppp.H) _vy *= -1;
    }

    // public functions
    this.update = function() {
        _updateVelocity();
        _updateBoundary();
    };
    this.hasCollisionWithObject = function(b) {
        return (Math.abs(_x - b.getX()) * 2 < (_r + b.getR())) &&
            (Math.abs(_y - b.getY()) * 2 < (_r + b.getR()));
    }
    this.setX = function(x) {
        _x = x;
    }
    this.setY = function(y) {
        _y = y;
    }
    this.getX = function() {
        return _x;
    }
    this.getY = function() {
        return _y;
    }
    this.getR = function() {
        return _r;
    }
}

// Game World Loading -----------------------------

// generate the creatures
// @param n number of creatures to spawn
function generateParticles(n) {
    ppp.world.creatures = [];
    for(var i=0; i<n;i++) {
        var x = Math.random()*ppp.W;
        var y = Math.random()*ppp.H;
        var vx = Math.random()*ppp.settings.maxSpeed*2-ppp.settings.maxSpeed;
        var vy = Math.random()*ppp.settings.maxSpeed*2-ppp.settings.maxSpeed;
        var r = Math.max(Math.random()*ppp.settings.maxRadius,ppp.settings.minRadius);
        ppp.world.creatures.push(new Particle(x,y, vx, vy, r));
    }
}

// generate the players
// TODO: add multiplayer support with multiple touches? networking?
function generatePlayers() {
    ppp.world.players = [];
    var x = Math.random()*ppp.W;
    var y = Math.random()*ppp.H;
    ppp.world.players.push(new Particle(x,y,0,0,ppp.settings.playerSize));
}

// generate the world
function initializeWorld() {
    generateParticles(ppp.settings.numberOfCreatures);
    generatePlayers();
}

// Loops and updates ----------------------------------

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
        }
    } else {
        gameComplete();
    }
}

//update the world
function update() {
    // update the players
    for (var i = 0; i<ppp.world.players.length;i++) {
        var p = ppp.world.players[i];
        // update the player
        p.update();
    }

    // update the creature
    for (var i = 0; i<ppp.world.creatures.length;i++) {
        var p = ppp.world.creatures[i];
        // update the creature
        p.update();

        //collission detection with players
        for (var j = 0; j<ppp.world.players.length;j++) {
            var cp = ppp.world.players[j];
            if(cp.hasCollisionWithObject(p)) {
                //hit! kill the creature!
                ppp.world.creatures.splice(ppp.world.creatures.indexOf(p), 1);
                if(ppp.world.creatures == 0) {
                    ppp.gamecomplete = true;
                }
            }
        }
    }
}

//draw the world
function draw() {
    //background color
    ppp.ctx.fillStyle = "grey";
    ppp.ctx.fillRect(0, 0, ppp.W, ppp.H);

    // draw the creatures 
    for(var i = 0; i<ppp.world.creatures.length;i++) {
        var c = ppp.world.creatures[i];
        ppp.ctx.beginPath();
        ppp.ctx.fillStyle = "white";
        ppp.ctx.arc(c.getX(), 
                    c.getY(), 
                    c.getR(), 
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
        ppp.ctx.rect(c.getX() - c.getR()/2, 
                    c.getY()- c.getR()/2, 
                    c.getR(), 
                    c.getR(), 
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

// End Game and Scoreboard ----------------------------------

function gameComplete() {
    ppp.ctx.clearRect(0,0,ppp.W,ppp.H);
    var score = Date.now() - ppp.screenrefresh.start
    ppp.ctx.font = '50pt sans-serif';
    ppp.ctx.fillText('Congratulations!', ppp.W/2, ppp.H/2-40);
    ppp.ctx.font = '30pt sans-serif';
    ppp.ctx.fillText(score/1000 + ' seconds have passed', ppp.W/2, ppp.H/2+20);
    ppp.ctx.fillText('while clearing the circles', ppp.W/2, ppp.H/2+60);
    ppp.ctx.fillText('on a ' + ppp.W + 'x' + ppp.H + ' screen', ppp.W/2,ppp.H/2+100);

    // show the dom for restart button and facebook like
    document.getElementById("pp-postgame-dom").className = "";
         
    // analytics
    if(_gaq) {
			_gaq.push(['_trackEvent', 'Games', 'circlefrenzy game completed', score]);
		}     
}


// IO -------------------------------------------------------- 
function initInputEvents () {
    function mousemove(event) {
        var currentPlayer = ppp.world.players[0]; 
        currentPlayer.setX(event.x);
        currentPlayer.setY(event.y);
    }

    function touchmove(event) {
        event.preventDefault();
        var currentPlayer = ppp.world.players[0]; 
        currentPlayer.setX(event.touches[0].pageX);
        currentPlayer.setY(event.touches[0].pageY);
    }
    ppp.canvas.addEventListener("touchmove", touchmove);
    ppp.canvas.addEventListener("mousemove", mousemove);

}

// Helpers ---------------------------------------------------
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

// Initialization --------------------------------------------

// set the game timers and refresh interval
function initializeTimers() {
    ppp.screenrefresh.then = ppp.screenrefresh.start = Date.now();
    ppp.screenrefresh.interval = 1000/ppp.settings.fps;
}

// Initialize the canvas
function initializeCanvas() {
    ppp.canvas = document.getElementById("myCanvas");
    ppp.canvas.width = window.innerWidth; // Replaced for document.width
    ppp.canvas.height = window.innerHeight; // Replaced for document.height
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
