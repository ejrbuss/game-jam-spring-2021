import Phaser from 'phaser';
import Constants from './Constants';
import MainScene from './MainScene';

const Game = new Phaser.Game({
    type: Phaser.AUTO,
    width: Constants.Width,
    height: Constants.Height,
    canvasStyle: 'margin: auto; display: block; width: 1280; height: 720; border-radius: 30px;',
    scene: MainScene,
    antialias: true,
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true,
        },
    },
});

window.Game = Game;

export default Game;