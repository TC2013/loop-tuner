import { Chart } from 'chart.js/auto'

//The Chart function below is designed to handle avgBgArray and avgBgArrayMobileView,which data sctructure is [{ {},{},{} }]
export function renderChartMobileView(avgBgArray, containerId) {
  // Check is chart is present and remove if is.
  Chart.getChart('containerId')?.destroy()
  // Extract the data and labels from the bgArray
  let labels = avgBgArray.map((hour) => {

    let hours = hour.time.getHours()
    let format = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return hours + ' ' + format
  });

  const bgData = avgBgArray.map(entry => entry.bg);

  // Create the chart
  var ctx = document.getElementById(containerId).getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: [
        {
          label: 'BG',
          data: bgData, // use the bg data as the y-axis data
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          pointRadius: 0,
          lineTension: 0.4,
        },
      ],
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



//The Chart function below is designed to hand bgArray (eg bgArrayJSON) which data sctructure is [{}]
export function renderChart(bgArray, containerId) {
  // Check is bg-chart is present and remove if is.
  Chart.getChart('bg-chart')?.destroy()
  // Extract the data and labels from the bgArray
  let datasets = bgArray.map((obj, i) => {
    return {
      label: 'BG' + i,
      data: obj.map((i) => i.bg),
      pointRadius: 0,
      lineTension: 0.4,
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