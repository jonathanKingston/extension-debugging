function snapper() {
  const form = document.createElement("form");
  const input = document.createElement("input");
  form.style.visibility = "hidden";
  input.type = "password";
  form.appendChild(input);
  document.body.appendChild(form);
}

snapper();
