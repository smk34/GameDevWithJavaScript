class StartGameScene extends Phaser.Scene {
    constructor() {
        super()
    }

    preload() {
        this.load.image('start-game', 'assets/images/game-start.jpg')
        this.load.image('start', 'assets/images/play-now.png')
    }

    create() {
        this.add.image(400, 300, 'start-game').setScale(1.8)
        this.startbtn = this.add.image(400, 300, 'start')
        this.startbtn.setInteractive();
        this.startbtn.on('pointerdown', this.startGame, this)
    }

    startGame() {
        this.scene.start('Play');
    }
}