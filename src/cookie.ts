import { options } from './index'

export function addEventListener() {
  document.getElementById('days').addEventListener('keyup', setDateRange)
  document.getElementById('save-button').addEventListener('click', setCookie)
}
addEventListener()

export function setCookie() {
  try {
        let enteredUrl = new URL(document.querySelector('#url').value).href
        let settings = {}
        let cookieValue
  
        settings.url = new URL(document.querySelector('#url').value).href
        settings.days = document.querySelector('#days').value
        settings.isf = document.querySelector('#isf').value
        settings.weight = document.querySelector('#weight').value
        cookieValue = JSON.stringify(settings)
        document.cookie = cookieValue
        console.log("Cookie saved.")    
  } catch {
    alert("The Nightscout address entered does not appear to be valid. Please make sure it conforms to 'https://nightscout-site.com/' or 'http://localhost/'\n\nPlease note the / is required to be on the end of the address.")
  }
}

export function getCookie(options) {
    let url //= new URL(document.querySelector('#url').value).href
    let days //= document.querySelector('#days').value
    let isf //= document.querySelector('#isf').value
    let weight //= document.querySelector('#weight').value

    if (document.cookie.length != 0) {
      //The JSON.parse method doesn't work in Safari; therefore, the catch parses the saved cookie
      try {let settings = JSON.parse(document.cookie)
        if (settings) {
        
          document.querySelector('#url').value = settings.url
          document.querySelector('#days').value = settings.days
          document.querySelector('#isf').value = settings.isf
          document.querySelector('#weight').value = settings.weight
          }
      }
      catch {
        let settings = document.cookie
          if (settings) {
            let json = document.cookie
            let pos1 = json.search(`"url\\":\\"`)
            let pos1a = json.search(`"url\\":\\"`) + 7
            let pos2 = json.search(`",\\"days":\\"`)
            let pos2a = json.search(`",\\"days":\\"`) + 10
            let pos3 = json.search(`",\\"isf":\\"`)
            let pos3a = json.search(`",\\"isf":\\"`) + 9
            let pos4 = json.search(`",\\"weight":\\"`)
            let pos4a = json.search(`",\\"weight":\\"`) + 12

            url = json.substring(pos1a, (pos2))
            days = json.substring(pos2a, pos3)
            isf = json.substring(pos3a, pos4)
            if(json.substring(pos4a, pos4a + 3).includes(`"`) == true){
              weight = json.substring(pos4a, pos4a + 2)
            } else {
            weight = json.substring(pos4a, pos4a + 3)
            }

            document.querySelector('#url').value = url
            document.querySelector('#days').value = days
            document.querySelector('#isf').value = isf
            document.querySelector('#weight').value = weight

          } 
      }
    } else {
      //If no cookie present, notify the user that the site uses cookies to save setting
      confirm("This site using cookies to save your settings. To access the settings menu, click on the gear in the upper right.\n\nPlease select OK to continue.")
    }
      options.url = document.getElementById('url').value
      console.log("Options.url: ", options.url)
      options.dateStart = document.getElementById('start').value
      options.dateEnd = document.getElementById('end').value
      options.ISF = document.getElementById('isf').value
      options.weight = document.getElementById('weight').value
}
  getCookie(options)

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
