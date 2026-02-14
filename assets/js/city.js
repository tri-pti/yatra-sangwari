const params = new URLSearchParams(window.location.search);
const cityKey = params.get("city");

const cityNameEl = document.getElementById("cityName");

const breadcrumbCity = document.getElementById("breadcrumbCity");

if (breadcrumbCity) {
  breadcrumbCity.innerText = cityNameEl.innerText;
}

const cityDescEl = document.getElementById("cityDescription");
const cards = document.querySelectorAll(".city-card");

function format(text) {
  return text
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

fetch("../data/places.json")
  .then(res => res.json())
  .then(data => {
    const cityData = data[cityKey];

    if (!cityData) {
      cityNameEl.innerText = "City Not Found";
      cityDescEl.innerText = "";
      return;
    }

    // City title & description
    cityNameEl.innerText = cityData.meta?.name || format(cityKey);
    cityDescEl.innerText =
      cityData.meta?.description ||
      "Explore tourist attractions of Chhattisgarh.";

    document.title = `${cityNameEl.innerText} | Yatra Sangwari`;

    // Handle category cards
    cards.forEach(card => {
      const type = card.dataset.type;

      // Hide card if no data
      if (!cityData[type] || cityData[type].length === 0) {
        card.style.display = "none";
        return;
      }

      // Update Explore link dynamically
      const link = card.querySelector("a");
      link.href = `category.html?city=${cityKey}&type=${type}`;
    });
  })
  .catch(err => {
    console.error("Error loading city data:", err);
  });
