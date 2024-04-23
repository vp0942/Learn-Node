import axios from "axios";
import { $ } from "./bling";

// Google Maps API loaded in the layout.pug file

// Default options for our initial map
const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
};

// Helper function that makes a map and display stores on it like pins (markers)
function loadPlaces(map, lat = 43.2, lng = -79.8) {
  // Get the stores that are near the selected place from the API
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    // If there is not store within 10km of the selected place, we will show an alert
    if (!places.length) {
      alert("No places found!");
      return;
    }

    // Create bounds
    // Bounds are the area that is visible on the map
    // We will extend the bounds to fit all the markers
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow(); // InfoWindow is the popup that appears when we click on a marker

    // For each place, create a marker
    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates; // MongoDB stores the coordinates in the opposite order
      const position = { lat: placeLat, lng: placeLng }; // Google Maps expects the latitude first
      bounds.extend(position); // Extend the bounds to fit this marker. In the end all the markers will fit in the bounds
      const marker = new google.maps.Marker({ map, position }); // Add the marker to the map
      marker.place = place; // Attach our specific place object data to the marker object so we can access it later
      return marker;
    });

    // When someone clicks on a marker, show the details of that place in the infoWindow
    // We will attach an event listener to each marker
    // marker.addListener() is the same as google.maps.event.addListener(marker, "click", function() {})
    markers.forEach(marker =>
      marker.addListener("click", function () {
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || "store.png"}" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html); // this refers to the marker in the html
        infoWindow.open(map, this); // this refers to the marker
      })
    );

    // Then zoom the map to fit all the markers perfectly
    map.setCenter(bounds.getCenter()); // Center the map in the middle of the bounds
    map.fitBounds(bounds); // Fit the map to the bounds by zooming in or out
  });
}

// Make a map and pass it to makeMap()
function makeMap(mapDiv) {
  if (!mapDiv) return;

  // Make our initial map
  const map = new google.maps.Map(mapDiv, mapOptions);

  // Load places on the map
  loadPlaces(map);

  // Make the search input work
  // $ is a function that is defined in bling.js and is a shortcut for document.querySelector()
  const input = $('[name="geolocate"]'); // Get the search input
  const autocomplete = new google.maps.places.Autocomplete(input); // Create an autocomplete object for the search input
  autocomplete.addListener("place_changed", () => { // When the user selects a place
    const place = autocomplete.getPlace(); // Get the place that the user selected
    const lat = place.geometry.location.lat(); // Get the latitude of the place
    const lng = place.geometry.location.lng(); // Get the longitude of the place
    loadPlaces(map, lat, lng); // Load the places near the selected place.
  });
}

export default makeMap;