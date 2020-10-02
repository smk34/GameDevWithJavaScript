var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
    },
    scene: [StartGameScene, PlayGameScene, EndGameScene]
};
var game = new Phaser.Game(config);

