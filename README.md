# Pseudoglot - Language Learning Chrome Extension

A Chrome extension that helps you learn new languages by translating words on web pages in real-time. The extension works with a Python Flask backend that provides intelligent word translation based on your learning level.

## 🌟 Features

- **Real-time Translation**: Translates words on any webpage based on user's learning level
- **Learning Level Support**: Beginner, Intermediate, and Advanced vocabulary
- **Multiple Languages**: Support for French, Spanish, and German
- **Interactive Tooltips**: Hover over translated words for meanings and pronunciations
- **Progress Tracking**: Monitor your learning progress and statistics
- **Customizable Settings**: Choose your target language and learning level

## 🏗️ Architecture

### How It Works

1. User enables the extension and configures language settings
2. Extension scans webpage content for translatable words
3. Text is sent to Flask backend via POST /translate
4. Backend filters words based on learning level and returns translations
5. Content script replaces words with translated versions
6. Users can hover over translated words for detailed information

### Components

Pseudoglot consists of two main components:

#### Backend (Python Flask)
- **Flask API Server**: Handles translation requests and data management
- **Word Filtering**: Intelligent filtering based on learning levels
- **CORS Support**: Configured for cross-origin requests from Chrome extension
- **Mock Data**: Sample translations for demonstration

#### Chrome Extension
- **Content Script**: Scans and modifies webpage content
- **Popup Interface**: User settings and statistics display
- **Background Script**: Handles extension lifecycle
- **Storage API**: Saves user preferences and progress

## 📁 Project Structure

```
pseudoglot/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── README.md          # Backend documentation
│   └── test_backend.py    # API testing script
├── extension/
│   ├── manifest.json      # Extension configuration
│   ├── popup.html         # Extension popup interface
│   ├── popup.js           # Popup functionality
│   ├── content.js         # Content script for webpage modification
│   ├── background.js      # Background script
│   └── styles.css         # Extension styling
├── frontend/              # React/Next.js frontend application
├── setup.sh              # Automated setup script
├── manual_setup.sh       # Manual setup instructions
├── INSTALLATION.md       # Detailed installation guide
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Google Chrome browser
- Git (optional)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd pseudoglot
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

3. **Load the Chrome extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

4. **Start using the extension**:
   - Click the extension icon in your toolbar
   - Configure your target language and learning level
   - Enable translation and start browsing!

## 🔧 API Documentation

### Backend Endpoints

#### POST /translate
Translates text based on learning level and target language.

**Request Body**:
```json
{
  "text": "Hello world, this is a beautiful morning.",
  "level": "beginner",
  "targetLanguage": "fr"
}
```

**Response**:
```json
{
  "translations": [
    {
      "original": "hello",
      "translated": "bonjour",
      "meaning": "hello",
      "pronunciation": "bohn-ZHOOR"
    },
    {
      "original": "world",
      "translated": "monde",
      "meaning": "world",
      "pronunciation": "mohnd"
    }
  ],
  "total_words_found": 8,
  "translations_provided": 2
}
```

#### GET /health
Health check endpoint for connection testing.

### Content Script Features

- **Text Extraction**: Safely extracts text from web pages using TreeWalker
- **Word Replacement**: Replaces words with translations using DOM manipulation
- **Tooltip System**: Creates interactive tooltips for translated words
- **DOM Observation**: Handles dynamically loaded content with MutationObserver
- **Error Handling**: Graceful error handling and fallbacks

### Extension Communication

- **Storage API**: Saves user settings and statistics
- **Message Passing**: Communication between popup and content script
- **Background Script**: Handles extension lifecycle and tab updates

## 🎨 User Experience

### Visual Design
- **Modern UI**: Clean, gradient-based popup interface
- **Responsive Design**: Works on different screen sizes
- **Accessibility**: Supports dark mode and high contrast
- **Smooth Animations**: Fade-in effects for translated words

### Interaction Flow
1. User clicks extension icon
2. Configures language and learning level
3. Enables translation
4. Navigates to any webpage
5. Words are automatically translated
6. Hover over translated words for details

## 🔧 Setup Instructions

### Quick Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd pseudoglot
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```
   
   This will:
   - Check for Python and pip installation
   - Create virtual environment
   - Install backend dependencies
   - Start the backend server

### Manual Setup

#### Backend Setup
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server**:
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5001`

#### Chrome Extension Setup
1. **Open Chrome** and navigate to `chrome://extensions/`
2. **Enable "Developer mode"** (toggle in top right)
3. **Click "Load unpacked"** and select the `extension` directory
4. **Verify installation** - the extension should appear in your toolbar

## 🧪 Testing

### Backend Testing
```bash
# Run the test script
python test_backend.py
```

### Extension Testing
1. Load the extension in Chrome
2. Navigate to a news website or blog
3. Enable translation in the popup
4. Verify words are translated
5. Hover over translated words to see tooltips

## 🌍 Supported Languages

- **French (fr)**: Beginner, Intermediate, Advanced levels
- **Spanish (es)**: Beginner, Intermediate, Advanced levels  
- **German (de)**: Beginner, Intermediate, Advanced levels

### Learning Levels

- **Beginner**: Basic vocabulary (hello, world, good, etc.)
- **Intermediate**: More complex words (beautiful, important, difficult, etc.)
- **Advanced**: Sophisticated vocabulary (sophisticated, revolutionary, philosophical, etc.)

## 🔮 Future Enhancements

### Potential Improvements
1. **Real Translation API**: Integrate with Google Translate, DeepL, or similar
2. **More Languages**: Add support for additional languages
3. **Learning Analytics**: Track progress and provide insights
4. **Spaced Repetition**: Implement learning algorithms
5. **Audio Pronunciation**: Add audio playback for pronunciations
6. **Vocabulary Lists**: Save and review learned words
7. **Gamification**: Add points, badges, and challenges

### Technical Enhancements
1. **Database Integration**: Store user progress and preferences
2. **User Authentication**: Multi-user support
3. **Cloud Deployment**: Deploy backend to cloud services
4. **Mobile Support**: Create mobile app version
5. **Offline Mode**: Cache translations for offline use

## 🐛 Known Limitations

1. **Mock Data**: Currently uses mock translation data
2. **Icon Files**: Placeholder icons need to be replaced with actual PNG files
3. **Limited Languages**: Only supports French, Spanish, and German
4. **Local Backend**: Requires local Python server (not cloud-hosted)
5. **Chrome Only**: Extension only works in Chrome/Chromium browsers

## 📝 Development Notes

### Code Quality
- **Modular Design**: Clean separation of concerns
- **Error Handling**: Comprehensive error handling throughout
- **Documentation**: Well-documented code with comments
- **Standards**: Follows Chrome extension Manifest V3 standards

### Security Considerations
- **Local Backend**: Runs on localhost for development
- **CORS Configuration**: Properly configured for extension communication
- **No External Data**: No data sent to external servers (except backend)
- **Permission Minimal**: Only requests necessary permissions

## 🎉 Conclusion

Pseudoglot is a fully functional language learning Chrome extension with a robust Python backend. It provides an innovative way to learn languages by translating words in real-time while browsing the web. The project demonstrates modern web development practices, Chrome extension development, and API design.

The extension is ready for use and can be easily extended with real translation APIs, additional languages, and enhanced learning features.

## 📄 License

This project is for educational purposes. Please respect the terms of use for any translation APIs you integrate.