# 📖 Visual Reference Guide

## 🎨 User Interface Layout

### BEFORE (Old Implementation)

```
┌─────────────────────────────────────────┐
│         Add Prayer Space                │
├─────────────────────────────────────────┤
│                                         │
│ Help fellow Muslims by adding a        │
│ prayer space in your area.              │
│                                         │
│ Place Name *                            │
│ ┌─────────────────────────────────────┐│
│ │ e.g., Al-Noor Masjid, Prayer Room  ││  ← Simple text input
│ └─────────────────────────────────────┘│
│                                         │
│ Type of Place *                         │
│ ┌─────┬────────┬──────┬──────┐        │
│ │Masj │Musalla │ Home │Office│ ...   │
│ └─────┴────────┴──────┴──────┘        │
│                                         │
│ City *                                  │
│ ┌─────────────────────────────────────┐│
│ │ e.g., Mumbai, Delhi                 ││  ← Manual entry
│ └─────────────────────────────────────┘│
│                                         │
│ ... rest of form ...                   │
└─────────────────────────────────────────┘
```

### AFTER (New Implementation) ✨

```
┌─────────────────────────────────────────┐
│         Add Prayer Space                │
├─────────────────────────────────────────┤
│                                         │
│ Help fellow Muslims by adding a        │
│ prayer space in your area.              │
│                                         │
│ Place Name *                            │
│ ┌─────────────────────────────────────┐│
│ │ Type location here...           [X] ││  ← Autocomplete + clear
│ └─────────────────────────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ 🔍 Shop 2, Crystal, Kanungo...     ││  ← Suggestions dropdown
│ │ 🔍 Masjid XYZ, Mumbai, Maha...    ││
│ │ 🔍 Prayer Center, Bangalore       ││
│ └─────────────────────────────────────┘│
│                                         │
│ City *                                  │
│ ┌─────────────────────────────────────┐│
│ │ Mira Road East                      ││  ← Auto-filled! ✅
│ └─────────────────────────────────────┘│
│                                         │
│ ... rest of form ...                   │
└─────────────────────────────────────────┘
```

---

## 🔄 User Interaction Flow

### Scenario 1: Adding a Masjid in Mumbai

```
STEP 1: Open Add Prayer Space
┌─────────────────────────────────┐
│ Place Name *                    │
│ ┌───────────────────────────────┤
│ │ Type here...            │
│ └───────────────────────────────┘

STEP 2: User types "Al-Noor"
┌─────────────────────────────────┐
│ Place Name *                    │
│ ┌───────────────────────────────┤
│ │ Al-Noor                 │
│ └───────────────────────────────┘
│ ┌───────────────────────────────┐
│ │ 🔍 Al-Noor Masjid, Mumbai    │
│ │ 🔍 Al-Noor Mosque, Delhi     │
│ │ 🔍 Al-Noor Prayer Hall, Goa  │
│ └───────────────────────────────┘

STEP 3: User clicks first option
┌─────────────────────────────────┐
│ Place Name *                    │
│ ┌───────────────────────────────┤
│ │ Al-Noor Masjid,     [X] │ ← Clear button
│ │ Bandra, Mumbai           │
│ │ 400050, India            │
│ └───────────────────────────────┘

City *
┌───────────────────────────────┐
│ Mumbai                  │ ← Auto-filled!
└───────────────────────────────┘

STEP 4: User continues with rest of form and submits
✅ SUCCESS! Place saved to database
```

### Scenario 2: User Made a Mistake

```
STEP 1: User selected wrong location
┌─────────────────────────────────┐
│ Place Name *                    │
│ ┌───────────────────────────────┤
│ │ Wrong Location,     [X] │
│ │ Wrong City, India        │
│ └───────────────────────────────┘

City *
┌───────────────────────────────┐
│ Wrong City                    │
└───────────────────────────────┘

STEP 2: User clicks X button
[X] button clicked
    │
    ▼
┌─────────────────────────────────┐
│ Place Name *                    │
│ ┌───────────────────────────────┤
│ │ (empty, ready for new search)│
│ └───────────────────────────────┘

City *
┌───────────────────────────────┐
│ (empty)                       │
└───────────────────────────────┘

STEP 3: User tries again with correct location
(Same as Scenario 1)
```

---

## 🎯 Component States

### State 1: Initial (Empty)

```
Place Name *
┌─────────────────────────────────┐
│ Type location here...     │
│ (empty, no suggestions)         │
└─────────────────────────────────┘

City *
┌─────────────────────────────────┐
│ e.g., Mumbai, Delhi       │
│ (empty, waiting for selection)  │
└─────────────────────────────────┘
```

### State 2: Typing (Showing Suggestions)

```
Place Name *
┌─────────────────────────────────┐
│ Al-Noor           │
│ (user typing)                   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🔍 Al-Noor Masjid, Mumbai      │
│ 🔍 Al-Noor Mosque, Delhi       │
│ 🔍 Al-Noor Prayer Hall, Bangalore
│ (dropdown visible)              │
└─────────────────────────────────┘

City *
┌─────────────────────────────────┐
│ e.g., Mumbai, Delhi       │
│ (still empty, waiting)          │
└─────────────────────────────────┘
```

### State 3: Selected (With Clear Button)

```
Place Name *
┌─────────────────────────────────┐
│ Al-Noor Masjid,     [X] │
│ Bandra, Mumbai            │
│ 400050, India             │
└─────────────────────────────────┘
(dropdown hidden)

City *
┌─────────────────────────────────┐
│ Mumbai                │
│ (auto-filled from selection)    │
└─────────────────────────────────┘
```

### State 4: With Error

```
Place Name *
┌─────────────────────────────────┐
│ Invalid/Empty       │
│ ❌ BORDER IS RED                │
└─────────────────────────────────┘
❌ Title is required

City *
┌─────────────────────────────────┐
│                           │
│ ❌ BORDER IS RED                │
└─────────────────────────────────┘
❌ City is required
```

---

## 🎨 Color Usage

### Input Fields

```
Normal State:
┌─────────────────────────────────┐
│ (text here)               │
│ Border: #E5E7EB (light gray)   │
│ Background: #FFFFFF (white)    │
│ Text: #1A1A1A (dark gray)      │
└─────────────────────────────────┘

Focused/Active State:
┌─────────────────────────────────┐
│ (text here)               │
│ Border: #1B5E20 (green)        │
│ Background: #FFFFFF (white)    │
│ Text: #1A1A1A (dark gray)      │
└─────────────────────────────────┘

Error State:
┌─────────────────────────────────┐
│ (text here)               │
│ Border: #DC2626 (red)          │
│ Background: #FFFFFF (white)    │
│ Text: #1A1A1A (dark gray)      │
└─────────────────────────────────┘
```

### Clear Button

```
┌──────────┐
│    X     │  ← Button
│ Bg: Red  │ (#DC2626)
│ Text: Wh │ (#FFFFFF)
│ Icon: ✕  │ (cross)
└──────────┘
```

### Dropdown Suggestions

```
┌─────────────────────────────────┐
│ 🔍 First Suggestion   │
│ Border-bottom: 1px gray         │
│ Padding: 12px                  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🔍 Second Suggestion  │
│ Border-bottom: 1px gray         │
│ Padding: 12px                  │
└─────────────────────────────────┘
```

---

## 📱 Mobile vs Desktop Layout

### Mobile (Portrait)

```
Max width: Full screen width (320-480px)

Place Name input: Full width
┌─────────────────┐
│ Type location...│
│         [X]     │
└─────────────────┘

Dropdown: Full width
┌─────────────────┐
│ Suggestion 1    │
│ Suggestion 2    │
│ Suggestion 3    │
└─────────────────┘

City input: Full width
┌─────────────────┐
│ Auto-filled city│
└─────────────────┘
```

### Desktop (Wide)

```
Max width: 600-700px (centered)

Place Name input: Full container width
┌──────────────────────────────────┐
│ Type location...            [X]  │
└──────────────────────────────────┘

Dropdown: Full container width
┌──────────────────────────────────┐
│ Full Address Suggestion 1         │
│ Full Address Suggestion 2         │
│ Full Address Suggestion 3         │
└──────────────────────────────────┘

City input: Full container width
┌──────────────────────────────────┐
│ Auto-filled City                 │
└──────────────────────────────────┘
```

---

## 🔑 Key Dimensions

```
Input Field Height: 56px (16px padding + 24px text)
Input Border: 2px
Input Padding: 16px (horizontal & vertical)
Input Border Radius: 12px
Input Font Size: 16px

Clear Button:
- Width: 24px
- Height: 24px
- Border Radius: 12px (fully rounded)
- Position: Absolute, right: 12px, top: 16px
- Z-index: 15 (above input)

Dropdown:
- Max Height: 250px
- Border: 1px
- Border Radius: 8px
- Margin Top: 4px
- Row Padding: 12px
- Row Border Bottom: 1px

Spacing:
- Between fields: 20px
- Container padding: 16px
- Label to input: 8px
- Error text top: 4px
```

---

## 📊 Data Transformation Example

```
USER INPUT:
   ↓
[User types "Shop" in Place Name]
   ↓
[Dropdown shows suggestions]
   ↓
[User clicks "Shop 2, Crystal, Kanungo, Mira Road East"]
   ↓
Google Places Response:
{
  "formatted_address": "Shop 2, Crystal, Kanungo, Mira Road East, Mumbai, 401105, India",
  "address_components": [
    { "long_name": "2", "types": ["street_number"] },
    { "long_name": "Crystal", "types": ["route"] },
    { "long_name": "Kanungo", "types": ["administrative_area_level_2"] },
    { "long_name": "Mira Road East", "types": ["locality"] },  ← CITY EXTRACTED HERE
    { "long_name": "Mumbai", "types": ["administrative_area_level_1"] },
    { "long_name": "401105", "types": ["postal_code"] },
    { "long_name": "India", "types": ["country"] }
  ]
}
   ↓
LOCAL STATE UPDATE:
{
  title: "Shop 2, Crystal, Kanungo, Mira Road East, Mumbai, 401105, India",
  city: "Mira Road East"  ← AUTOMATICALLY EXTRACTED
}
   ↓
FORM NOW SHOWS:
Place Name: "Shop 2, Crystal, Kanungo, Mira Road East, Mumbai, 401105, India"
City: "Mira Road East" ✅
   ↓
USER CAN NOW SUBMIT
```

---

## ⌨️ Keyboard Navigation

```
Normal Flow:
1. Focus in Place Name field (keyboard opens)
2. Type characters
3. Dropdown appears
4. Press ↓ arrow to navigate suggestions
5. Press Enter/Return to select
6. Keyboard closes
7. City field auto-fills
8. Focus moves to next field

Mobile Flow:
1. Tap on Place Name field
2. Keyboard opens at bottom
3. Type using keyboard
4. Suggestions appear above keyboard
5. Tap a suggestion
6. Keyboard closes
7. City field shows value
```

---

## 🎬 Animation References

```
Dropdown Appearing:
- Duration: 200-300ms
- Type: Fade in
- Direction: Top ↓

Dropdown Disappearing:
- Duration: 200-300ms
- Type: Fade out
- Direction: ↑ Top

Clear Button Appearing:
- Duration: 100ms
- Type: Fade in
- Trigger: Place selection

Clear Button Disappearing:
- Duration: 100ms
- Type: Fade out
- Trigger: Clear clicked
```

---

## 🔍 Accessibility Features

```
For Screen Readers:
- Input label properly associated: <label> → <input>
- Error messages announced
- Suggestions read as list items
- Clear button announced as "Clear button"

For Keyboard Navigation:
- Tab through inputs in order
- Enter selects from dropdown
- Arrow keys navigate suggestions
- Escape closes dropdown

For Motor Disabilities:
- Large touch targets (24px clear button)
- Proper spacing between elements
- No time limits for interaction
```

---

## 📸 Example Screenshots

### Screenshot 1: Empty State

```
Place Name field empty, cursor blinking
No dropdown visible
City field empty
```

### Screenshot 2: Typing State

```
Place Name shows "Al-Noor"
Dropdown visible with 3 suggestions:
  - Al-Noor Masjid, Mumbai
  - Al-Noor Mosque, Delhi
  - Al-Noor Prayer Hall, Bangalore
City field still empty
```

### Screenshot 3: Selected State

```
Place Name shows full address with [X] button
Dropdown hidden
City shows "Mumbai"
Form ready for submission
```

### Screenshot 4: Error State

```
Place Name field with red border
City field with red border
Error messages shown below each
Submission blocked
```

---

For more information:

- See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for code
- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
