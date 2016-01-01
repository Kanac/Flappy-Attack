/// <reference path="phaser.js" />

var SCREEN_WIDTH = 500;
var SCREEN_HEIGHT = 600;

window.onload = function () {
    document.getElementById("gameDiv").setAttribute("style", "width:" + SCREEN_WIDTH + "px;height:" + SCREEN_HEIGHT + "px; margin: 0 auto");
}

// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the game's assets  
        game.load.image('background', 'assets/bg.png');
        game.load.image('ground', 'assets/ground.png');
        game.load.image('tap', 'assets/Tap.png');
        game.load.image('getReady', 'assets/GetReady.png');
        game.load.spritesheet('redBird', 'assets/RedBird.png', 64, 46, 3);
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

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.Arcade);
        // Initialize background 
        this.background = game.add.sprite(0, 0, 'background');
        this.background.width = game.width;
        this.background.height = game.height;

        this.ground1 = game.add.sprite(0, SCREEN_HEIGHT * 7/8, 'ground');
        this.ground1.width = SCREEN_WIDTH;
        this.ground1.height = SCREEN_HEIGHT / 8;
        game.physics.arcade.enable(this.ground1);
        this.ground1.body.velocity.x = SCREEN_WIDTH / -2;

        this.ground2 = game.add.sprite(SCREEN_WIDTH, SCREEN_HEIGHT * 7/8, 'ground');
        this.ground2.width = SCREEN_WIDTH;
        this.ground2.height = SCREEN_HEIGHT / 8;
        game.physics.arcade.enable(this.ground2);
        this.ground2.body.velocity.x = SCREEN_WIDTH / -2;

        this.tap = game.add.sprite(SCREEN_WIDTH *1/2 - (SCREEN_WIDTH/3)/2, SCREEN_HEIGHT / 2 + 15, 'tap');
        this.tap.width = SCREEN_WIDTH * 1 / 3;
        this.tap.height = SCREEN_HEIGHT * 1 / 10;

        this.getReady = game.add.sprite(SCREEN_WIDTH * 1/2 - (SCREEN_WIDTH*2/3)/2, SCREEN_HEIGHT * 2.5 / 10 +15, 'getReady');
        this.getReady.width = SCREEN_WIDTH * 2 / 3;
        this.getReady.height = SCREEN_HEIGHT * 1 / 8;

        // Die when past the ground
        game.world.height = SCREEN_HEIGHT - SCREEN_HEIGHT * 1 / 8;

        // Display the bird on the screen
        //this.bird = this.game.add.sprite(100, 245, 'bird');
        this.bird = this.game.add.sprite(game.world.centerX * 6/ 10, game.world.centerY, 'redBird');
        this.bird.width = 45 * SCREEN_WIDTH / 400;
        this.bird.height = 32 * SCREEN_HEIGHT / 490;
        this.bird.anchor.setTo(-0.2, 0.5);

        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        
        // Add animation
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
        this.pipes = game.add.group(); // Create a group  
        this.pipes.enableBody = true;  // Add physics to the group  
        this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes  
        this.pipes.forEach(function (p) {
            p.width = SCREEN_WIDTH / 5;
            p.height = SCREEN_HEIGHT / 8;
            p.body.setSize(SCREEN_WIDTH/5, SCREEN_HEIGHT/8, 0, 0);
        }, this)

        this.pipeHeads = game.add.group();
        this.pipeHeads.enableBody = true;
        this.pipeHeads.createMultiple(10, 'pipeHead');
        this.pipeHeads.forEach(function (p) {
            p.width = SCREEN_WIDTH / 4;
            p.height = SCREEN_HEIGHT / 16;
            p.body.setSize(SCREEN_WIDTH / 4, SCREEN_HEIGHT / 16, 0, 0);
        }, this)

        // Create pipes every 1.5 seconds
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        this.gameStart = false;

        // Keep track of current pipe on screen
        this.currentPipe = null;
        this.nextPipe = null;

        // Keep track of score 
        this.score = 0;
        this.labelScore = game.add.text(SCREEN_WIDTH / 2 - 15, SCREEN_HEIGHT * 1 / 6, "0", { font: "50px Dimitri", fill: "#ffffff" });
        if (localStorage.getItem('score') == null)
            localStorage.setItem('score', 0);
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic   
        if (this.gameStart)
            this.bird.body.gravity.y = SCREEN_HEIGHT * 2;

        if (this.bird.y <= this.bird.height)
            this.bird.y = this.bird.height;

        if (this.bird.y >= this.ground1.y - this.bird.height*1.5) {
            this.hitGround();
        }
        // Don't change bird angle before game starts
        if (this.bird.angle > 0 && !this.gameStart)
            this.bird.angle += 1
        // constantly lower the bird's angle to -90 
        else if (this.bird.angle < 90 && this.gameStart) {
            this.bird.angle += 2;
        }

        // Scroll the ground to the left 
        if (this.ground1.x <= -SCREEN_WIDTH + 3)
            this.ground1.x = SCREEN_WIDTH;

        if (this.ground2.x <= -SCREEN_WIDTH + 3)
            this.ground2.x = SCREEN_WIDTH;

        this.checkPipes();

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        game.physics.arcade.overlap(this.bird, this.pipeHeads, this.hitPipe, null, this);
    },

    // Stops the bird from moving once it hits ground
    hitGround: function () {
        this.bird.body.moves = false;
        if (this.bird.alive) {  // If alive still, means it did not die from pipe, so finish up the work
            this.smackSound.play();
            this.bird.alive = false;
            this.endGame();
        }
    },

    // Stops everything in the game
    endGame: function () {
        this.bird.alive = false;

        game.world.bringToTop(this.bird);
        game.world.bringToTop(this.ground1);
        game.world.bringToTop(this.ground2);

        game.time.events.remove(this.timer);

        this.pipes.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);
        this.pipeHeads.forEachAlive(function (p) {
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


        this.gameOver = game.add.sprite((SCREEN_WIDTH - SCREEN_WIDTH*2/3)/2, SCREEN_HEIGHT*1/10, "gameOver");
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

    hitPipe: function () {
        if (!this.bird.alive)  // Don't play smack sound again if already hit pipe
            return;

        this.smackSound.play();
        this.endGame();
    },

    // Check when to add score after passing pipe
    checkPipes: function(){
        if (this.currentPipe == null)
            this.currentPipe = this.nextPipe;

        if (this.currentPipe != null) {
            if (this.bird.x >= this.currentPipe.x + this.currentPipe.width) {
                this.currentPipe = this.nextPipe
                this.labelScore.text = ++this.score;
                this.scoreSound.play();
            }
        }
    },

    // Make the bird jump 
    jump: function () {
        // Set boolean to true to allow for pipes to spawn 
        if (!this.gameStart) {
            game.add.tween(this.tap).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.add.tween(this.getReady).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
        }
        this.gameStart = true;

        if (this.bird.alive == false)
            return;
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = SCREEN_WIDTH * -7 / 8;

        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
        animation.to({ angle: -20 }, 100);

        // And start the animation
        animation.start();

        // Play jump sound
        this.jumpSound.play();
    },

    // Restart the game
    restartGame: function () {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
        if (this.bird.alive)
            this.smackSound.play();
    },

    addOnePipe: function (x, y, isHead) {
        // Get the first dead pipe of our group
        var pipe = isHead ? this.pipeHeads.getFirstDead() : this.pipes.getFirstDead();

        // Set the new position of the pipe
        if (isHead)
            pipe.reset((x - (SCREEN_WIDTH / 4 - SCREEN_WIDTH / 5)/2), y);
        else
            pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = SCREEN_WIDTH / -2;

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

        // Add the 5 pipes (iterate 8 times so that 2 spots are holes with 6 pipes)
        for (var i = 8; i > 1; i--) {
            if (i == hole + 2) {
                // Place bottom pipe head
                this.nextPipe = this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8) + (SCREEN_HEIGHT / 8 - SCREEN_HEIGHT / 16), true);
            }
            else if (i == hole) {
                // Place top pipe head
                this.nextPipe = this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8), true);
            }
            else if (i != hole + 1){
                this.nextPipe = this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8), false);
            }
        }
    },
};



// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');  

