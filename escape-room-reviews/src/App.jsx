import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://escape-room-website.onrender.com";

const states = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const reviewPrompts = {
  puzzles: [
    "I enjoyed the puzzles in the room and they were unique:",
    "There were lots of puzzles and rooms that reflected the player ratio:",
    "Puzzles used and triggered mechanical and electrical engineering throughout the room:",
    "All puzzles had a purpose and they were solvable without a hint:",
  ],
  atmosphere: [
    "There was a clear and interesting story that matched the theme:",
    "Lots of props and puzzles helped build the atmosphere:",
    "There was visual and physical special effects to add to the immersion:",
    "There was music and audio effects that added to the immersion:",
  ],
  other: [
    "There were creative ideas that put a unique twist from the average escape room:",
    "The employees ensured it was a great experience (Ex: room works correct, respectful, attentive, helps create the mood)",
  ],
};

const keyDescriptions = [
  "N/A. This aspect didn't exist or wasn't seen at all.",
  "Basically a joke. A child might've done better.",
  "Flimsy like a twig, covered in splinters. Was really bad.",
  "It was almost like it was thrown together. Not very good.",
  "It was ok, but definitely could've been fleshed out more.",
  "It was solid. Was neither good nor bad.",
  "Made it to the podium. Above average but room for improvement.",
  "Like getting gold in a local competition, very great part of the room and I was impressed.",
  "This part of the room was incredible and was a notable memory.",
  "Phenomenal aspect of the room and done at a very high level.",
  "Hit this aspect of the room perfectly, few rooms compare to it.",
];

function getOverallKeyImage(score) {
  if (score <= 5) return "/images/0.png";
  if (score <= 15) return "/images/1.png";
  if (score <= 25) return "/images/2.png";
  if (score <= 35) return "/images/3.png";
  if (score <= 45) return "/images/4.png";
  if (score <= 55) return "/images/5.png";
  if (score <= 65) return "/images/6.png";
  if (score <= 75) return "/images/7.png";
  if (score <= 85) return "/images/8.png";
  if (score <= 95) return "/images/9.png";

  return "/images/10.png";
}

function App() {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("newest");
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  async function loadReviews() {
    const response = await fetch(API_URL);
    const data = await response.json();
    setReviews(data);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function saveReview(review) {
    const isEditing = Boolean(editingReview);

    const url = isEditing ? `${API_URL}/${editingReview.id}` : API_URL;

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

    setEditingReview(null);
    setShowForm(false);
    await loadReviews();
  }

  async function deleteReview() {
    if (!reviewToDelete) return;

    await fetch(`${API_URL}/${reviewToDelete.id}`, {
      method: "DELETE",
    });

    setReviewToDelete(null);
    await loadReviews();
  }

  function startNewReview() {
    setEditingReview(null);
    setShowForm(true);
  }

  function startEditReview(review) {
    setEditingReview(review);
    setShowForm(true);
  }

  const filteredReviews = [...reviews]
    .filter((review) => {
      const text = searchText.toLowerCase();

      return (
        review.roomName?.toLowerCase().includes(text) ||
        review.title?.toLowerCase().includes(text) ||
        review.state?.toLowerCase().includes(text)
      );
    })
    .sort((a, b) => {
      if (filter === "highest") return b.totalScore - a.totalScore;
      if (filter === "lowest") return a.totalScore - b.totalScore;
      if (filter === "puzzles") return b.puzzleScore - a.puzzleScore;
      if (filter === "atmosphere") return b.atmosphereScore - a.atmosphereScore;
      if (filter === "other") return b.otherScore - a.otherScore;

      return b.id - a.id;
    });

  return (
    <div>
      <h1 className="title">Ryan's escape room reviews</h1>

      <nav className="review-nav">
        <button onClick={() => setActiveTab("all")}>All Reviews</button>

        <button
          onClick={() => {
            setActiveTab("location");
            setSelectedState(null);
            setSelectedLocation(null);
          }}
        >
          Search by Location
        </button>

        <button onClick={() => setShowSearch(!showSearch)}>🔍</button>

        <button onClick={() => setActiveTab("keys")}>Key for Keys</button>
      </nav>

      <PuzzleClue />

      {showSearch && (
        <div className="search-box">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
      )}

      <button className="unlock-btn" onClick={startNewReview}>
        🔐 Unlock New Review
      </button>

      {activeTab === "all" && (
        <>
          <section className="filter-bar">
            <h2>Filter Reviews</h2>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
              <option value="puzzles">Highest Puzzle Score</option>
              <option value="atmosphere">Highest Atmosphere Score</option>
              <option value="other">Highest Other Score</option>
            </select>
          </section>

          <section className="reviews-container">
            <h2>Escape Room Reviews</h2>

            <div id="reviews">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={startEditReview}
                  onDelete={setReviewToDelete}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "location" && (
        <SearchByLocation
          reviews={reviews}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          onEdit={startEditReview}
          onDelete={setReviewToDelete}
        />
      )}

      {activeTab === "keys" && <KeyForKeys />}

      {showForm && (
        <ReviewForm
          existingReview={editingReview}
          onSave={saveReview}
          onClose={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {reviewToDelete && (
        <DeleteModal
          onConfirm={deleteReview}
          onCancel={() => setReviewToDelete(null)}
        />
      )}
    </div>
  );
}
function ReviewForm({ existingReview, onSave, onClose }) {
  const [roomName, setRoomName] = useState(existingReview?.roomName || "");
  const [title, setTitle] = useState(existingReview?.title || "");
  const [state, setState] = useState(existingReview?.state || "");

  const starterSections = {
    puzzles: reviewPrompts.puzzles.map((question, index) => ({
      question,
      score: existingReview?.sections?.puzzles?.[index]?.score ?? 10,
      description:
        existingReview?.sections?.puzzles?.[index]?.description || "",
    })),
    atmosphere: reviewPrompts.atmosphere.map((question, index) => ({
      question,
      score: existingReview?.sections?.atmosphere?.[index]?.score ?? 10,
      description:
        existingReview?.sections?.atmosphere?.[index]?.description || "",
    })),
    other: reviewPrompts.other.map((question, index) => ({
      question,
      score: existingReview?.sections?.other?.[index]?.score ?? 10,
      description: existingReview?.sections?.other?.[index]?.description || "",
    })),
  };

  const [sections, setSections] = useState(starterSections);

  const totalScore = [
    ...sections.puzzles,
    ...sections.atmosphere,
    ...sections.other,
  ].reduce((total, section) => total + Number(section.score), 0);

  function updateSection(category, index, field, value) {
    setSections((prevSections) => {
      const updatedCategory = [...prevSections[category]];

      updatedCategory[index] = {
        ...updatedCategory[index],
        [field]: field === "score" ? Number(value) : value,
      };

      return {
        ...prevSections,
        [category]: updatedCategory,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const preparedSections = {
      puzzles: sections.puzzles.map((section) => ({
        ...section,
        keyImage: `/images/${section.score}.png`,
      })),
      atmosphere: sections.atmosphere.map((section) => ({
        ...section,
        keyImage: `/images/${section.score}.png`,
      })),
      other: sections.other.map((section) => ({
        ...section,
        keyImage: `/images/${section.score}.png`,
      })),
    };

    const puzzleScore = preparedSections.puzzles.reduce(
      (sum, section) => sum + section.score,
      0,
    );

    const atmosphereScore = preparedSections.atmosphere.reduce(
      (sum, section) => sum + section.score,
      0,
    );

    const otherScore = preparedSections.other.reduce(
      (sum, section) => sum + section.score,
      0,
    );

    const review = {
      id: existingReview?.id || Date.now(),
      roomName,
      title,
      state,
      totalScore,
      puzzleScore,
      atmosphereScore,
      otherScore,
      sections: preparedSections,
    };

    onSave(review);
  }

  return (
    <div className="overlay active" onClick={onClose}>
      <div className="popup" onClick={(event) => event.stopPropagation()}>
        <button className="close-modal" type="button" onClick={onClose}>
          &times;
        </button>

        <h2>{existingReview ? "Edit escape review" : "New escape review"}</h2>

        <form className="escape__form" onSubmit={handleSubmit}>
          <fieldset className="form__fieldset">
            <div className="header__form">
              <label className="form__label">Room Name:</label>
              <input
                className="form__input"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                required
              />

              <label className="form__label">State:</label>
              <select
                className="form__select"
                value={state}
                onChange={(event) => setState(event.target.value)}
                required
              >
                <option value="">Select a state</option>
                {states.map((stateOption) => (
                  <option key={stateOption} value={stateOption}>
                    {stateOption}
                  </option>
                ))}
              </select>

              <label className="form__label">Location:</label>
              <input
                className="form__input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <h2 className="key__rating">
                Key rating: <span>{totalScore}</span>/100
              </h2>

              <div className="body__form">
                <SectionInputs
                  title="Puzzles:"
                  category="puzzles"
                  sections={sections.puzzles}
                  updateSection={updateSection}
                />

                <SectionInputs
                  title="Atmosphere:"
                  category="atmosphere"
                  sections={sections.atmosphere}
                  updateSection={updateSection}
                />

                <SectionInputs
                  title="Other"
                  category="other"
                  sections={sections.other}
                  updateSection={updateSection}
                />
              </div>

              <button type="submit" className="submit-review">
                {existingReview ? "Save Changes" : "Submit Review"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

function SectionInputs({ title, category, sections, updateSection }) {
  return (
    <>
      <h2 className="title__form">{title}</h2>

      {sections.map((section, index) => (
        <div key={section.question}>
          <label className="form__label">{section.question}</label>

          <select
            className="form__select rating-select"
            value={section.score}
            onChange={(event) =>
              updateSection(category, index, "score", event.target.value)
            }
          >
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>

          <h3 className="description">Description</h3>

          <textarea
            rows="10"
            cols="50"
            placeholder="Enter description here"
            value={section.description}
            onChange={(event) =>
              updateSection(category, index, "description", event.target.value)
            }
          />
        </div>
      ))}
    </>
  );
}

function ReviewCard({ review, onEdit, onDelete }) {
  const overallKeyImage = getOverallKeyImage(review.totalScore);

  return (
    <div className="review-card">
      <h2>{review.roomName}</h2>

      <p>
        <strong>Location:</strong> {review.title}
      </p>

      <p>
        <strong>State:</strong> {review.state}
      </p>

      <p className="overall-key-rating">
        <img
          src={overallKeyImage}
          alt="Overall Key Rating"
          className="overall-key-img"
        />
        <strong>Key Rating:</strong> {review.totalScore}/100
      </p>

      <p>
        <strong>Puzzle Score:</strong> {review.puzzleScore}/40
      </p>

      <p>
        <strong>Atmosphere Score:</strong> {review.atmosphereScore}/40
      </p>

      <p>
        <strong>Other Score:</strong> {review.otherScore}/20
      </p>

      <hr />

      <ReviewSection title="Puzzles" sections={review.sections.puzzles} />
      <ReviewSection title="Atmosphere" sections={review.sections.atmosphere} />
      <ReviewSection title="Other" sections={review.sections.other} />

      <button
        className="edit-review-btn"
        type="button"
        onClick={() => onEdit(review)}
      >
        ✏️ Edit Review
      </button>

      <button
        className="delete-review-btn"
        type="button"
        onClick={() => onDelete(review)}
      >
        🗑 Delete Review
      </button>
    </div>
  );
}

function ReviewSection({ title, sections }) {
  return (
    <>
      <h3 className="review-section-title">{title}</h3>

      {sections.map((section) => (
        <div key={section.question}>
          <div className="review-prompt-row">
            <h4>{section.question}</h4>

            <img
              src={section.keyImage || `/images/${section.score}.png`}
              alt={`${section.score} key rating`}
              className="category-key-img"
            />
          </div>

          <p>
            <strong>Score:</strong> {section.score}/10
          </p>

          <p>{section.description}</p>

          <hr />
        </div>
      ))}
    </>
  );
}

function SearchByLocation({
  reviews,
  selectedState,
  setSelectedState,
  selectedLocation,
  setSelectedLocation,
  onEdit,
  onDelete,
}) {
  const statesWithReviews = [
    ...new Set(reviews.map((review) => review.state)),
  ].filter(Boolean);

  if (!selectedState) {
    return (
      <section>
        <h2 className="location-view-title">Choose a State</h2>

        <div className="folder-grid">
          {statesWithReviews.map((state) => (
            <button
              key={state}
              className="folder-btn"
              type="button"
              onClick={() => setSelectedState(state)}
            >
              {state}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const reviewsInState = reviews.filter(
    (review) => review.state === selectedState,
  );

  const locations = [
    ...new Set(reviewsInState.map((review) => review.title)),
  ].filter(Boolean);

  if (!selectedLocation) {
    return (
      <section>
        <button
          className="back-btn"
          type="button"
          onClick={() => setSelectedState(null)}
        >
          ← Back to States
        </button>

        <h2 className="location-view-title">{selectedState} Locations</h2>

        <div className="folder-grid">
          {locations.map((location) => (
            <button
              key={location}
              className="folder-btn"
              type="button"
              onClick={() => setSelectedLocation(location)}
            >
              {location}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const locationReviews = reviews.filter(
    (review) =>
      review.state === selectedState && review.title === selectedLocation,
  );

  return (
    <section>
      <button
        className="back-btn"
        type="button"
        onClick={() => setSelectedLocation(null)}
      >
        ← Back to Locations
      </button>

      <h2 className="location-view-title">{selectedLocation}</h2>

      <div id="reviews">
        {locationReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function KeyForKeys() {
  return (
    <section>
      <h2 className="location-view-title">Key for Keys</h2>

      {keyDescriptions.map((description, index) => (
        <div className="key-guide-row" key={index}>
          <img
            src={`/images/${index}.png`}
            alt={`${index} key rating`}
            className="key-guide-img"
          />

          <div>
            <p>
              <strong>{index}/10</strong>
            </p>

            <p>{description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="delete-modal" onClick={onCancel}>
      <div
        className="delete-modal-box"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Delete Review?</h2>
        <p>
          Are you sure you want to delete this review? This cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button type="button" id="confirmDeleteBtn" onClick={onConfirm}>
            Yes, Delete
          </button>

          <button type="button" id="cancelDeleteBtn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PuzzleClue() {
  const [clue, setClue] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function getClue() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://api.adviceslip.com/advice");

      if (!response.ok) {
        throw new Error("Could not load a clue. Try again.");
      }

      const data = await response.json();

      setClue(data.slip.advice);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="filter-bar">
      <h2>Random Escape Room Hint</h2>

      <button type="button" onClick={getClue} disabled={isLoading}>
        {isLoading ? "Loading..." : "Get Hint"}
      </button>

      {error && <p>{error}</p>}

      {clue && (
        <p>
          <strong>Hint:</strong> {clue}
        </p>
      )}
    </section>
  );
}

export default App;
