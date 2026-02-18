# 🧪 Step-by-Step Testing Guide - Advanced Search & Filter Feature

## ✅ Pre-Testing Checklist

- [ ] All 3 files are created/updated:
  - [ ] `src/components/FilterModal.tsx` exists
  - [ ] `src/components/SearchBar.tsx` exists
  - [ ] `src/screens/HomeScreen.tsx` is updated
- [ ] App is running: `npm start` in terminal
- [ ] No red error screens
- [ ] Device/emulator is connected

---

## 🏃 Quick Test (2-3 minutes)

### **Step 1: Search Bar Test**

```
1. Open the app
2. Look at the home screen
   ✓ Do you see a search bar with "Search city, masjid, address..." text?
   ✓ Is there a green filter icon (⚙️) on the right?

3. Type something in search bar: "Mumbai"
   ✓ Do the results update instantly?
   ✓ Do only Mumbai places show?

4. Clear the search
   ✓ Do all places reappear?
```

### **Step 2: Filter Icon Test**

```
1. Click the green filter icon (⚙️) on the right
   ✓ Does a modal/bottom sheet open?
   ✓ Do you see 6 different filter sections?

2. Look at all 6 sections:
   ✓ Place Added (with hour/day/week/month)
   ✓ Rating (with 1-5 stars)
   ✓ Women's Area (with toggle)
   ✓ Radius (with 500m-5km options)
   ✓ Capacity (with 50-400 options)
   ✓ Type of Place (with Masjid, Musalla, etc)
```

### **Step 3: Filter Application Test**

```
1. Click on "Masjid" in the Type section
   ✓ Does the option highlight/select?

2. Click "Apply Filters" button at bottom
   ✓ Does the modal close?
   ✓ Do results show only masjids?

3. Click filter icon again
   ✓ Is "Masjid" still selected?
   ✓ Are other options still unselected?
```

### **Step 4: Reset Test**

```
1. In filter modal, click "Reset"
   ✓ Do all selections clear?
   ✓ Does it say "No active filters"?

2. Click "Apply Filters"
   ✓ Do all places reappear?
```

---

## 🔍 Detailed Test Cases (10-15 minutes)

### **Test Case 1: Search Functionality**

```
Purpose: Verify search bar filters correctly

Test Steps:
1. Type "Mumbai" in search bar
   Expected: Shows only places with Mumbai in name/city/address
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

2. Type "Masjid" in search bar
   Expected: Shows places with Masjid in name
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

3. Clear search (select all, delete)
   Expected: Shows all places again
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

4. Type partial text: "Mum"
   Expected: Shows places with "Mum" in name/city
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]
```

### **Test Case 2: Individual Filters**

```
Purpose: Verify each filter works independently

A. Rating Filter:
1. Select "4 stars" in Rating section
2. Click "Apply Filters"
   Expected: Shows only places with 4+ star rating
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

B. Women's Area Filter:
1. Toggle on "Women's Area"
2. Click "Apply Filters"
   Expected: Shows only places with women's area
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

C. Type Filter:
1. Select "Musalla" in Type section
2. Click "Apply Filters"
   Expected: Shows only musallas
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

D. Capacity Filter:
1. Select "100+" in Capacity
2. Click "Apply Filters"
   Expected: Shows only places with 100+ capacity
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

E. Radius Filter:
1. Select "2 km" in Radius
2. Click "Apply Filters"
   Expected: Shows only places within 2km
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

F. Time Filter:
1. Select "Week ago" in Place Added
2. Click "Apply Filters"
   Expected: Shows only places added in last week
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]
```

### **Test Case 3: Combined Filters**

```
Purpose: Verify multiple filters work together

Test Scenario: Find all masjids within 2km with 100+ capacity
1. Click filter icon
2. Set Type = "Masjid"
3. Set Radius = "2 km"
4. Set Capacity = "100+"
5. Click "Apply Filters"
   Expected: Shows only masjids within 2km with 100+ capacity
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

Test Scenario: Find recent women-friendly places with 4+ rating
1. Click filter icon
2. Set Place Added = "Week ago"
3. Set Women's Area = ON
4. Set Rating = "4 stars"
5. Click "Apply Filters"
   Expected: Shows recent places with women's area and 4+ rating
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]
```

### **Test Case 4: Search + Filter Combination**

```
Purpose: Verify search and filters work together

Test Scenario: Search "Mumbai" + filter by "Masjid"
1. Type "Mumbai" in search bar
2. Click filter icon
3. Select Type = "Masjid"
4. Click "Apply Filters"
   Expected: Shows masjids with Mumbai in name/city
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]
```

### **Test Case 5: Reset Functionality**

```
Purpose: Verify reset clears all filters

Test Steps:
1. Select multiple filters (Type, Radius, Rating)
2. Click "Apply Filters"
3. Click filter icon again
4. Click "Reset" button
   Expected: All selections clear, modal shows empty state
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]

5. Click "Apply Filters"
   Expected: All places show again
   Actual: ____________________
   ✓ Pass [ ] Fail [ ]
```

### **Test Case 6: UI/UX Tests**

```
Purpose: Verify UI elements are properly styled and responsive

A. Search Bar:
   [ ] Search bar visible at top
   [ ] Green filter icon on right
   [ ] Magnifying glass icon appears
   [ ] Text input is responsive
   [ ] Placeholder text shows

B. Filter Modal:
   [ ] Modal slides up from bottom
   [ ] Can scroll if needed
   [ ] All 6 sections visible
   [ ] Apply and Reset buttons at bottom
   [ ] Modal can be closed by tapping outside

C. Color Scheme:
   [ ] Green used for primary actions
   [ ] Stars are visible in Rating section
   [ ] Icons are clear and visible
   [ ] Text is readable

D. Responsiveness:
   [ ] Works on phone size screens
   [ ] Works on tablet size screens
   [ ] Touch targets are large enough (>44px)
   [ ] No text overflow issues
```

---

## 🐛 Troubleshooting

### **Issue: Search bar not appearing**

```
Solution:
1. Check that SearchBar.tsx exists in src/components/
2. Check HomeScreen.tsx imports SearchBar
3. Reload app: Press R in terminal
4. If still not showing, check console for errors
```

### **Issue: Filter icon not working**

```
Solution:
1. Check that FilterModal.tsx exists in src/components/
2. Verify onFilterPress function exists in HomeScreen
3. Check that modal state variables are initialized
4. Check console for errors
```

### **Issue: Filters not applying**

```
Solution:
1. Check applyFiltersAndSearch() function exists in HomeScreen
2. Verify useEffect hook is watching filters and searchText
3. Make sure all places have the required fields (created_at, avg_rating, etc)
4. Check console for error messages
```

### **Issue: Search typing slowly**

```
Solution:
1. This is normal for React Native - slight delay is expected
2. If very slow, check if many places (100+) are loaded
3. Try reducing number of places or implement pagination
```

---

## ✅ Success Criteria

All tests pass when:

- ✅ Search bar filters by city/name/address instantly
- ✅ Filter icon opens modal with all 6 filter categories
- ✅ Each filter can be selected/toggled
- ✅ Apply button applies filters correctly
- ✅ Reset button clears all filters
- ✅ Search and filters work together
- ✅ UI is responsive and user-friendly
- ✅ No console errors

---

## 📝 Test Results Summary

```
Total Test Cases: ___ / ___
Passed: ___ / ___
Failed: ___ / ___

Critical Issues:
1. ____________________
2. ____________________

Minor Issues:
1. ____________________
2. ____________________

Overall Status: [ ] PASS [ ] FAIL
Date Tested: _______________
Tester Name: _______________
```

---

## 🎯 What to Do Next

**If all tests pass:**

1. ✅ Your feature is ready!
2. ✅ Proceed to Google Places autocomplete testing
3. ✅ Test on actual device (not just emulator)
4. ✅ Gather user feedback

**If some tests fail:**

1. 📋 Document which tests failed
2. 📋 Check the troubleshooting section
3. 📋 Review error messages in console
4. 📋 Reach out for support with error details

---

## 📱 Device/Emulator Testing

```
Device Details:
- Device Type: [ ] iPhone [ ] Android [ ] Tablet
- Screen Size: _______________
- OS Version: _______________
- App Version: _______________

Testing Environment:
- Emulator/Device: _______________
- Network: [ ] WiFi [ ] Mobile [ ] Offline
- Number of Places: _______________
```

---

That's it! You're ready to test! 🚀
