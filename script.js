// Replace with your OpenWeatherMap API key
const apiKey = "4320c95d2b3d6cd2b5c6370fc5853c6e";
const weatherBaseUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastBaseUrl = "https://api.openweathermap.org/data/2.5/forecast";

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');

// Update date and time
function updateDateTime() {
    const dateTime = document.getElementById('dateTime');
    const now = new Date();
    dateTime.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fetch current weather and forecast
async function getWeatherData(city) {
    try {
        // Fetch current weather
        const weatherUrl = `${weatherBaseUrl}?q=${city}&appid=${apiKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === "404") {
            showError();
            return;
        }

        // Fetch 5-day forecast
        const forecastUrl = `${forecastBaseUrl}?q=${city}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        updateUI(weatherData, forecastData);
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError();
    }
}

// Update UI with weather data
function updateUI(weatherData, forecastData) {
    // Hide error and show weather info
    errorMessage.classList.add('hidden');
    weatherInfo.classList.remove('opacity-0', 'translate-y-4');

    // Update current weather
    document.getElementById('cityName').textContent = weatherData.name;
    document.getElementById('temperature').textContent = 
        `${Math.round(weatherData.main.temp)}°C`;
    document.getElementById('weatherDescription').textContent = 
        weatherData.weather[0].description;
    document.getElementById('feelsLike').textContent = 
        `${Math.round(weatherData.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = 
        `${weatherData.main.humidity}%`;
    document.getElementById('windSpeed').textContent = 
        `${Math.round(weatherData.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    document.getElementById('pressure').textContent = 
        `${weatherData.main.pressure} hPa`;

    // Update weather icon
    const iconCode = weatherData.weather[0].icon;
    document.getElementById('weatherIcon').src = 
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Update date and time
    updateDateTime();

    // Update forecast
    updateForecast(forecastData);
}

// Update 5-day forecast
function updateForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (excluding current day)
    const dailyForecasts = forecastData.list.filter(forecast => 
        forecast.dt_txt.includes('12:00:00')
    ).slice(0, 5);

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;

        const forecastCard = `
            <div class="bg-black/20 p-4 rounded-xl text-center">
                <p class="font-bold">${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" 
                     alt="Weather Icon" 
                     class="w-12 h-12 mx-auto">
                <p class="text-lg font-bold">${temp}°C</p>
            </div>
        `;

        forecastContainer.innerHTML += forecastCard;
    });
}

// Show error message
function showError() {
    weatherInfo.classList.add('opacity-0', 'translate-y-4');
    errorMessage.classList.remove('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Initialize with default city
window.addEventListener('load', () => {
    updateDateTime();
    getWeatherData('London');
});

// Update time every minute
setInterval(updateDateTime, 60000);