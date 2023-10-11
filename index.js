import { places } from "./data.js";

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9lbC0yMDA0IiwiYSI6ImNsbmszenQ0ejFsMG8ya3J1MjNhcDEyZ2EifQ.z7X0f_vqsd_OTaQU_PcuKg';

const allowedDistance = 50; 

let startPoint = null;
let endPoint = null;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [78.9629, 20.5937], // Center the map on India
    zoom: 5
});

map.on('click', function(e) {
    const clickedCoordinates = [e.lngLat.lng, e.lngLat.lat];

    for (const place of places) {
        const placeCoordinates = place.coordinates;
        const distance = calculateDistance(clickedCoordinates[0], clickedCoordinates[1], placeCoordinates[0], placeCoordinates[1]);

        if (distance <= allowedDistance) { // Allow selection within 50 kilometers (adjust as needed)
            if (!startPoint) {
                startPoint = placeCoordinates;
                Swal.fire('Starting point selected', JSON.stringify(startPoint), 'success');
            } else if (!endPoint) {
                endPoint = placeCoordinates;
                Swal.fire('Valid destination selected', JSON.stringify(endPoint), 'success');
                drawRoute(map);
            }
         
            return;
        }
   
    }
    Swal.fire('Invalid destination', 'Please select a place within proximity of a major city or international airport.', 'error');
    location.reload();
});

function calculateDistance(lon1, lat1, lon2, lat2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in kilometers
}

function drawRoute(map) {
    if (startPoint && endPoint) {
        const geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [startPoint, endPoint]
                }
            }]
        };

        map.addSource('route', {
            type: 'geojson',
            data: geojson
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#888',
                'line-width': 8
            }
        });
    }

}
