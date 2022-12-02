import * as parseJSON from "./parseJSON"
import * as charts from "./charts"
import * as calculations from "./calculations"

const options: ResponseSettings = {
    url: "https://canning.herokuapp.com/",
    dateStart: new Date("2022-11-29T00:00"),
    dateEnd: new Date("2022-11-30T00:00"),
    showBasalChart: false,
    showBGChart: true,
    showCOBChart: false,
    COBRate: NaN,
    adjustBasalRates: true,
    ISF: NaN,
    weight: NaN,
    minBG: NaN,
    poolingTime: 120
};


(async function actionPerformed(options: ResponseSettings){

    await parseJSON.setProfile(options)
    
    const bgArray = await parseJSON.getBG(options.url, options.dateStart, options.dateEnd)
    
    const tempBasals = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)
    console.log(tempBasals)

    const basalProfiles = parseJSON.getBasalProfile(options.dateStart, options.dateEnd)


    const avgBgArray = calculations.averageBGs(bgArray)

    calculations.getNetBasals(tempBasals, basalProfiles)
    charts.renderChart(bgArray)

    
})(options)
