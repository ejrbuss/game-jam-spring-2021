const Constants = {
    Width: 1024,
    Height: 576,
    FarmingTime: 1000 * 30,
    GrowthChance: 0.1,
    // Game Events
    Events: {
        ExitPhase: 'ExitPhase',
        EnterPhase: 'EnterPhase',
        RefreshMarket: 'RefreshMarket',
        RefreshMoney: 'RefreshMoney',
    },
    // Game Phases
    Phases: {
        Start: 'Start',
        End: 'End',
        Market: 'Market',
        Farm: 'Farm',
    },
};

export default Constants;