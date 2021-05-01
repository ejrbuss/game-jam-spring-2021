import Cards from "./Cards";

// This is the game's entire mutable state, and its initial value
const State = {
    // start, market, farm, end
    state: "start",
    // Player's current hand
    hand: [ Cards.TestCard7, Cards.TestCard8 ],
    // Farm plots (magnitude growth phase, neagtive needs water)
    plots: [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
    ],
    plotsWidth: 8,
    plotsHeight: 5,

};

window.State = State;

export default State;