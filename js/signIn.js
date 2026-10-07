const form = document.getElementById("signinForm");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passError = document.getElementById("passwordError");
const successMsg = document.getElementById("successMessage");

document.getElementById("showPassword").addEventListener("click", () => {
  passInput.type = passInput.type === "password" ? "text" : "password";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailError.textContent = "";
  passError.textContent = "";
  successMsg.textContent = "";

  const email = emailInput.value.trim();
  const password = passInput.value;
  let ok = true;

  if (!/^\S+@\S+\.\S+$/.test(email)) { emailError.textContent = "Enter a valid email."; ok = false; }
  if (!password) { passError.textContent = "Password is required."; ok = false; }
  if (!ok) return;

  const res = await Auth.signin(email, password, document.getElementById("remember").checked);
  if (!res.ok) { passError.textContent = res.error; return; }

  successMsg.textContent = "Signed in! Redirecting...";
  const redirect = new URLSearchParams(location.search).get("redirect");
  setTimeout(() => (location.href = redirect || "index.html"), 600);
});