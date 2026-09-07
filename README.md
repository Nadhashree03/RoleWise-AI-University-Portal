# RoleWise AI

## Role-Aware Feature Discovery Assistant for University Student Services

RoleWise AI is a web-based university student-services portal designed to help users discover and access features relevant to their role.

The system addresses the problem of feature discoverability in university portals. Universities provide multiple services such as admissions, fee management, attendance, certificates, and analytics. However, users may find it difficult to discover the features relevant to their role.

RoleWise AI provides role-aware dashboards, feature recommendations, controlled access, and interactive workflows for different university users.

---

## User Roles

The application supports three primary user roles:

### Student

Student users can access:

- Pay Fees
- View Attendance
- Download Certificate
- Track Admission

### Faculty

Faculty users can access:

- Mark Attendance
- View Student Attendance
- Upload Attendance

### Administrator

Administrator users can access:

- Manage Admissions
- Manage Fees
- Generate Certificates
- View Analytics

---

# Features

## Role-Based Login and Access

The application provides role-based login and access control for Student, Faculty, and Administrator users.

The current implementation includes:

- Login functionality
- Role identification
- Role-based redirection
- Protected routes
- Restricted access handling
- Unauthorized access handling
- Logout functionality

After login, users are redirected to the dashboard and features relevant to their assigned role.

---

## Role-Aware Dashboard

RoleWise AI provides different dashboards based on the active user role.

The dashboard and navigation dynamically change according to whether the user is a Student, Faculty member, or Administrator.

### Student Dashboard

Provides access to:

- Fee services
- Attendance information
- Certificates
- Admission tracking

### Faculty Dashboard

Provides access to:

- Mark attendance
- View student attendance
- Attendance-related workflows

### Administrator Dashboard

Provides access to:

- Admission management
- Fee management
- Certificate generation
- Analytics

---

## Feature Discovery Assistant

The Feature Discovery Assistant helps users discover university services relevant to their role and task.

The assistant supports:

- User query input
- Suggested queries
- Task intent detection
- Role-aware feature recommendations
- Feature matching
- Recommendation explanations
- Evidence behind recommendations
- Restricted feature handling

The recommendation system considers the active user role when suggesting features.

---

## Recommendation Engine

A dedicated recommendation engine is used to evaluate user queries and identify relevant university services.

The current recommendation logic includes:

- Task intent detection
- Role-aware feature matching
- Feature recommendations
- Recommendation explanations
- Unknown query handling
- Ambiguous query handling
- Restricted feature handling
- Insufficient evidence handling
- Temporarily unavailable service handling

The current implementation uses predefined rules and feature metadata to provide explainable recommendations.

---

# Student Features

## Pay Fees

The Pay Fees module allows Student users to view and interact with fee-related information.

The workflow includes:

- Tuition balance display
- Student account information
- Payment status
- Itemized fee breakdown
- Payment method selection
- Payment confirmation
- Payment status updates
- Receipt-related workflow

The payment process is currently implemented as a simulated application workflow.

---

## View Attendance

The View Attendance module allows Student users to access attendance-related information.

The interface displays:

- Course information
- Attendance percentages
- Subject-related attendance information
- Attendance status

---

## Download Certificate

The certificate workflow allows Student users to access certificate-related services.

The interface includes:

- Certificate information
- Certificate availability
- Certificate access workflow

---

## Track Admission

The admission tracking workflow allows Student users to monitor admission-related information.

The interface includes:

- Application status
- Admission progress
- Verification milestones
- Admission workflow information

---

# Faculty Features

## Mark Attendance

The Mark Attendance module provides an interactive attendance workflow.

Faculty users can:

- Select a course
- Select an attendance date
- Select a session or class time
- View a student roster
- Mark students as Present
- Mark students as Absent
- View attendance summary
- Confirm attendance before submission

---

## View Student Attendance

Faculty users can access student attendance information.

The module supports attendance monitoring and displays:

- Student attendance information
- Attendance percentages
- Attendance status
- Attendance-related concerns

---

## Upload Attendance

The application includes an attendance upload workflow interface for Faculty users.

The workflow is intended to support attendance-related file upload and processing.

---

# Administrator Features

## Manage Admissions

The Manage Admissions module provides an interface for managing admission-related information.

The workflow includes:

- Applicant information
- Programme information
- Application status
- Admission review workflow
- Administrative actions

---

## Manage Fees

The Manage Fees module provides an interface for managing student fee information.

The workflow includes:

- Student fee records
- Paid and pending fee information
- Fee status
- Search functionality
- Filtering functionality
- Administrative fee management

---

## Generate Certificates

The certificate generation module provides an administrative workflow for certificate-related operations.

The workflow includes:

- Student certificate information
- Certificate generation workflow
- Certificate status
- Administrative confirmation

---

## View Analytics

The Analytics module provides administrative information related to university services and application activity.

The interface is designed to support monitoring of:

- Feature usage
- Portal activity
- University service metrics
- Recommendation-related metrics

---

# Confirmation and Controlled Actions

RoleWise AI includes confirmation dialogs for selected state-changing actions.

Users can review an action before confirming it.

This is used in workflows involving actions such as:

- Attendance submission
- Fee-related actions
- Administrative actions

---

# Restricted Access and Override Handling

The application handles situations where users attempt to access features outside their assigned role.

The system can provide restricted access responses and supports a demonstration-level override workflow.

The override workflow can include:

- Override reason
- Additional notes
- Temporary override state
- Activity recording

---

# Audit Trail

The application includes an Audit Trail module for tracking application activity.

The audit structure can record information such as:

- Event ID
- Timestamp
- User or actor
- User role
- Action
- Target feature
- Event status
- Restricted access attempts
- Override-related activity

---

# Change History and Rollback

The project includes a change tracking structure for monitoring selected changes.

Change information can include:

- Change ID
- Timestamp
- Actor
- Target feature
- Action type
- Previous state
- New state
- Override information
- Rollback status

The project also includes a demonstration-level rollback concept.

---

# Application State

The application manages role and workflow state using frontend application state.

Browser storage is used for selected prototype data and application state, allowing certain information to remain available during continued use of the application.

---

# Reusable Components

The application is organized using reusable components.

The project includes components for:

- Application layout
- Sidebar navigation
- Top navigation
- Role badges
- Confirmation dialogs
- Toast notifications
- Reusable cards
- Feature action modals

---

# Project Structure

```text
src/
├── assets/
│
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.jsx
│   │   ├── GlassCard.jsx
│   │   ├── RoleBadge.jsx
│   │   └── ToastNotification.jsx
│   │
│   ├── features/
│   │   └── FeatureActionModal.jsx
│   │
│   └── layout/
│       ├── AppLayout.jsx
│       ├── Sidebar.jsx
│       └── TopNavbar.jsx
│
├── context/
│   └── RoleContext.jsx
│
├── data/
│   └── mockData.js
│
├── engine/
│   └── recommendationEngine.js
│
├── pages/
│   ├── AnalyticsPage.jsx
│   ├── AuditTrailPage.jsx
│   ├── DashboardPage.jsx
│   ├── DiscoveryAssistantPage.jsx
│   ├── FeaturesPage.jsx
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── SettingsPage.jsx
│   └── UnauthorizedPage.jsx
│
├── App.jsx
├── App.css
├── index.css
└── main.jsx