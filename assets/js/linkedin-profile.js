/**
 * LinkedIn Profile Picture Auto-Update
 * Fetches the latest LinkedIn profile picture and updates the site automatically
 */

(function() {
  'use strict';
  
  const PROFILE_IMG_SELECTOR = '#profile-picture';
  const LINKEDIN_USERNAME = 'aakash-raman-66676b38';
  
  // LinkedIn profile picture URL format
  // Note: This requires the actual image ID from LinkedIn
  // For automatic updates, you would need to use LinkedIn API or a proxy service
  const LINKEDIN_IMAGE_BASE = 'https://media.licdn.com/dms/image';
  
  function updateProfilePicture() {
    const profileImg = document.querySelector(PROFILE_IMG_SELECTOR);
    if (!profileImg) return;
    
    // Method 1: Use LinkedIn's public profile image (if available)
    // This requires the actual image ID which changes when profile picture updates
    const linkedinImageUrl = profileImg.getAttribute('data-linkedin-url');
    
    if (linkedinImageUrl) {
      const testImg = new Image();
      testImg.onload = function() {
        profileImg.src = linkedinImageUrl;
        profileImg.setAttribute('data-updated', new Date().toISOString());
      };
      testImg.onerror = function() {
        console.log('LinkedIn image not accessible, using local fallback');
      };
      testImg.src = linkedinImageUrl;
    }
    
    // Method 2: Use a proxy service (requires setup)
    // Example: fetch(`https://api.example.com/linkedin/${LINKEDIN_USERNAME}/image`)
    //   .then(response => response.json())
    //   .then(data => { profileImg.src = data.imageUrl; });
  }
  
  // Update on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProfilePicture);
  } else {
    updateProfilePicture();
  }
  
  // Optional: Update periodically (every 24 hours)
  // setInterval(updateProfilePicture, 24 * 60 * 60 * 1000);
})();
