import * as basal from '../calculations/basal';
import * as misc from '../calculations/misc';
import * as BG from '../calculations/BG';
import * as chart from '../charts'
import * as DIA from '../calculations/DIA'

(function() {
  console.log('This ran')
  window.loadBasalView = loadBasalView;
})()


export async function loadBasalView() {  
  console.log('loadBasalView started')
  var main = document.getElementById('main');

  var title = document.createElement('div');
  title.id = 'title';
  main.appendChild(title);

  /* Add a child div to main with the id basal-div */

  var basalDiv = document.createElement('div');
  basalDiv.id = 'basal-div';
  main.appendChild(basalDiv);

  /* Add a child div to basalDiv with the id basal-options */
  var basalOptions = document.createElement('div');
  basalOptions.id = 'basal-options';
  basalDiv.appendChild(basalOptions);
  // Create 3 column divs in basalOptions
  var basalOptionsCol1 = document.createElement('div');
  basalOptionsCol1.id = 'basal-options-col1';
  basalOptions.appendChild(basalOptionsCol1);
  var basalOptionsCol2 = document.createElement('div');
  basalOptionsCol2.id = 'basal-options-col2';
  basalOptions.appendChild(basalOptionsCol2);
  var basalOptionsCol3 = document.createElement('div');
  basalOptionsCol3.id = 'basal-options-col3';
  basalOptions.appendChild(basalOptionsCol3);

  /* Add the start and end date inputs to basalOptions */
  var startBasalLabel = document.createElement('label');
  startBasalLabel.id = 'start-basal-label';
  startBasalLabel.innerHTML = 'Start:';
  basalOptionsCol1.appendChild(startBasalLabel);
  var startBasalDate = document.createElement('input');
  startBasalDate.id = 'start-basal-date';
  startBasalDate.type = 'date';
  basalOptionsCol1.appendChild(startBasalDate);
  var endBasalLabel = document.createElement('label');
  endBasalLabel.id = 'end-basal-label';
  endBasalLabel.innerHTML = 'End:';
  basalOptionsCol3.appendChild(endBasalLabel);
  var endBasalDate = document.createElement('input');
  endBasalDate.id = 'end-basal-date';
  endBasalDate.type = 'date';
  basalOptionsCol3.appendChild(endBasalDate);

  // var basalButton = document.createElement('button');
  // basalButton.id = 'basal-button';
  // basalButton.innerHTML = 'Submit';
  // basalOptionsCol3.appendChild(basalButton);
 
  var basalGetDataButton = document.createElement('button');
  basalGetDataButton.id = 'basal-getdata-button';
  basalGetDataButton.className = 'menu-button';
  basalGetDataButton.innerHTML = 'Go';
  basalGetDataButton.onclick = getData;
  basalOptionsCol2.appendChild(basalGetDataButton);

  var chartContainer = document.createElement('div');
  chartContainer.id = 'chart-container';
  basalDiv.appendChild(chartContainer);

  var chart = document.createElement('chart');
  chart.id = 'chart';
  chartContainer.appendChild(chart);

  var bgChart = document.createElement('canvas');
  bgChart.id = 'bg-chart';
  chart.appendChild(bgChart);

  var basalControls = document.createElement('div');
  basalControls.id = 'basal-controls';
  basalDiv.appendChild(basalControls);

  var modBasalTitle = document.createElement('div');
  modBasalTitle.id = 'mod-basal-title';
  basalControls.appendChild(modBasalTitle);

  var modBasal = document.createElement('div');
  modBasal.id = 'mod-basal';
  basalControls.appendChild(modBasal);

  var basalGoButton = document.createElement('button');
  basalGoButton.id = 'basal-go-button';
  basalGoButton.className = 'menu-button';
  basalGoButton.innerHTML = 'Apply';
  basalGoButton.onclick = function() { actionPerformed(options); };
  basalControls.appendChild(basalGoButton);
  
  const modBasalTitleDiv = document.getElementById("mod-basal-title");
  const text = document.createElement("p");
  text.innerHTML = "Select basal period and +/- amount";
  modBasalTitleDiv.appendChild(text);

  const modBasalDiv = document.getElementById("mod-basal");

  var basalAdjustColumn1 = document.createElement('div');
  basalAdjustColumn1.id = 'basal-adjust-column-1';
  basalAdjustColumn1.style.display = 'flex';
  basalAdjustColumn1.style.flexDirection = 'column';
  basalAdjustColumn1.style.alignItems = 'center';
  document.getElementById('mod-basal').appendChild(basalAdjustColumn1);

  // create the button and input elements
  var basalAdjustColumn2 = document.createElement('div');
  basalAdjustColumn2.id = 'basal-adjust-column-2';
  basalAdjustColumn2.style.display = 'flex';
  basalAdjustColumn2.style.flexDirection = 'column';
  basalAdjustColumn2.style.alignItems = 'center';
  document.getElementById('mod-basal').appendChild(basalAdjustColumn2);

  // create the button and input elements
  var basalAdjustColumn3 = document.createElement('div');
  basalAdjustColumn3.id = 'basal-adjust-column-3';
  basalAdjustColumn3.style.display = 'flex';
  basalAdjustColumn3.style.flexDirection = 'column';
  basalAdjustColumn3.style.alignItems = 'center';
  document.getElementById('mod-basal').appendChild(basalAdjustColumn3);
 
  // create the button and input elements
  var basalAdjustColumn4 = document.createElement('div');
  basalAdjustColumn4.id = 'basal-adjust-column-4';
  basalAdjustColumn4.style.display = 'flex';
  basalAdjustColumn4.style.flexDirection = 'column';
  basalAdjustColumn4.style.alignItems = 'center';
  document.getElementById('mod-basal').appendChild(basalAdjustColumn4);
 
  // create the button and input elements
  const button1 = document.createElement("button");
  button1.innerHTML = "+";
  button1.id = "button-1";
  button1.className = "controlButtons Pos"
  document.getElementById('basal-adjust-column-1').appendChild(button1);
  const hourInput = document.createElement("input");
  hourInput.type = "number";
  hourInput.id = "hour";
  hourInput.value = 12;
  hourInput.setAttribute("readonly", "true")
  // hourInput.setAttribute("inputmode", "text")
  hourInput.className = "controlFields"
  document.getElementById('basal-adjust-column-1').appendChild(hourInput);
  const button5 = document.createElement("button");
  button5.innerHTML = "-";
  button5.id = "button-6";
  button5.className = "controlButtons Neg"
  document.getElementById('basal-adjust-column-1').appendChild(button5);

  const button2 = document.createElement("button");
  button2.innerHTML = "+";
  button2.id = "button-2";
  button2.className = "controlButtons Pos"
  document.getElementById('basal-adjust-column-2').appendChild(button2);
  const minuteInput = document.createElement("input");
  minuteInput.type = "number";
  minuteInput.id = "minute";
  minuteInput.value = "00";
  minuteInput.setAttribute("readonly", "true")
  // minuteInput.setAttribute("inputmode", "text")
  minuteInput.className = "controlFields"
  document.getElementById('basal-adjust-column-2').appendChild(minuteInput);
  const button6 = document.createElement("button");
  button6.innerHTML = "-";
  button6.id = "button-7";
  button6.className = "controlButtons Neg"
  document.getElementById('basal-adjust-column-2').appendChild(button6);

  const button3 = document.createElement("button");
  button3.innerHTML = "+";
  button3.id = "button-3";
  button3.className = "controlButtons Pos"
  document.getElementById('basal-adjust-column-3').appendChild(button3);
  const amPmInput = document.createElement("input");
  amPmInput.type = "text";
  amPmInput.id = "am-pm";
  amPmInput.value = "AM";
  amPmInput.setAttribute("readonly", "true")
  // amPmInput.setAttribute("inputmode", "text")
  amPmInput.className = "controlFields"
  document.getElementById('basal-adjust-column-3').appendChild(amPmInput);
  const button7 = document.createElement("button");
  button7.innerHTML = "-";
  button7.id = "button-8";
  button7.className = "controlButtons Neg"
  document.getElementById('basal-adjust-column-3').appendChild(button7);
  
  const button4 = document.createElement("button");
  button4.innerHTML = "+";
  button4.id = "button-4";
  button4.className = "controlButtons Pos"
  document.getElementById('basal-adjust-column-4').appendChild(button4);
  const rate = document.createElement("input");
  rate.type = "number";
  rate.id = "rate";
  rate.value = "0.00";
  rate.setAttribute("readonly", "true")
  // rate.setAttribute("inputmode", "text")
  rate.className = "controlFields"
  document.getElementById('basal-adjust-column-4').appendChild(rate);
  const button8 = document.createElement("button");
  button8.innerHTML = "-";
  button8.id = "button-9";
  button8.className = "controlButtons Neg"
  document.getElementById('basal-adjust-column-4').appendChild(button8);

  button1.addEventListener("click", incrementHour);
  button1.addEventListener("click", setBasal);

  button5.addEventListener("click", decrementHour);
  button5.addEventListener("click", setBasal);

  button2.addEventListener("click", setMinuteTo30);
  button2.addEventListener("click", setBasal);

  button6.addEventListener("click", setMinuteTo30);
  button6.addEventListener("click", setBasal);

  button3.addEventListener("click", setAmPm);
  button3.addEventListener("click", setBasal);

  button7.addEventListener("click", setAmPm);
  button7.addEventListener("click", setBasal);

  button4.addEventListener("click", incrementRate);

  button8.addEventListener("click", decrementRate);

  const getDataButton = document.getElementById("basal-getdata-button");
  getDataButton.addEventListener("click", getData);

  const getBasalGoButton = document.getElementById("basal-go-button");
  getBasalGoButton.addEventListener("click", predictBGs);
 
//Everything past this is a test:

 

  // create number field
  var numberField = document.createElement("input");
  numberField.setAttribute("type", "number");
  numberField.setAttribute("id", "number-field");
  numberField.style.height = "25px";
  numberField.style.width = "75px";
  document.getElementById('mod-basal').appendChild(numberField);

  // create button
  var button = document.createElement("button");
  button.innerHTML = "Submit";
  button.style.height = "25px";
  button.style.width = "75px";
  button.addEventListener("click", function() {
    var insulinKG = document.getElementById("number-field").value;
    // GIRCurve(insulinKG);
    graphCurves();
  });
  document.getElementById('mod-basal').appendChild(button);

 // create graph of GIR curves
 function graphCurves() {
    let curve1 = GIRCurve(.01)
    let curve1_2 = GIRCurve(.025)
    let curve2 = GIRCurve(.05)
    let curve2_2 = GIRCurve(.075)
    let curve3 = GIRCurve(.1)
    let curve4 = GIRCurve(.125)
    let curve5 = GIRCurve(.15)
    let curve6 = GIRCurve(.175)
    let curve7 = GIRCurve(.2)
    let curve8 = GIRCurve(.25)
    let curve9 = GIRCurve(.3)
    let curve10 = GIRCurve(.35)
    let curve11 = GIRCurve(.4)
    let curve12 = GIRCurve(.45)
    let curves = [curve1, curve1_2,curve2,curve2_2, curve3, curve4, curve5, curve6, curve7, curve8, curve9, curve10, curve11]
    let insulinKGs = [.01, .025, .05, .075, .1, .125, .15, .175, .2, .25, .3, .35, .4]
    // let insulinKGs = [.01, .05, .1, .125, .15, .175, .2, .25, .3, .35, .4, .45]
    plotLineGraph(curves, insulinKGs)
 }


  function GIRCurve(insulinKG) {
    console.log('insulinKG', insulinKG)
    let xData = new Array(1920);
    for (let i = 0; i < 1920; i++) {
      let x = i * (15.0/3600);
      xData[i] = x;
    }
    let smallYData = getSmallYData(xData);
    // console.log('smallYData', smallYData)
    let mediumYData = getMediumYData(xData);
    let largeYData = getLargeYData(xData);
    let smallCurve = [];
    let mediumCurve = [];
    let largeCurve = [];
    let peakValueSmall = 0;
    let peakValueMedium = 0;
    let peakValueLarge = 0;
      for(let i of smallYData) {
        if(i > peakValueSmall) {
            peakValueSmall = i;
        }
      }
      for(let i of mediumYData) {
        if(i > peakValueMedium) {
            peakValueMedium = i;
        }
      }
      for(let i of largeYData) {
        if(i > peakValueLarge) {
            peakValueLarge = i;
        }
      }
    
    let stopSmall = peakValueSmall *.0175;
    let stopMedium = peakValueMedium *.0175;
    let stopLarge = peakValueLarge *.0175;

    for (let i = 0; i < smallYData.length; i++) {
      if(i < 60 && smallYData[i] > 0){smallCurve.push(smallYData[i]);}
      else if(smallYData[i] > stopSmall){smallCurve.push(smallYData[i]);}
    }

    for (let i = 0; i < mediumYData.length; i++) {
      if(i < 60 && mediumYData[i] > 0){mediumCurve.push(mediumYData[i]);}
      else if(mediumYData[i] > stopMedium){mediumCurve.push(mediumYData[i]);}
    }

    for (let i = 0; i < largeYData.length; i++) {
      if(i < 60 && largeYData[i] > 0){largeCurve.push(largeYData[i]);}
      else if(largeYData[i] > stopLarge){largeCurve.push(largeYData[i]);}
    }

    let newCurveFull = []
    let newCurve = []
    if(insulinKG < .1) {
      let smallYData = getSmallYData(xData);
      let mediumYData = getMediumYData(xData);
      let smallMedium = new Array(smallYData.length);
        for(let i = 0; i < smallMedium.length; i++) {
          smallMedium[i] = smallYData[i] / mediumYData[i];
        }
      for(let i = 0; i < 1920; i++) {
        let pow = -1.44269504088897 * Math.log(insulinKG) - 3.32192809488739;
         let yRate = -0.0455826595478078 * xData[i] + 0.9205489113464720;
         let yDiff = Math.pow(yRate, pow) * smallMedium[i];
         let yMultiplier = Math.pow(yDiff, pow);
         let value = smallYData[i] * yMultiplier;
         if(i != 0 && Math.abs(newCurveFull[i-1] - value) > .05)
             {newCurveFull[i] = newCurveFull[i-1];}
         else
             {newCurveFull[i] = value;}
      }
      let peakValue = 0;

        for(let i of newCurveFull) {
          if(i > peakValue) {
              peakValue = i;
          }
        }
      
      let stop = peakValue *.0175;
  
      for (let i = 0; i < newCurveFull.length; i++) {
        if(i < 60 && newCurveFull[i] > 0){newCurve.push(newCurveFull[i]);}
        else if(newCurveFull[i] > stopSmall){newCurve.push(newCurveFull[i]);}
      }
    }
    
    if(insulinKG == .1) {newCurve = smallCurve;}

    else if(insulinKG > .1 && insulinKG < .2) {
      newCurve = getIntermediateYData(xData, insulinKG)
    }

    else if(insulinKG == .2) {newCurve = mediumCurve;}

    else if(insulinKG > .2 && insulinKG < .4) {
      newCurve = getIntermediateYData(xData, insulinKG)
    }

    else if(insulinKG >= .4) {newCurve = largeCurve;}

    // plotLineGraph(newCurve, insulinKG)
    return newCurve;
  }
  
  function getIntermediateYData(intermediateXData, insulinKG) {
    let intermediateYData = new Array(intermediateXData.length);
    for (let i = 0; i < intermediateXData.length; i++) {
        let x = intermediateXData[i];
        let smallY = 0.0033820425120803 * Math.pow(x, 5) - 0.0962642502970792 * Math.pow(x, 4) + 1.0161233494860400 * Math.pow(x, 3) -
            4.7280409167367000 * Math.pow(x, 2) + 8.2811624637053000 * x - 0.4658832073238300;
        let mediumY = 0.0004449113905105 * Math.pow(x, 6) - 0.0097881251143144 * Math.pow(x, 5) + 0.0487062677027909 * Math.pow(x, 4) +
            0.3395509285035820 * Math.pow(x, 3) - 3.8635372657493500 * Math.pow(x, 2) + 9.8215306047782600 * x - 0.5016675029655920;
        let largeY = -0.0224550824431891 * Math.pow(x, 4) + 0.5324819868175370 * Math.pow(x, 3) - 4.2740977490209200 * Math.pow(x, 2) +
        11.6354217632198000 * x - 0.0653457810255797;
        let intermediateY;
        if(insulinKG < .1 ){
            intermediateY = (insulinKG - 0.1) * (mediumY - smallY) / (0.2 - 0.1) + smallY;
        }
        else if(insulinKG > .1 && insulinKG < .2){
            intermediateY = (insulinKG - 0.1) * (mediumY - smallY) / (0.2 - 0.1) + smallY;
        }
        else if(insulinKG > .2 && insulinKG < .4){
            intermediateY = (insulinKG - 0.2) * (largeY - mediumY) / (0.4 - 0.2) + mediumY;
        }
        intermediateYData[i] = intermediateY;
    }
    return intermediateYData
  }
   
  function getSmallYData(smallXData) {
    //using the .1 U/kg curve
    let smallYData = new Array(1920);
    for (let i = 0; i < smallYData.length; i++) {
      let x = smallXData[i];
      let y = 0.0033820425120803 * Math.pow(x, 5) - 0.0962642502970792 * Math.pow(x, 4) + 1.0161233494860400 * Math.pow(x, 3) -
        4.7280409167367000 * Math.pow(x, 2) + 8.2811624637053000 * x - 0.4658832073238300;
      smallYData[i] = y;
    }
    return smallYData;
  }

  function getMediumYData(mediumXData) {
    //Using the .2 U/kg curve
    let mediumYData = new Array(1920);
    for (let i = 0; i < mediumXData.length; i++) {
      let x = mediumXData[i];
      let y = 0.0004449113905105 * Math.pow(x, 6) - 0.0097881251143144 * Math.pow(x, 5) + 0.0487062677027909 * Math.pow(x, 4) +
        0.3395509285035820 * Math.pow(x, 3) - 3.8635372657493500 * Math.pow(x, 2) + 9.8215306047782600 * x - 0.5016675029655920;
      mediumYData[i] = y;
    }
    return mediumYData;
  }

  function getLargeYData(largeXData) {
    //Using the .4 U/kg curve
    let largeYData = new Array(1920);
    for (let i = 0; i < largeXData.length; i++) {
      let x = largeXData[i];
      let y = -0.0224550824431891 * Math.pow(x, 4) + 0.5324819868175370 * Math.pow(x, 3) - 4.2740977490209200 * Math.pow(x, 2) +
        11.6354217632198000 * x - 0.0653457810255797;
      largeYData[i] = y;
    }
    return largeYData;
  }

  function plotLineGraph(data, legend) {
    // create new div to hold the chart
    var chartContainer = document.createElement("div");
    chartContainer.style.width = "1200px";
    chartContainer.style.background = "white";
    document.body.appendChild(chartContainer);
    
    legend.reverse();
    data.reverse();

    var canvas = document.createElement("canvas");
    chartContainer.appendChild(canvas);
  
    var ctx = canvas.getContext("2d");
    var chartData = {
        labels: Array.from(Array(data[0].length).keys()),
        datasets: []
    };
    var colors = ["red", 'orange', 'yellow', 'green', "blue", 'indigo', "violet", "black", "brown", "pink"];
    for (var i = 0; i < data.length; i++) {
        chartData.datasets.push({
            label: legend[i],
            data: data[i],
            borderColor: colors[i % colors.length],
            pointRadius: 0,
            fill: false
        });
    }
    var chart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        scales: {
          y: {
            // maxTicksLimit: 5
          }
        }
      }
    });
}

  
  
}

// //initalizing these outside of the function so they can be used in other functions
var netBasals = []
var avgBGs = []
var adjustedBasals = []
var adjustedBGs = []

async function predictBGs() {
  if (adjustedBasals.length == 0) {adjustedBasals = createAdjustedBasal()}
  if (adjustedBGs.length == 0) {adjustedBGs = createAdjustedBGs()}
  
  let currentPosition = getCurrentPosition()
  let insulin = document.getElementById('rate').value - adjustedBasals[currentPosition] / 6;
  let DIA_Arr = await applyInsulin()
  console.log('adjustedBGs =++++++++++++++++++++++ ', adjustedBGs)
  for (let i = 0; i < 6; i++){
    currentPosition = currentPosition + i
    let array = []
    // console.log('DIA_Arr[currentPosition + 144] = ', Math.round(DIA_Arr[currentPosition + 144]))
    for (let j = 0; j < Math.round(DIA_Arr[currentPosition + 144]); j++){
      
      array.push(j)
      if (currentPosition + j > 287) 
      {
        adjustedBGs[currentPosition + j - 288].bg = adjustedBGs[currentPosition + j - 288].bg - (insulin * options.ISF / Math.round(DIA_Arr[currentPosition + j - 288]))
      }
      else 
      {
      console.log(currentPosition + j,adjustedBGs[currentPosition + j].bg, '-',(insulin * options.ISF / Math.round(DIA_Arr[currentPosition + j])), '=',adjustedBGs[currentPosition + j].bg - (insulin * options.ISF / Math.round(DIA_Arr[currentPosition + j])) )

      adjustedBGs[currentPosition + j].bg = adjustedBGs[currentPosition + j].bg - (insulin * options.ISF / Math.round(DIA_Arr[currentPosition + j]))
      console.log('and the new rate is set to:',adjustedBGs[currentPosition + j].bg)
      }
    } 

    currentPosition = getCurrentPosition()
  }
  console.log('avgBGs', avgBGs)
  console.log('adjustedBGs', adjustedBGs)
  let combinedBGs = [adjustedBGs, avgBGs]
  console.log('combinedBGs', combinedBGs)
  chart.renderChart(combinedBGs, 'bg-chart')
}

function createAdjustedBasal() {
  console.log('createAdjustedBasal ran')
  for(let i = 0; i < netBasals.length; i++){
    adjustedBasals.push(netBasals[i])
  }
  return adjustedBasals
}

function createAdjustedBGs() {
  console.log('createAdjustedBGs ran')
  avgBGs.map((bg) => {
    adjustedBGs.push(bg)
  })
  return adjustedBGs
}

async function applyInsulin(){
  console.log('adjustedBasals111111111111aaaaaaaaaa', adjustedBasals)
  let currentPosition = getCurrentPosition()
  for(let i = 0; i < 6; i++){
    let insulin = Number(document.getElementById('rate').value) / 6;
    console.log('insulin', insulin, 'adjustedBasals[cp]', adjustedBasals[currentPosition + i])
    adjustedBasals[currentPosition + i] = insulin
  }
  console.log('adjustedBasals222222222222bbbbbbbbbb', adjustedBasals)
  let DIA_Arr = await DIA.getDIA(options, adjustedBasals)
  return DIA_Arr
}

function setBasal() {
  let currentPosition = getCurrentPosition()
  let basalRate = netBasals.slice(currentPosition, currentPosition + 6).reduce((a, b) => a + b, 0);
  basalRate = roundToNearest(basalRate, .05)
  document.getElementById("rate").value = basalRate

}

function getCurrentPosition() {
  let hour = document.getElementById("hour").value;
  let minute = Number(document.getElementById("minute").value)
  let amPm = document.getElementById("am-pm").value;
  if(hour === "12" && amPm ==="AM") {hour = 0};
  if(amPm === "PM") {hour = parseInt(hour) + 12};
  let currentPosition = hour * 12 + Math.floor(minute / 5)
  return currentPosition
}

function roundToNearest(n, nearest) {
  return Math.round(n / nearest) * nearest;
}

async function getData() {
  const netTempBasals = basal.getNetTempBasals()
  const avgNetTempBasals = basal.averageNetTempBasalsByPeriod(netTempBasals, options)
  console.log('avgNetTempBasals', avgNetTempBasals)
  const avgNetBolusBasals = await basal.avgBolusBasalByPeriod(options)
  console.log('avgNetBolusBasals', avgNetBolusBasals)
  netBasals = misc.addBolusArrays(avgNetBolusBasals, avgNetTempBasals)
  const bgArr = JSON.parse(localStorage.getItem('bgArr'))
  avgBGs = BG.averageBGs(bgArr)
  Object.freeze(avgBGs);
  console.log('avgBGsZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', avgBGs)
  console.log('netBasals', netBasals)
  
  setBasal()

  const chartDiv = 'bg-chart'  
  chart.renderChartMobileView(avgBGs, chartDiv)
}

function incrementHour() {
  const hourInput = document.getElementById("hour");
  let hour = Number(hourInput.value);
  if (hour == 11){setAmPm();}
    hour += 1;
  if (hour > 12){hour = 1;} 
  hourInput.value = hour;
}

function decrementHour() {
  const hourInput = document.getElementById("hour");
  const amPmInput = document.getElementById("am-pm");
  let hour = Number(hourInput.value);
  if(hour == 12){setAmPm()}
  hour -= 1;
  if (hour == 0) {
    hour = 12;
  }
  hourInput.value = hour;
}

function setMinuteTo30() {
  const minuteInput = document.getElementById("minute");
  let minute = minuteInput.value;
  if (minute === "00") {
    minute = "30";
  } else if (minute === "30") {
    minute = "00";
  }
  minuteInput.value = minute;
}

function setAmPm() {
  const amPmInput = document.getElementById("am-pm");
  let amPm = amPmInput.value;
  if (amPm === "AM") {
    amPm = "PM";
  } else if (amPm === "PM") {
    amPm = "AM";
  }
  amPmInput.value = amPm;
}

function incrementRate() {
  const rateInput = document.getElementById("rate");
  let incrementor = .05;
  incrementor.toFixed(2)
  let rate = parseFloat(rateInput.value)
  rate += incrementor;
  rateInput.value = parseFloat(rate).toFixed(2);
}

function decrementRate() {
  const rateInput = document.getElementById("rate");
  let incrementor = .05;
  incrementor.toFixed(2)
  let rate = parseFloat(rateInput.value)
  rate -= incrementor;
  if(rate < 0) {rate = 0}
  rateInput.value = parseFloat(rate).toFixed(2);
  
}
