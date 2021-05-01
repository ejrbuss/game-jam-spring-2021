import Phaser from 'phaser';
import Constants from './Constants';
import MainScene from './MainScene';

const Game = new Phaser.Game({
    type: Phaser.AUTO,
    width: Constants.Width,
    height: Constants.Height,
    canvasStyle: 'margin: auto; display: block;',
    scene: MainScene,
});

window.Game = Game;

export default Game;