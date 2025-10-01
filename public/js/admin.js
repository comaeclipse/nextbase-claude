// Admin panel functionality

class AdminManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeComponents();
  }

  bindEvents() {
    // Delete confirmation
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-delete') || e.target.closest('.btn-delete')) {
        e.preventDefault();
        const button = e.target.matches('.btn-delete') ? e.target : e.target.closest('.btn-delete');
        this.handleDelete(button);
      }
    });

    // Form submission with loading state
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.admin-form')) {
        this.handleFormSubmit(e);
      }
    });

    // Auto-save for forms
    document.addEventListener('input', (e) => {
      if (e.target.matches('.auto-save')) {
        this.debounce(() => this.autoSave(e.target), 2000)();
      }
    });

    // Handle CSV import
    const csvImport = document.getElementById('csvImport');
    if (csvImport) {
      csvImport.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.showProgressModal('Importing CSV data...');
        }
      });
    }
  }

  initializeComponents() {
    // Initialize data tables
    this.initializeDataTables();

    // Initialize tooltips
    this.initializeTooltips();

    // Initialize form validation
    this.initializeFormValidation();

    // Auto-hide alerts
    this.autoHideAlerts();
  }

  handleDelete(button) {
    const itemType = button.dataset.type || 'item';
    const itemId = button.dataset.id;
    const itemName = button.dataset.name || 'this item';

    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      this.performDelete(button, itemType, itemId);
    }
  }

  async performDelete(button, itemType, itemId) {
    try {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      let endpoint = '';
      switch (itemType) {
        case 'location':
          endpoint = `/admin/locations/${itemId}`;
          break;
        case 'user':
          endpoint = `/admin/users/${itemId}`;
          break;
        default:
          throw new Error('Unknown item type');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Remove the row from the table
        const row = button.closest('tr');
        if (row) {
          row.style.opacity = '0';
          setTimeout(() => row.remove(), 300);
        }

        this.showAlert('success', result.message || 'Item deleted successfully');
      } else {
        this.showAlert('error', result.message || 'Failed to delete item');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-trash"></i>';
      }
    } catch (error) {
      console.error('Delete error:', error);
      this.showAlert('error', 'An error occurred while deleting the item');
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-trash"></i>';
    }
  }

  handleFormSubmit(e) {
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<span class="spinner"></span> Saving...';

      // Re-enable button after a delay if form doesn't redirect
      setTimeout(() => {
        if (submitButton.disabled) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }
      }, 10000);
    }
  }

  autoSave(input) {
    const form = input.closest('form');
    if (!form || !form.dataset.autosave) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    this.showAlert('info', 'Auto-saving...', 2000);

    // Implement auto-save logic here
    // This would typically send a PATCH request to update the specific field
  }

  initializeDataTables() {
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
      // Add sorting functionality
      const headers = table.querySelectorAll('th[data-sortable]');
      headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => this.sortTable(table, header));
      });
    });
  }

  sortTable(table, header) {
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const isAscending = header.classList.contains('sort-asc');

    // Remove existing sort classes
    header.parentNode.querySelectorAll('th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });

    // Add new sort class
    header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');

    rows.sort((a, b) => {
      const aText = a.children[columnIndex].textContent.trim();
      const bText = b.children[columnIndex].textContent.trim();

      // Try to parse as numbers
      const aNum = parseFloat(aText);
      const bNum = parseFloat(bText);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return isAscending ? bNum - aNum : aNum - bNum;
      }

      // Sort as strings
      return isAscending ? bText.localeCompare(aText) : aText.localeCompare(bText);
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => this.showTooltip(e));
      element.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }

  showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
  }

  hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  initializeFormValidation() {
    const forms = document.querySelectorAll('.validate-form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
      if (field.value && !this.isValidEmail(field.value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);

    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showAlert(type, message, duration = 5000) {
    const alertContainer = document.querySelector('.admin-content');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      ${message}
    `;

    alertContainer.insertBefore(alert, alertContainer.firstChild);

    if (duration > 0) {
      setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
      }, duration);
    }
  }

  autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
      }, 5000);
    });
  }

  showProgressModal(message) {
    const modal = document.createElement('div');
    modal.className = 'progress-modal';
    modal.innerHTML = `
      <div class="progress-content">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  hideProgressModal() {
    const modal = document.querySelector('.progress-modal');
    if (modal) {
      modal.remove();
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Utility method for making API calls
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

// User Management Class
class UserManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.closest('.modal-close')) {
                this.closeModals();
            }
            if (e.target.matches('.modal')) {
                this.closeModals();
            }
        });

        // Add user form
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    showAddUserModal() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    handleAddUser(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validate password confirmation
        if (password !== confirmPassword) {
            this.showAlert('error', 'Passwords do not match');
            return;
        }

        // Remove confirm password from form data
        formData.delete('confirmPassword');

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Adding...';

        // Submit form normally (will redirect)
        form.submit();
    }

    showAlert(type, message) {
        const alertContainer = document.querySelector('.admin-content');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        alertContainer.insertBefore(alert, alertContainer.firstChild);

        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

// Initialize admin functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdminManager();
  new UserManager();
});

// Export for use in other scripts
window.AdminManager = AdminManager;
window.UserManager = UserManager;