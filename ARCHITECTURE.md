# User Flow Diagram & Architecture

## 🎯 User Flow for New Feature

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADD PRAYER SPACE SCREEN                      │
└─────────────────────────────────────────────────────────────────┘

   START: User opens "Add Prayer Space"
   │
   ├─── USER TYPES IN "PLACE NAME" FIELD
   │    │
   │    └─→ [GOOGLE PLACES API]
   │        │
   │        └─→ Returns suggestions dropdown
   │
   ├─── DROPDOWN APPEARS WITH OPTIONS
   │    ├─ Shop 2, Crystal, Kanungo, Mira Road East
   │    ├─ Masjid XYZ, Mumbai, Maharashtra
   │    ├─ Prayer Center, Bangalore
   │    └─ ...
   │
   ├─── USER CLICKS A SUGGESTION
   │    │
   │    └─→ [handlePlaceSelect() function]
   │        │
   │        ├─→ Extract full address
   │        ├─→ Extract city from address
   │        └─→ Auto-fill city field
   │
   ├─── FORM NOW HAS
   │    ├─ Place Name: "Shop 2, Crystal, Kanungo, Mira Road East" ✅
   │    ├─ City: "Mira Road East" ✅ (AUTO-FILLED)
   │    └─ Clear Button (X) appears ✅
   │
   ├─── IF USER MADE MISTAKE
   │    │
   │    └─→ USER CLICKS X BUTTON
   │        │
   │        └─→ [clearPlaceSelection() function]
   │            │
   │            ├─→ Clear Place Name field
   │            ├─→ Clear City field
   │            ├─→ Hide X button
   │            └─→ Focus back to search
   │
   ├─── USER FILLS OTHER FIELDS
   │    ├─ Type of Place (Masjid, Musalla, etc.)
   │    ├─ Capacity (optional)
   │    ├─ Amenities (checkboxes)
   │    └─ Photo (optional)
   │
   ├─── USER CLICKS "ADD PRAYER SPACE"
   │    │
   │    └─→ [Validation]
   │        ├─ Title required? ✅
   │        ├─ City required? ✅
   │        ├─ Valid capacity? ✅
   │        └─ Location available? ✅
   │
   ├─── DATA SENT TO SUPABASE
   │    ├─ title: "Shop 2, Crystal, Kanungo, Mira Road East"
   │    ├─ city: "Mira Road East"
   │    ├─ type: "musalla"
   │    ├─ latitude: 19.1234
   │    ├─ longitude: 72.5678
   │    └─ ... other fields
   │
   └─── SUCCESS! PLACE ADDED ✅
        └─→ Navigate to Home Screen
            └─→ Show new place in list
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADD PRAYER SPACE SCREEN                    │
│  (src/screens/AddPlaceScreen.tsx)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
           ┌────────▼────────┐  ┌──────▼──────────┐
           │ State Variables │  │ Handler Methods │
           ├─────────────────┤  ├─────────────────┤
           │ formData        │  │ handlePlace...  │
           │ location        │  │ clearPlaceDesc  │
           │ photo           │  │ validateForm()  │
           │ selectedPlace   │  │ handleSubmit()  │
           │ googlePlacesRef │  └─────────────────┘
           └────────┬────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼──┐   ┌───▼──┐   ┌───▼──┐
    │Input │   │Type  │   │City  │
    │(Auto)│   │Select│   │Input │
    └───┬──┘   └──────┘   └──────┘
        │
        └─→ GooglePlacesAutocomplete Component
            │
            └─→ [GOOGLE PLACES API]
                │
                └─→ Returns: formatted_address, address_components
                    │
                    └─→ handlePlaceSelect() extracts:
                        ├─ Full address → title field
                        └─ City → city field (auto-fill)
```

---

## 🔄 Data Flow

```
USER INPUT
   │
   ├─ Types in Place Name field
   │   │
   │   └─→ GooglePlacesAutocomplete detects change
   │       │
   │       └─→ Calls Google Places API
   │           │
   │           └─→ API returns suggestions
   │               │
   │               └─→ Dropdown displays 5-10 options
   │
   ├─ Clicks a suggestion
   │   │
   │   └─→ onPress triggered
   │       │
   │       └─→ handlePlaceSelect(data, details)
   │           │
   │           ├─→ Extract details.formatted_address
   │           │   └─→ Full address
   │           │
   │           ├─→ Parse details.address_components
   │           │   └─→ Look for "locality" or "administrative_area_level_1"
   │           │       └─→ Extract city name
   │           │
   │           └─→ setFormData({
   │               title: fullAddress,
   │               city: extractedCity
   │           })
   │               │
   │               └─→ setSelectedPlace(details)
   │                   └─→ Show X button
   │
   ├─ (Optional) User clicks X button
   │   │
   │   └─→ clearPlaceSelection()
   │       │
   │       ├─→ Clear form fields
   │       ├─→ Clear googlePlacesRef input
   │       └─→ Hide X button
   │
   └─→ User fills remaining fields and submits
       │
       └─→ Form data sent to Supabase
```

---

## 📱 Component Tree

```
AddPlaceScreen
├── SafeAreaView
│   └── ScrollView
│       └── View (content)
│           ├── Text (description)
│           │
│           ├── Input: Place Name (NEW: GooglePlacesAutocomplete)
│           │   └── Clear Button (X) [Conditional]
│           │
│           ├── Type Selector
│           │   └── Multiple buttons (Masjid, Musalla, etc.)
│           │
│           ├── Input: City
│           │   └── Auto-filled from place selection
│           │
│           ├── Input: Capacity
│           │
│           ├── Amenities Checklist
│           │   ├── Checkbox: Wuzu
│           │   ├── Checkbox: Washroom
│           │   └── Checkbox: Women Area
│           │
│           ├── Photo Section
│           │   └── Image Picker
│           │
│           ├── Location Display
│           │   └── GPS Coordinates
│           │
│           └── Submit Button
```

---

## 🔌 API Integrations

```
┌─────────────────────────────────────────┐
│  GOOGLE PLACES AUTOCOMPLETE API         │
├─────────────────────────────────────────┤
│ Input: User typing in Place Name       │
│ Output: {                               │
│   formatted_address: string,            │
│   address_components: [                 │
│     {                                   │
│       long_name: "Mira Road East",     │
│       short_name: "MRE",               │
│       types: ["locality", ...]         │
│     },                                  │
│     ...                                 │
│   ]                                     │
│ }                                       │
└─────────────────────────────────────────┘
           │
           └─→ Parsed by handlePlaceSelect()
               │
               └─→ Data stored in state


┌─────────────────────────────────────────┐
│  SUPABASE DATABASE                      │
├─────────────────────────────────────────┤
│ Receives:                               │
│ {                                       │
│   title: "Shop 2, Crystal, Kanungo...",│
│   city: "Mira Road East",              │
│   type: "musalla",                     │
│   latitude: 19.1234,                   │
│   longitude: 72.5678,                  │
│   capacity: 50,                         │
│   amenities: {...},                    │
│   photo: "uri..."                      │
│ }                                       │
│                                         │
│ Stores in: places table                │
│ Returns: Created place object          │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────┐
│      GOOGLE PLACES API KEY           │
├──────────────────────────────────────┤
│ ✅ Stored in: .env file (not in git)│
│ ✅ Loaded by: app.config.js          │
│ ✅ Passed to: GooglePlacesAutocomplete│
│ ✅ Used for: API authentication      │
│ ✅ Restricted to: Places API only    │
│ ✅ Limited to: Specific domain/app   │
│ ✅ Monitored: Google Cloud Console   │
└──────────────────────────────────────┘
         │
         └─→ [API REQUEST]
             │
             └─→ Google Validates Key
                 │
                 ├─→ Valid ✅ → Return data
                 └─→ Invalid ❌ → Return error
```

---

## 📊 State Management

```
Component State:

formData = {
  title: string,          // From Google Places
  type: string,           // User selection
  city: string,           // Auto-filled from Google
  capacity: string,       // User input
  amenities: {
    wuzu: boolean,
    washroom: boolean,
    women_area: boolean
  }
}

selectedPlace = {
  formatted_address: string,
  address_components: Array,
  geometry: { location: { lat, lng } },
  ...other Google data
}

googlePlacesRef = useRef           // Reference to autocomplete

errors = Record<string, string>   // Validation errors

location = { latitude, longitude } // GPS coordinates

photo = string | null              // Image URI

loading = boolean                  // Form submission state
```

---

## 🎨 Styling Structure

```
Styles for Autocomplete Component:

googlePlacesContainer
├─ Wraps entire autocomplete
└─ z-index: 10

googlePlacesInput
├─ Similar to regular input
├─ Border: 2px, Color-coded
├─ Padding: 16px
└─ paddingRight: 50px (space for X button)

googlePlacesListView
├─ Dropdown menu
├─ maxHeight: 250px
├─ Rounded corners
└─ Shadow effect

googlePlacesRow
├─ Each suggestion item
├─ Padding: 12px
└─ Border bottom: 1px

clearButton
├─ Position: absolute, right: 12px, top: 16px
├─ Background: Error color (red)
├─ Size: 24x24px
├─ Border radius: 12px (rounded)
├─ z-index: 15 (above input)
└─ Text: "✕" (cross symbol)
```

---

## ⚡ Performance Considerations

```
API Calls:
- Triggered on each keystroke in Place Name
- Google Places has built-in debouncing
- ~100-200ms delay before API call
- Results cached by Google

Memory:
- selectedPlace object stored in state
- Contains Google's full response
- ~5-10KB per selection
- No memory leak issues

Rendering:
- Dropdown only renders when suggestions exist
- FlatList would be better for 1000+ items
- Current: Good for typical 5-10 suggestions
- No performance issues at current scale
```

---

## 🚀 Deployment Flow

```
Development
   │
   ├─ Add API key to .env
   └─ Test locally
       │
       ▼
Staging
   │
   ├─ Add API key to staging environment
   ├─ Test on staging app
   └─ Verify Google Cloud API limits
       │
       ▼
Production
   │
   ├─ Add API key to production environment
   ├─ Set API quota limits
   ├─ Monitor usage dashboard
   └─ Track costs
       │
       ▼
Post-Launch
   │
   ├─ Monitor error rates
   ├─ Check user feedback
   ├─ Optimize if needed
   └─ Scale if usage grows
```

---

For more details, see:

- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- [AddPlaceScreen.tsx](src/screens/AddPlaceScreen.tsx)
