# SpurHacked - Language Learning Chrome Extension

A Chrome extension that helps users learn new languages by translating words on web pages in real-time. The extension works with a Python Flask backend that provides intelligent word translation based on the user's learning level.

## 🌟 Features

- **Real-time Translation**: Translates words on any webpage based on user's learning level
- **Interactive Learning**: Hover tooltips show meaning and pronunciation
- **Customizable Settings**: Choose target language and learning level
- **Non-intrusive**: Preserves original page layout and styling
- **Smart Word Filtering**: Focuses on meaningful vocabulary, filters out common words
- **Dynamic Content Support**: Handles dynamically loaded content
- **Learning Statistics**: Track how many words you've learned

## 🏗️ How It Works

### Architecture Overview

SpurHacked consists of two main components:

1. **Chrome Extension** (Frontend)
   - Extracts text from web pages
   - Sends text to backend for translation
   - Replaces words with translations
   - Shows interactive tooltips

2. **Python Flask Backend** (API)
   - Processes text and extracts meaningful words
   - Provides translations based on learning level
   - Returns structured translation data

### Technical Flow

```
1. User enables translation in extension popup
2. Content script extracts text from webpage
3. Text is sent to Flask backend via POST /translate
4. Backend filters words and returns translations
5. Content script replaces words with translated versions
6. Hover events show tooltips with details
```

### Detailed Process

#### 1. Text Extraction
- Content script walks through all text nodes in the document
- Filters out script, style, and already processed elements
- Extracts clean text content for processing

#### 2. Backend Processing
- Receives text, learning level, and target language
- Uses regex to extract individual words
- Filters out common English words (the, a, and, etc.)
- Matches words against translation database
- Returns structured translation data

#### 3. Word Replacement
- Creates DOM elements for translated words
- Preserves original capitalization
- Adds hover event listeners for tooltips
- Maintains page layout and styling

#### 4. Interactive Tooltips
- Shows on hover over translated words
- Displays: original word → translation
- Includes meaning and pronunciation
- Positioned dynamically based on word location

## 📁 Project Structure

```
spurHacked/
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application with translation logic
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── extension/              # Chrome extension
│   ├── manifest.json      # Extension manifest (Manifest V3)
│   ├── content.js         # Content script for webpage interaction
│   ├── popup.html         # Extension popup interface
│   ├── popup.js           # Popup functionality and settings
│   ├── background.js      # Background service worker
│   ├── styles.css         # Extension styles with responsive design
│   └── icon*.png          # Extension icons (placeholders)
├── venv/                  # Python virtual environment
├── setup.sh              # Automated setup script
├── manual_setup.sh       # Manual setup instructions
├── test_backend.py       # Backend testing script
├── INSTALLATION.md       # Detailed installation guide
├── PROJECT_SUMMARY.md    # Complete project documentation
└── README.md             # This file
```

## 🛠️ Technical Implementation

### Backend API Endpoints

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
   cd spurHacked
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

SpurHacked is a fully functional language learning Chrome extension with a robust Python backend. It provides an innovative way to learn languages by translating words in real-time while browsing the web. The project demonstrates modern web development practices, Chrome extension development, and API design.

The extension is ready for use and can be easily extended with real translation APIs, additional languages, and enhanced learning features.

## 📄 License

This project is for educational purposes. Please respect the terms of use for any translation APIs you integrate.