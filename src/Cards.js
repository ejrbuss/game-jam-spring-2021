import Assets from "./Assets";

const Cards = {
    CardSeed: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
        ],
        level: 0,
    },
    CardCow: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
        ],
        level: 0,
    },
    CardScarecrow: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
        ],
    },
    CardTalisman: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
        ],
    },
    CardOveralls: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
        ],
    },
    CardSprinkler: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
        ],
    },
    CardTractor: {
        levels: [
            { cost: 50 },
            { cost: 100 },
            { cost: 500 },
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