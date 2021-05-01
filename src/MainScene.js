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

    gotoPhase(phase) {
        this.events.emit(Constants.Events.ExitPhase);
        State.phase = phase;
        this.events.emit(Constants.Events.EnterPhase);
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
        const background = this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.FarmBackground);

        // Start screen
        const startButton = this.createButton(
            Constants.Width / 2, 
            Constants.Height / 2, 
            Assets.Images.StartButton, 
            () => { 
                this.gotoPhase(Constants.Phases.Market) 
            });
        this.visibleDuringPhase(Constants.Phases.Start, startButton);

        // Market
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Market) { return; }
            // Reset players hand
            State.hand = [
                Cards.CardSeed,
                [
                    Cards.CardPestilence,
                    Cards.CardPlague,
                    Cards.CardDrought,
                ][Phaser.Math.Between(0, 2)],
            ];
            // Tell market cards to refresh
            this.events.emit(Constants.Events.RefreshMarket);
        });
        const marketBoard = this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.MarketBackground);
        this.visibleDuringPhase(Constants.Phases.Market, marketBoard);

        this.createMarketCard(Constants.Width / 4, Constants.Height / 4 + 50, Cards.CardCow);
        this.createMarketCard(Constants.Width / 4 + 120, Constants.Height / 4 + 50, Cards.CardScarecrow);
        this.createMarketCard(Constants.Width / 4 + 240, Constants.Height / 4 + 50, Cards.CardTalisman);
        this.createMarketCard(Constants.Width / 4, Constants.Height / 4 + 250, Cards.CardOveralls);
        this.createMarketCard(Constants.Width / 4 + 120, Constants.Height / 4 + 250, Cards.CardSprinkler);
        this.createMarketCard(Constants.Width / 4 + 240, Constants.Height / 4 + 250, Cards.CardTractor);
        this.createMarketCard(Constants.Width / 4 + 450, Constants.Height / 4 + 50, Cards.CardSeed, true);

        // Farm plots
        this.farmPlots = [];
        this.plotHitBoxes = [];
        for (let i = 0; i < State.plots.length; i++) {
            const x = i % State.plotsWidth;
            const y = Math.floor(i / State.plotsWidth);
            const plot = this.add.sprite(x * 75 + 175, y * 75 + 25, Assets.Images.Plant0);
            plot.setVisible(false);
            const plotHitBox = this.add.rectangle(x * 75 + 175, y * 75 + 100, 75, 75, 0x0, 0);
            plotHitBox.setInteractive();
            plotHitBox.setStrokeStyle(1, 0x0000ff);
            plotHitBox.setVisible(false);
            plotHitBox.on(Phaser.Input.Events.POINTER_DOWN, () => {
                // TODO manage plot state properly
                console.log('clicked plot');
                State.plots[i] = (State.plots[i] + 1) % 3;
            });
            this.farmPlots.push(plot);
            this.plotHitBoxes.push(plotHitBox);
        }

        // Hand Cards
        this.handCards = {};
        for (const key in Cards) {
            this.createHandCard(Cards[key]);
        }

        this.gotoPhase(Constants.Phases.Start);
    }

    visibleDuringPhase(phase, ...objects) {
        this.events.addListener(Constants.Events.EnterPhase, () => {
            for (const object of objects) {
                object.setVisible(State.phase === phase);
            }
        });
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


    createMarketCard(x, y, card) {
        // TODO upgrade and buy buttons should be in a visibly disabled state if 
        // the player cannot afford them
        const rotation = Phaser.Math.Between(-100, 100) / 500;
        const marketCard = this.add.sprite(x, y, card.Image);
        marketCard.setRotation(rotation);
        const levelIndicator = this.add.text(x - 30, y - 55, '');
        levelIndicator.setColor('#000000');
        const upgradeButton = this.createButton(x - 30, y + 100, Assets.Images.UpgradeButton, () => {
            State.cardLevels[card.Key] += 1;
            this.events.emit(Constants.Events.RefreshMarket);
        });
        const buyButton = this.createButton(x + 30, y + 100, Assets.Images.BuyButton, () => { 
            // TODO subtract player cash and update the other buy/upgrade states
            State.hand.push(card);
            // TODO create a prettier indication that the card has been bought
            // Eg. a SOLD sign over the card
            marketCard.setTint(0xff0000);
            buyButton.setVisible(false);
            if (State.hand.length === 5) {
                this.gotoPhase(Constants.Phases.Farm);
            }
        });
        this.visibleDuringPhase(Constants.Phases.Market, marketCard, levelIndicator, upgradeButton, buyButton);
        this.events.addListener(Constants.Events.RefreshMarket, () => {
            // TODO show the card level in a proper manner
            levelIndicator.setText(`Level ${State.cardLevels[card.Key] + 1}`);
            // Show buy button if card is not in hand

            // Show upgrade button if card has a higher level

            
        });
    }

    createHandCard(card) {
        const handCard = this.add.sprite(0, Constants.Height + 25, card.Image);
        handCard.setInteractive();
        handCard.on(Phaser.Input.Events.POINTER_OVER, () => {
            // TODO animate the card falling
            handCard.setY(Constants.Height - 75);
        });
        handCard.on(Phaser.Input.Events.POINTER_OUT, () => {
            // TODO animate the card rising
            handCard.setY(Constants.Height + 25);
        });
        this.handCards[card.Key] = handCard;
    }

    update() {
        for (const object in this.handCards) {
            this.handCards[object].setVisible(false);
        }
        if (State.phase === Constants.Phases.Market || State.phase === Constants.Phases.Farm) {
            let offset = 60;
            for (const card of State.hand) {
                const handCard = this.handCards[card.Key];
                handCard.setVisible(true);
                handCard.setX(offset);
                offset += 110;
            }
        }
        for (const i in this.farmPlots) {
            const plot = this.farmPlots[i];
            plot.setTexture(Assets.Images['Plant' + State.plots[i]]);
        }
    }

}