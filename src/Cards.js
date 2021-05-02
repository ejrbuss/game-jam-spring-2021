import Assets from "./Assets";

const Cards = {
    CardSeed: {
        levels: [
            { upgradeCost: 100 },
            { upgradeCost: 200 },
            { upgradeCost: 400 },
            { upgradeCost: 800 },
        ],
    },
    CardCow: {
        levels: [
            { upgradeCost: 25,
              buyCost:     10 },
            { upgradeCost: 50,
              buyCost:     25 },
            { upgradeCost: 100,
              buyCost:     50 },
            { upgradeCost: 200,
              buyCost:     100 },
        ],
    },
    CardScarecrow: {
        levels: [
          { upgradeCost: 25,
            buyCost:     10 },
          { upgradeCost: 50,
            buyCost:     25 },
          { upgradeCost: 100,
            buyCost:     50 },
          { upgradeCost: 200,
            buyCost:     100 },
        ],
    },
    CardTalisman: {
        levels: [
          { upgradeCost: 25,
            buyCost:     10 },
        ],
    },
    CardOveralls: {
        levels: [
          { upgradeCost: 25,
            buyCost:     10 },
          { upgradeCost: 50,
            buyCost:     25 },
          { upgradeCost: 100,
            buyCost:     50 },
          { upgradeCost: 200,
            buyCost:     100 },
        ],
    },
    CardSprinkler: {
        levels: [
          { upgradeCost: 25,
            buyCost:     10 },
          { upgradeCost: 50,
            buyCost:     25 },
          { upgradeCost: 100,
            buyCost:     50 },
          { upgradeCost: 200,
            buyCost:     100 },
        ],
    },
    CardTractor: {
        levels: [
          { upgradeCost: 25,
            buyCost:     10 },
          { upgradeCost: 50,
            buyCost:     25 },
          { upgradeCost: 100,
            buyCost:     50 },
          { upgradeCost: 200,
            buyCost:     100 },
        ],
    },
    CardDrought: {
    },
    CardPestilence: {
    },
    CardPlague: {
    },
};

for (const key in Cards) {
    Cards[key].Key = key;
    Cards[key].Image = Assets.Images[key];
    Cards[key].ImageDisabled = Assets.Images[key.replace('.png', 'Disabled.png')];
}

export default Cards;