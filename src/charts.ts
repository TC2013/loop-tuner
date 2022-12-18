import { Chart } from 'chart.js/auto'

export function renderChart(bgArray, containerId) {
  // Check is bg-chart is present and remove if is.
  Chart.getChart('bg-chart')?.destroy()
  // Extract the data and labels from the bgArray
  let datasets = bgArray.map((obj, i) => {
    return {
      label: 'BG' + i,
      data: obj.map((i) => i.bg),
    }
  });
  
  let labels = bgArray[0].map((hour) => {
    let hours = hour.time.getHours()
    let format = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return hours + ' ' + format
  });

  // Create the chart
  var ctx = document.getElementById(containerId).getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: datasets
    },

    // Configuration options go here
    options: {
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 5,
            fontSize: 30,
          },
        },
        y: {
          fontSize: 30,
        },
      },
    },
  });
}


/////This is the 
// export async function renderChart(bgArray: Array<Array<BG>>) {
//   console.log('Rendering BG Chart')

//   let datasets = bgArray.map((obj, i) => {
//     return {
//       label: 'BG' + i,
//       data: obj.map((i) => i.bg),
//     }
//   })
//   Chart.getChart('bgChart')?.destroy()

//   let hour: Array<String> = bgArray[0].map((hour) => {
//     let hours = hour.time.getHours()
//     let format = hours >= 12 ? 'PM' : 'AM'
//     hours = hours % 12
//     hours = hours ? hours : 12
//     return hours + ' ' + format
//   })

//   new Chart(<HTMLCanvasElement>document.getElementById('bgChart'), {
//     type: 'line',
//     data: {
//       labels: hour,
//       datasets: datasets,
//     },
//     options: {
//       scales: {
//         x: {
//           grid: {
//             display: false,
//           },
//           ticks: {
//             maxTicksLimit: 5,
//             // fontSize: 30,
//           },
//         },
//         y: {
//           // fontSize: 30,
//         },
//       },
//     },
//   })
// }
