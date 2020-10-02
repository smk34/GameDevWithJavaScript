var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var sky, jet, cursors, ammo, bombs, explosion, gunShot, coins;
var game = new Phaser.Game(config);
var coinHit;
var score = 0;
var scoreText;
var gameOver = false;


function preload() {
    this.load.image('sky', 'http://labs.phaser.io/assets/skies/space3.png');
    this.load.image('jet', 'assets/images/jet.png');
    this.load.image('bomb', 'assets/images/bomb.png');
    this.load.image('ammo', 'assets/images/ammo.png');
    this.load.image('coin', 'assets/images/coin.png')
    this.load.spritesheet('explosion', 'assets/spritesheets/explosion.png', {
        frameWidth: 16,
        frameHeight: 16
    })
    this.load.audio('coinhit', 'assets/audio/coinhit.wav')
    this.load.audio('gun-shot', 'assets/audio/gunshot.wav')
    this.load.audio('end', 'assets/audio/end.mp3')
}

function create() {
    sky = this.add.tileSprite(400, 300, config.width, config.height, 'sky');
    jet = this.physics.add.image(400, 500, 'jet').setScale(0.15).setOrigin(0.5, 0)
    jet.setCollideWorldBounds(true)

    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', shoot, this)

    bombs = this.physics.add.group({
        key: 'bomb',
        repeat: 3,
        setXY: {
            x: 20, y: 50, stepX: Phaser.Math.Between(10, config.width - 15), stepY: Phaser.Math.Between(15, 300)
        }
    })
    coins = this.physics.add.group();

    for (let i = 0; i < 10; i++) {
        let x = Phaser.Math.Between(0, config.width - 15)
        let y = Phaser.Math.Between(0, 200)
        let newCoin = coins.create(x, y, 'coin')
    }
    setObjVelocity(coins);
    setObjVelocity(bombs);

    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion'),
        frameRate: 20,
        hideOnComplete: true
    })

    this.physics.add.collider(jet, coins, collectCoins, null, this)
    this.physics.add.collider(jet, bombs, endGame, null, this)

    gunShot = this.sound.add('gun-shot')
    coinHit = this.sound.add('coinhit')
    endGameMusic = this.sound.add('end')

    scoreText = this.add.text(15, 15, 'Score : 0', { fontSize: 32, fill: '#ff0000' })
}

function endGame(jet, bomb) {
    endGameMusic.play()
    this.physics.pause()
    jet.setTint(0xff0000)
    gameOver = true;
}

function collectCoins(jet, coin) {
    // coinHit.play()
    coin.disableBody(true, true)
    let x = Phaser.Math.Between(0, config.width - 15)
    coin.enableBody(true, x, 0, true, true)
    let xVel = Phaser.Math.Between(-100, 100);
    let yVel = Phaser.Math.Between(150, 200)
    coin.setVelocity(xVel, yVel)
    score += 10;
    scoreText.setText('Score : ' + score)
}

function setObjVelocity(bombs) {
    bombs.children.iterate(function (bomb) {
        let xVel = Phaser.Math.Between(-100, 100);
        let yVel = Phaser.Math.Between(150, 200)
        bomb.setVelocity(xVel, yVel)
    })
}

function shoot() {
    ammo = this.physics.add.image(jet.x, jet.y, 'ammo').setScale(0.1)
    ammo.setRotation(-Phaser.Math.PI2 / 4);
    ammo.setVelocityY(-600)
    this.physics.add.collider(ammo, bombs, destroyBomb, null, this)
}

function destroyBomb(ammo, bomb) {
    gunShot.play()
    explosion = this.add.sprite(bomb.x, bomb.y, 'explosion').setScale(4);
    explosion.play('explode')
    bomb.disableBody(true, true)
    ammo.disableBody(true, true)
    let x = Phaser.Math.Between(0, config.width - 15)
    bomb.enableBody(true, x, 0, true, true)
    let xVel = Phaser.Math.Between(-100, 100);
    let yVel = Phaser.Math.Between(150, 200)
    bomb.setVelocity(xVel, yVel)
    score += 8;
    scoreText.setText('Score : ' + score)
}

function update() {
    if (gameOver) {
        return;
    }
    sky.tilePositionY -= 0.5;

    if (cursors.left.isDown) {
        jet.setVelocityX(-150);
    } else if (cursors.right.isDown) {
        jet.setVelocityX(150);
    } else {
        jet.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        jet.setVelocityY(-150);
    } else if (cursors.down.isDown) {
        jet.setVelocityY(150);
    } else {
        jet.setVelocityY(0);
    }

    checkForRepos(bombs)
    checkForRepos(coins)
}

function checkForRepos(bombs) {
    bombs.children.iterate(function (bomb) {
        if (bomb.y > config.height) {
            resetPos(bomb)
        }
    })
}
function resetPos(bomb) {
    bomb.y = 0;
    let randomX = Phaser.Math.Between(15, config.width - 15)
    bomb.x = randomX;
}