//////////Begin cookie related functions. TODO: move this to own file.//////////
export function checkCookies() {
  // Check if cookies are enabled // Check if there are any cookies for the site
  if (navigator.cookieEnabled && document.cookie.length > 0) {
            
    // Get the values of the cookie
    var url = getCookie("url");
    var isf = getCookie("isf");
    var weight = getCookie("weight");
    var days = getCookie("days");

    // Enter the values into their respective elements
    // document.getElementById("url").value = url;
    // document.getElementById("isf").value = isf;
    // document.getElementById("weight").value = weight;
    // document.getElementById("days").value = days;
  
    // Function to get the value of a specific cookie
    function getCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
    } 
  } else {
    console.log('No saved cookies.')
  }
} checkCookies()

// window.saveValuesToCookie = saveValuesToCookie
export function saveValuesToCookie() {
  // Get the values of the text inputs
  var url = document.getElementById("url").value;
  var isf = document.getElementById("isf").value;
  var weight = document.getElementById("weight").value;
  var days = document.getElementById("days").value;

  // Set the cookie to never expire
  var expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  // Save the values to the cookie
  document.cookie = "url=" + url + "; expires=" + expirationDate.toUTCString();
  document.cookie = "isf=" + isf + "; expires=" + expirationDate.toUTCString();
  document.cookie = "weight=" + weight + "; expires=" + expirationDate.toUTCString();
  document.cookie = "days=" + days + "; expires=" + expirationDate.toUTCString();

  //Acknowledge button press
  function displaySettingSaved() {
    var cookieButton = document.getElementById("cookie-button");
    cookieButton.innerText = "Settings saved!";
    setTimeout(function() {
      cookieButton.innerText = "Save";
    }, 3000);
  } displaySettingSaved()
}

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
// setDateRange(options)