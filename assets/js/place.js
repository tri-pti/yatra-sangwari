const params = new URLSearchParams(window.location.search);

const city = params.get("city");
const type = params.get("type");
const name = params.get("name");

const placeNameEl = document.getElementById("placeName");
const placeImageEl = document.getElementById("placeImage");
const placeDescEl = document.getElementById("placeDescription");
const placeCityEl = document.getElementById("placeCity");
const placeCategoryEl = document.getElementById("placeCategory");
const placeMapEl = document.getElementById("placeMap");
const directionLink = document.getElementById("directionLink");

fetch("../data/places.json")
  .then(res => res.json())
  .then(data => {
    const places = data[city]?.[type];
    if (!places) return;

    const place = places.find(p => p.name === name);
    if (!place) return;

    placeNameEl.innerText = place.name;
    placeDescEl.innerText = place.description;
    placeCityEl.innerText = city.toUpperCase();
    placeCategoryEl.innerText = type.replace("-", " ").toUpperCase();

    placeImageEl.src = `../assets/images/places/${place.image}`;

    if (place.map?.lat && place.map?.lng) {
      placeMapEl.innerHTML = `
        <iframe
          src="https://www.google.com/maps?q=${place.map.lat},${place.map.lng}&output=embed"
          loading="lazy">
        </iframe>
      `;

      directionLink.href = `https://www.google.com/maps/dir/?api=1&destination=${place.map.lat},${place.map.lng}`;
    }
  });

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const nearbyList = document.getElementById("nearbyList");

let allPlaces = [];

// collect all places in the city
Object.keys(data[city]).forEach(cat => {
  if (Array.isArray(data[city][cat])) {
    data[city][cat].forEach(p => {
      if (p.map && p.name !== place.name) {
        allPlaces.push({ ...p, category: cat });
      }
    });
  }
});

// calculate distance
allPlaces.forEach(p => {
  p.distance = getDistance(
    place.map.lat,
    place.map.lng,
    p.map.lat,
    p.map.lng
  );
});

// sort by nearest
allPlaces.sort((a, b) => a.distance - b.distance);

// take top 4
const nearby = allPlaces.slice(0, 4);

// render
nearby.forEach(p => {
  const card = document.createElement("div");
  card.className = "nearby-card";

  card.innerHTML = `
    <img src="../assets/images/places/${p.image}"
         onerror="this.src='../assets/images/places/common/placeholder.jpg'">
    <h4>${p.name}</h4>
  `;

  card.addEventListener("click", () => {
    window.location.href =
      `place.html?city=${city}&type=${p.category}&name=${encodeURIComponent(p.name)}`;
  });

  nearbyList.appendChild(card);
});

const btn = document.getElementById("addToItineraryBtn");

const itineraryKey = "yatra-itinerary";

function getItinerary() {
  return JSON.parse(localStorage.getItem(itineraryKey)) || [];
}

function saveItinerary(list) {
  localStorage.setItem(itineraryKey, JSON.stringify(list));
}

btn.addEventListener("click", () => {
  let itinerary = getItinerary();

  const exists = itinerary.some(
    p => p.city === city && p.name === place.name
  );

  if (exists) {
    alert("This place is already in your itinerary.");
    return;
  }

  itinerary.push({
    city,
    type,
    name: place.name,
    image: place.image,
    map: place.map
  });

  saveItinerary(itinerary);

  btn.classList.add("added");
  btn.innerText = "✔ Added to Itinerary";
});
