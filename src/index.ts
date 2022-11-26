import {actionPerformed, getBG} from "./parseJSON"
const options = {
    url: "https://canning.herokuapp.com/",
    dateStart: new Date("2022-08-26T00:00"),
    dateEnd: new Date("2022-09-02T00:00"),
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

(function getData() {
    let sgv 


    // Change color of datapoint to indicate BG range
    const bkgcolor = [];

    for (i = 0; i < sgv.length; i++) {
        // pink if less than 50
        if (sgv[i] < 50) { bkgcolor.push('#e73c7e') }
        // blue if between 50 but less than 200
        if (sgv[i] >= 50 && sgv[i] < 200) { bkgcolor.push('#23a6d5') }
        // orange if over 200
        if (sgv[i] >= 200) { bkgcolor.push('#ee7752') }
    }


    // Chartjs setup  
    const labels = date
    const data = {
        labels: labels,
        datasets: [{
            label: 'BG Data',
            data: sgv, // result of sgv map
            backgroundColor: bkgcolor,
            borderColor: bkgcolor,
            // backgroundColor: 'rgba(255, 99, 132, 0.2)',
            // borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.4,
        }]
    }

    // Chartjs config
    const config = {
        type: 'line',
        data: data,
        options: {
            layout: {
                padding: 20
            },
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        
                        text: 'BG Value',
                        color: '#23a6d5',
                        font: {
                            size: 13,
                            weight: 'bold',
                        },
                    },
                    min: 40,
                    max: 400,
                    ticks: {
                        stepSize: 20
                    },
                    beginAtZero: false
                },
                x: {
                    title: {
                        display: true,
                        type: 'time',
                        text: 'Time',
                        color: '#23a6d5',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        time: {
                            unit: 'day'
                            
                        },
                    },

                    ticks: {
                        // display only time in labels, but full data on datapoint hover
                        callback: function (value) {
                            return this.getLabelForValue(value).substr(-8)
                        }
                    },

                }
            },
                // removes colored box next to BG Data title, adds bold to dataset text
                plugins: {
                    legend: {
                        onClick: null, //disables click on BG Data title that removed data. Re-enable if adding more than one dataset
                        labels: {
                            boxWidth: 0,
                            font: {
                                weight: 'bold'
                            },
                        },
                    }
                }
            }
        }

        // render Chartjs
        // let myChart = null

        if (Chart.getChart('myChart')) {
            Chart.getChart('myChart').destroy()
        }

        myChart = new Chart(
            document.getElementById('myChart'),
            config
        )


    })()




//actionPerformed(options)
