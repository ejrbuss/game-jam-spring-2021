const Constants = {
    Width: 1024 * 2, //* window.devicePixelRatio,
    Height: 576 * 2, // * window.devicePixelRatio,
    Unit: 2,//  window.devicePixelRatio,
    FarmingTime: 1000 * 30,
    GrowthChance: 0.01,
    WiltOnGrowthChance: 0.3,
    DryingChance: 0.007,
    CrowChance: 0.001,
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
    // Market Button Info
    MarketTextStates: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: 12 * 2, // 2 = unit
        align: 'center',
        color: '#000',
    },
};

export default Constants;