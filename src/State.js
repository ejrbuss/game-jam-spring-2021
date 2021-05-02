// This is the game's entire mutable state, and its initial value
const State = {
    // start, market, farm, end
    phase: undefined,
    // Player's current hand
    hand: [],
    time: 0,
    lastTick: 0,
    // Farm plots (magnitude growth phase, neagtive needs water)
    plants: [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
    ],
    plotsWidth: 8,
    plotsHeight: 5,
    // Player's current monies
    playerMoney: 1000,
    // Current card levels
    cardLevels: {
        CardSeed: 0,
        CardCow: 0,
        CardScarecrow: 0,
        CardTalisman: 0,
        CardOveralls: 0,
        CardSprinkler: 0,
        CardTractor: 0,
    },
};

window.State = State;

export default State;