const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const reviewsFile = path.join(__dirname, "reviews.json");

// Load reviews
function loadReviewsFromFile() {
  if (!fs.existsSync(reviewsFile)) {
    fs.writeFileSync(reviewsFile, "[]");
  }

  return JSON.parse(fs.readFileSync(reviewsFile, "utf8"));
}

// Save reviews
function saveReviewsToFile(reviews) {
  fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));
}

let reviews = loadReviewsFromFile();

console.log(`Loaded ${reviews.length} review(s).`);

// =======================
// GET ALL REVIEWS
// =======================

app.get("/api/reviews", (req, res) => {
  res.json(reviews);
});

// =======================
// CREATE REVIEW
// =======================

app.post("/api/reviews", (req, res) => {
  const newReview = {
    ...req.body,
    id: Date.now(),
  };

  reviews.push(newReview);

  saveReviewsToFile(reviews);

  res.status(201).json(newReview);
});

// =======================
// UPDATE REVIEW
// =======================

app.put("/api/reviews/:id", (req, res) => {
  const reviewId = Number(req.params.id);

  const reviewIndex = reviews.findIndex((review) => review.id === reviewId);

  if (reviewIndex === -1) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  reviews[reviewIndex] = {
    ...req.body,
    id: reviewId,
  };

  saveReviewsToFile(reviews);

  res.json(reviews[reviewIndex]);
});

// =======================
// DELETE REVIEW
// =======================

app.delete("/api/reviews/:id", (req, res) => {
  const reviewId = Number(req.params.id);

  reviews = reviews.filter((review) => review.id !== reviewId);

  saveReviewsToFile(reviews);

  res.json({
    message: "Review deleted",
  });
});

// =======================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
