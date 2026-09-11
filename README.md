# Modern SGPA & CGPA Calculator Web Application

A full-stack, production-quality **SGPA & CGPA Calculator** application engineered to accurately calculate semester performance (SGPA), overall cumulative performance (CGPA), target grade estimations, and visual analytics for **Diploma** and **General** university students.

Based on mathematical logic extracted from university grading systems and reference spreadsheet logic (`calculator (1).xlsx`).

---

## 🌟 Key Features

1. **Diploma & General Student Stream Support**:
   - **Diploma Students**: Supports lateral entry (Semesters 3 through 8) and standard 5-semester diploma course structures.
   - **General Students**: Supports standard 4-year degree programs (Semesters 1 through 8).

2. **Centralized Grade Configuration**:
   - **Standard Scale**: `O` (10), `A` (9), `B` (8), `C` (7), `D` (6), `P` (5), `F` (2), `SA` (0), `M` (0)
   - **General Scale**: `O` (10), `E` (9), `A` (8), `B` (7), `C` (6), `D` (5), `F` (2), `S` (0), `M` (0)

3. **Dynamic Subject & Semester Management**:
   - Add, Edit, Delete, Duplicate subjects dynamically.
   - Live real-time SGPA banner updates with credit-point multiplication.
   - Reset individual semesters or add custom semesters.

4. **Credit-Weighted CGPA Calculation**:
   - Strictly enforces weighted average formula:
     $$\text{CGPA} = \frac{\sum (\text{SGPA}_i \times \text{Credits}_i)}{\sum \text{Credits}_i} = \frac{\sum \text{Total Points}}{\sum \text{Total Credits}}$$
   - Prevents inaccurate simple averaging when semester credits differ.

5. **Target CGPA Estimator**:
   - Calculates the exact SGPA required in upcoming semesters to achieve a target CGPA:
     $$\text{Required SGPA} = \frac{\text{Target CGPA} \times (\text{Completed Credits} + \text{Upcoming Credits}) - \text{Current CGPA} \times \text{Completed Credits}}{\text{Upcoming Credits}}$$
   - Provides feasibility badges: **Achieved**, **Achievable**, **Challenging**, or **Impossible**.

6. **Interactive Visual Dashboard**:
   - SGPA performance trend line chart.
   - Credit distribution bar chart.
   - Grade breakdown pie chart.
   - Minimum / Maximum SGPA and completed credit summaries.

7. **Excel Import & Export**:
   - Parse uploaded `.xlsx` marksheets using SheetJS (`xlsx`).
   - Export current calculation reports to formatted `.xlsx` files.

8. **Firebase Authentication & Firestore Data Persistence**:
   - Google Sign-In integration.
   - Owner-only Firestore security rules ensuring user data privacy.

9. **Modern UX & Aesthetics**:
   - Responsive design (Mobile card view / horizontal scrolling tables).
   - Light & Dark mode support with local persistence.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS, Recharts, Lucide Icons, SheetJS (`xlsx`), Vitest.
- **Backend**: Node.js, Express.js REST API, CORS, Dotenv.
- **Database & Auth**: Firebase Authentication (Google Sign-In), Cloud Firestore.

---

## 📐 Mathematical Formulas

### 1. Semester SGPA
$$\text{SGPA} = \frac{\sum (\text{Subject Credits} \times \text{Grade Point})}{\sum \text{Subject Credits}}$$

### 2. Overall CGPA
$$\text{CGPA} = \frac{\sum (\text{SGPA}_i \times \text{Semester Credits}_i)}{\sum \text{Semester Credits}_i}$$

### 3. Target SGPA
$$\text{Required SGPA} = \frac{\text{Target CGPA} \times (C_{\text{completed}} + C_{\text{upcoming}}) - \text{Current CGPA} \times C_{\text{completed}}}{C_{\text{upcoming}}}$$

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

### 2. Setup Backend Server
```bash
cd backend
npm install
npm run dev
```
The backend server will start at `http://localhost:5000`.

### 3. Run Unit Tests
```bash
cd frontend
npx vitest run
```

---

## 🔐 Environment Variables Configuration

Copy `.env.example` to `.env` in the root directory:

```env
# Firebase Client Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Express Backend Config
PORT=5000
NODE_ENV=development
```

---

## 📦 Deployment Instructions

### Deploy Frontend to Firebase Hosting / Vercel
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy `frontend/dist` directory to Firebase Hosting, Vercel, or Netlify.

### Deploy Firestore Security Rules
Deploy `firebase/firestore.rules` using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 📄 License
MIT License. Created for academic performance tracking.
