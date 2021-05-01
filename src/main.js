import Phaser from 'phaser';

import HelloWorldScene from './scenes/HelloWorldScene';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    canvasStyle: 'margin: auto; display: block;',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: [HelloWorldScene]
});
