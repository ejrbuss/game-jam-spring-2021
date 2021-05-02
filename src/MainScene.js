import Phaser from 'phaser';
import Assets from './Assets';
import Cards from './Cards';
import Constants from './Constants';
import State from './State';

export default class MainScene extends Phaser.Scene {

    constructor() {
        super('MainScene');
        window.MainScene = this;
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
        background.setDisplaySize(Constants.Width, Constants.Height);
        const moneyBoard = this.add.image(Constants.Width - 100 * Constants.Unit, 30 * Constants.Unit, Assets.Images.MoneyBoard);
        moneyBoard.setScale(0.3 * Constants.Unit);
        const money = this.add.text(Constants.Width - 150 * Constants.Unit, 16 * Constants.Unit, "0", { fontFamily: 'Nunito-Light', fontSize: 24 * Constants.Unit, align: 'right', color: '#B69E7C' });
        money.setDisplayOrigin(0, 0);
        this.events.addListener(Constants.Events.EnterPhase, () => {
            const moneyVisible = State.phase === Constants.Phases.Market || State.phase === Constants.Phases.Farm;
            moneyBoard.setVisible(moneyVisible);
            money.setVisible(moneyVisible);
        });
        this.events.addListener(Constants.Events.RefreshMoney, () => {
            money.setText(State.playerMoney);
        });

        // Start screen
        const startButton = this.createButton(
            Constants.Width / 2, 
            Constants.Height / 2,
            2,
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
        marketBoard.setDisplaySize(Constants.Width - 60 * Constants.Unit, Constants.Height - 60 * Constants.Unit);
        marketBoard.setRotation(0.05);
        this.visibleDuringPhase(Constants.Phases.Market, marketBoard);

        this.createMarketCard(Constants.Width / 4 - 75 * Constants.Unit, Constants.Height / 4, Cards.CardCow);
        this.createMarketCard(Constants.Width / 4 + 125 * Constants.Unit, Constants.Height / 4, Cards.CardScarecrow);
        this.createMarketCard(Constants.Width / 4 + 325 * Constants.Unit, Constants.Height / 4, Cards.CardTalisman);
        this.createMarketCard(Constants.Width / 4 - 75 * Constants.Unit, Constants.Height / 4 + 225 * Constants.Unit, Cards.CardOveralls);
        this.createMarketCard(Constants.Width / 4 + 125 * Constants.Unit, Constants.Height / 4 + 225 * Constants.Unit, Cards.CardSprinkler);
        this.createMarketCard(Constants.Width / 4 + 325 * Constants.Unit, Constants.Height / 4 + 225 * Constants.Unit, Cards.CardTractor);
        this.createMarketCard(Constants.Width / 4 + 575 * Constants.Unit, Constants.Height / 4 + 125 * Constants.Unit, Cards.CardSeed);

        // Farm plots
        this.plants= [];
        this.plots = [];
        for (let i = 0; i < State.plants.length; i++) {
            const x = i % State.plotsWidth;
            const y = Math.floor(i / State.plotsWidth);
            const plot = this.add.sprite(x * 75 * Constants.Unit + 175 * Constants.Unit, y * 75 * Constants.Unit + 100 * Constants.Unit, Assets.Images.PlotDry);
            const plotBox = this.add.rectangle(x * 75 * Constants.Unit + 175 * Constants.Unit, y * 75 * Constants.Unit + 100 * Constants.Unit, 70 * Constants.Unit, 70 * Constants.Unit);
            plotBox.setStrokeStyle(2, 0x121200);
            plotBox.setVisible(false);
            plot.setScale(0.075 * Constants.Unit);
            plot.setInteractive();
            plot.on(Phaser.Input.Events.POINTER_OVER, () => {
                plotBox.setVisible(true);                
            });
            plot.on(Phaser.Input.Events.POINTER_OUT, () => {
                plotBox.setVisible(false);
            });
            plot.on(Phaser.Input.Events.POINTER_DOWN, () => {
                const level = State.plants[i];
                // Plant
                if (level === 0) {
                    State.plants[i] = -1;
                }
                // Water
                if (level < 0) {
                    State.plants[i] = -level;
                }
                // Harvest
                if (level === 5) {
                    State.plants[i] = 0;
                    State.playerMoney += 100;
                    this.events.emit(Constants.Events.RefreshMoney);
                }
            });
            plot.on(Phaser.Input.Events.POINTER_OVER, () => {
            });
            plot.on(Phaser.Input.Events.POINTER_OUT, () => {
            });
            const plant = this.add.sprite(
                x * 75 * Constants.Unit + 175 * Constants.Unit + Math.random() * 8 * Constants.Unit, 
                y * 75 * Constants.Unit + 100 * Constants.Unit + Math.random() * 8 * Constants.Unit, 
                Assets.Images.Plant1,
            );
            plant.setScale(0.075 * Constants.Unit);
            this.plants.push(plant);
            this.plots.push(plot);
        }
        this.visibleDuringPhase(Constants.Phases.Farm, ...this.plants);
        this.visibleDuringPhase(Constants.Phases.Farm, ...this.plots);
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Farm) { return; }
            State.time = 0;
            State.lastTick = 0;
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

    createButton(x, y, scale, buttonAsset, onClick) {
        const button = this.add.sprite(x, y, buttonAsset);
        button.setScale(scale);
        button.setInteractive();
        button.on(Phaser.Input.Events.POINTER_OVER, () => {
            button.setTint(0xdddddd);
        });
        button.on(Phaser.Input.Events.POINTER_OUT, () => {
            button.clearTint();
        });
        button.on(Phaser.Input.Events.POINTER_DOWN, () => {
        });
        button.on(Phaser.Input.Events.POINTER_UP, () => {
            onClick();
        });
        return button;
    }

    createMarketCard(x, y, card) {
        // TODO upgrade and buy buttons should be in a visibly disabled state if 
        // the player cannot afford them
        const marketCard = this.add.sprite(x, y, card.Image);
        // marketCard.setRotation(rotation);
        marketCard.setScale(0.3);
        const levelIndicator = this.add.text(x - 30, y - 55, '');
        levelIndicator.setColor('#000000');
        const upgradeButton = this.createButton(x - 28 * Constants.Unit, y + 100 * Constants.Unit, 0.3, Assets.Images.UpgradeButton, () => {
            State.cardLevels[card.Key] += 1;
            this.events.emit(Constants.Events.RefreshMarket);
        });
        const buyButton = this.createButton(x + 40 * Constants.Unit, y + 100 * Constants.Unit, 0.3, Assets.Images.BuyButton, () => { 
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
        const handCard = this.add.sprite(0, Constants.Height + 25 * Constants.Unit, card.Image);
        handCard.setInteractive();
        handCard.setScale(0.3);
        handCard.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.add.tween({
                targets: handCard,
                y: Constants.Height - 100 * Constants.Unit,
                ease: 'Expo',
                duration: 500,
            });
        });
        handCard.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.add.tween({
                targets: handCard,
                y: Constants.Height + 25 * Constants.Unit,
                ease: 'Expo',
                duration: 500,
            });
        });
        this.handCards[card.Key] = handCard;
    }

    update(time, delta) {
        for (const object in this.handCards) {
            this.handCards[object].setVisible(false);
        }
        if (State.phase === Constants.Phases.Market || State.phase === Constants.Phases.Farm) {
            let offset = 75 * Constants.Unit;
            for (const card of State.hand) {
                const handCard = this.handCards[card.Key];
                handCard.setVisible(true);
                handCard.setX(offset);
                offset += 150 * Constants.Unit;
            }
        }
        if (State.phase === Constants.Phases.Farm) {
            // TODO update plant plots
            // Update plant images
            for (const i in State.plants) {
                const plant = this.plants[i];
                const plot = this.plots[i];
                const level = State.plants[i];
                if (level <= 0) {
                    plot.setTexture(Assets.Images.PlotDry);
                } else {
                    plot.setTexture(Assets.Images.PlotWet);
                }
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
            } else if (State.time - State.lastTick > 100) {
                const i = Phaser.Math.Between(0, State.plants.length);
                const level = State.plants[i];
                if (level > 0 && level <= 4 && Math.random() > Constants.GrowthChance) {
                    State.plants[i] += 1;
                }
                State.lastTick = State.lastTick + 100;
            }
        }

    }

}