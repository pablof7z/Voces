# Follow Pack Creation Tests

## Test Scenarios

### 1. Create Follow Pack from Follow Packs Page
**Steps:**
1. Navigate to `/packs`
2. Verify "New Follow Pack" button is visible (requires logged-in user)
3. Click "New Follow Pack" button
4. Dialog should open with two tabs: "Details" and "Members"
5. Fill in Details tab:
   - Image URL (optional)
   - Title (required)
   - Description (optional)
6. Switch to Members tab
7. Add members by:
   - Selecting from follows list
   - OR entering npub/NIP-05
8. Click "Create Pack"
9. Pack should be published and dialog closes

### 2. Create Follow Pack from Profile Page
**Steps:**
1. Navigate to any user profile (not your own)
2. Locate Follow button
3. Click dropdown button next to Follow button
4. Dropdown menu should show:
   - "Create new follow pack" option
   - List of existing packs (if any)
5. Click "Create new follow pack"
6. Dialog opens with user already added to members
7. Complete pack creation as in scenario 1

### 3. Add User to Existing Pack
**Steps:**
1. Navigate to a user profile (not your own)
2. Click dropdown button next to Follow button
3. Click on an existing pack name
4. User should be added to that pack
5. Checkmark should appear next to pack name

## UI/UX Requirements
- Dialog should be stylish and elegant
- Image preview should show when URL is entered
- Members tab should show avatars and names
- Search functionality for filtering follows
- Character limits: Title (100), Description (500)
- Proper validation and error messages
- Loading states during publish
- Toast notifications for success/error
