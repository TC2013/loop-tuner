export function setCookie() {
  let url = document.querySelector('#url').value
  let days = document.querySelector('#days').value
  let isf = document.querySelector('#isf').value
  let weight = document.querySelector('#weight').value
  document.cookie = [url, days, isf, weight]
  console.log(document.cookie)
}
