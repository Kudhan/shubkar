# Vendor Registration Upgrade Plan ("Orchids" Standard)

## Goal
Elevate the Vendor Registration experience to a premium, comprehensive wizard that captures detailed business information, matching top-tier industry standards.

## Proposed Changes

### Backend
#### [MODIFY] [VendorProfile.js](file:///d:/projects/shubkar/backend/models/VendorProfile.js)
- Add `socialLinks` object (instagram, facebook, youtube).
- Add `bookingPolicy` object (advancePercentage, cancellationRules).
- Add `serviceCities` (Array of strings).
- Add `foundedYear` (Number).
- Add `awards` (Array of strings).

#### [MODIFY] [authController.js](file:///d:/projects/shubkar/backend/controllers/authController.js)
- Update `register` function to destructure and save the new fields into the `VendorProfile` document.

### Frontend
#### [MODIFY] [VendorRegister.jsx](file:///d:/projects/shubkar/frontend/src/pages/VendorRegister.jsx)
- **Transform into 4-Step Wizard**:
    1.  **Identity**: Basic credentials & Company Name.
    2.  **Expertise**: Multi-select Services, Primary City + Service Cities, Experience/Founded Year.
    3.  **Presence**: Website, Social Media Links, Detailed Bio.
    4.  **Business**: Starting Price, Payment Policy (Advance %), Portfolio Links.
- **UI Improvements**:
    - Use "Pill" selection for Services.
    - Add icons for Social Media inputs.
    - Better progress bar visibility.

## Verification
- Register a new vendor "Premium Events" with all new fields.
- Check Database to ensure all fields are saved.
- Verify Vendor Dashboard still works (might need minor tweak to show new info, but priority is saving it).
