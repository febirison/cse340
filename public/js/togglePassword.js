document.getElementById("togglePassword").addEventListener("click", function() {
    const passwordField = document.getElementById("account_password");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      this.textContent = "Hide Password";
    } else {
      passwordField.type = "password";
      this.textContent = "Show Password";
    }
  });
  