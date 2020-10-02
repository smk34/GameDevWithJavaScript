
class PlayGameScene extends Phaser.Scene {
    constructor() {
        super('Play')
        this.score = 0;
    }
    preload() {
        this.load.image('sky', 'http://labs.phaser.io/assets/skies/space3.png');
        this.load.image('jet', 'assets/images/jet.png');
        this.load.image('bomb', 'assets/images/bomb.png');
        this.load.image('ammo', 'assets/images/ammo.png');
        this.load.image('coin', 'assets/images/coin.png')
        this.load.audio('gun-shot', 'assets/audio/gunshot.wav')
        this.load.audio('coinhit', 'assets/audio/coinhit.wav')
        this.load.audio('endgame', 'assets/audio/end.mp3')
        this.load.spritesheet('explosion', 'assets/spritesheets/explosion.png', {
            frameWidth: 16,
            frameHeight: 16
        })
    }

    create() {
        this.sky = this.add.image(400, 300, 'sky');
        this.jet = this.physics.add.image(400, 500, 'jet').setScale(0.15).setOrigin(0.5, 0)
        this.jet.setCollideWorldBounds(true)

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.shoot, this)

        this.bombs = this.physics.add.group({
            key: 'bomb',
            repeat: 3,
            setXY: {
                x: 20, y: -50, stepX: Phaser.Math.Between(10, config.width - 15), stepY: Phaser.Math.Between(15, 20)
            }
        })

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion'),
            frameRate: 20,
            hideOnComplete: true
        })

        this.coins = this.physics.add.group();

        for (let i = 0; i < 10; i++) {
            let x = Phaser.Math.Between(0, config.width);
            let y = Phaser.Math.Between(0, config.height);
            let newCoin = this.coins.create(x, y, 'coin');
        }

        this.setObjVelocity(this.bombs);
        this.setObjVelocity(this.coins);
        this.gunShot = this.sound.add('gun-shot');
        this.coinHit = this.sound.add('coinhit');
        this.endgame = this.sound.add('endgame');


        this.physics.add.overlap(this.jet, this.coins, this.collectCoins, null, this);
        this.physics.add.overlap(this.jet, this.bombs, this.endGame, null, this);

        this.scoreText = this.add.text(15, 15, 'Score : 0', { fontSize: 32, fill: '#ff0000' })

    }
    endGame() {
        this.endgame.play()
        this.physics.pause();
        this.jet.setTint(0xff0000)
        this.gameOver = true;
    }

    collectCoins(jet, coin) {
        this.coinHit.play()
        coin.disableBody(true, true)
        this.score += 10;
        this.scoreText.setText('Score : ' + this.score);

        let x = Phaser.Math.Between(0, config.width);
        let y = Phaser.Math.Between(0, 200);
        coin.enableBody(true, x, y, true, true)
        let xVel = Phaser.Math.Between(-100, 100);
        let yVel = Phaser.Math.Between(150, 200);
        coin.setVelocity(xVel, yVel)
    }

    setObjVelocity(bombs) {
        bombs.children.iterate(function (bomb) {
            let x = Phaser.Math.Between(-100, 100);
            let y = Phaser.Math.Between(150, 200);
            bomb.setVelocity(x, y)
        })
    }

    shoot() {
        this.ammo = this.physics.add.image(this.jet.x, this.jet.y, 'ammo').setScale(0.1)
        this.ammo.setRotation(-Phaser.Math.PI2 / 4);
        this.ammo.setVelocityY(-600)
        this.physics.add.collider(this.ammo, this.bombs, this.destroyBomb, null, this)
    }

    destroyBomb(ammo, bomb) {
        this.gunShot.play()
        this.explosion = this.add.sprite(bomb.x, bomb.y, 'explosion').setScale(4);
        this.explosion.play('explode')
        this.score += 8;
        this.scoreText.setText('Score : ' + this.score);
        this.ammo.disableBody(true, true)
        bomb.disableBody(true, true)
        let randomX = Phaser.Math.Between(15, config.width - 15)
        bomb.enableBody(true, randomX, 0, true, true)
        let x = Phaser.Math.Between(-100, 100);
        let y = Phaser.Math.Between(150, 200);
        bomb.setVelocity(x, y);
    }

    update() {
        if (this.gameOver && !this.endgame.isPlaying) {
            this.scene.start('EndGame', { totalScore: this.score })
        }

        if (this.cursors.left.isDown) {
            this.jet.setVelocityX(-150);
        } else if (this.cursors.right.isDown) {
            this.jet.setVelocityX(150);
        } else {
            this.jet.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.jet.setVelocityY(-150);
        } else if (this.cursors.down.isDown) {
            this.jet.setVelocityY(150);
        } else {
            this.jet.setVelocityY(0);
        }

        this.checkForRepos(this.bombs)
        this.checkForRepos(this.coins)
    }
    checkForRepos(bombs) {
        let game = this;
        bombs.children.iterate(function (bomb) {
            if (bomb.y > config.height) {
                game.resetPos(bomb);
            }
        })
    }
    resetPos(bomb) {
        bomb.y = 0;
        let randomX = Phaser.Math.Between(15, config.width - 15);
        bomb.x = randomX;
    }
}