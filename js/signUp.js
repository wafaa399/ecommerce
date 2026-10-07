const form = document.getElementById("signupForm");
const errBox = document.getElementById("signupError");

function fail(msg) {
  errBox.textContent = msg;
  errBox.classList.remove("d-none");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errBox.classList.add("d-none");

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!firstName || !lastName || !email || !password) return fail("Please fill in all fields.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email.");
  if (password.length < 8) return fail("Password must be at least 8 characters.");
  if (password !== confirm) return fail("Passwords do not match.");
  if (!document.getElementById("termsCheck").checked) return fail("You must accept the terms.");

  const res = await Auth.signup({ firstName, lastName, email, password });
  if (!res.ok) return fail(res.error);

  const redirect = new URLSearchParams(location.search).get("redirect");
  location.href = redirect || "index.html";
});