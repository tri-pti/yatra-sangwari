const list = document.getElementById("itineraryList");
const itinerary = JSON.parse(localStorage.getItem("yatra-itinerary")) || [];

if (itinerary.length === 0) {
  list.innerHTML = "<p>No places added yet.</p>";
}

itinerary.forEach(p => {
  const card = document.createElement("div");
  card.className = "place-card";

  card.innerHTML = `
    <img src="../assets/images/places/${p.image}">
    <h3>${p.name}</h3>
    <p>${p.city}</p>
  `;

  list.appendChild(card);
});
