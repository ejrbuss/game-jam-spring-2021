import Assets from "./Assets";

const Cards = {
    CardSeed: {
        levels: [
            { upgradeCost: 100 },
            { upgradeCost: 200 },
            { upgradeCost: 400 },
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
        ],
    },
    CardTalisman: {
        levels: [
          { upgradeCost: 25,
            buyCost:     10 },
          { upgradeCost: 50,
            buyCost:     25 },
          { upgradeCost: 100,
            buyCost:     50 },
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