# Running the Drug Regimen Calendar App

## Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```

The backend API will be available at `http://localhost:5000`

## Frontend Setup

### Option 1: Local Development
Simply open `frontend/index.html` in your web browser.

### Option 2: GitHub Pages Deployment
1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select source: "Deploy from a branch"
4. Choose branch and `/frontend` folder
5. Your app will be available at `https://[username].github.io/amy_cal/`

**Note**: If hosting on GitHub Pages, you'll need to update the API URL in `frontend/js/app.js` to point to your deployed backend.

## Using the Application

1. Make sure the backend is running (you should see Flask output in terminal)
2. Open the frontend in your browser
3. Select a drug regimen from the dropdown
4. Choose a start date
5. Click "Generate Schedule" to see your treatment calendar
6. Click on events to see details
7. Use "Print Calendar" to save/print a PDF

## Troubleshooting

- **"Error loading regimens"**: Make sure the Flask backend is running on port 5000
- **CORS errors**: The backend includes CORS support, but you may need to update allowed origins if hosting remotely
- **Calendar not displaying**: Check browser console for JavaScript errors
- **PDF export issues**: Try using the browser's print function (Ctrl/Cmd + P) as an alternative