import * as loadData from './loadData'
import * as cookie from './cookie'
import * as DIA from './calculations/DIA'

export const options: ResponseSettings = {
  url: 'https://canning.herokuapp.com/',
  dateStart: new Date('2022-12-03T00:00'),
  dateEnd: new Date('2022-12-06T00:00'),
  showBasalChart: false,
  showBGChart: true,
  showCOBChart: false,
  COBRate: 30,
  adjustBasalRates: true,
  ISF: NaN,
  weight: 80,
  minBG: NaN,
  targetBG: 110,
  poolingTime: 120,
  period: 30
}
// //this will set options.dateEnd to 12 am local time today
// options.dateEnd = new Date()
// options.dateEnd.setHours(0, 0, 0, 0)
// //this will set options.dateStart to 12 am local time 30 days ago
// options.dateStart = new Date(options.dateEnd.getTime() - 2 * 24 * 60 * 60 * 1000)
window.options = options;
window.actionPerformed = actionPerformed;

async function actionPerformed(options: ResponseSettings) {
  console.log("actionPerformed started")
  cookie.checkCookies()
  loadData.rawData(options)
  DIA.getDIA(options)

}
actionPerformed(options)