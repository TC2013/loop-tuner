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
  hourInput.setAttribute("inputmode", "text")
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
  minuteInput.setAttribute("inputmode", "text")
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
  amPmInput.setAttribute("inputmode", "text")
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
  rate.setAttribute("inputmode", "text")
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
 

}

//initalizing these outside of the function so they can be used in other functions
var netBasals = []
var avgBGs = []
var adjustedBasals = []
var adjustedBGs = []

function predictBGs() {
  adjustedBasals = createAdjustedBasal()
  console.log('adjustedBasals22222222222222222222', adjustedBasals)
  adjustedBGs = createAdjustedBGs()
  console.log('adjustedBGs22222222222222222', adjustedBGs)
  applyInsulin()
  let DIA = DIA.getDIA(options, adjustedBasals)
  let hour = document.getElementById("hour").value;
  let minute = document.getElementById("minute").value;
  let amPm = document.getElementById("am-pm").value;
  if(amPm === "PM") {hour = parseInt(hour) + 12};
  let currentPosition = hour * 12 + Math.floor(minute / 5)
  for (let i = 0; i < 6; i++){
    for (let j = 0; j < DIA[currentPosition]; j++){
      adjustedBGs[currentPosition + i].bg = avgBGs[currentPosition + i].bg - insulin / 6 * options.ISF / DIA[currentPosition + i]
    }
  }

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
  for(let i = 0; i < avgBGs.length; i++){
    adjustedBGs.push(avgBGs[i])
  }
  return adjustedBGs
}

function applyInsulin(){
  let hour = document.getElementById("hour").value;
  let minute = document.getElementById("minute").value;
  let amPm = document.getElementById("am-pm").value;
  if(amPm === "PM") {hour = parseInt(hour) + 12};
  let currentPosition = hour * 12 + Math.floor(minute / 5)
  for(let i = 0; i < 6; i++){
    let insulin = Number(document.getElementById('rate').value) / 6;
    console.log('insulin', insulin, 'adjustedBasals[cp]', adjustedBasals[currentPosition + i])
    adjustedBasals[currentPosition + i] = insulin
  }
}
function setBasal() {
  let hour = document.getElementById("hour").value;
  let minute = document.getElementById("minute").value;
  let amPm = document.getElementById("am-pm").value;
  if(amPm === "PM") {hour = parseInt(hour) + 12};
  let currentPosition = hour * 12 + Math.floor(minute / 5)
  // let rate = document.getElementById("rate")?.innerText;
  let basalRate = netBasals.slice(currentPosition, currentPosition + 6).reduce((a, b) => a + b, 0);
  basalRate = roundToNearest(basalRate, .05)
  document.getElementById("rate").value = basalRate

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
  console.log('avgBGs', avgBGs)
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