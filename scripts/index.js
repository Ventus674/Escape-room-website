const editProfileBtn = document.querySelector(".profile__edit-btn");

const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileClosedBtn =
  editProfileModal.querySelector(".modal__close-btn");
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostClosedBtn = newPostModal.querySelector(".modal__close-btn");

editProfileBtn.addEventListener("click", function () {
  editProfileModal.classList.add("modal_is-opened");
});

editProfileClosedBtn.addEventListener("click", function () {
  editProfileModal.classList.remove("modal_is-opened");
});

newPostBtn.addEventListener("click", function () {
  newPostModal.classList.add("modal_is-opened");
});

newPostClosedBtn.addEventListener("click", function () {
  newPostModal.classList.remove("modal_is-opened");
});
