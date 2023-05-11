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
    wind: L.featureGroup(),
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
    "Wetterstationen": themaLayer.stations,
    "Temperatur": themaLayer.temperature,
    "Wind": themaLayer.wind.addTo(map),

}).addTo(map);

layerControl.expand();

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function getColor(value, ramp ) {
    for (let rule of ramp) {
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
    }

}

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
}
function writeTemperatureLayer(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature) {
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor (feature.properties.LT, COLORS.temperature);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.LT.toFixed (1)}</span>`

                })
            });
        },
    }).addTo(themaLayer.temperature);
}


function writeWindLayer(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature) {
            if (feature.properties.WG > 0 && feature.properties.WG < 150) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor (feature.properties.WG, COLORS.wind);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.WG.toFixed (1)}</span>`

                })
            });
        },
    }).addTo(themaLayer.wind);
}



// Wetterstation 
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    writeStationLayer(jsondata);
    writeTemperatureLayer(jsondata);
    writeWindLayer(jsondata);

} 
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");