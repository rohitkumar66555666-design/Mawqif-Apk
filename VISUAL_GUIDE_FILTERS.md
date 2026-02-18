# 🎨 Visual Guide - Advanced Search & Filter Feature

## 📱 UI/UX Layout

### **HomeScreen Layout**

```
┌─────────────────────────────────────┐
│  🏠 Header / Navigation              │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search city, masjid... ⚙️ │ │  ← SearchBar Component
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│                                       │
│  ┌──────────────────────────────┐   │
│  │ 📍 Place Name 1              │   │  ← PlaceCard
│  │ ⭐ 4.5 • 200m • 100+ ppl     │   │
│  └──────────────────────────────┘   │
│                                       │
│  ┌──────────────────────────────┐   │
│  │ 📍 Place Name 2              │   │  ← PlaceCard
│  │ ⭐ 4.2 • 1.5km • 50+ ppl     │   │
│  └──────────────────────────────┘   │
│                                       │
│  ... more cards ...                   │
│                                       │
└─────────────────────────────────────┘
```

### **Search Bar Close-Up**

```
┌──────────────────────────────────────┐
│ 🔍  Search city, masjid, address...  ⚙️ │
└──────────────────────────────────────┘
   │                                │
   └─ Search Icon (left)            └─ Filter Icon (right)
```

### **Filter Modal - Full Layout**

```
┌──────────────────────────────────────┐
│ 🔧 Advanced Filters          ✕        │  ← Header with close (X)
├──────────────────────────────────────┤
│                                        │
│ 📅 PLACE ADDED                         │  ← Section Header
│ ○ Hour ago                             │
│ ○ Day ago                              │  ← Options (toggles)
│ ○ Week ago                             │
│ ○ Month ago                            │
│                                        │
│ ──────────────────────────────────────  │  ← Divider
│                                        │
│ ⭐ RATING (MINIMUM)                    │  ← Section Header
│ ○ 1 star    ○ 2 stars    ○ 3 stars   │
│ ○ 4 stars   ○ 5 stars                │
│                                        │
│ ──────────────────────────────────────  │
│                                        │
│ 👩 WOMEN'S AREA                        │  ← Section Header
│ [  Toggle ON/OFF  ]                   │  ← Toggle Switch
│                                        │
│ ──────────────────────────────────────  │
│                                        │
│ 📍 SEARCH RADIUS                       │  ← Section Header
│ ○ 500m   ○ 1km   ○ 2km   ○ 3km ○ 5km │
│                                        │
│ ──────────────────────────────────────  │
│                                        │
│ 👥 CAPACITY                            │  ← Section Header
│ ○ 50+  ○ 100+ ○ 150+ ○ 200+          │
│ ○ 300+ ○ 400+                         │
│                                        │
│ ──────────────────────────────────────  │
│                                        │
│ 🏢 TYPE OF PLACE                       │  ← Section Header
│ ○ Masjid ○ Musalla ○ Home             │
│ ○ Office ○ Shop    ○ Other            │
│                                        │
├──────────────────────────────────────┤
│ [  🔄 RESET  ]  [  ✓ APPLY FILTERS  ] │  ← Action Buttons
└──────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### **Primary Colors**

```
Primary Green (Actions):       #4CAF50
Secondary Green (Borders):     #81C784
Dark Text:                     #333333
Light Text:                    #666666
Border:                        #EEEEEE
Background:                    #FFFFFF
Surface:                       #FAFAFA
```

### **Icon Legend**

```
🔍  = Search function
⚙️  = Filter/Settings
📅  = Time/Date
⭐  = Rating/Stars
👩  = Women/Amenity
📍  = Location/Radius
👥  = People/Capacity
🏢  = Building/Type
✓   = Confirm/Check
🔄  = Reset/Refresh
✕   = Close
```

---

## 🔄 Filter Application Flow (Visual)

```
USER OPENS APP
     │
     ▼
LOADS ALL PLACES (up to 50km)
     │
     ├─────────────────────────┬──────────────────────┐
     │                         │                      │
     ▼                         ▼                      ▼
TYPES IN SEARCH      CLICKS FILTER ICON    SCROLLS PLACE LIST
     │                         │                      │
     ├─ "Mumbai"              ├─ Opens Modal        └─ Views Cards
     │                         │
     │                    ┌────┴────┬─────┬─────┬────┬──────┐
     │                    │          │     │     │    │      │
     ▼                    ▼          ▼     ▼     ▼    ▼      ▼
FILTER SEARCH     Select  Select Select Set  Pick Pick
APPLIES           Type  Rating Area Radius Cap Type
     │             │     │      │    │     │   │
     └─────────────┴─────┴──────┴────┴─────┴───┴─── APPLY ──┐
                                                       │
                                                       ▼
                                          applyFiltersAndSearch()
                                                       │
                                          ┌────────────┼────────────┐
                                          │            │            │
                                    Search Text  All Filters   Radius
                                    Filtering    Applied       Check
                                          │            │            │
                                          └────────────┴────────────┘
                                                       │
                                                       ▼
                                             FILTERED RESULTS
                                                       │
                                                       ▼
                                          PLACE CARDS UPDATED
```

---

## 📊 Filter Logic Decision Tree

```
Do you want to search?
├─ Yes → Apply text search filter
│         Filter: title/city/address contains search text
│
└─ No → Skip search filter

Do you want to filter by radius?
├─ Yes → Apply radius filter
│         Filter: distance <= selected radius
│
└─ No → Use default 5km

Do you want to filter by type?
├─ Yes → Apply type filter
│         Filter: place.type === selected type
│
└─ No → Show all types

Do you want to filter by rating?
├─ Yes → Apply rating filter
│         Filter: avg_rating >= selected rating
│
└─ No → Show all ratings

Do you want to filter by women's area?
├─ Yes → Apply women's area filter
│         Filter: amenities.women_area === true
│
└─ No → Show places with/without women's area

Do you want to filter by capacity?
├─ Yes → Apply capacity filter
│         Filter: capacity >= selected capacity
│
└─ No → Show all capacities

Do you want to filter by time?
├─ Yes → Apply time filter
│         Filter: created_at >= cutoff date
│
└─ No → Show all times

┌─────────────────────────────────┐
│ COMBINE ALL SELECTED FILTERS    │
│ (AND logic - all must match)    │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ SHOW MATCHING RESULTS           │
└─────────────────────────────────┘
```

---

## 🎯 User Interaction Wireflow

### **Simple Search Path**

```
┌─────────────┐
│  User Types │ → "Mumbai"
└─────────────┘
       │
       ▼
┌────────────────────┐
│ Real-time Filter   │ → Filters places with "Mumbai"
└────────────────────┘
       │
       ▼
┌────────────────────┐
│ Show Results       │ → All Mumbai places displayed
└────────────────────┘
```

### **Complex Filter Path**

```
┌────────────────────┐
│ Open Filter Modal  │
└────────────────────┘
       │
       ├─ Select Type = Masjid
       ├─ Select Rating = 4 stars
       ├─ Toggle Women's Area = ON
       ├─ Set Radius = 2km
       │
       ▼
┌────────────────────┐
│ Click Apply        │
└────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ 7-Step Filter Process:     │
│ 1. Search text filter      │
│ 2. Radius filter           │
│ 3. Type filter (Masjid)    │
│ 4. Rating filter (4+)      │
│ 5. Women's area filter     │
│ 6. Capacity filter         │
│ 7. Time filter             │
└────────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ RESULTS:                      │
│ Masjids with:                 │
│ - 4+ rating                   │
│ - Women's area                │
│ - Within 2km                  │
└───────────────────────────────┘
```

---

## 🎨 Component Structure Diagram

```
<HomeScreen>
    │
    ├─ <Header />
    │
    ├─ <SearchBar>
    │   ├─ <TextInput />
    │   ├─ SearchIcon (🔍)
    │   └─ FilterButton (⚙️)
    │
    ├─ <FlatList>
    │   ├─ <PlaceCard>
    │   │   ├─ Title
    │   │   ├─ Rating
    │   │   ├─ Distance
    │   │   └─ Capacity
    │   ├─ <PlaceCard>
    │   └─ ...more cards
    │
    ├─ <FilterModal visible={showFilterModal}>
    │   ├─ Header (🔧 Advanced Filters ✕)
    │   ├─ <ScrollView>
    │   │   ├─ Place Added Section
    │   │   ├─ Rating Section
    │   │   ├─ Women's Area Section
    │   │   ├─ Radius Section
    │   │   ├─ Capacity Section
    │   │   └─ Type Section
    │   ├─ Reset Button
    │   └─ Apply Button
    │
    └─ <LoadingIndicator /> (if loading)
```

---

## 📱 Responsive Behavior

### **Mobile (Portrait)**

```
┌────────────────────┐
│ [Search Bar Full]  │
├────────────────────┤
│ [Place Card]       │
├────────────────────┤
│ [Place Card]       │
├────────────────────┤
│ [Place Card]       │
└────────────────────┘
```

### **Mobile (Landscape)**

```
┌──────────────────────────────────────┐
│ [Search Bar Full Width]              │
├─────────────────┬─────────────────────┤
│ [Place Card]    │ [Place Card]        │
├─────────────────┼─────────────────────┤
│ [Place Card]    │ [Place Card]        │
└─────────────────┴─────────────────────┘
```

### **Tablet**

```
┌──────────────────────────────────────────┐
│ [Search Bar Full Width]                  │
├─────────────────┬─────────────────┬──────┤
│ [Place Card]    │ [Place Card]    │ [PC] │
├─────────────────┼─────────────────┼──────┤
│ [Place Card]    │ [Place Card]    │ [PC] │
└─────────────────┴─────────────────┴──────┘
```

---

## 🎯 Filter Selection Visual States

### **Unselected Option**

```
○ Option Text    ← Empty circle, normal text color
```

### **Selected Option**

```
● Option Text    ← Filled circle, green/primary color
```

### **Hover State (Mobile)**

```
◐ Option Text    ← Partial fill, indicates touchable
```

### **Active Toggle**

```
[████████●] ON   ← Toggle switch in ON position
```

### **Inactive Toggle**

```
[●████████] OFF  ← Toggle switch in OFF position
```

---

## 📈 Information Architecture

```
HomeScreen
├── UI Layer
│   ├── SearchBar (Input)
│   ├── FilterButton (Action)
│   ├── PlaceCards (Display)
│   └── FilterModal (Modal)
│
├── Logic Layer
│   ├── State Management (useState)
│   ├── Effect Hooks (useEffect)
│   ├── Callbacks (useCallback)
│   └── Filter Algorithm
│
├── Data Layer
│   ├── Local State
│   │   ├── allPlaces
│   │   ├── places (filtered)
│   │   └── filters
│   └── Database
│       └── Supabase
│
└── Service Layer
    ├── PlacesService
    │   ├── fetchNearbyPlaces()
    │   └── getPlaceDetails()
    └── LocationService
        ├── getCurrentLocation()
        └── calculateDistance()
```

---

## 🔄 State Update Cycle

```
TIME AXIS →

Initial State
│
├─ User Input (Search/Filter)
│  │
│  ▼
├─ setState() Called
│  │
│  ▼
├─ useEffect Triggered
│  │
│  ▼
├─ applyFiltersAndSearch() Executes
│  │ ├─ Combines all filters
│  │ ├─ Applies search text
│  │ └─ Returns filtered array
│  │
│  ▼
├─ setPlaces() Updates State
│  │
│  ▼
├─ Component Re-renders
│  │ ├─ PlaceCards update
│  │ ├─ Count updates
│  │ └─ Modal closes (if apply)
│  │
│  ▼
└─ UI Reflects Changes
```

---

## 📊 Performance Visualization

```
Search Type        Speed       Size Limit
────────────────────────────────────────
Text Search        ⚡⚡⚡ <50ms    ∞
Radius Filter      ⚡⚡⚡ <50ms    ∞
Type Filter        ⚡⚡⚡ <50ms    ∞
Rating Filter      ⚡⚡⚡ <50ms    ∞
Women Area Filter  ⚡⚡⚡ <50ms    ∞
Capacity Filter    ⚡⚡⚡ <50ms    ∞
Time Filter        ⚡⚡⚡ <100ms   ∞
Combined (All)     ⚡⚡⚡ <200ms   ∞

Legend: ⚡ = Fast, ⚡⚡ = Very Fast, ⚡⚡⚡ = Instant

Recommended Data Sizes:
- Excellent: 1-100 places
- Good:      100-500 places
- OK:        500-1000 places
- Consider Optimization: 1000+ places
```

---

## 🎨 Color Reference Card

```
PRIMARY GREEN (Action Buttons)
#4CAF50 ████████████████████████████████

SECONDARY GREEN (Highlights)
#81C784 ████████████████████████████████

DARK TEXT (Titles)
#333333 ████████████████████████████████

MEDIUM TEXT (Descriptions)
#666666 ████████████████████████████████

BORDER (Dividers)
#EEEEEE ████████████████████████████████

BACKGROUND (Pages)
#FFFFFF ████████████████████████████████

SURFACE (Cards)
#FAFAFA ████████████████████████████████
```

---

## ✨ Animation Timing

```
Filter Modal Opening:     250ms (slide from bottom)
Filter Modal Closing:     200ms (fade out)
Button Press Feedback:    100ms (ripple effect)
Result Update:            300ms (fade in)
```

---

This visual guide helps understand the layout, flow, and interactions of the advanced search and filter feature!
