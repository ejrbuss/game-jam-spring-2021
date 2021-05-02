import Assets from "./Assets";

const Cards = {
    CardSeed: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
              buyCost:     100 },
        ],
    },
    CardCow: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
              buyCost:     100 },
        ],
    },
    CardScarecrow: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
              buyCost:     100 },
        ],
    },
    CardTalisman: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
              buyCost:     100 },
        ],
    },
    CardOveralls: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
              buyCost:     100 },
        ],
    },
    CardSprinkler: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
              buyCost:     100 },
        ],
    },
    CardTractor: {
        levels: [
            { upgradeCost: 50,
              buyCost:     10 },
            { upgradeCost: 100,
              buyCost:     20 },
            { upgradeCost: 500,
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
}

export default Cards;