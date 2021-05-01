import Phaser from 'phaser';
import Assets from './Assets';
import Cards from './Cards';
import Constants from './Constants';
import State from './State'; 

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
            setTimeout(() => this.events.emit(Constants.Events.RefreshMarket));

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
        this.plants= [];
        this.plots = [];
        for (let i = 0; i < State.plants.length; i++) {
            const x = i % State.plotsWidth;
            const y = Math.floor(i / State.plotsWidth);
            const plot = this.add.sprite(x * 75 + 175, y * 75 + 100, Assets.Images.Plot);
            plot.setScale(0.075);
            plot.setInteractive();
            plot.on(Phaser.Input.Events.POINTER_DOWN, () => {
                // TODO manage plot state properly
                console.log('clicked plot');
                State.plants[i] = (State.plants[i] + 1) % 6;
            
            });
            plot.on(Phaser.Input.Events.POINTER_OVER, () => {
                plot.setTint(0x00ff00);
            });
            plot.on(Phaser.Input.Events.POINTER_OUT, () => {
                plot.clearTint();
            });
            const plant = this.add.sprite(x * 75 + 175, y * 75 + 100, Assets.Images.Plant1);
            plant.setScale(0.075);
            this.plants.push(plant);
            this.plots.push(plot);
        }
        this.visibleDuringPhase(Constants.Phases.Farm, ...this.plants);
        this.visibleDuringPhase(Constants.Phases.Farm, ...this.plots);
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Farm) { return; }
            State.time = 0;
        })

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

    update(time, delta) {
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
        if (State.phase === Constants.Phases.Farm) {
            // TODO update plant plots
            // Update plant images
            for (const i in State.plants) {
                const plant = this.plants[i];
                const plot = this.plots[i];
                const level = State.plants[i];
                if (level !== 0) {
                    plant.setVisible(true);
                    plant.setTexture(Assets.Images['Plant' + Math.abs(level)]);
                } else {
                    plant.setVisible(false);
                }
            }

            State.time += delta;
            if (State.time > Constants.FarmingTime) {
                this.gotoPhase(Constants.Phases.Market);
            }
        }

    }

}