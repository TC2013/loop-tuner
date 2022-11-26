import {actionPerformed, getBG} from "./parseJSON"
import { Chart } from 'chart.js/auto'

const options = {
    url: "https://canning.herokuapp.com/",
    dateStart: new Date("2022-11-24T00:00"),
    dateEnd: new Date("2022-11-25T00:00"),
    showBasalChart: false,
    showBGChart: false,
    showCOBChart: false,
    COBRate: NaN,
    adjustBasalRates: false,
    ISF: NaN,
    weight: NaN,
    minBG: NaN,
    poolingTime: NaN
}

async function renderChart() {
    console.log("Rendering BG Chart")

    if (Chart.getChart('bgChart')) {
        Chart.getChart('bgChart').destroy()
    }

    let data = await(getBG(options.url, options.dateStart, options.dateEnd))

    new Chart(
        document.getElementById('bgChart'),
        {
            type: 'line',
            data: {
                labels: data.map(row => roundToNearestHour(row.time).toLocaleTimeString('en-US')),
                datasets: [
                    {
                        label: 'BGs',
                        data: data.map(row => row.bg)
                    }
                ]
            }
        }
    )
}renderChart()  

function roundToNearestHour(date) {
    date.setMinutes(date.getMinutes() + 30)
    date.setMinutes(0,0)
    // date.getHours()
    // console.log("This is the hour: ",date.getHours())
  
    return date;
  }

// function returnHourOnly(data) {
//     for (let i = 0, i < data.length, i++) {
//         if(i.time == (i-1).time) {
//             return i.time
//         }
//         else {
//             return ""
//         }
// }

actionPerformed(options)
