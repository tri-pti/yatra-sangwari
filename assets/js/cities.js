const filterButtons = document.querySelectorAll(".filter-btn");
const cityCards = document.querySelectorAll(".district-card");

fetch("data/places.json")
  .then(res => res.json())
  .then(data => {

    filterButtons.forEach(button => {
      button.addEventListener("click", () => {

        // Remove active state
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;

        cityCards.forEach(card => {
          const cityKey = card.dataset.city;

          if (filter === "all") {
            card.style.display = "block";
            return;
          }

          // Check if city has that category & not empty
          if (
            data[cityKey] &&
            data[cityKey][filter] &&
            data[cityKey][filter].length > 0
          ) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });

      });
    });

  });