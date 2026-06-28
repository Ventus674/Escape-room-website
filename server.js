const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const fs = require("fs");
const path = require("path");

const reviewsFile = path.join(__dirname, "reviews.json");

function loadReviewsFromFile() {
  if (!fs.existsSync(reviewsFile)) {
    fs.writeFileSync(reviewsFile, "[]");
  }

  return JSON.parse(fs.readFileSync(reviewsFile, "utf8"));
}

function saveReviewsToFile(reviews) {
  fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));
}

app.use(cors());
app.use(express.json());

let reviews = loadReviewsFromFile();

// Get all reviews
app.get("/api/reviews", (req, res) => {
  res.json(reviews);
});

// Add a review
app.post("/api/reviews", (req, res) => {
  const newReview = {
    id: Date.now(),
    ...req.body,
  };

  reviews.push(newReview);
  saveReviewsToFile(reviews);

  res.status(201).json(newReview);
});

app.put("/api/reviews/:id", (req, res) => {
  const reviewId = Number(req.params.id);

  const reviewIndex = reviews.findIndex((review) => review.id === reviewId);

  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    ...req.body,
    id: reviewId,
  };

  saveReviewsToFile(reviews);

  res.json(reviews[reviewIndex]);
});

// Delete a review
app.delete("/api/reviews/:id", (req, res) => {
  const reviewId = Number(req.params.id);

  reviews = reviews.filter((review) => review.id !== reviewId);
  saveReviewsToFile(reviews);
  res.json({ message: "Review deleted" });
});

// Filter/sort reviews
app.get("/api/reviews/filter/:type", (req, res) => {
  const type = req.params.type;
  let filteredReviews = [...reviews];

  if (type === "highest") {
    filteredReviews.sort((a, b) => b.totalScore - a.totalScore);
  }

  if (type === "lowest") {
    filteredReviews.sort((a, b) => a.totalScore - b.totalScore);
  }

  if (type === "puzzles") {
    filteredReviews.sort((a, b) => b.puzzleScore - a.puzzleScore);
  }

  if (type === "atmosphere") {
    filteredReviews.sort((a, b) => b.atmosphereScore - a.atmosphereScore);
  }

  if (type === "other") {
    filteredReviews.sort((a, b) => b.otherScore - a.otherScore);
  }

  res.json(filteredReviews);
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
