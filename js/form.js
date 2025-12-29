/**
 * Contact Form Handler
 * Provides client-side validation, loading states, and simulated submission
 */

(function() {
  'use strict';

  // Validation rules
  const VALIDATION_RULES = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Please enter your name (at least 2 characters)'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      message: 'Please enter a message (at least 10 characters)'
    }
  };

  /**
   * Validate a single field
   */
  function validateField(name, value) {
    const rules = VALIDATION_RULES[name];
    if (!rules) return { valid: true };

    const trimmedValue = value.trim();

    // Required check
    if (rules.required && !trimmedValue) {
      return { valid: false, message: rules.message };
    }

    // Min length check
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return { valid: false, message: rules.message };
    }

    // Max length check
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return { valid: false, message: `Maximum ${rules.maxLength} characters allowed` };
    }

    // Pattern check (for email)
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      return { valid: false, message: rules.message };
    }

    return { valid: true };
  }

  /**
   * Validate all form fields
   */
  function validateForm(formData) {
    const errors = {};

    for (const [name, value] of Object.entries(formData)) {
      const result = validateField(name, value);
      if (!result.valid) {
        errors[name] = result.message;
      }
    }

    return errors;
  }

  /**
   * Show error state for a field
   */
  function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.add('has-error');
    field.classList.add('error');

    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
    }

    // Set ARIA attributes for accessibility
    field.setAttribute('aria-invalid', 'true');
    if (errorElement) {
      const errorId = errorElement.id || `error-${field.name}`;
      errorElement.id = errorId;
      field.setAttribute('aria-describedby', errorId);
    }
  }

  /**
   * Clear error state for a field
   */
  function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.remove('has-error');
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  /**
   * Clear all form errors
   */
  function clearAllErrors(form) {
    const fields = form.querySelectorAll('.form-input, .form-textarea');
    fields.forEach(field => clearFieldError(field));
  }

  /**
   * Display form errors
   */
  function displayErrors(form, errors) {
    for (const [name, message] of Object.entries(errors)) {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) {
        showFieldError(field, message);
      }
    }

    // Focus the first field with an error
    const firstErrorField = form.querySelector('.form-input.error, .form-textarea.error');
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }

  /**
   * Set loading state on the submit button
   */
  function setLoadingState(button, isLoading) {
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
  }

  /**
   * Show form message (success or error)
   */
  function showFormMessage(form, type, message) {
    // Remove any existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.setAttribute('role', 'alert');
    messageElement.textContent = message;

    form.appendChild(messageElement);

    // Auto-hide success message after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => messageElement.remove(), 300);
      }, 5000);
    }
  }

  /**
   * Simulate form submission (mock API call)
   */
  function simulateSubmission(formData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve({ success: true, message: 'Thank you for your message! We\'ll get back to you soon.' });
        } else {
          reject(new Error('Submission failed. Please try again later.'));
        }
      }, 1500);
    });
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('.form-submit');

    // Clear previous errors
    clearAllErrors(form);

    // Remove any existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Get form data
    const formDataObj = new FormData(form);
    const formData = {
      name: formDataObj.get('name') || '',
      email: formDataObj.get('email') || '',
      message: formDataObj.get('message') || ''
    };

    // Validate
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      displayErrors(form, errors);
      return;
    }

    // Submit
    setLoadingState(submitButton, true);

    try {
      const result = await simulateSubmission(formData);
      showFormMessage(form, 'success', result.message);
      form.reset();
    } catch (error) {
      showFormMessage(form, 'error', error.message);
    } finally {
      setLoadingState(submitButton, false);
    }
  }

  /**
   * Handle real-time field validation on blur
   */
  function handleBlur(event) {
    const field = event.target;
    const { name, value } = field;

    if (!VALIDATION_RULES[name]) return;

    const result = validateField(name, value);

    if (!result.valid) {
      showFieldError(field, result.message);
    } else {
      clearFieldError(field);
    }
  }

  /**
   * Handle input to clear error state when user starts typing
   */
  function handleInput(event) {
    const field = event.target;
    if (field.classList.contains('error')) {
      // Only clear if the field now has a valid value
      const result = validateField(field.name, field.value);
      if (result.valid) {
        clearFieldError(field);
      }
    }
  }

  /**
   * Initialize form handling
   */
  function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Real-time validation on blur
    const fields = form.querySelectorAll('.form-input, .form-textarea');
    fields.forEach(field => {
      field.addEventListener('blur', handleBlur);
      field.addEventListener('input', handleInput);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }
})();
