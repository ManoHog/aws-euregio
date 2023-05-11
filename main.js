/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true,
    maxZoom: 12
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map),
    "Temperatur": themaLayer.temperature.addTo(map),
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function writeStationLayer(jsondata){
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/wifi.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
    
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            let pointInTime = new Date (prop.date);

            layer.bindPopup(`
            <h4>${prop.name} (${feature.geometry.coordinates[2]}m)</h4>
            <ul>
                <li>Lufttemperatur (°C): ${prop.LT || "kein Wert"} </li>
                <li>Relative Luftfeuchte (%): ${prop.RH || "kein Wert"} </li>
                <li>Windgeschwindigkeit (km/h): ${prop.WG || "kein Wert"} </li>
                <li>Schneehöhe (cm): ${prop.HS || "kein Wert"} </li>
            </ul>
            <span>${pointInTime.toLocaleString()}</span>
            `);
            //console.log(prop.NAME);
        }
    }).addTo(themaLayer.stations);

    //console.log(response, jsondata)



// Wetterstation 
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    writeStationLayer(jsondata);

} 
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");}