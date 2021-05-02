import Phaser from 'phaser';
import Assets from './Assets';
import Constants from './Constants';

export default class CreditsScene extends Phaser.Scene {

    constructor() {
        super('CreditsScene')
    }

    preload() {
        for (const key in Assets.Images) {
            this.load.image(Assets.Images[key], Assets.Images[key]);
        }
        for (const key in Assets.Sounds) {
            this.load.audio(Assets.Sounds[key], Assets.Sounds[key]);
        }
        for (const key in Assets.Animations) {
            this.load.animation(Assets.Animations[key], Assets.Animations[key]);
        }
    }

    create() {
        console.log('We started the credits scene!');
        this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.Space);
        this.sound.stopAll();
        this.sound.play(Assets.Sounds.MarketBackgroundMusic, {
            volume: 1,
            loop: true,
        });
        let superCorn = this.physics.add.sprite(-1000, Constants.Height + 500, Assets.Images.Corn);
        superCorn.setVelocity(80, -40);
        superCorn.setOrigin(0.5);

        let t1 = this.add.text(Constants.Width/2, Constants.Height/2,'Congratulations!').setFontSize(50).setFontStyle('bold').setAlpha(0).setOrigin(0.5);
        let t2 = this.add.text(Constants.Width/2, Constants.Height/2 + 50, 'You sucessfully met your $1000 goal and funded your expidition to space in...' ).setFontSize(30).setFontStyle('bold').setAlpha(0).setOrigin(0.5);
        let t3 = this.add.text(Constants.Width/2, Constants.Height/2 + 50*2, '... a ...').setFontSize(30).setFontStyle('bold').setAlpha(0).setOrigin(0.5);
        let t4 = this.add.text(Constants.Width/2, Constants.Height/2 + 50*3, '... GIANT ...').setFontSize(30).setFontStyle('bold').setAlpha(0).setOrigin(0.5);
        let t5 = this.add.text(Constants.Width/2, Constants.Height/2 + 50*4, 'CORN!').setFontSize(50).setFontStyle('bold').setAlpha(0).setOrigin(0.5);

        let t6 = this.add.text(100, 100, 'Now you can grace the universe with that most sacred of foods...').setFontSize(30).setFontStyle('bold').setAlpha(0);
        let t7 = this.add.text(100, 150, 'POPCORN!').setFontSize(50).setFontStyle('bold').setAlpha(0);

        let popcorn = this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.SpaceCorn).setAlpha(0);

        let t8 = this.add.text(Constants.Width/2, Constants.Height/2 - 150, 'The End').setFontSize(200).setFontStyle('bold').setAlpha(0).setOrigin(0.5);

        // t1
        this.add.tween({
            targets: t1,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 5000,
        });
        this.add.tween({
            targets: t1,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 18000,
        });

        // t2
        this.add.tween({
            targets: t2,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 7000,
        });
        this.add.tween({
            targets: t2,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 18000,
        });

        // t3
        this.add.tween({
            targets: t3,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 12000,
        });
        this.add.tween({
            targets: t3,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 18000,
        });

        // t4
        this.add.tween({
            targets: t4,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 13000,
        });
        this.add.tween({
            targets: t4,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 18000,
        });

        // t5
        this.add.tween({
            targets: t5,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 15000,
        });
        this.add.tween({
            targets: t5,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 18000,
        });

        // t6
        this.add.tween({
            targets: t6,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 20000,
        });
        this.add.tween({
            targets: t6,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 38000,
        });

        // t7
        this.add.tween({
            targets: t7,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 35000,
        });
        this.add.tween({
            targets: t7,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            delay: 38000,
        });

        // superCorn
        this.add.tween({
            targets: superCorn,
            scale: 0,
            ease: 'linear',
            duration: 10000,
            delay: 25000,
        });

        // flash
        setTimeout(() => {this.cameras.main.fadeIn(3000, 255, 255, 255);}, 36000);
        // hotswap background
        setTimeout(() => {popcorn.setAlpha(1)}, 36000);

        // t8
        this.add.tween({
            targets: t8,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            delay: 40000,
        });
        // this.add.tween({
        //     targets: t8,
        //     alpha: 0,
        //     duration: 1000,
        //     ease: 'Power2',
        //     delay: 45000,
        // });

        // // Return to main menu
        // setTimeout(() => {this.scene.run('MainScene');}, 50000);
    }   

    update() {

    }
}