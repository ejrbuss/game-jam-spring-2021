import Phaser from 'phaser';
import Assets from './Assets';
import Cards from './Cards';
import Constants from './Constants';
import State from './State'; 

console.log(Assets);

export default class MainScene extends Phaser.Scene {

    super() {
        constructor('MainScene');
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

        this.farmBackground = this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.FarmBackground);

        // Start screen
        this.startButton = this.createButton(Constants.Width / 2, Constants.Height / 2, Assets.Images.StartButton, () => { State.state = 'market' });

        // End screen

        // Market
        this.marketObjects = [];
        this.marketBoard = this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.MarketBackground);
        this.marketObjects.push(this.marketBoard);

        this.createMarketCard(Constants.Width / 4, Constants.Height / 4 + 50, Cards.TestCard1);
        this.createMarketCard(Constants.Width / 4 + 120, Constants.Height / 4 + 50, Cards.TestCard2);
        this.createMarketCard(Constants.Width / 4 + 240, Constants.Height / 4 + 50, Cards.TestCard3);
        this.createMarketCard(Constants.Width / 4, Constants.Height / 4 + 250, Cards.TestCard4);
        this.createMarketCard(Constants.Width / 4 + 120, Constants.Height / 4 + 250, Cards.TestCard5);
        this.createMarketCard(Constants.Width / 4 + 240, Constants.Height / 4 + 250, Cards.TestCard6);

        this.createMarketCard(Constants.Width / 4 + 450, Constants.Height / 4 + 50, Cards.TestCard7, true);

        for (const object of this.marketObjects) {
            object.setVisible(false);
        }

        // Farm

        // Hand Cards
        this.handCards = {};
        for (const key in Cards) {
            this.createHandCard(Cards[key]);
        }
    }

    createButton(x, y, buttonAsset, onClick) {
        const buttonAssetHover = buttonAsset.replace('.png', 'Hover.png');
        const buttonAssetClick = buttonAsset.replace('.png', 'Click.png');
        const button = this.add.sprite(x, y, buttonAsset);
        button.setInteractive();
        button.on(Phaser.Input.Events.POINTER_OVER, () => {
            button.setTexture(buttonAssetHover);
        });
        button.on(Phaser.Input.Events.POINTER_OUT, () => {
            button.setTexture(buttonAsset);
        });
        button.on(Phaser.Input.Events.POINTER_DOWN, () => {
            button.setTexture(buttonAssetClick);
        });
        button.on(Phaser.Input.Events.POINTER_UP, () => {
            button.setTexture(buttonAsset);
            onClick();
        });
        return button;
    }

    createMarketCard(x, y, card, upgradeOnly = false) {
        const marketCard = this.add.sprite(x, y, card.Image);
        if (upgradeOnly) {
            const upgradeButton = this.createButton(x, y + 100, Assets.Images.UpgradeButton, () => {});
            this.marketObjects.push(marketCard, upgradeButton);
        } else {
            const upgradeButton = this.createButton(x - 30, y + 100, Assets.Images.UpgradeButton, () => {
                upgradeButton.setVisible(false);
            });
            const buyButton = this.createButton(x + 30, y + 100, Assets.Images.BuyButton, () => { 
                State.hand.push(card);
                buyButton.setVisible(false);
                if (State.hand.length === 5) {
                    State.state = 'farm';
                }
            });
            this.marketObjects.push(marketCard, upgradeButton, buyButton);
        }

    }

    createHandCard(card) {
        const handCard = this.add.sprite(0, Constants.Height + 25, card.Image);
        handCard.setInteractive();
        handCard.setVisible(false);
        handCard.on(Phaser.Input.Events.POINTER_OVER, () => {
            handCard.setY(Constants.Height - 75);
        });
        handCard.on(Phaser.Input.Events.POINTER_OUT, () => {
            handCard.setY(Constants.Height + 25);
        });
        this.handCards[card.Key] = handCard;
    }

    update() {
        const entering = State.state;
        const exiting = this.lastState;

        if (entering !== exiting) {
            switch (exiting) {
                case 'start': {
                    this.startButton.setVisible(false);
                    break;
                }
                case 'end': {
                    break;
                }
                case 'market': {
                    for (const object of this.marketObjects) {
                        object.setVisible(false);
                    }
                    break;
                }
                case 'farm': {
                    break;
                }
            }
            switch (entering) {
                case 'start': {
                    this.startButton.setVisible(true);
                    break;
                }
                case 'end': {
                    break;
                }
                case 'market': {
                    for (const object of this.marketObjects) {
                        object.setVisible(true);
                    }
                    break;
                }
                case 'farm': {
                    break;
                }
            }

        }
        switch (State.state) {
            case 'start': {
                this.updateHand(false);
                break;
            }
            case 'end': {
                this.updateHand(false);
                break;
            }
            case 'market': {
                this.updateHand(true);
                break;
            }
            case 'farm': {
                this.updateHand(true);
                break;
            }
        }
        this.lastState = State.state;
    }

    updateHand(show = true) {
        for (const object in this.handCards) {
            this.handCards[object].setVisible(false);
        }
        if (show) {
            let offset = 60;
            for (const card of State.hand) {
                const handCard = this.handCards[card.Key];
                handCard.setVisible(true);
                handCard.setX(offset);
                offset += 110;
            }
        }
    }

}