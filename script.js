function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('Link copied to clipboard!');
    })
    .catch((error) => {
      console.error('Failed to copy link: ', error);
      alert('Failed to copy link. Please try again.');
    });
}

function toggleDropdown(event) {
  event.preventDefault(); // stops # from jumping to top
  document.getElementById("resourcesMenu").classList.toggle("show");
}

// Close dropdown if user clicks anywhere outside
window.onclick = function(event) {
  if (!event.target.matches('.dropdown > a')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}