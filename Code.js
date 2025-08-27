// ===============================================
// SAS POSITION INTEREST SYSTEM - DASHBOARD ONLY
// Complete Google Apps Script Code
// ===============================================

// CONFIGURATION - UPDATE THESE VALUES
const SHEET_ID = '1CgQHyd_lKH19eKyo8B6QxO1N2nQrOm7_Y809PYtkdv0'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Faculty Roles'; // Sheet tab name for faculty role openings
// EXTERNAL_FORM_URL no longer needed - using URLs from sheet Column E
const HR_EMAIL = 'hrdept@sas.edu.sg'; // Replace with actual HR email

// ===============================================
// WEB APP FUNCTIONS
// ===============================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Expression of Interest: 2026-27 Internal Transfer (Faculty Roles)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ===============================================
// JOB DATA FUNCTIONS
// ===============================================

function getJobOpenings() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and filter for available positions
    const jobs = data.slice(1).filter(row => {
      // Check if Status (Column F) contains "Available" (case insensitive) or is not "Closed"
      const status = row[5] ? row[5].toString().toLowerCase() : '';
      return status.includes('available') || status.includes('open') || (!status.includes('closed') && !status.includes('filled') && status !== '');
    }).map(row => ({
      division: row[0] || '',
      roleTitle: row[1] || '',
      summaryRole: row[2] || '',
      descriptionLink: row[3] || '', // Column D - Job Description Link
      interestForm: row[4] || '',     // Column E - Interest Form URL
      status: row[5] || ''
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching faculty role listings:', error);
    return [];
  }
}

function getDivisions() {
  try {
    const jobs = getJobOpenings();
    const divisions = [...new Set(jobs.map(job => job.division).filter(div => div))];
    return divisions.sort();
  } catch (error) {
    console.error('Error fetching divisions:', error);
    return [];
  }
}

// ===============================================
// DASHBOARD FUNCTIONS (Modified for External Form)
// ===============================================

function getJobOpeningsWithExternalForm() {
  try {
    const jobs = getJobOpenings();
    
    if (jobs.length === 0) {
      return [];
    }
    
    // Use the interest form link directly from the sheet (Column E)
    const jobsWithForms = jobs.map(job => ({
      ...job,
      interestFormUrl: job.interestForm // Use the URL from Column E of the sheet
    }));
    
    console.log('Generated', jobsWithForms.length, 'faculty roles with sheet form URLs');
    return jobsWithForms;
    
  } catch (error) {
    console.error('Error getting faculty roles with sheet form URLs:', error);
    return [];
  }
}

// ===============================================
// ADMIN/MANAGEMENT FUNCTIONS
// ===============================================

function refreshJobData() {
  // Force refresh of faculty role data
  try {
    const jobs = getJobOpenings();
    console.log('Current faculty role count:', jobs.length);
    
    return {
      roleCount: jobs.length,
      usingSheetUrls: true
    };
  } catch (error) {
    console.error('Error refreshing faculty role data:', error);
    return { error: error.toString() };
  }
}

function testSystem() {
  console.log('=== SAS FACULTY ROLES DASHBOARD TEST ===');
  
  try {
    // Test 1: Check faculty role data
    const jobs = getJobOpenings();
    console.log('✓ Faculty role data retrieved:', jobs.length, 'roles found');
    
    // Test 2: Check divisions
    const divisions = getDivisions();
    console.log('✓ Divisions retrieved:', divisions);
    
    // Test 3: Check roles with sheet form URLs
    const jobsWithForms = getJobOpeningsWithExternalForm();
    console.log('✓ Faculty roles with sheet form URLs:', jobsWithForms.length, 'roles processed');
    
    // Test 4: Check that roles have interest form URLs from sheet
    const rolesWithUrls = jobsWithForms.filter(job => job.interestFormUrl && job.interestFormUrl.trim() !== '');
    console.log('✓ Roles with valid interest form URLs:', rolesWithUrls.length);
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    return {
      success: true,
      roleCount: jobs.length,
      rolesWithFormsCount: jobsWithForms.length,
      rolesWithValidUrls: rolesWithUrls.length,
      divisions: divisions,
      usingSheetUrls: true
    };
    
  } catch (error) {
    console.error('✗ Test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ===============================================
// SETUP FUNCTIONS (RUN THESE MANUALLY)
// ===============================================

function initialSetup() {
  console.log('=== INITIAL SETUP ===');
  
  // Test the system
  console.log('Testing system...');
  const testResult = testSystem();
  
  if (testResult.success) {
    console.log('✓ Setup completed successfully!');
    console.log('Dashboard is ready to deploy');
    console.log('Using interest form URLs from sheet Column E');
  } else {
    console.log('✗ Setup encountered issues:', testResult.error);
  }
  
  return testResult;
}

// ===============================================
// DISABLED FORM FUNCTIONS (Moved to separate file)
// ===============================================

/*
// FORM FUNCTIONS HAVE BEEN MOVED TO form.gs
// These functions are now disabled in this dashboard-only version:
// - createOrUpdateInterestForm()
// - setupFormResponseCollection()
// - getInterestFormUrl()
// - getPrefilledInterestFormUrl()
// - updateFormJobListings()
// - sendRecentResponseNotifications()
// - sendNotificationToHR()
// - getUserInfo()
// - getCurrentUserWorkspaceInfo()
// - getManualUserProfile()
// - loadUserProfilesFromSheet()
// - getPrefilledFormUrlForJob()
// - getJobsWithPrefilledUrls()
// - getFormManagementInfo()
// - All user profile related functions
*/

// ===============================================
// IMPORTANT SETUP NOTES:
// 
// 1. UPDATE CONFIGURATION at the top of this file (REQUIRED):
//    - SHEET_ID: Your Google Sheet ID (from the URL between /d/ and /edit)
//    - SHEET_NAME: "Faculty Roles" (the tab name in your sheet)
//    - HR_EMAIL: Actual HR email address
//    
//    INTEREST FORM URLS are now pulled directly from Column E of your sheet
//    WITHOUT CORRECT SHEET_ID AND SHEET_NAME, FACULTY ROLE DATA WON'T LOAD!
//
// 2. DASHBOARD FUNCTIONALITY:
//    - Displays faculty role listings from Google Sheet
//    - Filters by division (Elementary, Middle, High School)
//    - Links to interest forms using URLs from Column E of sheet
//    - Whole School tab is hidden but code preserved for future use
//
// 3. FORM FUNCTIONALITY:
//    - All form creation and management functions are DISABLED
//    - Dashboard uses interest form URLs directly from Column E in your sheet
//    - No Google Form creation or management in this version
//
// 4. RECOMMENDED SETUP STEPS:
//    - Step 1: Update SHEET_ID and SHEET_NAME
//    - Step 2: Ensure Column E in your sheet contains interest form URLs
//    - Step 3: Run initialSetup() to test the system
//    - Step 4: Run testSystem() to verify everything works
//    - Step 5: Deploy as web app (Execute as: Me, Access: Anyone within organization)
//    - Step 6: Embed the web app URL in your portal
//
// 5. TESTING FUNCTIONS:
//    - initialSetup(): First time setup and system test
//    - testSystem(): Comprehensive test of dashboard components
//    - refreshJobData(): Refresh faculty role data from sheet
//
// 6. TO RE-ENABLE WHOLE SCHOOL TAB:
//    - In index.html, remove 'style="display: none;"' from wholeTab button
//    - No other changes needed - filtering logic is already present
//
// 7. TO RE-ENABLE FORM FUNCTIONS:
//    - Use the separate form.gs file for Google Form creation and management
//    - Update getJobOpeningsWithExternalForm() to use form functions
//    - Update index.html to use generated form URLs instead of sheet URLs
//
// ===============================================