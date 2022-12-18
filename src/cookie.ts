import { options } from './index'


function setDateRange(options) {
  let days = document.querySelector('#days').value
  options.dateStart = new Date()
  options.dateEnd = new Date()
  let dateOffset = 24 * 60 * 60 * 1000

  options.dateStart.setTime(options.dateStart.getTime() - dateOffset * days)
  options.dateEnd.setTime(options.dateEnd.getTime() - (dateOffset * 1))

  document.querySelector('#start').value = options.dateStart
    .toISOString()
    .slice(0, 10)
  document.querySelector('#end').value = options.dateEnd
    .toISOString()
    .split('T')[0]
} 
setDateRange(options)
