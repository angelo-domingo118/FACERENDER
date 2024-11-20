# FACERENDER

**FACERENDER** is a centralized web-based facial composite system designed to enhance the accuracy, efficiency, and reliability of facial composite creation for law enforcement agencies. Leveraging advanced AI and machine learning technologies, FACERENDER streamlines access to a comprehensive database of facial features, enables real-time data sharing, and automates feature adjustments to produce detailed and accurate facial composites in minutes.

## Features

### Core Features

1. **Integrated Database of Facial Features**
   - **Centralized Facial Components Database:** Access a comprehensive collection of facial features, including eyes, noses, mouths, skin tones, and more, all within a unified interface.
   - **Composite Database Extension:** Store finalized composite images along with essential details such as offense, demographics, examiner information, and case identifiers.

2. **Automated Facial Feature Alignment and Adjustment**
   - **Automatic Layering and Proportion Matching:** Utilize AI-powered algorithms to automatically layer and align facial features based on default human facial proportions.
   - **Intelligent Blending and Color Matching:** Achieve natural-looking composites with AI-driven tools that harmonize skin tones, shadows, and colors across different facial elements.

3. **Customizable Facial Feature Selection**
   - **Facial Feature Templates:** Start with pre-configured templates tailored to various demographics, including age, ethnicity, and gender, and customize them to fit witness descriptions.
   - **Dynamic Search and Filter Options:** Quickly locate specific facial features using descriptive tags like "round eyes" or "broad nose."

4. **Enhanced Data Security and Access Control**
   - **Secure Login and Permission-Based Access:** Ensure that only authorized users can access and modify data, with granular permissions for viewing, editing, or distributing files.
   - **Automated Backup and Data Integrity:** Maintain data security with automatic backups and routine integrity checks, including off-site storage to prevent data loss.

### Additional Features

1. **Customizable Wanted Bulletin Creation Tool**
   - **Built-in Bulletin Template Library:** Create wanted bulletins using customizable templates that incorporate facial composites and case-specific details.
   - **Drag-and-Drop Functionality:** Easily design bulletins by dragging and dropping elements into pre-set sections.
   - **Automatic Export:** Export bulletins in print-ready (PDF or PNG) or digital formats for seamless sharing with law enforcement agencies.

2. **Automated Facial Composite Workflow and Documentation**
   - **Step-by-Step Workflow Documentation:** Automatically log each step of the composite creation process for easy review and accountability.
   - **Automated Report Generation:** Generate final reports with essential details, including composite artist information, witness input, and case identifiers.

3. **Real-Time Composite Comparison**
   - **Composite Comparison Overlay:** Compare new composites with previous versions or similar records to ensure visual quality control and consistency.

4. **Search Functionality**
   - **Enhanced Search for Composite Retrieval:** Retrieve previously created composites based on descriptors like name, offense, or demographic details for quick access and reference.

## Technologies Used

- **Frontend:**
  - **React:** A JavaScript library for building user interfaces.
  - **Shadcn UI + Tailwind CSS:** For styling and UI components.
  - **Vite:** A fast frontend build tool.
  
- **Backend:**
  - **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
  - **TypeScript:** Superset of JavaScript adding static types.
  - **Cloudinary:** For image management and storage.
  
- **Other Technologies:**
  - **TensorFlow.js:** For AI-powered feature alignment and adjustments.
  - **ESLint:** For maintaining code quality.
  - **Prettier:** For consistent code formatting.

## Installation

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**
- **Cloudinary Account** (for image management)

### Clone the Repository

```bash
git clone https://github.com/yourusername/facerender.git
cd facerender
```

### Setup Backend

1. **Navigate to the Backend Directory:**

   ```bash
   cd backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `backend` directory and add the following:

   ```env
   PORT=5000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the Backend Server:**

   ```bash
   npm run start:dev
   ```

   The backend server will start on `http://localhost:5000`.

### Setup Frontend

1. **Navigate to the Frontend Directory:**

   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `frontend` directory and add the following:

   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_API_SECRET=your_api_secret
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Run the Frontend Development Server:**

   ```bash
   npm run dev
   ```

   The frontend application will be available at `http://localhost:3000`.

## Running the Application

1. **Backend:**

   Ensure you're in the `backend` directory and run:

   ```bash
   npm run start:dev
   ```

2. **Frontend:**

   In a separate terminal, navigate to the `frontend` directory and run:

   ```bash
   npm run dev
   ```

3. **Access the Application:**

   Open your browser and navigate to `http://localhost:3000` to use FACERENDER.

## Deployment

### Backend Deployment

1. **Build the Backend:**

   ```bash
   npm run build
   ```

2. **Start the Production Server:**

   ```bash
   npm run start:prod
   ```

3. **Choose a Hosting Platform:**

   Deploy the built backend using platforms like **Heroku**, **AWS**, or **DigitalOcean**.

### Frontend Deployment

1. **Build the Frontend:**

   ```bash
   npm run build
   ```

2. **Preview the Build:**

   ```bash
   npm run preview
   ```

3. **Choose a Hosting Platform:**

   Deploy the frontend using platforms like **Vercel**, **Netlify**, or **AWS Amplify**.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch:**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes:**

   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to the Branch:**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## License

[MIT](https://github.com/yourusername/facerender/blob/main/LICENSE)

## Contact

For any inquiries or support, please contact us at [support@facerender.com](mailto:support@facerender.com).

---

© 2024 FACERENDER. All rights reserved.
