// This script handles the addition and removal of vehicles from the favorites list
// and validates the vehicle ID before submission.
document.addEventListener('DOMContentLoaded', () => {
    const favoriteForms = document.querySelectorAll('form[action$="/add-favorite"], form[action$="/remove-favorite"]');
    favoriteForms.forEach(form => {
      form.addEventListener('submit', (event) => {
        const invIdInput = form.querySelector('input[name="inv_id"]');
        const invId = invIdInput ? invIdInput.value : null;
  
        if (!invId || isNaN(parseInt(invId))) {
          event.preventDefault();
          alert('Invalid vehicle ID. Please try again.');
        }
      });
    });
  });