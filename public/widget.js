(function () {
  // This function runs once the script is loaded

  // 1. --- Configuration ---
  const WIDGET_HOST = "https://needachef.ng"; // Replace with your actual domain in production
  const BUTTON_TEXT = "Book a Chef for Your Stay";

  // --- Helper to get URL params ---
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      ref: params.get('ref') || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    };
  }

  // 2. --- Create and Inject CSS ---
  const css = `
    .needachef-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #FF6B00; /* Needachef Orange */
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      border: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      transition: transform 0.2s ease-in-out;
    }
    .needachef-widget-button:hover {
      transform: scale(1.05);
    }
    .needachef-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .needachef-modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .needachef-modal-content {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      transform: translateY(-20px);
      transition: transform 0.3s ease;
    }
    .needachef-modal-overlay.active .needachef-modal-content {
      transform: translateY(0);
    }
    .needachef-modal-content h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .needachef-form-group {
      margin-bottom: 15px;
    }
    .needachef-form-group label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #555;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .needachef-form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .needachef-submit-button {
      width: 100%;
      padding: 12px;
      background-color: #FF6B00;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }
    .needachef-close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #888;
    }
    .needachef-modal-header {
      position: relative;
    }
  `;
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // 3. --- Create HTML Elements ---
  const button = document.createElement("button");
  button.innerText = BUTTON_TEXT;
  button.className = "needachef-widget-button";

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "needachef-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="needachef-modal-content">
      <div class="needachef-modal-header">
        <h2>Book a Private Chef</h2>
        <button class="needachef-close-button">&times;</button>
      </div>
      <form id="needachef-booking-form">
        <div class="needachef-form-group">
          <label for="nc-service">Service Required</label>
          <select id="nc-service" name="service" required>
            <option value="">Loading services...</option>
          </select>
        </div>
        <div class="needachef-form-group">
          <label for="nc-name">Full Name</label>
          <input type="text" id="nc-name" name="name" required>
        </div>
        <div class="needachef-form-group">
          <label for="nc-phone">Phone Number</label>
          <input type="tel" id="nc-phone" name="phone" required>
        </div>
        <div class="needachef-form-group">
          <label for="nc-location">Location (e.g., Hotel Name)</label>
          <input type="text" id="nc-location" name="location" required>
        </div>
        <div class="needachef-form-group">
          <label for="nc-guests">Number of Guests</label>
          <input type="number" id="nc-guests" name="guests" min="1" value="1" required>
        </div>
        <div class="needachef-form-group">
          <label for="nc-date">Date & Time</label>
          <input type="datetime-local" id="nc-date" name="date" required>
        </div>
        <button type="submit" class="needachef-submit-button">Request Chef</button>
        <p id="needachef-form-message" style="margin-top: 15px; text-align: center;"></p>
      </form>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(modalOverlay);

  const form = document.getElementById("needachef-booking-form");
  const formMessage = document.getElementById("needachef-form-message");
  const submitButton = modalOverlay.querySelector(".needachef-submit-button");
  const serviceSelect = document.getElementById("nc-service");

  let availableServices = []; // To store fetched services

  // Fetch services and populate the dropdown
  async function fetchServices() {
    try {
      const response = await fetch(`${WIDGET_HOST}/api/services`);
      if (!response.ok) throw new Error("Failed to fetch services.");
      const services = await response.json();
      availableServices = services; // Store services globally

      serviceSelect.innerHTML = '<option value="">Select a service</option>'; // Reset options
      services.forEach(service => {
        if (service.type === "TIERED" && service.options && service.options.length > 0) {
          service.options.forEach((option, index) => {
            const optionElement = document.createElement("option");
            optionElement.value = `${service.id}-${index}-tiered`;
            optionElement.innerText = `${service.name} - ${option.price} (${option.coverage})`;
            serviceSelect.appendChild(optionElement);
          });
        } else if (service.type === "PER_HEAD") {
          const optionElement = document.createElement("option");
          optionElement.value = `${service.id}-per-head`;
          optionElement.innerText = `${service.name} - ${service.price} (${service.minGuests})`;
          serviceSelect.appendChild(optionElement);
        }
      });
    } catch (error) {
      console.error("Error loading services:", error);
      serviceSelect.innerHTML = '<option value="">Failed to load services</option>';
      serviceSelect.disabled = true;
    }
  }

  // Initial fetch of services
  fetchServices();

  button.addEventListener("click", () => {
    modalOverlay.classList.add("active");
  });

  modalOverlay.querySelector(".needachef-close-button").addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("active");
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerText = "Sending...";
    formMessage.innerText = "";

    const formData = new FormData(this);
    const partnerUrl = window.location.href;
    const trackingParams = getUrlParams();
    
    const selectedServiceValue = formData.get("service");
    let selectedServiceDetails = null;

    if (selectedServiceValue) {
      const [serviceId, indexOrType, type] = selectedServiceValue.split('-');
      if (type === "TIERED") {
        const service = availableServices.find(s => s.id === serviceId && s.type === "TIERED");
        if (service && service.options && service.options[parseInt(indexOrType)]) {
          selectedServiceDetails = {
            id: service.id,
            name: service.name,
            description: service.description,
            type: service.type,
            selectedOption: {
              index: parseInt(indexOrType),
              ...service.options[parseInt(indexOrType)],
            },
          };
        }
      } else if (indexOrType === "PER_HEAD") {
        const service = availableServices.find(s => s.id === serviceId && s.type === "PER_HEAD");
        if (service) {
          selectedServiceDetails = {
            id: service.id,
            name: service.name,
            description: service.description,
            type: service.type,
            price: service.price,
            minGuests: service.minGuests,
          };
        }
      }
    }

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      location: formData.get("location"),
      guests: parseInt(formData.get("guests")), // Capture guests value
      date: formData.get("date"),
      partnerUrl: partnerUrl,
      ...trackingParams,
      selectedService: selectedServiceDetails, // Include selected service details
    };

    try {
      const response = await fetch(`${WIDGET_HOST}/api/widget-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        formMessage.style.color = "green";
        formMessage.innerText = "Success! We will contact you shortly.";
        form.reset();
        setTimeout(() => {
          modalOverlay.classList.remove("active");
          formMessage.innerText = "";
        }, 3000);
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error) {
      formMessage.style.color = "red";
      formMessage.innerText = "Error: " + error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.innerText = "Request Chef";
    }
  });
})();