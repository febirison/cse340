// public/js/showPassword.js
document.addEventListener("DOMContentLoaded", function() {
    const showPasswordCheckbox = document.getElementById("show-password");
    const passwordField = document.getElementById("account_password");
  
    if (showPasswordCheckbox && passwordField) {
      showPasswordCheckbox.addEventListener("change", function() {
        if (this.checked) {
          passwordField.type = "text";
        } else {
          passwordField.type = "password";
        }
      });
    }
  });
  