let quoteUrl = "https://api.quotable.io/random?tags=inspirational"

/**
 * 
 * @param {string} toElemID The id of the element to put the quote in
 */
async function generateQuotes({ toElemID }) {
    const quoteElement = document.getElementById(toElemID)
    quoteElement.style.opacity = 0.5
    quoteElement.innerHTML = "Generating quote ..."

    const response = await fetch(quoteUrl)
    const data = await response.json()
    const quote = data.content

    quoteElement.style.opacity = 1.0
    quoteElement.innerHTML = quote
}