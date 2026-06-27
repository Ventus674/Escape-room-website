const button = document.getElementById("review_btn");
const overlay = document.getElementById("newPost_popup");
const animationScreen = document.getElementById("lockAnimation");
const shackle = document.querySelector(".shackle");
const modal = document.getElementById("newPost_popup");
const popup = document.querySelector(".popup");
const closeBtn = document.querySelector(".close-modal");
const reviewList = document.getElementById("reviews");
const form = document.querySelector(".escape__form");
const keyTotal = document.getElementById("keyTotal");
const ratingSelects = document.querySelectorAll(".rating-select");
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const reviewFilter = document.getElementById("reviewFilter");
const allReviewsLink = document.getElementById("allReviewsLink");
const locationSearchLink = document.getElementById("locationSearchLink");
const locationView = document.getElementById("locationView");
const searchToggleBtn = document.getElementById("searchToggleBtn");
const searchBox = document.getElementById("searchBox");
const reviewSearchInput = document.getElementById("reviewSearchInput");
const keyForKeysLink = document.getElementById("keyForKeysLink");
const keyForKeysView = document.getElementById("keyForKeysView");

let reviewsArray = [];
let reviewToDelete = null;
let editingReviewId = null;

keyForKeysLink.addEventListener("click", showKeyForKeys);

function showKeyForKeys() {
  reviewList.innerHTML = "";
  locationView.innerHTML = "";
  keyForKeysView.classList.remove("hidden");
  button.style.display = "none";

  let html = `<h2 class="location-view-title">Key for Keys</h2>`;

  const keyDescriptions = [
    "N/A. This aspect didn't exist or wasn't seen at all.",
    "Basically a joke. A child might've done better.",
    "Flimsy like a twig, covered in splinters. Was really bad.",
    "It was almost like it was thrown together. Not very good.",
    "It was ok, but definitley could've been fleshed out more.",
    "It was solid. Was neither good nor bad.",
    "Made it to the podium. Above average but room for improvement.",
    "Like getting gold in a local competition, very great part of the room and I was impressed.",
    "This part of the room was incredible and was a notable memory.",
    "Phenomenal aspect of the room and done at a very high level.",
    "Hit this aspect of the room perfectly, few rooms compare to it.",
  ];

  for (let i = 0; i <= 10; i++) {
    html += `
    <div class="key-guide-row">
      <img src="./images/${i}.png" alt="${i} key rating" class="key-guide-img">

      <div>
        <p><strong>${i}/10</strong></p>
        <p>${keyDescriptions[i]}</p>
      </div>
    </div>
  `;
  }

  keyForKeysView.innerHTML = html;
}

function updateKeyRating() {
  let total = 0;

  ratingSelects.forEach((select) => {
    total += parseInt(select.value);
  });

  keyTotal.textContent = total;
}

ratingSelects.forEach((select) => {
  select.addEventListener("change", updateKeyRating);
});

updateKeyRating();

searchToggleBtn.addEventListener("click", () => {
  searchBox.classList.toggle("hidden");
  reviewSearchInput.focus();
});

reviewSearchInput.addEventListener("input", renderReviews);

button.addEventListener("click", () => {
  animationScreen.classList.remove("hidden");

  setTimeout(() => {
    shackle.parentElement.classList.add("unlock-lock");
  }, 1500);
  shackle.parentElement.classList.remove("unlock-lock");

  setTimeout(() => {
    animationScreen.classList.add("hidden");
    overlay.classList.add("active");
  }, 2500);
});

/* CLOSE WITH X */

closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

/* CLOSE BY CLICKING OUTSIDE */

modal.addEventListener("click", (event) => {
  if (!popup.contains(event.target)) {
    modal.classList.remove("active");
  }
});

function getOverallKeyImage(score) {
  if (score <= 5) return "./images/0.png";
  if (score <= 15) return "./images/1.png";
  if (score <= 25) return "./images/2.png";
  if (score <= 35) return "./images/3.png";
  if (score <= 45) return "./images/4.png";
  if (score <= 55) return "./images/5.png";
  if (score <= 65) return "./images/6.png";
  if (score <= 75) return "./images/7.png";
  if (score <= 85) return "./images/8.png";
  if (score <= 95) return "./images/9.png";

  return "./images/10.png";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const roomName = document.getElementById("roomName").value;
  const title = document.getElementById("escapeTitle").value;
  const state = document.getElementById("stateSelect").value;
  const totalScore = parseInt(document.getElementById("keyTotal").textContent);
  const ratings = document.querySelectorAll(".rating-select");

  let puzzleScore = 0;
  let atmosphereScore = 0;
  let otherScore = 0;

  const sections = {
    puzzles: [],
    atmosphere: [],
    other: [],
  };

  ratings.forEach((rating, index) => {
    const question = rating.previousElementSibling.textContent;
    const textarea = rating.nextElementSibling.nextElementSibling;
    const description = textarea.value;
    const score = parseInt(rating.value);

    const sectionData = {
      question: question,
      score: score,
      description: description,
      keyImage: `./images/${score}.png`,
    };

    if (index < 4) {
      puzzleScore += score;
      sections.puzzles.push(sectionData);
    } else if (index < 8) {
      atmosphereScore += score;
      sections.atmosphere.push(sectionData);
    } else {
      otherScore += score;
      sections.other.push(sectionData);
    }
  });

  const review = {
    id: editingReviewId || Date.now(),
    roomName,
    title,
    state,
    totalScore,
    puzzleScore,
    atmosphereScore,
    otherScore,
    sections,
  };

  await saveReview(review);

  form.reset();
  updateKeyRating();
  modal.classList.remove("active");
});

async function saveReview(review) {
  const isEditing = editingReviewId !== null;

  const url = isEditing
    ? `http://localhost:3000/api/reviews/${editingReviewId}`
    : "http://localhost:3000/api/reviews";

  const method = isEditing ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Save failed:", response.status, errorText);
    return;
  }

  editingReviewId = null;
  await loadReviews();
}

async function loadReviews() {
  const response = await fetch("http://localhost:3000/api/reviews");
  reviewsArray = await response.json();

  renderReviews();
}

loadReviews();

confirmDeleteBtn.addEventListener("click", async () => {
  if (reviewToDelete !== null) {
    await fetch(`http://localhost:3000/api/reviews/${reviewToDelete}`, {
      method: "DELETE",
    });

    reviewToDelete = null;
    deleteConfirmModal.classList.add("hidden");

    loadReviews();
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  reviewToDelete = null;
  deleteConfirmModal.classList.add("hidden");
});

deleteConfirmModal.addEventListener("click", (event) => {
  if (event.target === deleteConfirmModal) {
    reviewToDelete = null;
    deleteConfirmModal.classList.add("hidden");
  }
});

function renderReviews() {
  reviewList.innerHTML = "";

  let displayedReviews = [...reviewsArray];

  const searchText = reviewSearchInput.value.toLowerCase();

  displayedReviews = displayedReviews.filter((review) => {
    return (
      review.title.toLowerCase().includes(searchText) ||
      review.state.toLowerCase().includes(searchText)
    );
  });

  if (reviewFilter.value === "highest") {
    displayedReviews.sort((a, b) => b.totalScore - a.totalScore);
  }

  if (reviewFilter.value === "lowest") {
    displayedReviews.sort((a, b) => a.totalScore - b.totalScore);
  }

  if (reviewFilter.value === "puzzles") {
    displayedReviews.sort((a, b) => b.puzzleScore - a.puzzleScore);
  }

  if (reviewFilter.value === "atmosphere") {
    displayedReviews.sort((a, b) => b.atmosphereScore - a.atmosphereScore);
  }

  if (reviewFilter.value === "other") {
    displayedReviews.sort((a, b) => b.otherScore - a.otherScore);
  }

  if (reviewFilter.value === "location") {
    const groupedReviews = {};

    displayedReviews.forEach((review) => {
      if (!groupedReviews[review.state]) {
        groupedReviews[review.state] = [];
      }

      groupedReviews[review.state].push(review);
    });

    for (const state in groupedReviews) {
      const stateHeading = document.createElement("h2");
      stateHeading.classList.add("location-group-title");
      stateHeading.textContent = state;

      reviewList.appendChild(stateHeading);

      groupedReviews[state].forEach((review) => {
        createReviewCard(review);
      });
    }
  } else {
    displayedReviews.forEach((review) => {
      createReviewCard(review);
    });
  }
}

function createReviewCard(review) {
  const reviewCard = document.createElement("div");
  const overallKeyImage = getOverallKeyImage(review.totalScore);
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️ Edit Review";
  editBtn.classList.add("edit-review-btn");

  editBtn.addEventListener("click", () => {
    startEditReview(review);
  });

  
  reviewCard.classList.add("review-card");

  reviewCard.innerHTML = `
    <h2>${review.roomName}</h2>
    <p><strong>Location:</strong> ${review.title}</p>
    <p><strong>State:</strong> ${review.state}</p>
    <p class="overall-key-rating">
  <img
    src="${overallKeyImage}"
    alt="Overall Key Rating"
    class="overall-key-img"
  >

  <strong>Key Rating:</strong> ${review.totalScore}/100
</p>

    <p><strong>Puzzle Score:</strong> ${review.puzzleScore}/40</p>
    <p><strong>Atmosphere Score:</strong> ${review.atmosphereScore}/40</p>
    <p><strong>Other Score:</strong> ${review.otherScore}/20</p>

    <hr>

    <h3 class="review-section-title">Puzzles</h3>
    ${buildSectionHTML(review.sections.puzzles)}

    <h3 class="review-section-title">Atmosphere</h3>
    ${buildSectionHTML(review.sections.atmosphere)}

    <h3 class="review-section-title">Other</h3>
    ${buildSectionHTML(review.sections.other)}
  `;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑 Delete Review";
  deleteBtn.classList.add("delete-review-btn");

  deleteBtn.addEventListener("click", () => {
    reviewToDelete = review.id;
    deleteConfirmModal.classList.remove("hidden");
  });

  reviewCard.appendChild(editBtn);
  reviewCard.appendChild(deleteBtn);
  reviewList.appendChild(reviewCard);
}

function startEditReview(review) {
  editingReviewId = review.id;

  document.getElementById("roomName").value = review.roomName || "";
  document.getElementById("escapeTitle").value = review.title || "";
  document.getElementById("stateSelect").value = review.state || "";

  const ratings = document.querySelectorAll(".rating-select");
  const textareas = document.querySelectorAll("textarea");

  const allSections = [
    ...review.sections.puzzles,
    ...review.sections.atmosphere,
    ...review.sections.other,
  ];

  allSections.forEach((section, index) => {
    ratings[index].value = section.score;
    textareas[index].value = section.description;
  });

  updateKeyRating();

  modal.classList.add("active");
}

function buildSectionHTML(sectionArray) {
  let html = "";

  sectionArray.forEach((section) => {
    html += `
      <div class="review-prompt-row">
        <h4>${section.question}</h4>
        <img 
          src="${section.keyImage}" 
          alt="${section.score} key rating" 
          class="category-key-img"
        >
      </div>

      <p><strong>Score:</strong> ${section.score}/10</p>
      <p>${section.description}</p>
      <hr>
    `;
  });

  return html;
}

reviewFilter.addEventListener("change", renderReviews);

function showAllReviews() {
  locationView.innerHTML = "";
  keyForKeysView.classList.add("hidden");
  reviewList.style.display = "flex";
  button.style.display = "block";

  renderReviews();
}

function showLocationSearch() {
  reviewList.innerHTML = "";
  reviewList.style.display = "none";
  button.style.display = "none";
  keyForKeysView.classList.add("hidden");

  const states = [...new Set(reviewsArray.map((review) => review.state))];

  let html = `
    <h2 class="location-view-title">Choose a State</h2>
    <div class="folder-grid">
  `;

  states.forEach((state) => {
    html += `
    <button class="folder-btn"
      onclick="showLocationsInState('${state}')">
      ${state}
    </button>
  `;
  });

  html += `</div>`;

  locationView.innerHTML = html;
}

function showLocationsInState(state) {
  const reviewsInState = reviewsArray.filter(
    (review) => review.state === state,
  );

  const locations = [...new Set(reviewsInState.map((review) => review.title))];

  let html = `
    <button class="back-btn" onclick="showLocationSearch()">← Back to States</button>
    <h2 class="location-view-title">${state} Locations</h2>
    <div class="folder-grid">
  `;

  locations.forEach((location) => {
    html += `
    <button class="folder-btn"
      onclick="showReviewsAtLocation('${state}','${location}')">
      ${location}
    </button>
  `;
  });

  html += `</div>`;

  locationView.innerHTML = html;
}

function showReviewsAtLocation(state, location) {
  locationView.innerHTML = `
    <button class="back-btn" onclick="showLocationsInState('${state}')">← Back to Locations</button>
    <h2 class="location-view-title">${location}</h2>
  `;

  reviewList.innerHTML = "";
  reviewList.style.display = "flex";
  button.style.display = "block";

  const locationReviews = reviewsArray.filter(
    (review) => review.state === state && review.title === location,
  );

  locationReviews.forEach((review) => {
    createReviewCard(review);
  });
}

allReviewsLink.addEventListener("click", showAllReviews);
locationSearchLink.addEventListener("click", showLocationSearch);
