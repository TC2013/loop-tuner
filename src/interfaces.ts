
//Data Types
interface Basal{
    readonly value: number
    readonly time: Date
}

interface BasalProfile{
    readonly profile: Array<Basal>
    readonly startDate: Date
    readonly endDate: Date
    isf: number,
    carbRatio: number,
    lowTarget: number,
    highTarget: number,
}

interface BG{
    readonly bg: number
    readonly time: Date
}

interface CarbRatio{
    readonly value: number
    readonly time: Date
}

interface CarbRatioProfile{
    readonly profile: Array<CarbRatio>
    readonly startDate: Date
}

interface ISF{
    readonly value: number
    readonly time: Date
}

interface ISFProfile{
    readonly profile: Array<ISF>
    readonly startDate: Date
}

interface MealBolus{
    readonly carbs: number
    readonly absorptionTime: number
    readonly timestamp: Date
}

interface TempBasal{
    readonly rate: number
    duration: number
    readonly created_at: Date
}


//Not Data Types
interface ResponseSettings{
    url: String
    dateStart: Date
    dateEnd: Date
    showBasalChart: boolean
    showBGChart: boolean
    showCOBChart: boolean
    COBRate: number
    adjustBasalRates: boolean
    ISF: number
    weight: number
    minBG: number
    poolingTime: number

}

