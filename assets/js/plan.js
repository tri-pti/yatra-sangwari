const citySelect = document.getElementById("citySelect");
const daySelect = document.getElementById("daySelect");
const itineraryDiv = document.getElementById("itinerary");

let userLocation = null;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
    },
    () => {
      console.warn("Location access denied");
    }
  );
}
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


document.getElementById("generatePlan").addEventListener("click", () => {
  const city = citySelect.value;
  const days = Number(daySelect.value);

  if (!city || !days) {
    itineraryDiv.innerHTML = "<p>Please select city and days.</p>";
    return;
  }

  fetch("../data/places.json")
    .then(res => res.json())
    .then(data => {
      const cityData = data[city];
      if (!cityData) {
        itineraryDiv.innerHTML = "<p>No data available.</p>";
        return;
      }

      const plan = generatePlan(cityData, days);
      renderPlan(plan);
    });
});

function generatePlan(cityData, days) {
  const categoriesOrder = [
    "temples",
    "markets",
    "waterfalls",
    "wildlife",
    "hill-stations",
    "dams"
  ];

  const available = categoriesOrder.filter(cat => cityData[cat]?.length);
  const plan = [];

  for (let i = 0; i < days; i++) {
    plan.push({
      day: i + 1,
      categories: available.slice(i * 2, i * 2 + 2)
    });
  }

  return plan;
}

function renderPlan(plan) {
  itineraryDiv.innerHTML = "";
  const city = citySelect.value;

  fetch("../data/places.json")
    .then(res => res.json())
    .then(data => {
      const cityData = data[city];

      plan.forEach(day => {
        let totalDistance = 0;
        let placesForDay = [];

        // 1️⃣ Collect representative places
        day.categories.forEach(cat => {
          const place = cityData[cat]?.[0];
          if (place?.map?.lat && place?.map?.lng) {
            placesForDay.push(place);
          }
        });

        const routeURL = buildGoogleMapsRoute(userLocation, placesForDay);

        //smartordering function
function optimizeRoute(userLoc, places) {
  if (!places.length) return [];

  let remaining = [...places];
  let ordered = [];

  let current = userLoc
    ? { map: userLoc }
    : remaining.shift();

  while (remaining.length) {
    let nearestIndex = 0;
    let minDist = Infinity;

    remaining.forEach((place, i) => {
      const d = getDistance(
        current.map.lat,
        current.map.lng,
        place.map.lat,
        place.map.lng
      );
      if (d < minDist) {
        minDist = d;
        nearestIndex = i;
      }
    });

    current = remaining.splice(nearestIndex, 1)[0];
    ordered.push(current);
  }

  return ordered;
}

        // 2️⃣ Distance: user → first place
        if (userLocation && placesForDay.length > 0) {
          totalDistance += getDistance(
            userLocation.lat,
            userLocation.lng,
            placesForDay[0].map.lat,
            placesForDay[0].map.lng
          );
        }

        // 3️⃣ Distance: place → place
        for (let i = 0; i < placesForDay.length - 1; i++) {
          totalDistance += getDistance(
            placesForDay[i].map.lat,
            placesForDay[i].map.lng,
            placesForDay[i + 1].map.lat,
            placesForDay[i + 1].map.lng
          );
        }

        // 4️⃣ Render category links
        const itemsHTML = day.categories.map(cat => `
          <a
            href="../pages/category.html?city=${city}&type=${cat}"
            class="itinerary-link"
          >
            ${format(cat)}
          </a>
        `).join("");

        itineraryDiv.innerHTML += `
          <div class="day-card">
            <h3>Day ${day.day}</h3>

            <div class="itinerary-items">
              ${itemsHTML}
            </div>

            <p class="day-distance">
              📏 Estimated travel: ${totalDistance.toFixed(1)} km
            </p>
            <a href="${routeURL}" target="_blank" class="route-btn">
      🗺️ View Route on Google Maps
    </a>
          </div>
        `;
      });
    });
}


function format(text) {
  return text.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
}

//route builder function
function buildGoogleMapsRoute(userLoc, places) {
  if (!places.length) return "#";

  let origin = userLoc
    ? `${userLoc.lat},${userLoc.lng}`
    : `${places[0].map.lat},${places[0].map.lng}`;

  let destination = `${places[places.length - 1].map.lat},${places[places.length - 1].map.lng}`;

  let waypoints = places
    .slice(0, -1)
    .map(p => `${p.map.lat},${p.map.lng}`)
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }

  return url;
}


