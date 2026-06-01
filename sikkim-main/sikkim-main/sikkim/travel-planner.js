// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTravelPlanner();
});

function initializeTravelPlanner() {
    const form = document.getElementById('travel-form');
    const loadingModal = document.getElementById('loading-modal');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
    
    // Add date validation
    setupDateValidation();
    
    // Form submission handler
    form.addEventListener('submit', handleFormSubmission);
    
    // Real-time validation
    setupRealTimeValidation();
}

function setupDateValidation() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    startDate.addEventListener('change', function() {
        endDate.min = this.value;
        if (endDate.value && endDate.value < this.value) {
            endDate.value = this.value;
        }
    });
    
    endDate.addEventListener('change', function() {
        if (this.value < startDate.value) {
            this.value = startDate.value;
        }
    });
}

function setupRealTimeValidation() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('input', validateField);
        field.addEventListener('blur', validateField);
    });
}

function validateField(event) {
    const field = event.target;
    const isValid = field.checkValidity();
    
    // Remove existing validation classes
    field.classList.remove('valid', 'invalid');
    
    if (field.value.trim() !== '') {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    const formData = collectFormData();
    generatePDF(formData);
}

function validateForm() {
    const form = document.getElementById('travel-form');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid');
            isValid = false;
        }
    });
    
    // Validate at least one place is selected
    const selectedPlaces = document.querySelectorAll('input[name="places"]:checked');
    if (selectedPlaces.length === 0) {
        showNotification('Please select at least one place to visit.', 'error');
        isValid = false;
    }
    
    // Validate date range
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    if (endDate <= startDate) {
        showNotification('End date must be after start date.', 'error');
        isValid = false;
    }
    
    return isValid;
}

function collectFormData() {
    const form = document.getElementById('travel-form');
    const formData = new FormData(form);
    
    // Collect selected places
    const selectedPlaces = [];
    document.querySelectorAll('input[name="places"]:checked').forEach(checkbox => {
        selectedPlaces.push(checkbox.value);
    });
    
    // Organize data
    const data = {
        personal: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            age: formData.get('age'),
            nationality: formData.get('nationality'),
            address: formData.get('address')
        },
        travel: {
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            groupSize: formData.get('groupSize'),
            budget: formData.get('budget'),
            accommodation: formData.get('accommodation'),
            transportation: formData.get('transportation'),
            interests: formData.get('interests'),
            activityLevel: formData.get('activityLevel'),
            season: formData.get('season'),
            experience: formData.get('experience'),
            specialRequests: formData.get('specialRequests') || ''
        },
        places: selectedPlaces
    };
    
    return data;
}

function generatePDF(data) {
    showLoadingModal();
    
    // Simulate processing time
    setTimeout(() => {
        try {
            createPDFDocument(data);
            hideLoadingModal();
            showNotification('Your travel PDF has been generated successfully!', 'success');
        } catch (error) {
            hideLoadingModal();
            showNotification('Error generating PDF. Please try again.', 'error');
            console.error('PDF generation error:', error);
        }
    }, 2000);
}

function createPDFDocument(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // PDF Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to add text with wrapping
    function addText(text, fontSize = 12, isBold = false, color = [0, 0, 0]) {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(...color);
        
        const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
        lines.forEach(line => {
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += fontSize * 0.4;
        });
        yPosition += 5;
    }
    
    // Helper function to add section header
    function addSectionHeader(title) {
        yPosition += 5;
        doc.setFillColor(6, 182, 212);
        doc.rect(margin, yPosition - 8, pageWidth - (margin * 2), 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, yPosition);
        yPosition += 15;
        doc.setTextColor(0, 0, 0);
    }
    
    // Title Page
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Sikkim Travel Itinerary', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Personalized for ${data.personal.firstName} ${data.personal.lastName}`, pageWidth / 2, 45, { align: 'center' });
    
    yPosition = 80;
    doc.setTextColor(0, 0, 0);
    
    // Personal Information Section
    addSectionHeader('Personal Information');
    addText(`Name: ${data.personal.firstName} ${data.personal.lastName}`, 12, true);
    addText(`Email: ${data.personal.email}`);
    addText(`Phone: ${data.personal.phone}`);
    addText(`Age: ${data.personal.age}`);
    addText(`Nationality: ${data.personal.nationality}`);
    addText(`Address: ${data.personal.address}`);
    
    // Travel Details Section
    addSectionHeader('Travel Details');
    const startDate = new Date(data.travel.startDate).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    const endDate = new Date(data.travel.endDate).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    const duration = Math.ceil((new Date(data.travel.endDate) - new Date(data.travel.startDate)) / (1000 * 60 * 60 * 24));
    
    addText(`Travel Dates: ${startDate} to ${endDate} (${duration} days)`, 12, true);
    addText(`Group Size: ${data.travel.groupSize}`);
    addText(`Budget Range: ${data.travel.budget}`);
    addText(`Accommodation: ${data.travel.accommodation}`);
    addText(`Transportation: ${data.travel.transportation}`);
    addText(`Primary Interest: ${data.travel.interests}`);
    addText(`Activity Level: ${data.travel.activityLevel}`);
    addText(`Preferred Season: ${data.travel.season}`);
    addText(`Experience Level: ${data.travel.experience}`);
    
    if (data.travel.specialRequests) {
        addText(`Special Requests: ${data.travel.specialRequests}`);
    }
    
    // Places to Visit Section
    addSectionHeader('Selected Places to Visit');
    
    // Group places by category
    const placeCategories = {
        'Monasteries': [],
        'Tourist Attractions': [],
        'Trekking Routes': [],
        'Cultural Experiences': []
    };
    
    // Categorize selected places
    data.places.forEach(place => {
        if (place.includes('Monastery')) {
            placeCategories['Monasteries'].push(place);
        } else if (['Goecha La Trek', 'Kanchenjunga Base Camp', 'Sandakphu Trek', 'Dzongri Trek', 'Green Lake Trek', 'Singalila Ridge Trek'].includes(place)) {
            placeCategories['Trekking Routes'].push(place);
        } else if (['Local Markets', 'Traditional Festivals', 'Handicraft Centers', 'Tea Gardens', 'Village Homestays', 'Local Cuisine Tours'].includes(place)) {
            placeCategories['Cultural Experiences'].push(place);
        } else {
            placeCategories['Tourist Attractions'].push(place);
        }
    });
    
    Object.entries(placeCategories).forEach(([category, places]) => {
        if (places.length > 0) {
            addText(`${category}:`, 14, true, [6, 182, 212]);
            places.forEach(place => {
                addText(`• ${place}`);
            });
            yPosition += 5;
        }
    });
    
    // Recommendations Section
    addSectionHeader('Personalized Recommendations');
    
    const recommendations = generateRecommendations(data);
    recommendations.forEach(recommendation => {
        addText(recommendation);
    });
    
    // Suggested Itinerary
    addSectionHeader('Suggested Itinerary');
    const itinerary = generateItinerary(data);
    itinerary.forEach((day, index) => {
        addText(`Day ${index + 1}: ${day}`, 12, true);
    });
    
    // Essential Information
    addSectionHeader('Essential Information');
    addText('Permits Required:', 12, true);
    addText('• Inner Line Permit (ILP) for Indian citizens');
    addText('• Protected Area Permit (PAP) for restricted areas');
    addText('• Valid ID proof required at all times');
    
    addText('Best Time to Visit:', 12, true);
    addText('• Spring (March-May): Clear mountain views, blooming rhododendrons');
    addText('• Summer (June-August): Monsoon season, lush greenery');
    addText('• Autumn (September-November): Clear skies, perfect weather');
    addText('• Winter (December-February): Snow-covered landscapes, limited accessibility');
    
    addText('What to Pack:', 12, true);
    addText('• Warm clothing and layers');
    addText('• Comfortable trekking shoes');
    addText('• Rain gear and waterproof items');
    addText('• Sunscreen and sunglasses');
    addText('• First aid kit and personal medications');
    addText('• Power bank and camera');
    
    // Emergency Contacts
    addSectionHeader('Emergency Contacts');
    addText('Tourist Helpline: +91-3592-202865', 12, true);
    addText('Police Emergency: 100');
    addText('Medical Emergency: 108');
    addText('Fire Emergency: 101');
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Sikkim Wanderlust Travel Planner', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    // Save the PDF
    const fileName = `Sikkim_Travel_Plan_${data.personal.firstName}_${data.personal.lastName}.pdf`;
    doc.save(fileName);
}

function generateRecommendations(data) {
    const recommendations = [];
    
    // Budget-based recommendations
    if (data.travel.budget === 'budget') {
        recommendations.push('• Consider staying in guesthouses and homestays for authentic experiences and lower costs.');
        recommendations.push('• Use shared transportation and local buses to save money.');
        recommendations.push('• Try local street food and small restaurants for authentic cuisine.');
    } else if (data.travel.budget === 'luxury') {
        recommendations.push('• Book premium hotels and resorts with mountain views.');
        recommendations.push('• Consider hiring a private vehicle with driver for comfort and flexibility.');
        recommendations.push('• Opt for guided tours and premium experiences.');
    }
    
    // Activity level recommendations
    if (data.travel.activityLevel === 'high' || data.travel.activityLevel === 'extreme') {
        recommendations.push('• Book trekking permits well in advance.');
        recommendations.push('• Consider hiring experienced guides for high-altitude treks.');
        recommendations.push('• Pack proper trekking gear and equipment.');
    }
    
    // Season-based recommendations
    if (data.travel.season === 'winter') {
        recommendations.push('• Pack heavy winter clothing as temperatures can drop below freezing.');
        recommendations.push('• Some high-altitude areas may be inaccessible due to snow.');
        recommendations.push('• Check road conditions before traveling to remote areas.');
    }
    
    // Group size recommendations
    if (data.travel.groupSize === '9+') {
        recommendations.push('• Book accommodations and transportation well in advance for large groups.');
        recommendations.push('• Consider split bookings if single large accommodations are not available.');
    }
    
    // Interest-based recommendations
    if (data.travel.interests === 'spiritual') {
        recommendations.push('• Visit monasteries early in the morning for peaceful meditation sessions.');
        recommendations.push('• Respect local customs and dress modestly when visiting religious sites.');
        recommendations.push('• Participate in morning prayers if welcomed by monks.');
    }
    
    return recommendations;
}

function generateItinerary(data) {
    const itinerary = [];
    const duration = Math.ceil((new Date(data.travel.endDate) - new Date(data.travel.startDate)) / (1000 * 60 * 60 * 24));
    const selectedPlaces = data.places;
    
    // Simple itinerary generation based on selected places
    if (duration >= 1) {
        itinerary.push('Arrival in Gangtok, check-in, local exploration and market visit');
    }
    
    if (duration >= 2 && selectedPlaces.some(place => place.includes('Monastery'))) {
        itinerary.push('Monastery tour - Visit selected monasteries and spiritual sites');
    }
    
    if (duration >= 3 && selectedPlaces.includes('Tsomgo Lake')) {
        itinerary.push('Tsomgo Lake and Nathula Pass excursion (if selected)');
    }
    
    if (duration >= 4 && selectedPlaces.includes('Pelling')) {
        itinerary.push('Travel to Pelling, Kanchenjunga views, and local sightseeing');
    }
    
    if (duration >= 5 && selectedPlaces.some(place => place.includes('Trek'))) {
        itinerary.push('Trekking day - Begin selected trekking route');
    }
    
    if (duration >= 6) {
        itinerary.push('Cultural experiences and local interactions');
    }
    
    if (duration >= 7) {
        itinerary.push('Free day for shopping and relaxation');
    }
    
    // Add departure day
    if (duration > 1) {
        itinerary.push('Departure - Check-out and travel back');
    }
    
    // Limit to actual duration
    return itinerary.slice(0, Math.max(duration, 1));
}

function showLoadingModal() {
    const modal = document.getElementById('loading-modal');
    modal.classList.add('show');
}

function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    modal.classList.remove('show');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-triangle' : 
                 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
                backdrop-filter: blur(20px);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 12px;
                padding: 1rem 1.5rem;
                z-index: 10001;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-color: rgba(16, 185, 129, 0.5);
            }
            
            .notification.error {
                border-color: rgba(239, 68, 68, 0.5);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #f8fafc;
                font-size: 0.9rem;
            }
            
            .notification.success i {
                color: #10b981;
            }
            
            .notification.error i {
                color: #ef4444;
            }
            
            .notification i {
                color: #06b6d4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: rgba(248, 250, 252, 0.7);
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: 0.5rem;
                transition: color 0.3s ease;
            }
            
            .notification-close:hover {
                color: #f8fafc;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    const autoHide = setTimeout(() => hideNotification(notification), 5000);
    
    // Manual close handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoHide);
        hideNotification(notification);
    });
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300);
}

// Form reset functionality
function resetForm() {
    document.getElementById('travel-form').reset();
    
    // Remove validation classes
    const fields = document.querySelectorAll('.valid, .invalid');
    fields.forEach(field => field.classList.remove('valid', 'invalid'));
    
    showNotification('Form has been reset.', 'info');
}

// Export form data as JSON (for backup/debugging)
function exportFormData() {
    const data = collectFormData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sikkim_travel_data_${Date.now()}.json`;
    link.click();
    
    showNotification('Form data exported successfully!', 'success');
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const submitBtn = document.querySelector('.generate-pdf-btn');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
        }
    }
    
    // Escape to close loading modal
    if (event.key === 'Escape') {
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal.classList.contains('show')) {
            hideLoadingModal();
        }
    }
});

// Add smooth scrolling to form sections
function scrollToSection(sectionIndex) {
    const sections = document.querySelectorAll('.form-section');
    if (sections[sectionIndex]) {
        sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
    }
}

// Auto-save form data to localStorage
function autoSaveFormData() {
    try {
        const data = collectFormData();
        localStorage.setItem('sikkim_travel_form_data', JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to auto-save form data:', error);
    }
}

// Load saved form data
function loadSavedFormData() {
    try {
        const savedData = localStorage.getItem('sikkim_travel_form_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            populateForm(data);
            showNotification('Previously saved data has been loaded.', 'info');
        }
    } catch (error) {
        console.warn('Failed to load saved form data:', error);
    }
}

function populateForm(data) {
    // Populate personal details
    Object.entries(data.personal).forEach(([key, value]) => {
        const field = document.getElementById(key);
        if (field && value) {
            field.value = value;
        }
    });
    
    // Populate travel details
    Object.entries(data.travel).forEach(([key, value]) => {
        const field = document.getElementById(key);
        if (field && value) {
            field.value = value;
        }
    });
    
    // Populate selected places
    if (data.places) {
        data.places.forEach(place => {
            const checkbox = document.querySelector(`input[value="${place}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

// Set up auto-save on form changes
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data on page load
    setTimeout(loadSavedFormData, 500);
    
    // Auto-save every 30 seconds
    setInterval(autoSaveFormData, 30000);
    
    // Auto-save on form changes
    const form = document.getElementById('travel-form');
    if (form) {
        form.addEventListener('change', autoSaveFormData);
    }
});
