var marker;

function searchTown() {
  var inputTown = document.getElementById('TownInput').value;

  fetch(`https://api-adresse.data.gouv.fr/search/?q=${inputTown}&autocomplete=1`)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        var addresses = data.features;
        displaySugg(addresses);
      } else {
        document.getElementById('resultTown').innerText = 'We can\'t find any town';
      }
    })
    .catch(error => console.error('Error during the search :', error));
}

function displaySugg(addresses) {
  var suggestionList = document.getElementById("city-suggestions");
  suggestionList.innerHTML = '';

  addresses.forEach(address => {
    var cityName = address.properties.city;
    var postalCode = address.properties.postcode;
    var key = cityName + " " + postalCode;

    var suggestionItem = document.createElement('li');
    suggestionItem.textContent = key;

    suggestionItem.addEventListener('click', function () {
      document.getElementById('TownInput').value = key;
      suggestionList.innerHTML = '';

      var latitude = address.geometry.coordinates[1];
      var longitude = address.geometry.coordinates[0];
      updateMapMarker(latitude, longitude);
    });

    suggestionList.appendChild(suggestionItem);
  });
}

function obtainMeteoInfo(latitude, longitude) {
  var apiKey = '0d47d640a383307597fca125db84f064';

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
          document.getElementById('humidity').innerText = `${data.main.humidity}%`;
          document.getElementById('precipitation').innerText = `${data.weather[0].description}`;
          document.getElementById('wind').innerText = `${data.wind.speed}`;
          document.getElementById('temperature').innerText = `${Math.round(data.main.temp - 273.15)}°C`;

          var weatherImage = document.getElementById('weatherImage');
          var weatherType = data.weather[0].main.toLowerCase();

          if (weatherType.includes('rain')) {
              weatherImage.style.backgroundImage = 'url("PHOTOS/Rain_icon.svg.png")';
          } else if (weatherType.includes('cloud')) {
          } else if (weatherType.includes('sun') || weatherType.includes('clear')) {
              weatherImage.style.backgroundImage = 'url("PHOTOS/Sun.svg.png")';
          } else if (weatherType.includes('wind')) {
              weatherImage.style.backgroundImage = 'url("PHOTOS/1244389.png")';
          }
      })
      .catch(error => console.error('Erreur lors de la récupération des informations météorologiques :', error));
}

function updateMapMarker(latitude, longitude) {
  if (map.hasLayer(marker)) {
    map.removeLayer(marker);
  }

  marker = L.marker([latitude, longitude]).addTo(map);
  map.setView([latitude, longitude], 13);

  obtainMeteoInfo(latitude, longitude);
}

document.getElementById('TownInput').addEventListener('input', searchTown);

var map = L.map('map').setView([48.866667, 2.333333], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    .openPopup();
