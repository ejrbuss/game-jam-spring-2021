import Phaser from 'phaser';
import Assets from './Assets';
import Cards from './Cards';
import Constants from './Constants';
import State from './State';

const U = Constants.Unit;

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
        // Do the music
        this.events.addListener(Constants.Events.EnterPhase, () => {
            // TODO animate blur
            switch (State.phase) {
                case Constants.Phases.Start:
                case Constants.Phases.Market:
                case Constants.Phases.End:
                    this.sound.stopAll();
                    this.sound.play(Assets.Sounds.MarketBackgroundMusic, {
                        volume: 1,
                        loop: true,
                    });
                    break;
                case Constants.Phases.Farm:
                    this.sound.stopAll();
                    this.sound.play(Assets.Sounds.FarmBackgroundMusic, {
                        volume: 1,
                        loop: true,
                    });
                    break;
            }
        });
        const background = this.add.image(Constants.Width / 2, Constants.Height / 2, Assets.Images.FarmBackground);
        this.events.addListener(Constants.Events.EnterPhase, () => {
            // TODO animate blur
            switch (State.phase) {
                case Constants.Phases.Start:
                case Constants.Phases.End:
                case Constants.Phases.Market: background.setTexture(Assets.Images.FarmBackground); break;
                case Constants.Phases.Farm: background.setTexture(Assets.Images.FarmPlotBackground); break;
            }
        });
        background.setDisplaySize(Constants.Width, Constants.Height);
        const cornGroup = this.physics.add.group();
        const moneyBoard = this.physics.add.staticSprite(Constants.Width - 100 * U, 30 * U, Assets.Images.MoneyBoard);
        this.physics.add.collider(cornGroup, moneyBoard, (...args) => {this.handleCornCollision(...args)});
        moneyBoard.setScale(0.3 * U);
        const money = this.add.text(Constants.Width - 150 * U, 16 * U, State.playerMoney, { fontFamily: 'Nunito-Light', fontSize: 24 * U, align: 'right', color: '#B69E7C' });
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
            1 * U,
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
        const continueButton = this.createButton(Constants.Width - 100 * U, Constants.Height - 50 * U, 0.3 * U, Assets.Images.ContinueButton, () => {
            this.gotoPhase(Constants.Phases.Farm);
        });
        continueButton.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.add.tween({
                targets: continueButton,
                rotation: 0.1,
                duration: 500,
                ease: 'bounce',
            });
        });
        continueButton.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.add.tween({
                targets: continueButton,
                rotation: 0,
                duration: 500,
                ease: 'bounce',
            });
        });
        marketBoard.setDisplaySize(Constants.Width - 60 * U, Constants.Height - 60 * U);
        marketBoard.setRotation(0.05);
        this.visibleDuringPhase(Constants.Phases.Market, marketBoard, continueButton);

        this.createMarketCard(Constants.Width / 4 - 75 * U, Constants.Height / 4, Cards.CardCow);
        this.createMarketCard(Constants.Width / 4 + 125 * U, Constants.Height / 4, Cards.CardScarecrow);
        this.createMarketCard(Constants.Width / 4 + 325 * U, Constants.Height / 4, Cards.CardTalisman);
        this.createMarketCard(Constants.Width / 4 - 75 * U, Constants.Height / 4 + 225 * U, Cards.CardOveralls);
        this.createMarketCard(Constants.Width / 4 + 125 * U, Constants.Height / 4 + 225 * U, Cards.CardSprinkler);
        this.createMarketCard(Constants.Width / 4 + 325 * U, Constants.Height / 4 + 225 * U, Cards.CardTractor);
        this.createMarketCard(Constants.Width / 4 + 575 * U, Constants.Height / 4 + 125 * U, Cards.CardSeed);
        
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Market) { return; }
            State.cursedCard = [
                Cards.CardCow,
                Cards.CardScarecrow,
                Cards.CardTalisman,
                Cards.CardOveralls,
                Cards.CardSprinkler,
                Cards.CardTractor,
            ][Phaser.Math.Between(0, 5)];
        })

        // Farm plots
        this.plants= [];
        this.plots = [];
        for (let i = 0; i < State.plants.length; i++) {
            const x = i % State.plotsWidth;
            const y = Math.floor(i / State.plotsWidth);
            const xPos = x * 80 * U + 148 * U;
            const yPos = y * 80 * U + 78 * U;
            const plot = this.add.sprite(xPos, yPos, Assets.Images.PlotDry);
            const plotBox = this.add.rectangle(xPos, yPos, 70 * U, 70 * U);
            plotBox.setStrokeStyle(2, 0x121200);
            plotBox.setVisible(false);
            plot.setScale(0.08 * U);
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
                    this.sound.play(Assets.Sounds.Sow);
                    State.plants[i] = -1;
                }
                // Water
                if (level < 0) {
                    this.sound.play(Assets.Sounds.Water);
                    State.plants[i] = -level;
                }
                // Harvest
                if (level === State.cardLevels.CardSeed + 2) {
                    this.sound.play(Assets.Sounds.HarvestClick);
                    State.plants[i] = 0;
                    this.events.emit(Constants.Events.RefreshMoney);
                    for (let x = -1; x < level; x++) {
                        const xOffset = (Math.random() * 2 - 1) * 100;
                        const yOffset = (Math.random() * 2 - 1) * 100;
                        this.createZoomingCorn(cornGroup, xPos + xOffset, yPos + yOffset);
                    }
                }
            });
            plot.on(Phaser.Input.Events.POINTER_OVER, () => {
            });
            plot.on(Phaser.Input.Events.POINTER_OUT, () => {
            });
            const plant = this.add.sprite(
                x * 80 * U + 148 * U + Math.random() * 8 * U, 
                y * 80 * U + 78 * U + Math.random() * 8 * U, 
                Assets.Images.Plant1,
            );
            plant.setScale(0.075 * U);
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
        this.handCardsStars = {};
        for (const key in Cards) {
            this.createHandCard(Cards[key]);
        }

        this.gotoPhase(Constants.Phases.Start);
    }

    handleCornCollision(sign, corn) {
        corn.destroy();
        State.playerMoney += 20;
        this.events.emit(Constants.Events.RefreshMoney);
        this.sound.play(Assets.Sounds.HarvestGain, {
            volume: 1
        });
    }

    createZoomingCorn(cornGroup, x, y) {
        const cornAsset = Assets.Images.Corn;
        const corn = cornGroup.create(x, y, cornAsset);
        corn.setScale(0.075);
        const offset = {x: Constants.Width - x, y: y};
        corn.setVelocity(offset.x, -offset.y);
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
        const marketCard = this.add.sprite(x, y, card.Image);
        // marketCard.setRotation(rotation);

        marketCard.setScale(0.15 * U);
        marketCard.setInteractive();

        const star = this.add.sprite(x, y);
        star.setScale(0.15 * U);

        marketCard.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.add.tween({
                targets: [ marketCard, star ],
                rotation: 0.1,
                ease: 'bounce',
                duration: '500',
            });
        });
        marketCard.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.add.tween({
                targets: [ marketCard, star ],
                rotation: 0,
                ease: 'bounce',
                duration: '500',
            });
        });

        let upgradeButton;
        let buyButton;
        if (card === Cards.CardSeed) {
            upgradeButton = this.createButton(x, y + 100 * U, 0.15 * U, Assets.Images.UpgradeButton, () => {
                let curLevel = State.cardLevels[card.Key];
                if ( (curLevel + 1 == card.levels.length)                       // the card is max level
                  || (State.playerMoney < card.levels[curLevel].upgradeCost) )  // the user does not have enough money
                { return; }
                State.playerMoney -= card.levels[curLevel].upgradeCost;
                State.cardLevels[card.Key] += 1;
                this.events.emit(Constants.Events.RefreshMoney);
                this.events.emit(Constants.Events.RefreshMarket);
            });
            this.visibleDuringPhase(Constants.Phases.Market, marketCard, star, upgradeButton);
        }
        else
        {
            upgradeButton = this.createButton(x - 28 * U, y + 100 * U, 0.15 * U, Assets.Images.UpgradeButton, () => {
                let curLevel = State.cardLevels[card.Key];
                if ( (curLevel + 1 == card.levels.length)                       // the card is max level
                  || (State.hand.includes(card))                                // the card is already in hand
                  || (State.playerMoney < card.levels[curLevel].upgradeCost) )  // the user does not have enough money
                { return; }
                State.playerMoney -= card.levels[curLevel].upgradeCost;
                State.cardLevels[card.Key] += 1;
                this.events.emit(Constants.Events.RefreshMoney);
                this.events.emit(Constants.Events.RefreshMarket);
            });
            buyButton = buyButton = this.createButton(x + 40 * U, y + 100 * U, 0.15 * U, Assets.Images.BuyButton, () => {
                let curLevel = State.cardLevels[card.Key];
                if ( (State.hand.includes(card))                            // the card is already in hand
                  || (State.playerMoney < card.levels[curLevel].buyCost) )  // the user does not have enough money
                { return; }
                if (card === State.cursedCard) {
                    let curse = [
                        Cards.CardPestilence,
                        Cards.CardPlague,
                        Cards.CardDrought,
                    ].filter(x => !State.hand.includes(x))[Phaser.Math.Between(0, 1)];
                    State.hand.push(curse);
                }
                State.playerMoney -= card.levels[curLevel].buyCost;
                this.sound.play(Assets.Sounds.Buy);
                State.hand.push(card);
                if (State.hand.length === 5) {
                    this.gotoPhase(Constants.Phases.Farm);
                }
                this.events.emit(Constants.Events.RefreshMoney);
                this.events.emit(Constants.Events.RefreshMarket);
            });
            this.visibleDuringPhase(Constants.Phases.Market, marketCard, star, upgradeButton, buyButton);
        }
        this.events.addListener(Constants.Events.RefreshMarket, () => {
            let curLevel = State.cardLevels[card.Key];
            // clear tints and then we're gonna reapply them
            marketCard.clearTint();
            upgradeButton.clearTint();
            if (buyButton) buyButton.clearTint();
            if (curLevel + 1 == card.levels.length) {
                upgradeButton.setTint(0xff0000);
            }
            if (card === State.cursedCard) {
                marketCard.setTint(0xff00ff);
            }
            if ( (card != Cards.CardSeed)
              && (State.hand.includes(card)) ) {
                // TODO create a prettier indication that the card has been bought
                // Eg. a SOLD sign over the card
                marketCard.setTint(0xff0000);
                upgradeButton.setTint(0xff0000);
                if (buyButton) buyButton.setTint(0xff0000);
            }
            else {
                if (State.hand.length >= 4) {
                    if (card === State.cursedCard) {
                        marketCard.setTint(0xff0088);
                        upgradeButton.setTint(0xff0000);
                        if (buyButton) buyButton.setTint(0xff0000);
                    }
                }
                if (State.playerMoney < card.levels[curLevel].buyCost) {
                    if (buyButton) buyButton.setTint(0xff0000);
                }
                if ( (State.playerMoney < card.levels[curLevel].upgradeCost)
                  || (curLevel + 1 == card.levels.length) ) {
                    upgradeButton.setTint(0xff0000);
                }
            }

            switch (curLevel) {
                case 1: star.setTexture(Assets.Images.Star1); break;
                case 2: star.setTexture(Assets.Images.Star2); break;
                case 3: star.setTexture(Assets.Images.Star3); break;
                default: star.setTexture(undefined); break;
            }

        });
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Market) { return; }
            marketCard.clearTint();
            if (buyButton) buyButton.clearTint();
            if (State.cardLevels[card.Key] + 1 < card.levels.length) {
                upgradeButton.clearTint();
            }
            this.events.emit(Constants.Events.RefreshMarket);
        });
    }

    createHandCard(card) {
        const handCard = this.add.sprite(0, Constants.Height + 25 * U, card.Image);
        handCard.setInteractive();
        handCard.setScale(0.15 * U);
        const star = this.add.sprite(0, Constants.Height + 25 * U);
        star.setScale(0.15 * U);
        handCard.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.add.tween({
                targets: [ handCard, star ],
                y: Constants.Height - 100 * U,
                ease: 'Expo',
                duration: 500,
            });
        });
        handCard.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.add.tween({
                targets: [ handCard, star ],
                y: Constants.Height + 25 * U,
                ease: 'Expo',
                duration: 500,
            });
        });
        this.handCards[card.Key] = handCard;
        this.handCardsStars[card.Key] = star;
        this.events.addListener(Constants.Events.RefreshMarket, () => {
            let curLevel = State.cardLevels[card.Key];
            switch (curLevel) {
                case 1: star.setTexture(Assets.Images.Star1); break;
                case 2: star.setTexture(Assets.Images.Star2); break;
                case 3: star.setTexture(Assets.Images.Star3); break;
                default: star.setTexture(undefined); break;
            }
        });
    }

    update(time, delta) {
        for (const object in this.handCards) {
            this.handCards[object].setVisible(false);
        }
        for (const object in this.handCardStars) {
            this.handCardStars[object].setVisible(false);
        }
        if (State.phase === Constants.Phases.Market || State.phase === Constants.Phases.Farm) {
            let offset = 75 * U;
            for (const card of State.hand) {
                const handCard = this.handCards[card.Key];
                const star = this.handCardsStars[card.Key];
                handCard.setVisible(true);
                handCard.setX(offset);
                star.setVisible(true);
                star.setX(offset);
                offset += 150 * U;
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
                    if (State.cardLevels.CardSeed + 2 > State.plants[i]) {
                        State.plants[i] += 1;
                    }
                }
                State.lastTick = State.lastTick + 100;
            }
        }

    }

}