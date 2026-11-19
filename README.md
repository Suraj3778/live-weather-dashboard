# Atmos — Live Weather Dashboard

A responsive weather dashboard built with HTML, CSS, and vanilla JavaScript. Search for a city to see live current conditions and a five-day forecast, powered by the free Open-Meteo geocoding and forecast APIs. No account or API key is required.

## Run locally

1. Download or clone this project.
2. Open `index.html` in a modern browser. If your browser restricts network requests from local files, serve the folder with any static file server (for example, `npx serve .`) and open the local URL it prints.
3. Search for a city, or use the default Prayagraj forecast. Toggle between Celsius and Fahrenheit with the control in the top-right.

An internet connection is required to fetch geocoding and weather data.

## GitHub upload

Create an empty repository on GitHub, then run these commands from this project folder (replace the URL with your repository URL):

```bash
git init
git add index.html style.css script.js README.md
git commit -m "Build live weather dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Deploy with GitHub Pages

1. Open the repository on GitHub and select **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)` folder, then select **Save**.
4. Once published, open the Pages URL shown in the settings.

All app files are static and can be served directly from the repository root.

## Developer

Created by [Suraj Yadav](https://suportfolio2026.netlify.app/).

## Data and units

- City lookup: [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- Current conditions and daily forecast: [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- Wind speed is displayed in km/h and precipitation in mm.
- Forecast cards show the five days after today. Temperatures are converted locally when Fahrenheit is selected.
