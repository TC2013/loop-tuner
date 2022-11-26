import * as parseJSON from "./parseJSON"
import * as charts from "./charts"

const options: ResponseSettings = {
    url: "https://canning.herokuapp.com/",
    dateStart: new Date("2022-11-24T00:00"),
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

    parseJSON.setProfile(options)
    
    const bgArray = await parseJSON.getBG(options.url, options.dateStart, options.dateEnd)
    
    const tempBasalArray = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)

    const basalProfiles = parseJSON.getBasalProfile(options.dateStart, options.dateEnd)


    charts.renderChart(bgArray)
    
})(options)
