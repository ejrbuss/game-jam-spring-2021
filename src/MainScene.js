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
                case Constants.Phases.Start: background.setTexture(Assets.Images.FarmTitleBackground); break;
                case Constants.Phases.End:
                case Constants.Phases.Market: background.setTexture(Assets.Images.FarmBackground); break;
            }
        });
        background.setDisplaySize(Constants.Width, Constants.Height);
        this.background = background;
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
            Constants.Width / 2 - 90 * U, 
            Constants.Height / 2 + 50 * U,
            0.35 * U,
            Assets.Images.StartButton, 
            () => { 
                this.gotoPhase(Constants.Phases.Market) 
            });
        this.visibleDuringPhase(Constants.Phases.Start, startButton);


        // Farm plots
        this.plants= [];
        this.plots = [];
        this.plantTweens = [];
        this.plotBoxes = [];
        for (let i = 0; i < State.plants.length; i++) {
            const x = i % State.plotsWidth;
            const y = Math.floor(i / State.plotsWidth);
            const xPos = x * 80 * U + 148 * U;
            const yPos = y * 80 * U + 78 * U;
            const plot = this.add.sprite(xPos, yPos, Assets.Images.PlotDry);
            const plotBox = this.add.sprite(xPos, yPos, Assets.Images.SelectionSquare);
            plotBox.setVisible(false);
            plotBox.setScale(0.3);
            plot.setScale(0.08 * U);
            plot.setInteractive();
            plot.on(Phaser.Input.Events.POINTER_OVER, () => {
                plotBox.setVisible(true);
                // Overalls
                if (State.hand.includes(Cards.CardOveralls)) {
                    if (State.plants[i] === 0) {
                        const returns = this.AOEgetThings(State.cardLevels[Cards.CardOveralls.Key], i, this.plotBoxes);
                        for (const plotBox of returns) {
                            if (State.plants[this.plotBoxes.indexOf(plotBox)] === 0) {
                                plotBox.setVisible(true);
                            }
                        }
                    }
                }
                // Sprinkler
                if (State.hand.includes(Cards.CardSprinkler)) {
                    if (State.plants[i] < 0) {
                        // Handle wilted case
                        if (State.plants[i] === -99) {
                            const returns = this.AOEgetThings(State.cardLevels[Cards.CardSprinkler.Key], i, this.plotBoxes);
                            for (const plotBox of returns) {
                                if (State.plants[this.plotBoxes.indexOf(plotBox)] === -99) {
                                    plotBox.setVisible(true);
                                }
                            }
                        } else {
                            const returns = this.AOEgetThings(State.cardLevels[Cards.CardSprinkler.Key], i, this.plotBoxes);
                            for (const plotBox of returns) {
                                if (State.plants[this.plotBoxes.indexOf(plotBox)] < 0
                                 && State.plants[this.plotBoxes.indexOf(plotBox)] !== -99) {
                                    plotBox.setVisible(true);
                                }
                            }
                        }
                    }
                }
            });
            plot.on(Phaser.Input.Events.POINTER_OUT, () => {
                plotBox.setVisible(false);
                const returns = this.AOEgetThings(2, i, this.plotBoxes);
                for (const plotBox of returns) {
                    plotBox.setVisible(false);
                }
            });
            plot.on(Phaser.Input.Events.POINTER_DOWN, () => {
                const level = State.plants[i];
                // Plant
                if (level === 0) {
                    this.sound.play(Assets.Sounds.Sow);
                    State.plants[i] = -1;
                    if (State.hand.includes(Cards.CardOveralls)) {
                        const returns = this.AOEgetThings(State.cardLevels[Cards.CardOveralls.Key], i, this.plots);
                        for (const plot of returns) {
                            if (State.plants[this.plots.indexOf(plot)] === 0) {
                                State.plants[this.plots.indexOf(plot)] = -1;
                            }
                        }
                    }
                }
                // Water
                else if (level <= 0) {
                    // Handle wilted case
                    if (level === -99) {
                        this.sound.play(Assets.Sounds.Sow);
                        State.plants[i] = 0;
                        if (State.hand.includes(Cards.CardSprinkler)) {
                            const returns = this.AOEgetThings(State.cardLevels[Cards.CardSprinkler.Key], i, this.plots);
                            for (const plot of returns) {
                                if (State.plants[this.plots.indexOf(plot)] === -99) {
                                    State.plants[this.plots.indexOf(plot)] = 0;
                                }
                            }
                        }
                    } else {
                        this.sound.play(Assets.Sounds.Water);
                        State.plants[i] = -level;
                        if (State.hand.includes(Cards.CardSprinkler)) {
                            const returns = this.AOEgetThings(State.cardLevels[Cards.CardSprinkler.Key], i, this.plots);
                            for (const plot of returns) {
                                if (State.plants[this.plots.indexOf(plot)] <= 0) {
                                    State.plants[this.plots.indexOf(plot)] = -State.plants[this.plots.indexOf(plot)];
                                }
                            }
                        }
                    }
                }
                // Harvest
                else if (level === State.cardLevels.CardSeed + 2) {
                    this.sound.play(Assets.Sounds.HarvestClick);
                    State.plants[i] = 0;
                    this.events.emit(Constants.Events.RefreshMoney);
                    for (let x = 0; x < Math.pow(2, level - 2); x++) {
                        const xOffset = (Math.random() * 2 - 1) * 200;
                        const yOffset = (Math.random() * 2 - 1) * 200;
                        this.createZoomingCorn(cornGroup, xPos + xOffset, yPos + yOffset);
                    }
                }
                // Clean wilted
                else if (level === -99) {
                    this.sound.play(Assets.Sounds.HarvestClick);
                    State.plants[i] = 0;
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
            const tween = this.add.tween({
                targets: plant,
                rotation: 0.1,
                duration: 250,
                ease: 'sine',
                loop: true,
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 500,
            })
            this.plants.push(plant);
            this.plots.push(plot);
            this.plantTweens.push(tween);
            this.plotBoxes.push(plotBox);
        }
        this.visibleDuringPhase(Constants.Phases.Farm, ...this.plants);
        this.visibleDuringPhase(Constants.Phases.Farm, ...this.plots);
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Farm) { return; }
            State.time = 0;
            State.lastTick = 0;
        });

        this.createSeasonWheel();
        this.visibleDuringPhase(Constants.Phases.Farm);

        // Market
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase !== Constants.Phases.Market) { return; }
            // Reset players hand
            State.plants = State.plants.map(plant => plant === 0 ? 0 : -99);
            State.hand = [
                Cards.CardSeed,
                [
                    Cards.CardPestilence,
                    Cards.CardPlague,
                    Cards.CardDrought,
                ][Phaser.Math.Between(0, 2)],
            ];
            State.cursedCard = [
                Cards.CardCow,
                Cards.CardScarecrow,
                Cards.CardTalisman,
                Cards.CardOveralls,
                Cards.CardSprinkler,
                Cards.CardTractor,
            ][Phaser.Math.Between(0, 5)];
            // Tell market cards to refresh
            setTimeout(() => this.events.emit(Constants.Events.RefreshMarket));

        });
        this.marketAnimated = [];
        const marketBoard = this.add.image(Constants.Width / 2, Constants.Height / 2 - 30 * U, Assets.Images.MarketBackground);
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
        marketBoard.setDisplaySize(Constants.Width - 60 * U, Constants.Height - 55 * U);
        this.marketAnimated.push(marketBoard);
        this.visibleDuringPhase(Constants.Phases.Market, continueButton);

        this.createMarketCard(Constants.Width / 4 - 75 * U, Constants.Height / 4, Cards.CardCow);
        this.createMarketCard(Constants.Width / 4 + 125 * U, Constants.Height / 4, Cards.CardScarecrow);
        this.createMarketCard(Constants.Width / 4 + 325 * U, Constants.Height / 4, Cards.CardTalisman);
        this.createMarketCard(Constants.Width / 4 - 75 * U, Constants.Height / 4 + 225 * U, Cards.CardOveralls);
        this.createMarketCard(Constants.Width / 4 + 125 * U, Constants.Height / 4 + 225 * U, Cards.CardSprinkler);
        this.createMarketCard(Constants.Width / 4 + 325 * U, Constants.Height / 4 + 225 * U, Cards.CardTractor);
        this.createMarketCard(Constants.Width / 4 + 575 * U, Constants.Height / 4 + 125 * U, Cards.CardSeed);
        
        for (const target of this.marketAnimated) {
            target.originalY = target.y;
            target.setY(target.y - Constants.Height);
        }
        this.events.addListener(Constants.Events.EnterPhase, () => {
            if (State.phase === Constants.Phases.Farm || State.phase === Constants.Phases.Market) {
                this.sound.play(Assets.Sounds.BoardFall, {
                    volume: 2,
                });
            }
            if (State.phase !== Constants.Phases.Market) { return; }
            for (const target of this.marketAnimated) {
                this.add.tween({
                    targets: target,
                    y: target.originalY,
                    duration: 1000,
                    ease: 'Bounce',
                });
            }

        });
        this.events.addListener(Constants.Events.ExitPhase, () => {
            if (State.phase !== Constants.Phases.Market) { return; }
            for (const target of this.marketAnimated) {
                this.add.tween({
                    targets: target,
                    y: target.originalY - Constants.Height,
                    duration: 1000,
                    ease: 'Bounce',
                });
            }
        });

        // Hand Cards
        this.handCards = {};
        this.handCardsStars = {};
        for (const key in Cards) {
            this.createHandCard(Cards[key]);
        }

        const blackScreen = this.add.rectangle(Constants.Width / 2, Constants.Height / 2, Constants.Width, Constants.Height, 0x0);
        this.add.tween({
            targets: blackScreen,
            duration: 500,
            ease: 'sine',
            alpha: 0,
        });
        this.gotoPhase(Constants.Phases.Start);
    }

    handleCornCollision(sign, corn) {
        corn.destroy();
        State.playerMoney++;
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

    AOEgetThings(level, i, things) {
        let returns = [];
        switch(level) {
            case 2:
                // get the plots in the diagonals, if applicable
                let ulThing, urThing, llThing, lrThing;
                if ((i > 9) && (i % 8 != 0)) {
                    ulThing = things[i-9];
                    returns.push(ulThing);
                }
                if ((i > 7) && ((i+1) % 8 != 0)) {
                    urThing = things[i-7];
                    returns.push(urThing);
                }
                if ((i < 32) && (i % 8 != 0)) {
                    llThing = things[i+7];
                    returns.push(llThing);
                }
                if ((i < 31) && ((i+1) % 8 != 0)) {
                    lrThing = things[i+9];
                    returns.push(lrThing);
                }
            case 1:
                // get the plots above and below, if applicable
                let aboveThing, belowThing;
                if (i > 7) {
                    aboveThing = things[i-8];
                    returns.push(aboveThing);
                }
                if (i < 32) {
                    belowThing = things[i+8];
                    returns.push(belowThing);
                }
            case 0:
                // get the plots on the left and right, if applicable
                let leftThing, rightThing;
                if ((i != 0) && (i % 8 != 0)) {
                    leftThing = things[i-1];
                    returns.push(leftThing);
                }
                if ((i != this.plotBoxes.length-1) && ((i+1) % 8 != 0)) {
                    rightThing = things[i+1];
                    returns.push(rightThing);
                }
                break;
            default: break;
        }
        return returns;
    }

    visibleDuringPhase(phase, ...objects) {
        this.events.addListener(Constants.Events.EnterPhase, () => {
            for (const object of objects) {
                object.setVisible(State.phase === phase);
            }
        });
    }

    createSeasonWheel() {
        this.seasonWheel = this.add.sprite(Constants.Width - 100 * U, 100 * U, Assets.Images.SeasonWheel);
        const seasonArrow = this.add.sprite(Constants.Width - 99 * U, 81 * U, Assets.Images.SeasonWheelArrow);
        this.seasonWheel.setScale(0.20 * U);
        seasonArrow.setScale(0.20 * U);
        this.visibleDuringPhase(Constants.Phases.Farm, this.seasonWheel, seasonArrow);
    }

    createButton(x, y, scale, buttonAsset, onClick) {
        const button = this.add.sprite(x, y, buttonAsset);
        button.setScale(scale);
        button.setInteractive();
        button.on(Phaser.Input.Events.POINTER_OVER, () => {
            if (!button.texture.key.endsWith('Disabled.png')) {
                button.setTint(0xdddddd);
            }
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
        let upgradeText;
        let buyText;
        if (card === Cards.CardSeed) {
            upgradeButton = this.createButton(x, y + 100 * U, 0.15 * U, Assets.Images.RockButtonUpgrade, () => {
                let curLevel = State.cardLevels[card.Key];
                if ( (curLevel + 1 >= card.levels.length)                      // the card is max level
                  || (State.playerMoney < card.levels[curLevel].upgradeCost) )  // the user does not have enough money
                { return; }
                State.playerMoney -= card.levels[curLevel].upgradeCost;
                State.cardLevels[card.Key] += 1;
                this.events.emit(Constants.Events.RefreshMoney);
                this.events.emit(Constants.Events.RefreshMarket);
            });
            upgradeText = this.add.text(x - 40 * U, y + 92 * U, "Upgrade: $XXX", Constants.MarketTextStates);
            // this.visibleDuringPhase(Constants.Phases.Market, marketCard, star, upgradeButton);
            this.marketAnimated.push(marketCard, star, upgradeButton, upgradeText);
        }
        else
        {
            upgradeButton = this.createButton(x, y + 80 * U, 0.15 * U, Assets.Images.RockButtonUpgrade, () => {
                let curLevel = State.cardLevels[card.Key];
                if ( (curLevel + 1 >= card.levels.length)                           // the card is max level
                  || (State.hand.includes(card))                                // the card is already in hand
                  || (State.playerMoney < card.levels[curLevel].upgradeCost) )  // the user does not have enough money
                { return; }
                State.playerMoney -= card.levels[curLevel].upgradeCost;
                State.cardLevels[card.Key] += 1;
                this.events.emit(Constants.Events.RefreshMoney);
                this.events.emit(Constants.Events.RefreshMarket);
            });
            upgradeText = this.add.text(x - 40 * U, y + 72 * U, "Upgrade: $XXX", Constants.MarketTextStates);
            buyButton = this.createButton(x, y + 105 * U, 0.15 * U, Assets.Images.RockButtonBuy, () => {
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
            buyText = this.add.text(x - 30 * U, y + 98 * U, "Buy: $XXX", Constants.MarketTextStates);
            // this.visibleDuringPhase(Constants.Phases.Market, marketCard, star, upgradeButton, buyButton);
            this.marketAnimated.push(marketCard, star, upgradeButton, buyButton, upgradeText, buyText);
        }
        this.events.addListener(Constants.Events.RefreshMarket, () => {
            let curLevel = State.cardLevels[card.Key];
            // clear tints and then we're gonna reapply them
            marketCard.clearTint();
            marketCard.setTexture(card.Image);
            marketCard.setVisible(true);
            star.setVisible(true);
            upgradeButton.setTexture(Assets.Images.RockButtonUpgrade);
            
            const upgradeCost = card.levels[State.cardLevels[card.Key]].upgradeCost;
            if (upgradeCost > 0) {
                upgradeButton.setVisible(true);
                upgradeText.setVisible(true);
                upgradeText.setText("Upgrade: $" + upgradeCost);
            } else {
                upgradeButton.setVisible(false);
                upgradeText.setVisible(false);
            }

            if (buyButton) {
                buyButton.setTexture(Assets.Images.RockButtonBuy);
                buyButton.setVisible(true);
                buyText.setVisible(true);
                buyText.setText("Buy: $" + card.levels[State.cardLevels[card.Key]].buyCost);
            }
            if (curLevel + 1 == card.levels.length) {
                upgradeButton.setTexture(Assets.Images.RockButtonDisabled);
            }
            if (card === State.cursedCard) {
                marketCard.setTint(0xff00ff);
            }
            if ( (card != Cards.CardSeed)
              && (State.hand.includes(card)) ) {
                // TODO create a prettier indication that the card has been bought
                // Eg. a SOLD sign over the card
                marketCard.setVisible(false);
                star.setVisible(false);
                upgradeButton.setVisible(false);
                upgradeText.setVisible(false);
                if (buyButton) {
                    buyButton.setVisible(false);
                    buyText.setVisible(false);
                }
            } else {
                if (State.hand.length >= 4) {
                    if (card === State.cursedCard) {
                        marketCard.setTint(0xff0088);
                        upgradeButton.setTexture(Assets.Images.RockButtonDisabled);
                        if (buyButton) {
                            buyButton.setTexture(Assets.Images.RockButtonDisabled);
                        }
                    }
                }
                if (curLevel < card.levels.length) {
                    if (State.playerMoney < card.levels[curLevel].buyCost) {
                        if (buyButton) {
                            buyButton.setTexture(Assets.Images.RockButtonDisabled);
                        }
                    }
                    if ( (State.playerMoney < card.levels[curLevel].upgradeCost)
                    || (curLevel == card.levels.length) ) {
                        upgradeButton.setTexture(Assets.Images.RockButtonDisabled);
                    }
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
        for (const object in this.handCardsStars) {
            this.handCardsStars[object].setVisible(false);
        }
        if (State.playerMoney >= 1000) {
            console.log('YOU WIN!');
            this.scene.start('CreditsScene');
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
                if (level == -99) {
                    plant.setVisible(true);
                    plant.setTexture(Assets.Images['PlantWilted']);
                } else if (level !== 0) {
                    plant.setVisible(true);
                    plant.setTexture(Assets.Images['Plant' + Math.abs(level)]);
                } else {
                    plant.setVisible(false);
                }
                if (level === State.cardLevels.CardSeed + 2) {
                    this.plantTweens[i].resume();
                } else {
                    this.plantTweens[i].pause();
                }
            }

            State.time += delta;
            if (State.time > Constants.FarmingTime) {
                this.gotoPhase(Constants.Phases.Market);
            } else if (State.time - State.lastTick > 100) {

                let newRotation = State.time / Constants.FarmingTime;
                
                if (newRotation < 0.25) {
                    this.background.setTexture(Assets.Images.FarmBackgroundSpring);
                } else if (newRotation < 0.5) {
                    this.background.setTexture(Assets.Images.FarmBackgroundSummer);
                } else if (newRotation < 0.75) {
                    this.background.setTexture(Assets.Images.FarmBackgroundFall);
                } else {
                    this.background.setTexture(Assets.Images.FarmBackgroundWinter);
                }
                
                newRotation = newRotation * Math.PI * 2 * -1; // -1 to rotate counterclockwise
                this.seasonWheel.setRotation(newRotation);

                for (let i = 0; i < State.plants.length; i++) {
                    const level = State.plants[i];
                    let cowMultiplier = 1;
                    if (State.hand.includes(Cards.CardCow)) {
                        cowMultiplier = [ 2.0, 4.0, 8.0, 16.0 ][State.cardLevels.CardCow];
                    }
                    if (level > 0 && level <= 4 && Constants.GrowthChance * cowMultiplier > Math.random()) {
                        if ( (State.hand.includes(Cards.CardPlague))
                            && (!State.hand.includes(Cards.CardTalisman))
                            && (Constants.WiltOnGrowthChance > Math.random()) ) {
                            State.plants[i] = -99;
                        } else {
                            if (State.cardLevels.CardSeed + 2 > State.plants[i]) {
                                State.plants[i] += 1;
                            }
                        }
                    }
                    if ( (State.hand.includes(Cards.CardDrought))
                      && (!State.hand.includes(Cards.CardTalisman))
                      && (level > 0)
                      && (Constants.DryingChance > Math.random()) ) {
                        State.plants[i] = -level;
                    }

                }
                State.lastTick = State.lastTick + 100;
            }
        }

    }

}