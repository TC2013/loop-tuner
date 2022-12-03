import { Chart } from 'chart.js/auto'

export async function renderChart(bgArray: Array<Array<BG>>) {
  console.log('Rendering BG Chart')

  let datasets = bgArray.map((obj, i) => {
    return {
      label: 'BG' + i,
      data: obj.map((i) => i.bg),
    }
  })
  Chart.getChart('bgChart')?.destroy()

  let hour: Array<String> = bgArray[0].map((hour) => {
    let hours = hour.time.getHours()
    let format = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return hours + ' ' + format
  })

  new Chart(<HTMLCanvasElement>document.getElementById('bgChart'), {
    type: 'line',
    data: {
      labels: hour,
      datasets: datasets,
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 24,
          },
        },
      },
    },
  })
}
