const form = document.getElementById("signupForm");
const fields = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  emailAddress: document.getElementById("emailAddress"),
  interestType: document.getElementById("interestType"),
  availability: document.getElementById("availability"),
  experience: document.getElementById("experience"),
  shortMsg: document.getElementById("shortMsg"),
};
const infoPanel = document.getElementById("infoPanel");
const counter = document.getElementById("counter");
const confirmation = document.getElementById("confirmation");
const dashboard = document.getElementById("dashboard");

const MAX_CHARS = 200;

//Each interest type has a corresponding info panel message and prompt for the Experience field
const interestTypeInfo = {
  volunteer: {
    info: "Volunteers help with walks, cleaning, and events. About 4 hours a week.",
    prompt:
      "Have you worked with animals before? If so, please describe your experience.",
    next: "We'll email you open shift times.",
  },
  foster: {
    info: "Fosters house an animal for 2-8 weeks. We provide food, supplies, and vet care.",
    prompt: "Have you fostered animals before? Any other pets at home?",
    next: "A coordinator will contact you about a home check",
  },
  adoption: {
    info: "Adopters complete an application and a meet-and-greet.",
    prompt:
      "What pets have you had in the past? What are you looking for in a pet?",
    next: "we'll send you animal's profiles that match your preferences.",
  },
};
