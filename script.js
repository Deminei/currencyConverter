//sets up API key and headers
const myHeaders = new Headers();
myHeaders.append("apikey", "2yIXs8LCAMlT9QMJa2gPeMRDgKF30pmo");

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

//cache's DOM elements
const amountInput = document.getElementById("amount");
const baseCurrencySelect = document.getElementById("baseCurrency");
const targetCurrencySelect = document.getElementById("targetCurrency");
const convertButton = document.getElementById("convert");
const resultSpan = document.getElementById("convertedAmount");
const historicalRatesButton = document.getElementById("historicalRates");
const historicalRatesTable = document.getElementById("historicalRatesTable");
const saveFavoriteButton = document.getElementById("saveFavorite");
const loadFavoritesButton = document.getElementById("loadFavorites");
const favoriteCurrencyPairs = document.getElementById("favoriteCurrencyPairs");

//event listeners
baseCurrencySelect.addEventListener("change", convert);
targetCurrencySelect.addEventListener("change", convert);
amountInput.addEventListener("input", convert);
historicalRatesButton.addEventListener("click", viewHistoricalRates);
saveFavoriteButton.addEventListener("click", saveFavorite);

function convert() {
    const amount = parseFloat(amountInput.value);
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;

    if (isNaN(amount) || amount < 0) {
        alert("Please enter a valid positive number.");
        return;
    }
    if (!baseCurrency || !targetCurrency) {
        alert("Please select both the currencies.");
        return;
    }
    if (baseCurrency === targetCurrency) {
        alert("The base and target currencies are the same. The converted amount is the same as the entered amount.");
        resultSpan.innerText = `${amount.toFixed(2)} ${targetCurrency}`;
        return;
    }
    //fetchs exchange rate and performs conversion
    fetch(`https://api.apilayer.com/exchangerates_data/convert?to=${targetCurrency}&from=${baseCurrency}&amount=${amount}`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert("There was an error fetching the exchange rate data. Please try again later.");
                return;
            }
            resultSpan.innerText = `${data.result.toFixed(2)} ${targetCurrency}`;
        })
        .catch(error => {
            console.log("error", error);
            alert("There was an error fetching the exchange rate data. Please try again later.");
        });
}
function viewHistoricalRates() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;

    if (!baseCurrency || !targetCurrency) {
        alert("Please select both the currencies.");
        return;
    }
    //clears the historical rates table before appending new rates
    historicalRatesTable.innerHTML = '';

    //array of hardcoded dates/ anymore than this would take forever to receive
    const dates = [
        "2022-11-15",
        "2020-06-15",
        "2012-07-15",
    ];
    //fetchs historical exchange rates for each date
    for (const date of dates) {
        fetch(`https://api.apilayer.com/exchangerates_data/${date}?symbols=${targetCurrency}&base=${baseCurrency}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                displayHistoricalRate(data, date, baseCurrency, targetCurrency);
            })
            .catch(error => console.log("error", error));
    }
}
function displayHistoricalRate(data, date, baseCurrency, targetCurrency) {
    if (historicalRatesTable.childElementCount === 0) {
        historicalRatesTable.innerHTML = '';
    }
    const rate = data.rates[targetCurrency];
    const textMessage = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;

    //create a paragraph element to display the text message
    const paragraph = document.createElement("p");
    paragraph.innerText = textMessage;

    //append the paragraph to the historical rates container
    historicalRatesTable.appendChild(paragraph);
}
function saveFavorite() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;

    if (!baseCurrency || !targetCurrency) {
        alert("Please select both the currencies.");
        return;
    }
    //gets the existing favorite currency pairs from local storage
    const favorites = JSON.parse(localStorage.getItem("favoriteCurrencyPairs")) || [];

    //checks if the currency pair is already saved as a favorite
    const existingFavorite = favorites.find(favorite => {
        return favorite.baseCurrency === baseCurrency && favorite.targetCurrency === targetCurrency;
    });

    if (existingFavorite) {
        alert("This currency pair is already saved as a favorite.");
        return;
    }
    //saves the new favorite currency pair in local storage
    const newFavorite = { baseCurrency, targetCurrency };
    favorites.push(newFavorite);
    localStorage.setItem("favoriteCurrencyPairs", JSON.stringify(favorites));

    //displays the new favorite currency pair
    displayFavoriteCurrencyPair(newFavorite);
}
function displayFavoriteCurrencyPair(currencyPair) {
    const listItem = document.createElement("button");
    listItem.innerText = `${currencyPair.baseCurrency} / ${currencyPair.targetCurrency}`;

    //click event listener to the list item button
    listItem.addEventListener("click", () => {
        //updates the base and target currency dropdowns to the selected favorite pair
        baseCurrencySelect.value = currencyPair.baseCurrency;
        targetCurrencySelect.value = currencyPair.targetCurrency;
    });

    favoriteCurrencyPairs.appendChild(listItem);
}
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoriteCurrencyPairs")) || [];

    for (const currencyPair of favorites) {
        displayFavoriteCurrencyPair(currencyPair);
    }
}
//calls the loadFavorites function when the page is loaded
loadFavorites();
//                                   ༼ ༎ຶ ෴ ༎ຶ༽