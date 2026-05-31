/* Contact Form Controller Logic - Made by Sai */

import { showNotification } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const formCard = document.getElementById('form-card');
  const successCard = document.getElementById('success-card');
  
  if (!form || !formCard || !successCard) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Gather Input Values
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const subjectInput = document.getElementById('form-subject');
    const messageInput = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    // 2. Validate Inputs
    if (!name || !email || !subject || !message) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showNotification('Please enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }

    // 3. Transition Submit Button to Loading State
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animated-float" style="width: 18px; height: 18px; fill: currentColor; margin-right: 0.5rem; display: inline-block; vertical-align: middle; animation: spin 1s linear infinite;" viewBox="0 0 24 24">
        <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 14c4.41 0 8-3.59 8-8h2c0 5.52-4.48 10-10 10v-2z"/>
      </svg>
      Sending Message...
    `;

    // Disable all inputs while sending
    const fields = [nameInput, emailInput, subjectInput, messageInput];
    fields.forEach(field => field.disabled = true);

    try {
      // 4. Send Real Email via FormSubmit AJAX API.
      // Use FormData (multipart) rather than JSON so the request stays a
      // CORS "simple request" — JSON content-type would trigger a preflight
      // OPTIONS that FormSubmit doesn't answer with CORS headers.
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('_subject', `[Portfolio Contact] ${subject}`);
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('message', message);

      const response = await fetch('https://formsubmit.co/ajax/hello@madebysai.com', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      if (result.success !== 'true' && result.success !== true) {
        throw new Error(result.message || 'Form submission was not successful');
      }

      // 5. Trigger Success Toast
      showNotification('Your message has been sent successfully!', 'success');

      // 6. Transition form to confirmation card view
      formCard.style.animation = 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
      
      setTimeout(() => {
        formCard.style.display = 'none';
        successCard.style.display = 'block';
      }, 300);

    } catch (error) {
      console.error('Submission failed:', error);
      showNotification('Something went wrong. Please try again.', 'error');
      
      // Re-enable form
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      fields.forEach(field => field.disabled = false);
    }
  });
});

/**
 * Validates email layout formatting using basic RegExp
 * @param {string} email Target address to check
 * @returns {boolean} True if layout is correct
 */
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Add simple CSS spin animation in header dynamically for the loading icon
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
