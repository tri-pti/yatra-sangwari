//1 read url params
const params = new URLSearchParams(window.location.search);
const city = params.get("city");
const type = params.get("type");

//2 dom references
const list = document.getElementById("categoryList");
const title = document.getElementById("categoryTitle");
const subtitle = document.getElementById("categorySubtitle");

// CATEGORY ICON IMAGES (UI-level)
const categoryImages = {
  temples: "temple.jpg",
  waterfalls: "waterfall.jpg",
  wildlife: "wildlife.jpg",
  dams: "dam.jpg",
  "hill-stations": "hill.jpg",
  markets: "market.jpg"
};


/* ========== CATEGORY BACKGROUND ========== */
const bg = document.getElementById("category-bg");

const bgClassMap = {
  "waterfalls": "bg-waterfalls",
  "temples": "bg-temples",
  "wildlife": "bg-wildlife",
  "dams": "bg-dams",
  "hill-stations": "bg-hill-stations",
  "markets": "bg-markets"
};

if (bg && bgClassMap[type]) {
  bg.classList.add(bgClassMap[type]);
}
// 4️⃣ Utility functions (distance, format, etc.)
//location
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}
//user location
let userLocation = null;

// 5️⃣ Location logic
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    },
    () => {
      console.warn("Location access denied");
    }
  );
}

function format(text) {
  return text
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Header text
title.innerText = format(type);
subtitle.innerText = `Top ${format(type)} in ${format(city)}`;

/* ========== SHOW SKELETONS ========== */
list.innerHTML = "";

for (let i = 0; i < 6; i++) {
  list.innerHTML += `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>
  `;
}

/* ========== FETCH REAL DATA ========== */
fetch("../data/places.json")
  .then(res => res.json())
  .then(data => {
    list.innerHTML = "";

    if (!data[city] || !data[city][type] || data[city][type].length === 0) {
      list.innerHTML = `
        <p class="loading-text">
          No places available yet for this category.
        </p>
      `;
      return;
    }

    
    data[city][type].forEach(place => {
  const card = document.createElement("div");
  card.className = "place-card";

  /* let mapIframe = "";
  let directionLink = "";
  let distanceText = "";

  if (place.map?.lat && place.map?.lng) {
    const lat = place.map.lat;
    const lng = place.map.lng;

    mapIframe = `
      <div class="map-embed">
        <iframe
          src="https://www.google.com/maps?q=${lat},${lng}&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    `;

    directionLink = `
      <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}"
         target="_blank"
         class="dir-btn">
        🧭 Directions
      </a>
    `;

    if (userLocation) {
      const km = getDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
      distanceText = `<p class="distance">📏 ${km} km away</p>`;
    }
  }*/

  const categoryImg = categoryImages[type] || "default.jpg";

card.innerHTML = `
  <div class="place-image-wrapper">

    <!-- PLACE IMAGE -->
    <img
      src="../assets/images/places/${place.image}"
      alt="${place.name}"
      class="place-img"
      onerror="this.src='../assets/images/places/common/placeholder.jpg'"
    >
</div>

  <div class="place-card-content">
    <h3>${place.name}</h3>
    <p>${place.description}</p>
  
  </div>
`;

 // 🔥 ADD CLICK HANDLER HERE
card.addEventListener("click", () => {
  window.location.href =
    `place.html?city=${city}&type=${type}&name=${encodeURIComponent(place.name)}`;
});


  list.appendChild(card);
});
  });
