# 🧪 Client Portal Manual Testing Guide

## 📋 **Prerequisites**

1. **Setup Test Data**
   ```bash
   # Update Firebase config in scripts/setup-client-test-data.js
   # Then run:
   node scripts/setup-client-test-data.js
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Credentials**
   - Email: `test@client.com`
   - Password: `test123`

## 🎯 **Testing Scenarios**

### **1. Authentication Testing**

#### **1.1 Login Flow**
- [ ] **Navigate to Client Portal**
  - Go to `http://localhost:3000/client`
  - Should show login form

- [ ] **Test Valid Login**
  - Enter: `test@client.com` / `test123`
  - Should redirect to dashboard
  - Should show welcome message

- [ ] **Test Invalid Login**
  - Enter wrong credentials
  - Should show error message
  - Should not redirect

- [ ] **Test Password Visibility Toggle**
  - Click eye icon
  - Password should show/hide

#### **1.2 Session Management**
- [ ] **Test Session Persistence**
  - Login successfully
  - Refresh page
  - Should remain logged in
  - Should show dashboard

- [ ] **Test Logout**
  - Click logout button
  - Should redirect to login
  - Should clear session

### **2. Dashboard Testing**

#### **2.1 Dashboard Overview**
- [ ] **Check Welcome Section**
  - Should show "Welcome back!"
  - Should display client name
  - Should have "Contact Team" button

- [ ] **Check Stats Cards**
  - Total Projects: Should show 2
  - Completed: Should show 1
  - Total Files: Should show combined count
  - Upcoming: Should show pending milestones

#### **2.2 Recent Projects**
- [ ] **Check Project Display**
  - Should show 2 projects
  - Wedding Photography (in-progress)
  - Corporate Event (completed)

- [ ] **Check Project Cards**
  - Should show project title
  - Should show event type and location
  - Should show status badges
  - Should show progress bars
  - Should show media counts

- [ ] **Check Project Selection**
  - Click on project card
  - Should highlight selected project
  - Should update project details

#### **2.3 Quick Actions**
- [ ] **Test Quick Action Buttons**
  - Send Message button
  - Download Files button
  - Schedule Meeting button
  - Should be clickable (functionality TBD)

### **3. Project Management Testing**

#### **3.1 Project Selection**
- [ ] **Test Project Switching**
  - Click different project cards
  - Should update selected project
  - Should update project details
  - Should update files and messages

#### **3.2 Project Overview Tab**
- [ ] **Check Project Details**
  - Status: Should show correct status
  - Event Type: Should show "Wedding" or "Corporate"
  - Location: Should show location
  - Event Date: Should show formatted date

- [ ] **Check Milestones**
  - Should show milestone list
  - Should show milestone status
  - Should show milestone dates
  - Completed milestones should have green badges
  - Pending milestones should have gray badges

#### **3.3 Progress Tracking**
- [ ] **Check Progress Calculation**
  - Wedding project: 25% (1/4 milestones completed)
  - Corporate project: 100% (4/4 milestones completed)
  - Progress bars should reflect percentages

### **4. File Management Testing**

#### **4.1 Files Tab**
- [ ] **Check File Upload Interface**
  - Should show drag-and-drop area
  - Should have "Choose Files" button
  - Should be responsive

- [ ] **Check File List**
  - Should show uploaded files
  - Should show file names
  - Should show file types
  - Should show file sizes
  - Should have download/view buttons

#### **4.2 File Operations**
- [ ] **Test File Download**
  - Click download button
  - Should trigger download (or show download link)

- [ ] **Test File Preview**
  - Click view button
  - Should open file preview (TBD)

### **5. Communication Testing**

#### **5.1 Messages Tab**
- [ ] **Check Message Form**
  - Should have subject field
  - Should have message textarea
  - Should have send button
  - Should validate required fields

#### **5.2 Send Message**
- [ ] **Test Message Sending**
  - Fill subject and content
  - Click send
  - Should add message to history
  - Should clear form
  - Should show in message list

#### **5.3 Message History**
- [ ] **Check Message Display**
  - Should show message list
  - Should show sender/receiver
  - Should show message subject
  - Should show message content
  - Should show message date

### **6. Responsive Design Testing**

#### **6.1 Mobile Testing**
- [ ] **Test Mobile Layout**
  - Open in mobile browser
  - Should be responsive
  - Navigation should work
  - Forms should be usable

#### **6.2 Tablet Testing**
- [ ] **Test Tablet Layout**
  - Open in tablet browser
  - Should adapt layout
  - Should maintain functionality

#### **6.3 Desktop Testing**
- [ ] **Test Desktop Layout**
  - Open in desktop browser
  - Should use full layout
  - Sidebar should be visible

### **7. Error Handling Testing**

#### **7.1 Network Errors**
- [ ] **Test Offline Behavior**
  - Disconnect internet
  - Should show error message
  - Should handle gracefully

#### **7.2 Data Errors**
- [ ] **Test Invalid Data**
  - Modify Firebase data manually
  - Should handle missing fields
  - Should show appropriate errors

### **8. Performance Testing**

#### **8.1 Loading States**
- [ ] **Check Loading Indicators**
  - Should show spinners during loading
  - Should show progress for file uploads
  - Should show loading for data fetching

#### **8.2 Response Times**
- [ ] **Test Page Load Times**
  - Dashboard should load quickly
  - Project switching should be fast
  - File operations should be responsive

## 🐛 **Common Issues to Check**

### **Authentication Issues**
- [ ] **Login not working**
  - Check Firebase config
  - Check client data exists
  - Check console for errors

### **Data Loading Issues**
- [ ] **Projects not showing**
  - Check clientId in projects
  - Check Firebase permissions
  - Check network connection

### **UI Issues**
- [ ] **Styling problems**
  - Check Tailwind classes
  - Check component imports
  - Check responsive breakpoints

### **Functionality Issues**
- [ ] **Features not working**
  - Check Firebase service
  - Check component state
  - Check event handlers

## 📝 **Test Results Template**

```
Test Date: _______________
Tester: _________________

✅ PASSED TESTS:
- [ ] Authentication
- [ ] Dashboard
- [ ] Project Management
- [ ] File Management
- [ ] Communication
- [ ] Responsive Design
- [ ] Error Handling
- [ ] Performance

❌ FAILED TESTS:
- [ ] Issue 1: _______________
- [ ] Issue 2: _______________

🐛 BUGS FOUND:
- [ ] Bug 1: _______________
- [ ] Bug 2: _______________

📋 NOTES:
- [ ] General observations
- [ ] Performance notes
- [ ] UX suggestions
```

## 🚀 **Quick Test Commands**

```bash
# Start development server
npm run dev

# Run tests
npm test

# Check for linting issues
npm run lint

# Build for production
npm run build
```

## 📱 **Browser Testing Checklist**

- [ ] **Chrome** (Latest)
- [ ] **Firefox** (Latest)
- [ ] **Safari** (Latest)
- [ ] **Edge** (Latest)
- [ ] **Mobile Chrome**
- [ ] **Mobile Safari**

## 🔧 **Debugging Tips**

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests
   - Monitor Firebase calls

2. **Check Firebase Console**
   - Verify data exists
   - Check authentication
   - Monitor real-time updates

3. **Use React DevTools**
   - Check component state
   - Monitor props
   - Debug component tree

4. **Network Tab**
   - Check API calls
   - Monitor response times
   - Debug failed requests 