/**
 * Utility function to show toast notifications
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (0 for infinite)
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  const event = new CustomEvent('showToast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

// Convenience methods
export const successToast = (message, duration = 3000) =>
  showToast(message, 'success', duration);

export const errorToast = (message, duration = 3000) =>
  showToast(message, 'error', duration);

export const warningToast = (message, duration = 3000) =>
  showToast(message, 'warning', duration);

export const infoToast = (message, duration = 3000) =>
  showToast(message, 'info', duration);
