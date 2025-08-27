// ===============================================
// SAS POSITION INTEREST FORM SYSTEM
// Google Apps Script Code for Form Management
// ===============================================

// CONFIGURATION - UPDATE THESE VALUES TO MATCH YOUR MAIN SYSTEM
const FORM_SHEET_ID = 'YOUR_SHEET_ID'; // Same as main sheet or separate sheet for form data
const FORM_SHEET_NAME = 'Faculty Roles'; // Sheet name for faculty role data
const FORM_TITLE = "Expression of Interest: 2026-27 Internal Transfer (Faculty Roles)";
const FORM_DESCRIPTION = "Express your interest in the following faculty role opportunities. Your information will be pre-filled from your Google account.";
const FORM_HR_EMAIL = 'hrdept@sas.edu.sg'; // Replace with actual HR email

// ===============================================
// FORM CREATION AND MANAGEMENT
// ===============================================

function createOrUpdateInterestForm() {
  let form;
  let formId;
  
  // Check if form already exists (store form ID in Script Properties)
  const properties = PropertiesService.getScriptProperties();
  const existingFormId = properties.getProperty('INTEREST_FORM_ID');
  
  if (existingFormId) {
    try {
      form = FormApp.openById(existingFormId);
      console.log('Using existing form:', existingFormId);
    } catch (error) {
      console.log('Existing form not found, creating new one');
      form = FormApp.create(FORM_TITLE);
      formId = form.getId();
      properties.setProperty('INTEREST_FORM_ID', formId);
    }
  } else {
    form = FormApp.create(FORM_TITLE);
    formId = form.getId();
    properties.setProperty('INTEREST_FORM_ID', formId);
  }
  
  // Clear existing items
  const items = form.getItems();
  items.forEach(item => form.deleteItem(item));
  
  // Set form settings
  form.setTitle(FORM_TITLE)
      .setDescription(FORM_DESCRIPTION)
      .setCollectEmail(true)
      .setLimitOneResponsePerUser(false)
      .setRequireLogin(true)
      .setShowLinkToRespondAgain(false);
  
  // Get current job openings
  const jobs = getFormJobOpenings();
  
  if (jobs.length === 0) {
    form.addParagraphTextItem()
        .setTitle('No Faculty Roles Available')
        .setHelpText('There are currently no faculty role positions available for interest expression.');
    return {
      publishedUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
      formId: form.getId()
    };
  }
  
  // 1. Faculty Role Selection (Required)
  const jobChoices = jobs.map(job => `${job.division} - ${job.roleTitle}`);
  form.addListItem()
      .setTitle('Faculty Role of Interest')
      .setHelpText('Select the faculty role you would like to express interest in:')
      .setChoiceValues(jobChoices)
      .setRequired(true);
  
  // 2. Personal Information Section
  form.addSectionHeaderItem()
      .setTitle('Contact Information')
      .setHelpText('This information will help HR contact you about the position.');
  
  // Full Name (Required)
  form.addTextItem()
      .setTitle('Full Name')
      .setRequired(true);
  
  // Current Department/Division (Required)
  form.addTextItem()
      .setTitle('Current Department/Division')
      .setHelpText('e.g., Elementary School, Middle School, High School, Technology, etc.')
      .setRequired(true);
  
  // Current Position Title (Required)
  form.addTextItem()
      .setTitle('Current Position Title')
      .setRequired(true);
  
  // Phone Number (Optional)
  form.addTextItem()
      .setTitle('Phone Number')
      .setHelpText('Mobile or office number where you can be reached')
      .setRequired(false);
  
  // 3. Additional Information Section
  form.addSectionHeaderItem()
      .setTitle('Additional Information');
  
  // Why interested (Required)
  form.addParagraphTextItem()
      .setTitle('Why are you interested in this faculty role?')
      .setHelpText('Please share what interests you about this role and how it aligns with your career goals.')
      .setRequired(true);
  
  // Relevant Experience (Optional)
  form.addParagraphTextItem()
      .setTitle('Relevant Experience or Qualifications')
      .setHelpText('Please highlight any relevant experience, skills, or qualifications that make you a good fit for this faculty role.')
      .setRequired(false);
  
  // Availability (Required)
  form.addMultipleChoiceItem()
      .setTitle('When would you be available to start?')
      .setChoiceValues([
        'Immediately',
        'Within 2 weeks',
        'Within 1 month',
        'Within 2 months',
        'At the end of current semester',
        'At the end of current school year',
        'Other (please specify in comments)'
      ])
      .setRequired(true);
  
  // Additional Comments (Optional)
  form.addParagraphTextItem()
      .setTitle('Additional Comments')
      .setHelpText('Any additional information you would like to share')
      .setRequired(false);
  
  // Set up response collection
  setupFormResponseCollection(form);
  
  console.log('Form created/updated successfully');
  console.log('Form URL:', form.getPublishedUrl());
  console.log('Form Edit URL:', form.getEditUrl());
  
  return {
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    formId: form.getId()
  };
}

function setupFormResponseCollection(form) {
  try {
    // Create or get response spreadsheet
    let responseSpreadsheet;
    const properties = PropertiesService.getScriptProperties();
    const responseSheetId = properties.getProperty('RESPONSE_SHEET_ID');
    
    if (responseSheetId) {
      try {
        responseSpreadsheet = SpreadsheetApp.openById(responseSheetId);
      } catch (error) {
        responseSpreadsheet = SpreadsheetApp.create(FORM_TITLE + ' - Responses');
        properties.setProperty('RESPONSE_SHEET_ID', responseSpreadsheet.getId());
      }
    } else {
      responseSpreadsheet = SpreadsheetApp.create(FORM_TITLE + ' - Responses');
      properties.setProperty('RESPONSE_SHEET_ID', responseSpreadsheet.getId());
    }
    
    // Set the form to save responses to this spreadsheet
    form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSpreadsheet.getId());
    
    console.log('Form responses will be saved to:', responseSpreadsheet.getUrl());
    
  } catch (error) {
    console.error('Error setting up form response collection:', error);
  }
}

// ===============================================
// JOB DATA FUNCTIONS (For Form)
// ===============================================

function getFormJobOpenings() {
  try {
    const sheet = SpreadsheetApp.openById(FORM_SHEET_ID).getSheetByName(FORM_SHEET_NAME);
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
      descriptionLink: row[3] || '',
      interestForm: row[4] || '',
      status: row[5] || ''
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching faculty role listings for form:', error);
    return [];
  }
}

// ===============================================
// FORM URL FUNCTIONS
// ===============================================

function getInterestFormUrl() {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('INTEREST_FORM_ID');
  
  if (!formId) {
    // Create form if it doesn't exist
    const formInfo = createOrUpdateInterestForm();
    return formInfo.publishedUrl;
  }
  
  try {
    const form = FormApp.openById(formId);
    return form.getPublishedUrl();
  } catch (error) {
    // Form doesn't exist, create new one
    const formInfo = createOrUpdateInterestForm();
    return formInfo.publishedUrl;
  }
}

function getPrefilledInterestFormUrl() {
  try {
    const currentUser = Session.getActiveUser();
    return getPrefilledFormUrl(currentUser.getEmail());
  } catch (error) {
    console.error('Error getting pre-filled form URL:', error);
    return getInterestFormUrl(); // Fallback to regular form
  }
}

function updateFormJobListings() {
  return createOrUpdateInterestForm();
}

// ===============================================
// USER PROFILE FUNCTIONS (For Form Pre-filling)
// ===============================================

function getUserInfo(email) {
  try {
    // Try to get the current user's profile information from Google Workspace
    const user = Session.getActiveUser();
    const userEmail = user.getEmail();
    
    // For the current user, we can get more detailed information
    if (email === userEmail || !email) {
      return getCurrentUserWorkspaceInfo();
    } else {
      // For other users, extract basic info from email
      const namePart = email.split('@')[0];
      const name = namePart.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
      
      return {
        name: name,
        email: email,
        jobTitle: '',
        department: '',
        phone: ''
      };
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

function getCurrentUserWorkspaceInfo() {
  try {
    const user = Session.getActiveUser();
    const email = user.getEmail();
    
    // Extract name from email as fallback
    const namePart = email.split('@')[0];
    const defaultName = namePart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    
    // Start with basic information
    let userProfile = {
      name: defaultName,
      email: email,
      jobTitle: '',
      department: '',
      phone: ''
    };
    
    // Method 1: Try manual profile mapping first (most reliable)
    const manualProfile = getManualUserProfile(email);
    if (manualProfile) {
      userProfile = { ...userProfile, ...manualProfile };
      console.log('Using manual profile for:', email);
      return userProfile;
    }
    
    // Method 2: Try Google Workspace APIs
    try {
      // Try ContactsApp (if available)
      try {
        const contacts = ContactsApp.getContactsByEmailAddress(email);
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          
          const fullName = contact.getFullName();
          if (fullName) {
            userProfile.name = fullName;
          }
          
          const companies = contact.getCompanies();
          if (companies && companies.length > 0) {
            const company = companies[0];
            if (company.getJobTitle()) {
              userProfile.jobTitle = company.getJobTitle();
            }
            if (company.getDepartment()) {
              userProfile.department = company.getDepartment();
            }
          }
          
          const phones = contact.getPhones();
          if (phones && phones.length > 0) {
            userProfile.phone = phones[0].getPhoneNumber();
          }
        }
      } catch (contactError) {
        console.log('ContactsApp not available:', contactError.message);
      }
      
      // Try People API if ContactsApp didn't provide job info
      if (!userProfile.jobTitle) {
        try {
          const people = People.People.get('people/me', {
            personFields: 'names,emailAddresses,phoneNumbers,organizations'
          });
          
          if (people.names && people.names.length > 0) {
            userProfile.name = people.names[0].displayName || defaultName;
          }
          
          if (people.organizations && people.organizations.length > 0) {
            const org = people.organizations[0];
            userProfile.jobTitle = org.title || '';
            userProfile.department = org.department || '';
          }
          
          if (people.phoneNumbers && people.phoneNumbers.length > 0) {
            userProfile.phone = people.phoneNumbers[0].value || '';
          }
          
        } catch (peopleError) {
          console.log('People API not available:', peopleError.message);
        }
      }
      
    } catch (apiError) {
      console.log('Organization APIs not available:', apiError.message);
    }
    
    // Method 3: Try to infer from email patterns if still no department
    if (!userProfile.department) {
      const inferredInfo = inferUserInfoFromEmail(email);
      userProfile.department = inferredInfo.department;
    }
    
    console.log('Retrieved user profile:', userProfile);
    return userProfile;
    
  } catch (error) {
    console.error('Error getting current user workspace info:', error);
    
    // Return basic info as fallback
    const user = Session.getActiveUser();
    const email = user.getEmail();
    const namePart = email.split('@')[0];
    const defaultName = namePart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    
    return {
      name: defaultName,
      email: email,
      jobTitle: '',
      department: '',
      phone: ''
    };
  }
}

// Manual user profile mapping (if APIs don't work)
function getManualUserProfile(email) {
  // Method 1: Check hardcoded profiles first (most reliable)
  const manualProfiles = {
    'bfawcett@sas.edu.sg': {
      name: 'Ben Fawcett',
      jobTitle: 'Associate Technology and Innovation Coordinator',
      department: 'Technology',
      phone: '+65 63606659'
    }
    // Add more profiles as needed:
    // 'otheremail@sas.edu.sg': {
    //   name: 'Full Name',
    //   jobTitle: 'Position Title',
    //   department: 'Department Name',
    //   phone: '+65 xxxxxxxx'
    // }
  };
  
  // Check hardcoded profiles first
  if (manualProfiles[email]) {
    return manualProfiles[email];
  }
  
  // Method 2: Try to load from Staff Directory sheet
  try {
    const sheetProfiles = loadUserProfilesFromSheet();
    if (sheetProfiles[email]) {
      return sheetProfiles[email];
    }
  } catch (error) {
    console.log('Could not load sheet profiles:', error.message);
  }
  
  return null;
}

// Load user profiles from a Google Sheet (optional)
function loadUserProfilesFromSheet() {
  try {
    // Optional: Create a "Staff Directory" sheet in your Google Sheet
    // Columns: Email, Full Name, Job Title, Department, Phone
    const sheet = SpreadsheetApp.openById(FORM_SHEET_ID);
    let profileSheet;
    
    try {
      profileSheet = sheet.getSheetByName('Staff Directory');
    } catch (error) {
      console.log('Staff Directory sheet not found - using manual profiles only');
      return {};
    }
    
    if (!profileSheet) {
      return {};
    }
    
    const data = profileSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {};
    }
    
    const profiles = {};
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const email = row[0];
      if (email) {
        profiles[email] = {
          name: row[1] || '',
          jobTitle: row[2] || '',
          department: row[3] || '',
          phone: row[4] || ''
        };
      }
    }
    
    console.log('Loaded', Object.keys(profiles).length, 'profiles from Staff Directory sheet');
    return profiles;
    
  } catch (error) {
    console.error('Error loading profiles from sheet:', error);
    return {};
  }
}

// Helper function to infer user info from email patterns
function inferUserInfoFromEmail(email) {
  const localPart = email.split('@')[0].toLowerCase();
  
  // Common department patterns in email addresses
  const departmentPatterns = {
    'tech': 'Technology',
    'it': 'Technology', 
    'hr': 'Human Resources',
    'admin': 'Administration',
    'finance': 'Finance',
    'elementary': 'Elementary School',
    'middle': 'Middle School',
    'high': 'High School',
    'es': 'Elementary School',
    'ms': 'Middle School',
    'hs': 'High School'
  };
  
  let department = '';
  for (const [pattern, dept] of Object.entries(departmentPatterns)) {
    if (localPart.includes(pattern)) {
      department = dept;
      break;
    }
  }
  
  return {
    jobTitle: '', // Can't reliably infer job title from email
    department: department
  };
}

// ===============================================
// PRE-FILLED FORM FUNCTIONS
// ===============================================

function getPrefilledFormUrlForJob(jobTitle, division) {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('INTEREST_FORM_ID');
  
  if (!formId) {
    return getInterestFormUrl();
  }
  
  try {
    const form = FormApp.openById(formId);
    const userInfo = getCurrentUserWorkspaceInfo();
    
    if (!userInfo) {
      return form.getPublishedUrl();
    }
    
    // Create a response to get pre-filled URL
    const formResponse = form.createResponse();
    const items = form.getItems();
    
    items.forEach(item => {
      const title = item.getTitle().toLowerCase();
      
      try {
        if (title.includes('position of interest') && item.getType() === FormApp.ItemType.LIST) {
          const listItem = item.asListItem();
          const jobOption = `${division} - ${jobTitle}`;
          // Set the job selection
          formResponse.withItemResponse(listItem.createResponse(jobOption));
        }
        else if (title.includes('full name') && item.getType() === FormApp.ItemType.TEXT && userInfo.name) {
          const textItem = item.asTextItem();
          formResponse.withItemResponse(textItem.createResponse(userInfo.name));
        }
        else if (title.includes('current position title') && item.getType() === FormApp.ItemType.TEXT && userInfo.jobTitle) {
          const textItem = item.asTextItem();
          formResponse.withItemResponse(textItem.createResponse(userInfo.jobTitle));
        }
        else if (title.includes('current department') && item.getType() === FormApp.ItemType.TEXT && userInfo.department) {
          const textItem = item.asTextItem();
          formResponse.withItemResponse(textItem.createResponse(userInfo.department));
        }
        else if (title.includes('phone number') && item.getType() === FormApp.ItemType.TEXT && userInfo.phone) {
          const textItem = item.asTextItem();
          formResponse.withItemResponse(textItem.createResponse(userInfo.phone));
        }
      } catch (itemError) {
        console.log('Could not pre-fill item:', title, itemError.message);
      }
    });
    
    const prefilledUrl = formResponse.toPrefilledUrl();
    console.log('Generated pre-filled URL for job:', jobTitle, 'User:', userInfo.name);
    return prefilledUrl;
    
  } catch (error) {
    console.error('Error creating job-specific pre-filled URL:', error);
    return getInterestFormUrl();
  }
}

function getJobsWithPrefilledUrls() {
  try {
    const jobs = getFormJobOpenings();
    
    if (jobs.length === 0) {
      return [];
    }
    
    const jobsWithUrls = jobs.map(job => ({
      ...job,
      prefilledFormUrl: getPrefilledFormUrlForJob(job.jobTitle, job.division)
    }));
    
    return jobsWithUrls;
    
  } catch (error) {
    console.error('Error getting jobs with pre-filled URLs:', error);
    return [];
  }
}

// ===============================================
// NOTIFICATION FUNCTIONS
// ===============================================

function sendRecentResponseNotifications() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const responseSheetId = properties.getProperty('RESPONSE_SHEET_ID');
    
    if (!responseSheetId) {
      console.log('No response spreadsheet found');
      return;
    }
    
    const responseSheet = SpreadsheetApp.openById(responseSheetId);
    const sheets = responseSheet.getSheets();
    const formSheet = sheets[0]; // First sheet contains form responses
    
    const data = formSheet.getDataRange().getValues();
    if (data.length <= 1) {
      console.log('No responses found');
      return;
    }
    
    const headers = data[0];
    const lastRow = data[data.length - 1]; // Get the most recent response
    
    // Create submission data object
    const submissionData = {};
    headers.forEach((header, index) => {
      submissionData[header] = lastRow[index] || '';
    });
    
    // Send notification for the most recent response
    sendNotificationToHR(submissionData);
    console.log('Notification sent for most recent response');
    
  } catch (error) {
    console.error('Error sending recent response notifications:', error);
  }
}

function sendNotificationToHR(data) {
  try {
    // Find the position and applicant info from the data
    const position = data['Position of Interest'] || 'Unknown Position';
    const applicantName = data['Full Name'] || 'Unknown';
    const applicantEmail = data['Email Address'] || data['Email'] || 'Not provided';
    const currentRole = data['Current Position Title'] || 'Not provided';
    const currentDept = data['Current Department/Division'] || 'Not provided';
    const phone = data['Phone Number'] || 'Not provided';
    const whyInterested = data['Why are you interested in this position?'] || 'Not provided';
    const availability = data['When would you be available to start?'] || 'Not provided';
    const timestamp = data['Timestamp'] || new Date().toLocaleString();
    
    const subject = `New Faculty Role Interest Application: ${position}`;
    const body = `
Hello HR Team,

A new internal faculty role interest application has been submitted through the SAS Faculty Role Expression of Interest system.

=== APPLICATION DETAILS ===
Faculty Role Applied For: ${position}
Submitted: ${timestamp}

=== APPLICANT INFORMATION ===
Name: ${applicantName}
Email: ${applicantEmail}
Phone: ${phone}
Current Position: ${currentRole}
Current Department: ${currentDept}

=== APPLICATION RESPONSES ===
Why Interested:
${whyInterested}

Availability: ${availability}

=== NEXT STEPS ===
Please review the complete application details in the form responses spreadsheet and follow up with the applicant as appropriate.

This notification was automatically generated by the SAS Faculty Role Expression of Interest system.

Best regards,
Technology & Innovation Team
    `;
    
    // Send to HR email
    MailApp.sendEmail({
      to: FORM_HR_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log('Notification email sent to HR for:', applicantName);
    
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

// ===============================================
// FORM MANAGEMENT FUNCTIONS
// ===============================================

function getFormManagementInfo() {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('INTEREST_FORM_ID');
  const responseSheetId = properties.getProperty('RESPONSE_SHEET_ID');
  
  if (!formId) {
    return { error: 'No form created yet. Run createOrUpdateInterestForm() first.' };
  }
  
  try {
    const form = FormApp.openById(formId);
    const info = {
      formId: formId,
      title: form.getTitle(),
      publishedUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
      responseCount: form.getResponses().length
    };
    
    // Add response spreadsheet info if it exists
    if (responseSheetId) {
      try {
        const responseSheet = SpreadsheetApp.openById(responseSheetId);
        info.responseSpreadsheet = {
          id: responseSheetId,
          name: responseSheet.getName(),
          url: responseSheet.getUrl()
        };
      } catch (error) {
        info.responseSpreadsheet = { error: 'Response spreadsheet not accessible' };
      }
    }
    
    return info;
  } catch (error) {
    return { error: 'Form not found: ' + error.toString() };
  }
}

// ===============================================
// FORM TESTING FUNCTIONS
// ===============================================

function testFormSystem() {
  console.log('=== SAS JOB FORM SYSTEM TEST ===');
  
  try {
    // Test 1: Check job data
    const jobs = getFormJobOpenings();
    console.log('✓ Form job data retrieved:', jobs.length, 'jobs found');
    
    // Test 2: Check form creation
    const formInfo = createOrUpdateInterestForm();
    console.log('✓ Interest form created/updated:', formInfo.publishedUrl);
    
    // Test 3: Check user info
    const userInfo = getCurrentUserWorkspaceInfo();
    console.log('✓ User workspace info:', userInfo);
    
    // Test 4: Check jobs with pre-filled forms
    const jobsWithForms = getJobsWithPrefilledUrls();
    console.log('✓ Jobs with pre-filled forms:', jobsWithForms.length, 'jobs processed');
    
    // Test 5: Check management info
    const managementInfo = getFormManagementInfo();
    console.log('✓ Management info:', managementInfo);
    
    console.log('=== FORM TEST COMPLETED SUCCESSFULLY ===');
    return {
      success: true,
      jobCount: jobs.length,
      jobsWithFormsCount: jobsWithForms.length,
      formInfo: formInfo,
      userInfo: userInfo
    };
    
  } catch (error) {
    console.error('✗ Form test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function initialFormSetup() {
  console.log('=== INITIAL FORM SETUP ===');
  
  // Step 1: Create the interest form
  console.log('Creating interest form...');
  const formInfo = createOrUpdateInterestForm();
  console.log('✓ Form created:', formInfo.publishedUrl);
  
  // Step 2: Test the system
  console.log('Testing form system...');
  const testResult = testFormSystem();
  
  if (testResult.success) {
    console.log('✓ Form setup completed successfully!');
    console.log('Form URL:', formInfo.publishedUrl);
  } else {
    console.log('✗ Form setup encountered issues:', testResult.error);
  }
  
  return testResult;
}

// ===============================================
// HELPER FUNCTION FOR ADMIN
// ===============================================

function addManualUserProfile(email, name, jobTitle, department, phone) {
  // This is a helper function for admins to easily add profiles
  // In practice, you would edit the getManualUserProfile function above
  console.log('To add this profile, edit the getManualUserProfile function:');
  console.log(`'${email}': {`);
  console.log(`  name: '${name}',`);
  console.log(`  jobTitle: '${jobTitle}',`);
  console.log(`  department: '${department}',`);
  console.log(`  phone: '${phone}'`);
  console.log('},');
}

// ===============================================
// IMPORTANT SETUP NOTES FOR FORM SYSTEM:
// 
// 1. UPDATE CONFIGURATION at the top of this file (REQUIRED):
//    - FORM_SHEET_ID: Your Google Sheet ID (same as dashboard or separate)
//    - FORM_SHEET_NAME: Your sheet tab name (e.g., "Job Openings")
//    - FORM_HR_EMAIL: Actual HR email address for notifications
//    
// 2. FORM FEATURES:
//    - Creates Google Forms with job selection dropdown
//    - Pre-fills user information when possible
//    - Sends email notifications to HR for new submissions
//    - Stores responses in dedicated Google Spreadsheet
//    
// 3. USER PROFILE PRE-FILLING (Multiple Methods):
//    - Manual profiles: Edit getManualUserProfile() function
//    - Staff Directory sheet: Create "Staff Directory" sheet with user data
//    - Google Workspace APIs: Enable People API for automatic detection
//    - Email pattern inference: Basic department detection from email
//
// 4. RECOMMENDED SETUP STEPS:
//    - Step 1: Update FORM_SHEET_ID and FORM_SHEET_NAME
//    - Step 2: Add key user profiles to getManualUserProfile()
//    - Step 3: Run initialFormSetup() to create form and test
//    - Step 4: Run testFormSystem() to verify everything works
//    - Step 5: Deploy form as separate web app or use URLs in dashboard
//    - Step 6: Set up form response triggers for auto-notifications
//
// 5. TESTING FUNCTIONS:
//    - initialFormSetup(): First time setup - creates form and tests
//    - testFormSystem(): Comprehensive test of all form components
//    - createOrUpdateInterestForm(): Manually create/update form
//    - sendRecentResponseNotifications(): Test email notifications
//
// 6. INTEGRATION WITH DASHBOARD:
//    - Use getInterestFormUrl() to get the form URL for dashboard
//    - Use getJobsWithPrefilledUrls() to get job-specific pre-filled URLs
//    - Form system works independently of dashboard system
//
// 7. STAFF DIRECTORY SHEET FORMAT (Optional but recommended):
//    Create a sheet named "Staff Directory" with these columns:
//    A: Email (e.g., bfawcett@sas.edu.sg)
//    B: Full Name (e.g., Ben Fawcett)
//    C: Job Title (e.g., Associate Technology and Innovation Coordinator)
//    D: Department (e.g., Technology)
//    E: Phone (e.g., +65 63606659)
//
// 8. FORM RESPONSE TRIGGERS (Optional):
//    - Go to form spreadsheet > Extensions > Apps Script
//    - Add trigger for form submissions to auto-send HR notifications
//    - Use sendRecentResponseNotifications() as the trigger function
//
// ===============================================