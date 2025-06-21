# SpurHacked Installation Guide

This guide will help you set up the SpurHacked language learning Chrome extension with its Python backend.

## Prerequisites

- **Python 3.7+** installed on your system
- **pip** (Python package manager)
- **Google Chrome** browser
- **Git** (optional, for cloning the repository)

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

1. **Clone or download the project**:
   ```bash
   git clone <repository-url>
   cd spurHacked
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```
   
   This script will:
   - Check for Python and pip installation
   - Install backend dependencies
   - Start the backend server

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**:
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

#### Chrome Extension Setup

1. **Open Chrome** and navigate to `chrome://extensions/`

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `extension` folder from the project directory

4. **Verify installation**:
   - The SpurHacked extension should appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

## Configuration

### Backend Configuration

The backend server runs on `http://localhost:5000` by default. You can modify the port in `backend/app.py` if needed.

### Extension Configuration

1. **Click the extension icon** in your Chrome toolbar
2. **Configure your settings**:
   - **Target Language**: Choose French, Spanish, or German
   - **Learning Level**: Select Beginner, Intermediate, or Advanced
   - **Enable Translation**: Toggle the switch to start translating

3. **Test the connection**:
   - Click "Test Connection" to verify the backend is running
   - You should see "✅ Backend connection successful!"

## Usage

### Basic Usage

1. **Enable translation** in the extension popup
2. **Navigate to any webpage** (news articles, blogs, etc.)
3. **Wait for the page to load** - the extension will automatically process the text
4. **Hover over translated words** to see meaning and pronunciation

### Features

- **Real-time Translation**: Words are translated based on your learning level
- **Interactive Tooltips**: Hover over translated words for detailed information
- **Non-intrusive**: Original page layout and styling are preserved
- **Dynamic Content**: Handles dynamically loaded content
- **Statistics**: Track how many words you've learned

### Supported Languages

- **French (fr)**: Beginner, Intermediate, Advanced levels
- **Spanish (es)**: Beginner, Intermediate, Advanced levels
- **German (de)**: Beginner, Intermediate, Advanced levels

## Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to backend"
- **Solution**: Make sure the Python server is running on `http://localhost:5000`
- **Check**: Run `curl http://localhost:5000/health` in terminal

**Problem**: "Module not found" errors
- **Solution**: Install dependencies with `pip install -r requirements.txt`

**Problem**: Port already in use
- **Solution**: Change the port in `backend/app.py` or kill the process using the port

### Extension Issues

**Problem**: Extension not loading
- **Solution**: 
  - Check that Developer mode is enabled
  - Reload the extension from `chrome://extensions/`
  - Check the console for errors

**Problem**: No translations appearing
- **Solution**:
  - Verify the backend is running
  - Check that translation is enabled in the popup
  - Try refreshing the page
  - Check browser console for errors

**Problem**: Tooltips not showing
- **Solution**:
  - Make sure you're hovering over blue underlined words
  - Check if any browser extensions are blocking tooltips
  - Try disabling other extensions temporarily

### Common Error Messages

- **"CORS error"**: Backend server is not running or CORS is not configured
- **"Network error"**: Check your internet connection and backend server status
- **"Permission denied"**: Make sure the extension has necessary permissions

## Development

### Adding New Languages

1. **Add language data** to `backend/app.py` in the `TRANSLATION_DATA` dictionary
2. **Update the popup** to include the new language option
3. **Test the integration**

### Adding New Features

1. **Backend**: Add new endpoints in `backend/app.py`
2. **Extension**: Update content script and popup as needed
3. **Testing**: Test on various websites to ensure compatibility

## Security Notes

- The backend runs on `localhost` only for development
- In production, implement proper authentication and HTTPS
- The extension only accesses web pages you visit
- No data is stored or transmitted to external servers (except your backend)

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify the backend server is running
3. Test with different websites
4. Check the troubleshooting section above

## License

This project is for educational purposes. Please respect the terms of use for any translation APIs you integrate. 