/**
 * Contact Form JavaScript
 * Handles form validation, submission, and user feedback
 */

class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = document.getElementById('contact-submit');
        this.successMessage = document.getElementById('form-success');
        this.errorMessage = document.getElementById('form-error');
        
        this.fields = {
            name: {
                element: document.getElementById('contact-name'),
                error: document.getElementById('name-error'),
                validators: ['required', 'minLength']
            },
            email: {
                element: document.getElementById('contact-email'),
                error: document.getElementById('email-error'),
                validators: ['required', 'email']
            },
            message: {
                element: document.getElementById('contact-message'),
                error: document.getElementById('message-error'),
                validators: ['required', 'minLength']
            }
        };
        
        this.isSubmitting = false;
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // Add event listeners
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            field.element.addEventListener('blur', () => this.validateField(fieldName));
            field.element.addEventListener('input', () => this.clearFieldError(fieldName));
        });
    }
    
    handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate all fields
        const isValid = this.validateForm();
        
        if (isValid) {
            this.submitForm();
        } else {
            // Focus on first invalid field
            const firstInvalidField = this.getFirstInvalidField();
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    }
    
    validateForm() {
        let isValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.element.value.trim();
        const validators = field.validators;
        
        // Clear previous error state
        this.clearFieldError(fieldName);
        
        // Run validators
        for (const validator of validators) {
            const result = this.runValidator(validator, value, fieldName);
            if (!result.isValid) {
                this.showFieldError(fieldName, result.message);
                return false;
            }
        }
        
        // Show success state
        this.showFieldSuccess(fieldName);
        return true;
    }
    
    runValidator(validator, value, fieldName) {
        switch (validator) {
            case 'required':
                return {
                    isValid: value.length > 0,
                    message: `${this.getFieldLabel(fieldName)} is required.`
                };
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: emailRegex.test(value),
                    message: 'Please enter a valid email address.'
                };
                
            case 'minLength':
                const minLength = fieldName === 'message' ? 10 : 2;
                return {
                    isValid: value.length >= minLength,
                    message: `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters long.`
                };
                
            default:
                return { isValid: true, message: '' };
        }
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            name: 'Name',
            email: 'Email',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }
    
    showFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        field.element.classList.add('error');
        field.element.classList.remove('success');
        field.error.textContent = message;
        field.error.classList.add('show');
    }
    
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        field.element.classList.remove('error');
        field.error.textContent = '';
        field.error.classList.remove('show');
    }
    
    showFieldSuccess(fieldName) {
        const field = this.fields[fieldName];
        field.element.classList.add('success');
        field.element.classList.remove('error');
    }
    
    getFirstInvalidField() {
        for (const fieldName of Object.keys(this.fields)) {
            const field = this.fields[fieldName];
            if (field.element.classList.contains('error')) {
                return field.element;
            }
        }
        return null;
    }
    
    async submitForm() {
        this.isSubmitting = true;
        this.setSubmittingState(true);
        this.hideMessages();
        
        try {
            // Get form data
            const formData = this.getFormData();
            
            // Simulate form submission (replace with actual endpoint)
            const result = await this.sendFormData(formData);
            
            if (result.success) {
                this.showSuccessMessage();
                this.resetForm();
            } else {
                this.showErrorMessage(result.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            this.isSubmitting = false;
            this.setSubmittingState(false);
        }
    }
    
    getFormData() {
        return {
            name: this.fields.name.element.value.trim(),
            email: this.fields.email.element.value.trim(),
            message: this.fields.message.element.value.trim(),
            timestamp: new Date().toISOString()
        };
    }
    
    async sendFormData(formData) {
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, randomly succeed or fail
        // In production, replace this with actual form submission logic
        const shouldSucceed = Math.random() > 0.2; // 80% success rate for demo
        
        if (shouldSucceed) {
            return { success: true };
        } else {
            return { 
                success: false, 
                message: 'Server error. Please try again later.' 
            };
        }
        
        // Example of actual form submission:
        /*
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        */
    }
    
    setSubmittingState(isSubmitting) {
        const submitText = this.submitButton.querySelector('.submit-text');
        const submitLoading = this.submitButton.querySelector('.submit-loading');
        
        if (isSubmitting) {
            submitText.style.display = 'none';
            submitLoading.style.display = 'flex';
            this.submitButton.disabled = true;
        } else {
            submitText.style.display = 'flex';
            submitLoading.style.display = 'none';
            this.submitButton.disabled = false;
        }
    }
    
    showSuccessMessage() {
        this.successMessage.classList.add('show');
        this.successMessage.style.display = 'flex';
        this.errorMessage.classList.remove('show');
        this.errorMessage.style.display = 'none';
        
        // Scroll to success message
        this.successMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    showErrorMessage(message = 'There was an error sending your message. Please try again.') {
        const errorMessageText = document.getElementById('error-message');
        if (errorMessageText) {
            errorMessageText.textContent = message;
        }
        
        this.errorMessage.classList.add('show');
        this.errorMessage.style.display = 'flex';
        this.successMessage.classList.remove('show');
        this.successMessage.style.display = 'none';
        
        // Scroll to error message
        this.errorMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    hideMessages() {
        this.successMessage.classList.remove('show');
        this.errorMessage.classList.remove('show');
        
        // Hide after animation completes
        setTimeout(() => {
            if (!this.successMessage.classList.contains('show')) {
                this.successMessage.style.display = 'none';
            }
            if (!this.errorMessage.classList.contains('show')) {
                this.errorMessage.style.display = 'none';
            }
        }, 300);
    }
    
    resetForm() {
        // Clear form fields
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            field.element.value = '';
            field.element.classList.remove('success', 'error');
            this.clearFieldError(fieldName);
        });
        
        // Reset form
        this.form.reset();
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
}