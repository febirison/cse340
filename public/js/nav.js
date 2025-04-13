document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
  
    if (hamburger && navMenu) {
      // Toggle menu on hamburger click
      hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
  
      // Close menu when a link is clicked
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
        });
      });
    }
  });