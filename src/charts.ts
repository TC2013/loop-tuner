import { Chart } from 'chart.js/auto'

export async function renderChart(bgArray: Array<BG>) {
    console.log("Rendering BG Chart")
        
    Chart.getChart('bgChart')?.destroy()
    
    let hour:Array<String> = bgArray.map(hour => {
        let hours = hour.time.getHours()
        let format = hours >= 12 ? 'PM' : 'AM'
        hours = hours%12
        hours = hours ? hours : 12
        return hours + " " + format
    })
    

    new Chart(
        document.getElementById('bgChart'),{
            type: 'line',
            data: {
                labels: hour,
                datasets: [{
                        label: 'BGs',
                        data: bgArray.map(row => row.bg)
                    }]
            },
            options:{
                scales:{
                    x: {
                        ticks: {
                            maxTicksLimit: 23
                        }
                    }
                }
                
            }
            
        }
    )
}