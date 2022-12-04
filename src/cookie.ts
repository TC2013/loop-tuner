import { options } from './index'

export function addEventListener() {
  document.getElementById('days').addEventListener('keyup', setDateRange)
  document.getElementById('save-button').addEventListener('click', setCookie)
}
addEventListener()

export function setCookie() {
  let settings = {}
  settings.url = document.querySelector('#url').value
  settings.days = document.querySelector('#days').value
  settings.isf = document.querySelector('#isf').value
  settings.weight = document.querySelector('#weight').value

  let cookieValue = JSON.stringify(settings)
  document.cookie = cookieValue
}

export function getCookie(options) {
  if (document.cookie.length != 0) {
    var settings = JSON.parse(document.cookie)
    document.querySelector('#url').value = settings.url
    document.querySelector('#days').value = settings.days
    document.querySelector('#isf').value = settings.isf
    document.querySelector('#weight').value = settings.weight

    options.url = settings.url
    options.dateStart = document.getElementById('start').value
    options.dateEnd = document.getElementById('end').value
    options.ISF = settings.isf
    options.weight = settings.weight
  }
}
getCookie(options)

export function setDateRange(options) {
  let days = document.querySelector('#days').value
  options.dateStart = new Date()
  options.dateEnd = new Date()
  let dateOffset = 24 * 60 * 60 * 1000

  options.dateStart.setTime(options.dateStart.getTime() - dateOffset * days)
  options.dateEnd.setTime(options.dateEnd.getTime() - dateOffset)

  document.querySelector('#start').value = options.dateStart
    .toISOString()
    .slice(0, 10)
  document.querySelector('#end').value = options.dateEnd
    .toISOString()
    .split('T')[0]
}
setDateRange(options)
