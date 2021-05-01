import Cards from "./Cards";

// This is the game's entire mutable state, and its initial value
const State = {
    // start, market, farm, end
    state: "start",
    
    hand: [ Cards.TestCard7, Cards.TestCard8 ],
};

window.State = State;

export default State;