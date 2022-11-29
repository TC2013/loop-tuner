import * as parseJSON from "./parseJSON"
import * as charts from "./charts"
import * as calculations from "./calculations"

const options: ResponseSettings = {
    url: "https://canning.herokuapp.com/",
    dateStart: new Date("2022-11-14T00:00"),
    dateEnd: new Date("2022-11-25T00:00"),
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
    
    const tempBasalArray = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)

    const basalProfiles = parseJSON.getBasalProfile(options.dateStart, options.dateEnd)


    const avgBgArray = calculations.averageBGs(bgArray)
    charts.renderChart(avgBgArray)

    
})(options)
