/// <reference path="phaser.js" />
var SCREEN_WIDTH = 500;
var SCREEN_HEIGHT = 600;

var MAP_VELOCITY_X = SCREEN_WIDTH / -2
var GRAVITY_Y = SCREEN_WIDTH * 2;
var BIRD_WIDTH = 45 * SCREEN_WIDTH / 600;
var BIRD_HEIGHT = BIRD_WIDTH;
var BIRD_VELOCITY_Y = SCREEN_WIDTH * -6 / 8;
var POWERUP_WIDTH = BIRD_WIDTH;
var POWERUP_HEIGHT = BIRD_HEIGHT;
var GROUND_HEIGHT = SCREEN_HEIGHT / 8;
var PIPE_WIDTH = SCREEN_WIDTH / 6;
var PIPE_HEIGHT = SCREEN_HEIGHT / 8;
var PIPE_HEAD_WIDTH = SCREEN_WIDTH / 5;
var PIPE_HEAD_HEIGHT = SCREEN_HEIGHT / 16;

var gameCount = 0; // used to iterate background/bird colour

window.onload = function () {
    document.getElementById("gameDiv").setAttribute("style", "width:" + SCREEN_WIDTH + "px;height:" + SCREEN_HEIGHT + "px; margin: 0 auto");
}


// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {

    //render: function () {
    //    game.debug.body(this.bird);
    //},

    preload: function () {
        // This function will be executed at the beginning     
        // That's where we load the game's assets  
        game.load.image('background1', 'assets/bg1.png');
        game.load.image('background2', 'assets/bg2.png');
        game.load.image('ground', 'assets/ground.png');
        game.load.image('tap', 'assets/Tap.png');
        game.load.image('getReady', 'assets/GetReady.png');
        game.load.spritesheet('redBird', 'assets/RedBird.png', 64, 64, 3);
        game.load.spritesheet('blueBird', 'assets/BlueBird.png', 64, 64, 3);
        game.load.spritesheet('yellowBird', 'assets/YellowBird.png', 64, 64, 3);
        game.load.image('bonusPoints', 'assets/BonusPoints.png');
        game.load.image('pipe', 'assets/MiddlePipe.png');
        game.load.image('pipeHead', 'assets/EndPipe.png');
        game.load.image('gameOver', 'assets/GameOver.png');
        game.load.image('record', 'assets/Record.png');
        game.load.image('goldMedal', 'assets/GoldMedal.png');
        game.load.image('silverMedal', 'assets/SilverMedal.png');
        game.load.image('bronzeMedal', 'assets/BronzeMedal.png');
        game.load.image('continue', 'assets/Continue.png');
        game.load.image('share', 'assets/Share.png');
        game.load.audio('woosh', 'assets/woosh.wav');
        game.load.audio('jump', 'assets/jump.wav');
        game.load.audio('score', 'assets/score.wav');
        game.load.audio('smack', 'assets/smack.wav');
    },

    create: function () {
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 0;
        game.physics.p2.gravity.y = GRAVITY_Y;

        this.birdCollisionGroup = game.physics.p2.createCollisionGroup();
        this.pipeCollisionGroup = game.physics.p2.createCollisionGroup();
        this.powerUpCollisionGroup = game.physics.p2.createCollisionGroup();

        // Initialize background 
        this.background = gameCount % 2 == 0 ? game.add.sprite(0, 0, 'background1') : game.add.sprite(0, 0, 'background2');
        this.background.width = game.width;
        this.background.height = game.height;

        this.ground1 = game.add.sprite(0, SCREEN_HEIGHT * 7 / 8, 'ground');
        this.ground1.width = SCREEN_WIDTH;
        this.ground1.height = GROUND_HEIGHT;
        game.physics.arcade.enable(this.ground1);
        this.ground1.body.velocity.x = MAP_VELOCITY_X;

        this.ground2 = game.add.sprite(SCREEN_WIDTH, SCREEN_HEIGHT * 7 / 8, 'ground');
        this.ground2.width = SCREEN_WIDTH;
        this.ground2.height = GROUND_HEIGHT;
        game.physics.arcade.enable(this.ground2);
        this.ground2.body.velocity.x = MAP_VELOCITY_X;

        this.tap = game.add.sprite(SCREEN_WIDTH * 1 / 2 - (SCREEN_WIDTH / 3) / 2, SCREEN_HEIGHT * 4.5 / 10, 'tap');
        this.tap.width = SCREEN_WIDTH * 1 / 3;
        this.tap.height = SCREEN_HEIGHT * 2 / 10;

        this.getReady = game.add.sprite(SCREEN_WIDTH * 1 / 2 - (SCREEN_WIDTH * 2 / 3) / 2, SCREEN_HEIGHT * 2.5 / 10 + 15, 'getReady');
        this.getReady.width = SCREEN_WIDTH * 2 / 3;
        this.getReady.height = SCREEN_HEIGHT * 1 / 8;

        // Display the bird on the screen
        if (gameCount % 3 == 0) {
            this.bird = this.game.add.sprite(game.world.centerX * 6 / 10, game.world.centerY, 'redBird');
        }
        else if (gameCount % 3 == 1) {
            this.bird = this.game.add.sprite(game.world.centerX * 6 / 10, game.world.centerY, 'blueBird');
        }
        else {
            this.bird = this.game.add.sprite(game.world.centerX * 6 / 10, game.world.centerY, 'yellowBird');
        }

        this.bird.width = BIRD_WIDTH;
        this.bird.height = BIRD_HEIGHT;
        game.physics.p2.enable(this.bird);
        this.bird.body.data.gravityScale = 0;
        this.bird.body.setCircle(this.bird.width / 2);
        this.bird.body.data.shapes[0].sensor = true;   // Set sensor after body shape is set 
        this.bird.body.fixedRotation = true;
        this.bird.body.setCollisionGroup(this.birdCollisionGroup);
        this.bird.body.onBeginContact.add(this.hitPipe, this);
        this.bird.body.collides([this.pipeCollisionGroup, this.powerUpCollisionGroup]);
        var flap = this.bird.animations.add('flap');
        this.bird.animations.play('flap', 10, true);

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        // Call the 'jump' function when the screen is tapped is hit
        //game.input.ontap(this.jump, this);

        // Create sounds
        this.wooshSound = game.add.audio('woosh');
        this.jumpSound = game.add.audio('jump');
        this.scoreSound = game.add.audio('score');
        this.smackSound = game.add.audio('smack');

        // Create pipe group
        this.pipes = game.add.group();
        this.pipes.createMultiple(15, 'pipe');
        this.pipes.forEach(function (p) {
            p.width = PIPE_WIDTH;
            p.height = PIPE_HEIGHT;
            game.physics.p2.enable(p);
            p.body.data.gravityScale = 0;
            p.body.setRectangle(p.width, p.height, 0.5 * p.width, 0.5 * p.height);
            p.body.setCollisionGroup(this.pipeCollisionGroup);
            p.body.collides(this.birdCollisionGroup);
            p.body.static = true;
        }, this)

        this.pipeHeads = game.add.group();
        this.pipeHeads.createMultiple(6, 'pipeHead');
        this.pipeHeads.forEach(function (p) {
            p.width = PIPE_HEAD_WIDTH;
            p.height = PIPE_HEAD_HEIGHT;
            game.physics.p2.enable(p);
            p.body.data.gravityScale = 0;
            p.body.setRectangle(p.width, p.height, 0.5 * p.width, 0.5 * p.height);
            p.body.setCollisionGroup(this.pipeCollisionGroup);
            p.body.collides(this.birdCollisionGroup);
            p.body.static = true;
        }, this)

        // Create pipes every 1.25 seconds
        this.timerPipe = game.time.events.loop(1250, this.addRowOfPipes, this);
        
        // Create bonus points
        this.powerUps = game.add.group();
        this.powerUps.createMultiple(5, 'bonusPoints');
        this.powerUps.forEach(function (p) {
            p.width = POWERUP_WIDTH;
            p.height = POWERUP_HEIGHT;
            game.physics.p2.enable(p);
            p.body.data.gravityScale = 0;
            p.body.setRectangle(p.width, p.height, 0.5 * p.width, 0.5 * p.height);
            p.body.setCollisionGroup(this.powerUpCollisionGroup);
            p.body.collides(this.birdCollisionGroup);
            p.body.static = true;
        }, this)

        this.timerPowerUp = game.time.events.loop(game.rnd.integerInRange(700, 1000), this.addPowerUp, this);
        this.emitter = game.add.emitter(0, 0, 100);
        this.emitter.makeParticles('bonusPoints');
        this.emitter.gravity = GRAVITY_Y;

        // Keep track of current pipes on screen, where each index contains a pipe (chose bottom head) that represents the entire row
        this.currentRow = new Array();

        // Keep track of score 
        this.score = 0;
        this.labelScore = game.add.text(SCREEN_WIDTH / 2 - 15, SCREEN_HEIGHT * 1 / 6, "0", { font: "50px Dimitri", fill: "#ffffff" });
        if (localStorage.getItem('score') == null)
            localStorage.setItem('score', 0);

        // Create Pause button
        this.labelPause = game.add.text(0, 15, "Pause", { font: "50px Dimitri", fill: "#ffffff" });
        this.labelPause.anchor.setTo(1, 0);  // Horizontal Alignment to right
        this.labelPause.x = SCREEN_WIDTH - 15;
        this.labelPause.inputEnabled = true;
        this.labelPause.events.onInputDown.add(this.pause, this);
        // Add in ability to resume
        game.input.onDown.add(this.resume, this);

        this.gameStart = false;
        ++gameCount;
    },


    update: function () {
        // This function is called 60 times per second    
        // It contains the game's logic   
        if (this.gameStart)
            this.bird.body.data.gravityScale = 1;

        if (this.bird.y <= this.bird.height * 0.5)
            this.bird.body.moveDown(10);

        // bird has some transparant vertical overhead, so bird.y will not match ground1.y. Also account for anchor offset
        if (this.bird.y >= this.ground1.y - this.bird.height * 0.5) {
            this.hitGround();
        }
        // Don't change bird angle before game starts
        if (this.bird.angle > -0 && !this.gameStart) {
            this.bird.angle = 0;
        } // constantly lower the bird's angle to -90 
        else if (this.bird.angle < 90 && this.gameStart) {
            this.bird.angle += 2;
        }

        // Scroll the ground to the left 
        if (this.ground1.x <= -SCREEN_WIDTH + 3)
            this.ground1.x = SCREEN_WIDTH;

        if (this.ground2.x <= -SCREEN_WIDTH + 3)
            this.ground2.x = SCREEN_WIDTH;

        this.checkPipes();
    },

    jump: function () {
        // Set boolean to true to allow for pipes to spawn 
        if (!this.gameStart) {
            game.add.tween(this.tap).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.add.tween(this.getReady).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
        }
        this.gameStart = true;
        if (this.bird.alive == false)
            return;

        this.bird.body.velocity.y = BIRD_VELOCITY_Y;
        var animation = game.add.tween(this.bird);
        animation.to({ angle: -40 }, 100);
        animation.start();
        this.jumpSound.play();
    },

    // Check when to add score after passing pipe
    checkPipes: function () {
        if (this.currentRow.length == 0)
            return;
        else {
            if (this.bird.x >= this.currentRow[0].x + this.currentRow[0].width) {
                this.currentRow.splice(0, 1);   // Delete first index of array 
                this.labelScore.text = ++this.score;
                this.scoreSound.play();
            }
        }
    },

    pause: function (item) {
        if (this.bird.alive) {
            game.paused = true;
            this.labelPause.text = "Resume";
        }
    },

    resume: function (event) {
        if (this.game.paused) {
            game.paused = false;
            if (this.labelPause != null)
                this.labelPause.text = "Pause";
        }
    },

    hitPipe: function (body, bodyB, shapeA, shapeB, equation) {
        if (!this.bird.alive)  // Don't play smack sound again if already hit pipe
            return;

        if (body.sprite.key == "pipe" || body.sprite.key == "pipeHead") {
            this.bird.body.velocity.x = 0;
            this.bird.alive = false;
            this.bird.body.setRectangle(0, 0);   // Let the bird fall through pipes to hit the ground
            this.smackSound.play();
            this.endGame();
        }
        else if (body.sprite.key == "bonusPoints") {
            this.labelScore.text = ++this.score;
            this.scoreSound.play();
            this.emitter.x = body.x;
            this.emitter.y = body.y;
            this.emitter.start(true, 1500, null, 10);
            body.sprite.kill();
        }
    },

    // Stops the bird from moving once it hits ground
    hitGround: function () {
        this.bird.body.velocity.y = 0;
        this.bird.body.data.gravityScale = 0;
        if (this.bird.alive) {  // If alive still, means it did not die from pipe, so finish up the work
            this.smackSound.play();
            this.bird.alive = false;
            this.bird.bringToTop();
            this.endGame();
        }
    },

    // Stops everything in the game
    endGame: function () {
        this.bird.alive = false;

        game.world.bringToTop(this.bird);
        game.world.bringToTop(this.ground1);
        game.world.bringToTop(this.ground2);
        game.time.events.remove(this.timerPipe);
        game.time.events.remove(this.timerPowerUp);

        this.pipes.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);
        this.pipeHeads.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);
        this.powerUps.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);

        this.ground1.body.velocity.x = 0;
        this.ground2.body.velocity.x = 0;

        this.labelScore.alpha = 0;
        this.labelScore.x = SCREEN_WIDTH * 3 / 4;
        this.labelScore.y = game.world.centerY * 8 / 10;

        if (this.score > localStorage.getItem('score')) {
            localStorage.setItem('score', this.score);
        }

        this.gameOver = game.add.sprite((SCREEN_WIDTH - SCREEN_WIDTH * 2 / 3) / 2, SCREEN_HEIGHT * 1 / 10, "gameOver");
        this.gameOver.alpha = 0;
        this.gameOver.width = SCREEN_WIDTH * 2 / 3;
        this.gameOver.height = SCREEN_HEIGHT * 2 / 11;

        this.record = game.add.sprite((SCREEN_WIDTH - SCREEN_WIDTH * 4 / 5) / 2, SCREEN_HEIGHT * 3 / 10, "record");
        this.record.alpha = 0;
        this.record.width = SCREEN_WIDTH * 4 / 5;
        this.record.height = SCREEN_HEIGHT * 3 / 9;

        if (this.score >= 20) {
            if (this.score >= 50) {
                this.medal = game.add.sprite(SCREEN_WIDTH * 1.8 / 10, SCREEN_HEIGHT * 4 / 10, "goldMedal");
            }
            else if (this.score >= 35) {
                this.medal = game.add.sprite(SCREEN_WIDTH * 1.8 / 10, SCREEN_HEIGHT * 4 / 10, "silverMedal");
            }
            else if (this.score >= 20)
                this.medal = game.add.sprite(SCREEN_WIDTH * 1.8 / 10, SCREEN_HEIGHT * 4 / 10, "bronzeMedal");

            this.medal.alpha = 0;
            this.medal.width = SCREEN_WIDTH * 2 / 10;
            this.medal.height = SCREEN_HEIGHT * 2 / 10;
            this.medal.bringToTop();
        }

        this.labelHighScore = game.add.text(SCREEN_WIDTH * 3 / 4, game.world.centerY * 1.05, localStorage.getItem('score'), { font: "50px Dimitri", fill: "#ffffff" });
        this.labelHighScore.alpha = 0;

        this.continue = game.add.button(SCREEN_WIDTH * 1 / 10, SCREEN_HEIGHT * 7 / 8 - SCREEN_HEIGHT * 1.5 / 9, "continue", this.continueClick, this);
        this.continue.alpha = 0;
        this.continue.width = SCREEN_WIDTH / 3;
        this.continue.height = SCREEN_HEIGHT * 1.5 / 9;

        this.share = game.add.button(SCREEN_WIDTH * 6 / 10, SCREEN_HEIGHT * 7 / 8 - SCREEN_HEIGHT * 1.5 / 9, "share", this.shareClick, this);
        this.share.alpha = 0;
        this.share.width = SCREEN_WIDTH / 3;
        this.share.height = SCREEN_HEIGHT * 1.5 / 9;

        this.labelScore.bringToTop();

        game.add.tween(this.gameOver).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);
        game.add.tween(this.record).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        if (this.medal != null) game.add.tween(this.medal).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.labelScore).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.labelHighScore).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.continue).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.share).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
    },

    continueClick: function () {
        this.wooshSound.play();
        this.restartGame();
    },

    shareClick: function () {
        var url = "https://twitter.com/intent/tweet?text=I+scored+" + this.score + "+points+on+Flappy+Bird!+Try+to+beat+me+at+Kanac.github.io/Flappy-Bird+now!"
        window.open(url);
    },

    restartGame: function () {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
        if (this.bird.alive)
            this.smackSound.play();
    },

    addOnePipe: function (x, y, isHead) {
        // Get the first dead pipe of our group
        var pipe = isHead ? this.pipeHeads.getFirstDead() : this.pipes.getFirstDead();
        pipe.anchor.setTo(0);

        // Set the new position of the pipe
        if (isHead)
            // Calculate where to place pipehead so thats its in the middle of a pipe
            pipe.reset((x - (this.pipeHeads.getFirstDead().width - this.pipes.getFirstDead().width) / 2), y);
        else
            pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = MAP_VELOCITY_X;

        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
        return pipe;
    },

    addRowOfPipes: function () {
        if (!this.gameStart)
            return;

        // Pick where the hole will be (number from 2 to 6)
        var hole = Math.floor(Math.random() * 5) + 2;

        // Add the 5 pipes (iterate 7 times so that 2 spots are holes with 5 pipes)
        for (var i = 8; i > 1; i--) {
            if (i == hole + 2) {
                // Place bottom pipe head and choose this pipe to keep track of to represent the row for scoring
                // Y calculation means take the current step size away from the ground and account for anchor offset to place it level with previous pipe
                this.currentRow.push(this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8) + (SCREEN_HEIGHT / 8 - SCREEN_HEIGHT / 16), true));
            }
            else if (i == hole) {
                // Place top pipe head
                this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8), true);
            }
            else if (i != hole + 1) {
                this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8), false);
                }
        }
    },

    addPowerUp: function () {
        // Change delay of next power up spawn
        this.timerPowerUp.delay = game.rnd.integerInRange(700, 1000);

        // Ensure game has started and that there are no pipes near this power up 
        if (!this.gameStart) 
            return;

        // Don't spawn in the interval between game start and first pipe. May collide with a pipe. 
        if (this.currentRow.length == 0)
            return;

        if (this.currentRow.length > 0) {
            var frontPipe = this.currentRow[this.currentRow. length -1];
            if (frontPipe.x >= SCREEN_WIDTH - frontPipe.width || frontPipe.x <= SCREEN_WIDTH * 5.5 / 8)
                return;
        }

        // Pick additional time to wait (has to not collide with a pipe row)
        var randY = Math.floor(Math.random() * SCREEN_WIDTH * 6 / 8);

        var powerUp = this.powerUps.getFirstDead();
        powerUp.anchor.setTo(0, 0);
        powerUp.reset(SCREEN_WIDTH, randY);
        powerUp.body.velocity.x = MAP_VELOCITY_X;
        powerUp.checkWorldBounds = true;
        powerUp.outOfBoundsKill = true;
    }
};


// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');

