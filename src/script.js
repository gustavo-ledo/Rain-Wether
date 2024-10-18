const apiKey = '6be5f6e0361b740c3d284ade7979ccf2';
const timeZoneApiKey = 'H74RTVAVLYNP';

const map = L.map('map', {
    minZoom: 3,
    maxZoom: 18,
    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    maxBoundsViscosity: 1.0,
    zoomControl: false
}).setView([0, 0], 2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let marker;
let circle;
let timeOffset = 0;

function onLocationFound(e) {
    const radius = e.accuracy / 2;
    if (marker) {
        map.removeLayer(marker);
    }
    if (circle) {
        map.removeLayer(circle);
    }

    marker = L.marker(e.latlng, {
        icon: L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
            iconSize: [25, 41],
            iconAnchor: [12, 45],
            popupAnchor: [3, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41]
        })
    }).addTo(map)
    .bindPopup("Você está dentro de " + radius.toFixed(0) + " metros desse ponto.")
    .openPopup();

    circle = L.circle(e.latlng, {
        color: 'white',
        fillColor: 'white',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);

    updateWeather(e.latlng.lat, e.latlng.lng);
}

document.getElementById('back-local').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 16 });
})

function onLocationError(e) {
    alert("Não foi possível obter sua localização: " + e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.locate({ setView: true, maxZoom: 16 });

function getCity() {
    const search = document.querySelector(".input").value;
    const parts = search.split(',');
    const city = parts[0].trim();
    const state = parts[1] ? parts[1].trim() : '';
    const country = parts[2] ? parts[2].trim() : '';

    const urlApi = `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&appid=${apiKey}&units=metric`;

    fetch(urlApi).then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById('city').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById("temp").textContent = `${data.main.temp.toFixed(0)}`;
        document.getElementById('min_temp').textContent = `${data.main.temp_min.toFixed(0)}`;
        document.getElementById('max_temp').textContent = `${data.main.temp_max.toFixed(0)}`;
        const lon = data.coord.lon;
        const lat = data.coord.lat;

        if (marker) {
            map.removeLayer(marker);
        }
        if (circle) {
            map.removeLayer(circle);
        }

        map.setView([lat, lon], 12);
        updateWeather(lat, lon);

        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup("Localização buscada: " + city)
            .openPopup();

        circle = L.circle([lat, lon], {
            color: 'blue',
            fillColor: 'white',
            fillOpacity: 0.5,
            radius: 1000
        }).addTo(map);
    }).catch(error => {
        console.error('Erro:', error);
    });
}

function updateWeather(lat, lon) {
    const urlApi = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(urlApi).then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById('city').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById("temp").textContent = `${data.main.temp.toFixed(0)}`;
        document.getElementById('min_temp').textContent = `Min ${data.main.temp_min.toFixed(1)}`;
        document.getElementById('max_temp').textContent = `Max ${data.main.temp_max.toFixed(1)}`;
       
        const weatherIcon = document.getElementById("weather-icon");
        weatherIcon.innerHTML = '';

        let iconSvg;
        switch (data.weather[0].main) {
            case 'Clear':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"/><path d="M11 20v2"/><path d="M7 19v2"/></svg>';
                break;
            case 'Clouds':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>';
                break;
            case 'Rain':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M3 19h3a5 5 0 0 0 9.37-3.14"/><path d="M16 13a4 4 0 0 0 3.2-6.4A4 4 0 1 0 10.65 10.11"/></svg>';
                break;
            default:
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"/><path d="M9 9h.01"/><path d="M9 15h.01"/></svg>';
                break;
        }
        weatherIcon.innerHTML = iconSvg;

        getLocalTime(lat, lon);
    }).catch(error => {
        console.error('Erro ao obter dados do clima:', error);
    });
}

function getLocalTime(lat, lon) {
    const timeZoneUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;

    fetch(timeZoneUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            timeOffset = data.gmtOffset; 
            updateRealTimeClock();
        })
        .catch(error => {
            console.error('Erro ao obter o fuso horário:', error);
        });
}

function updateRealTimeClock() {
    setInterval(() => {
        const currentTime = new Date(Date.now() + timeOffset * 1000);
        const hours = String(currentTime.getUTCHours()).padStart(2, '0');
        const minutes = String(currentTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(currentTime.getUTCSeconds()).padStart(2, '0');

        const day = String(currentTime.getDate()).padStart(2, '0');
        const month = String(currentTime.getUTCMonth() + 1).padStart(2, '0');
        const year = currentTime.getUTCFullYear();

        document.getElementById('local-date').textContent = `${day}/${month}/${year}`;
        document.getElementById('local-time').textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

document.querySelector(".submit").addEventListener("click", () => {
    getCity();
});
