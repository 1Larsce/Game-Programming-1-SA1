// HILARIO B. ARRIESGADO II || GAME PROGRAMMING 1 || SA1
var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

// Variables
let Background, platforms, platform, iceBlock, player,
cursors, jumpKey, fruits, fruit, coins, coin, stardrops, stardrop,
jumpSound;
let backgroundMusic;
let fruitCount = 4;
let fruitsCollectedcount = 0;
let fruitsCollectedText = 0;

function preload ()
{   
//IMAGES
    // Background
    this.load.spritesheet('mountain', 'Assets/Images/background3.png',
    {frameWidth: 1920, frameHeight: 1080});
    // Platforms
    this.load.image('snow', 'Assets/Images/Platforms/snowplatform.png');
    this.load.image('ice', 'Assets/Images/Platforms/iceplatform.png');
    this.load.image('iceblock', 'Assets/Images/Platforms/ice.png');
    this.load.image('block', 'Assets/Images/Platforms/platform block.png');
    // Objects
    this.load.image('bomb', 'Assets/Images/Objects/poro.png');
    this.load.image('stardrop', 'Assets/Images/Objects/stardropsdv.png');
    this.load.image('fruit', 'Assets/Images/Objects/fruit.png');

    // Player
    // Movements
    this.load.spritesheet('playeridle', 'Assets/Images/Player/PlayerIdle.png', 
    {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('playerwalk', 'Assets/Images/Player/PlayerWalk.png', 
    {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('playerrun', 'Assets/Images/Player/Player Run.png', 
    {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('playerjump', 'Assets/Images/Player/PlayerJump.png', 
    {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('playerhurt', 'Assets/Images/Player/PlayerHurt.png', 
    {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('playerdeath', 'Assets/Images/Player/PlayerDeath.png', 
    {frameWidth: 32, frameHeight: 32});

// AUDIO
    //Background
    this.load.audio('backgroundMusic', 'Assets/Audio/backgroundMusic.mp3');
    //SFX
    this.load.audio('jumpSound', 'Assets/Audio/jumpSound.mp3');
    this.load.audio('walkSound', 'Assets/Audio/walkSound.mp3');
    this.load.audio('deathSound', 'Assets/Audio/deathSound.mp3');
    this.load.audio('stardropSound', 'Assets/Audio/stardropSound.mp3');
    this.load.audio('fruitCollectSound', 'Assets/Audio/fruitCollectSound.mp3');
    this.load.audio('bombBounceSound', 'Assets/Audio/bombBounceSound.mp3');
}

function create() {
    // ================BACKGROUND===============================================
     // Background animation setup
     Background = this.add.sprite(600, 300, 'mountain'); // Position centered on the game
     this.anims.create({
         key: 'animateBackground',
         frames: this.anims.generateFrameNumbers('mountain', { start: 0, end: 23 }), // 24 frames
         frameRate: 10,
         repeat: -1 // Loop forever
     });
     Background.play('animateBackground');
     // Scale the background to cover the entire game size
     Background.displayWidth = this.sys.game.config.width;   // 1200 pixels wide
     Background.displayHeight = this.sys.game.config.height; // 600 pixels high

    // Check if background music is already playing, stop it if it is
    if (backgroundMusic && backgroundMusic.isPlaying) {
        backgroundMusic.stop();
    }

    // Play background music
    backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
    backgroundMusic.play();

    // Load Sounds
    this.walkSound = this.sound.add('walkSound');
    this.jumpSound = this.sound.add('jumpSound');
    this.deathSound = this.sound.add('deathSound');
    this.fruitCollectSound = this.sound.add('fruitCollectSound');
    this.stardropSound = this.sound.add('stardropSound');
    this.bombBounceSound = this.sound.add('bombBounceSound');
    // ===============PLATFORMS SETUP============================================
    platforms = this.physics.add.staticGroup();
    
    // Creating a platform, setting it to the bottom of the screen and scaling it
    // Lower Platforms (From Left to Right)
    platforms.create(90, 600, 'snow').setScale().refreshBody();
    platforms.create(410, 580, 'snow').setScale().refreshBody();
    platforms.create(810, 580, 'snow').setScale().refreshBody();
    platforms.create(1130, 600, 'snow').setScale().refreshBody();

    // Middle Platforms (From Left to Right)
    platforms.create(100, 450, 'snow').setScale(.75).refreshBody();
    platforms.create(300, 420, 'block').setScale(.50).refreshBody();
    platforms.create(400, 360, 'block').setScale(.50).refreshBody();
    platforms.create(630, 300, 'ice').setScale(.75).refreshBody();
    platforms.create(900, 300, 'block').setScale(.50).refreshBody();
    platforms.create(1130, 250, 'snow').setScale(.75).refreshBody();

    // Top Platforms (From Left to Right)
    platforms.create(1100, 130, 'block').setScale(.50).refreshBody();
    platforms.create(950, 130, 'block').setScale(.50).refreshBody();
    platforms.create(800, 130, 'block').setScale(.50).refreshBody();
    platforms.create(650, 130, 'block').setScale(.50).refreshBody();
    platforms.create(350, 130, 'ice').setScale(.75).refreshBody();
    platforms.create(100, 130, 'block').setScale(.50).refreshBody();

    //================PLAYER======================================================
    // Initial Coordinates
    player = this.physics.add.sprite(50, 490, 'playerwalk');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    // Player Animations // Movements
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'playeridle', frame: 0 }], 
    });
    
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('playerwalk', { start: 0, end: 5 }),
        frameRate: 10, 
        repeat: -1 
    });
    
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('playerjump', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0 
        });

        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('playerhurt', {start: 0, end: 3}),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNumbers('playerdeath', {start: 0, end: 6}),
            frameRate: 20,
            repeat: 0
        });

    // =====================CONTROLS=============================================
    cursors = this.input.keyboard.createCursorKeys();
    
    // Jump key (space bar) for jumping
    jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ================OBJECTS===================================================
    stardrop = this.physics.add.staticSprite(100, 80, "stardrop");
    stardrop.setScale(0.09);
    // Adjust the size of the physics body to match the visible part of the sprite
    stardrop.body.setCircle(20);
    // stardrop.body.setCircle(stardrop.width / 3, stardrop.height / 2, 0);
    stardrop.body.setOffset(197, 268);


    // Ice Block (If touched, player will die.)
    iceBlock = this.physics.add.staticSprite(613, 620, "iceblock");
    iceBlock.setScale(1);

    // Creating fruits
    fruits = this.physics.add.group({
        key: 'fruit',
        repeat: fruitCount,
        setXY: { x: 0, y: 0, stepX: 135 }
    });
    
    // Adjusting Scale of Fruit
    fruits.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.8, 1));
        child.setScale(0.09); // Set the scale to 0.5 (adjust as needed)
        child.y = Phaser.Math.Between(0, 600);
        child.x = Phaser.Math.Between(100, config.width - 10);
    });
    

    bomb = this.physics.add.image(config.width / 2, 0, 'bomb');
    bomb.setScale(.07);
    bomb.setBounce(1,1);
    bomb.setVelocity(200,200);
    bomb.setCollideWorldBounds(true);
    
    fruitCollected = this.add.text(config.width / 1.5, 20, 'Fruits Collected: ', 
    { fontSize: '40px', fill: '#FFD700' , fontStyle: 'bold' , fontFamily: 'tahoma'}); // fruits collected text
    fruitCollected.setShadow(2, 2, '#f890e7', 3, true, true);
}



function update() {

    // Collissions and Overlapping
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(fruits, platforms);
    this.physics.add.collider(bomb, platforms, function() {
        // Play bomb bounce sound
        this.bombBounceSound.play();
    }, null, this);
    this.physics.add.overlap(player, fruits, fruitCollect, null, this);
    this.physics.add.overlap(player, bomb, bombHit, null, this);
    // Ice Block
    this.physics.add.overlap(player, iceBlock, Death, null, this);
    // Check for overlap between player and stardrop
    this.physics.add.overlap(player, stardrop, checkWin, null, this);

    // Player Controls
    if (cursors.left.isDown) {
        let velocityX = -160;
        if (player.body.touching.down && (player.body.blocked.down || player.body.touching.down)) {
            if (!onIcePlatform(player)) {
                velocityX = -160; // Normal velocity on non-ice platforms
            } else {
                velocityX = -80; // Reduced velocity on ice
            }
        }
        player.setVelocityX(velocityX);
        player.anims.play('walk', true);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        let velocityX = 160;
        if (player.body.touching.down && (player.body.blocked.down || player.body.touching.down)) {
            if (!onIcePlatform(player)) {
                velocityX = 160; // Normal velocity on non-ice platforms
            } else {
                velocityX = 80; // Reduced velocity on ice
            }
        }
        player.setVelocityX(velocityX);
        player.anims.play('walk', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    // Jump Logic
    if (cursors.space.isDown && player.body.touching.down) {
        player.setVelocityY(-280);
        player.anims.play('jump', true);
        this.jumpSound.play(); // Use this.jumpSound to refer to the jump sound
    } else if (!player.body.touching.down) {
        player.anims.play('jump', true);
    }    

    // Walk Sound
    if (cursors.left.isDown || cursors.right.isDown) {
        if (!this.walkSound.isPlaying) {
            this.walkSound.play();
        }
    } else {
        // Stop the walking sound if the player is not walking
        this.walkSound.stop();
    }
}

// Function to check if the player is on an ice platform
function onIcePlatform(player) {
    return platforms.getChildren().some(function(platform) {
        return platform.texture.key === 'ice' && player.body.touching.down && player.y < platform.y;
    });
}

// Fruit Collect
function fruitCollect(player, fruit) 
{
    fruit.disableBody(true,true);  // remove fruit

    // Play fruit collect sound
    this.fruitCollectSound.play();

    fruitsCollectedcount += 1;
    fruitsCollectedText += 1 ;
    fruitCollected.setText('Fruits Collected: ' + fruitsCollectedText);
    
    if ( fruits.countActive(true) < fruitCount )
    {
        fruit.enableBody(true, Phaser.Math.Between(0,config.width-10), 0, true ,true);
    }

    // Changing Player's Color after Collecting Fruit
    if (fruitsCollectedcount == 1) { player.setTint(0xff4040) }
    if (fruitsCollectedcount == 2) { player.setTint(0xffac40) }
    if (fruitsCollectedcount == 3) { player.setTint(0xfff240) }
    if (fruitsCollectedcount == 4) { player.setTint(0x67ff3d) }
    if (fruitsCollectedcount == 5) { player.setTint(0x4056ff) }
    if (fruitsCollectedcount == 6) { player.setTint(0x4b0082) }
    if (fruitsCollectedcount == 7) { player.setTint(0x8000de); fruitsCollectedcount = 0}

    if (fruitsCollectedcount % 5 == 0) { player.setScale(player.scaleX * 1.1, player.scaleY * 1.1) }
}

// CONDITIONS
function gameOver(player) {
    // Play death animation
    player.anims.play('death', true);

    // Disable player's body after animation
    player.disableBody(true, true);

    // Play death sound
    this.deathSound.play();

    // Show game over text
    let gameOverText = this.add.text(500, 200, 'Game Over\nScore: ' + fruitsCollectedText, 
        { fontSize: '50px', fill: '#FFD700', fontStyle: 'bold', fontFamily: 'tahoma', align: 'center' });
    gameOverText.setOrigin(0);
    gameOverText.setShadow(2, 2, '#f890e7', 3, true, true);

    // Prompt to start a new game
    let restartText = this.add.text(650, 350, 'Press Enter to Start a New Game', 
        { fontSize: '35px', fill: '#89cff0', fontStyle: 'bold', fontFamily: 'tahoma', align: 'center' });
    restartText.setOrigin(0.5);
    restartText.setShadow(3, 3, '#f890e7', 3, true, true);

    // Event listener for Enter key
    let scene = this;
    this.input.keyboard.on('keydown-ENTER', function () {
        // Restart the game
        scene.scene.restart();
    });

    // Stop background music when the game is over
    if (backgroundMusic && backgroundMusic.isPlaying) {
        backgroundMusic.stop();
    }
}

function bombHit(player, bombs) {
    this.physics.pause();
    gameOver.call(this, player);
}

function Death(player, iceBlock) {
    gameOver.call(this, player);
}

function Victory(player, stardrop) {
    checkWin.call(this, player);
}

// Function to check if the player overlaps with the stardrop
function checkWin(player, stardrop) {
    console.log("Player overlapped with stardrop!"); // Add this line for debugging
    // Play stardrop sound effect
    this.stardropSound.play();
    // Pauses the game
    this.physics.pause();
    
    // Display congratulatory message
    let winText = this.add.text(650, 230, 'You found a Stardrop!\nYour mind is filled with thoughts of...\n[Your Favorite Thing]\nMade by: lars / koh', 
        { fontSize: '35px', fill: '#FFD700', fontStyle: 'bold' , fontFamily: 'tahoma' , align: 'center' });
    winText.setOrigin(0.5);
    winText.setShadow(2, 2, '#f890e7', 3, true, true);

    // Prompt to start a new game
    let restartText = this.add.text(650, 350, 'Press Enter to Start a New Game', 
    { fontSize: '35px', fill: '#89cff0', fontStyle: 'bold', fontFamiily: 'tahoma', align: 'center' });
    restartText.setOrigin(0.5);
    restartText.setShadow(3, 3, '#f890e7', 3, true, true);

    // Event listener for Enter key
    this.input.keyboard.on('keydown-ENTER', function () {
        // Restart the game
        this.scene.restart();
    }, this);

    // Player disappears!
    stardrop.disableBody(true, true);

    // Stop background music when the game is won
    if (backgroundMusic && backgroundMusic.isPlaying) {
        backgroundMusic.stop();
    }
}

