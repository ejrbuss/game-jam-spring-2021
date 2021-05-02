const Constants = {
    Width: 1024 * window.devicePixelRatio,
    Height: 576 * window.devicePixelRatio,
    Unit: window.devicePixelRatio,
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