# SpurHacked Backend API

A Flask-based backend API for the SpurHacked language learning Chrome extension.

## Features

- **Translation API**: Translates words based on user's learning level and target language
- **CORS Support**: Configured for cross-origin requests from Chrome extension
- **Mock Data**: Includes sample translations for French, Spanish, and German
- **Word Filtering**: Intelligently filters out common words to focus on meaningful translations

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   python app.py
   ```

3. **Verify Installation**:
   - The API will be available at `http://localhost:5000`
   - Test with: `curl http://localhost:5000/health`

## API Endpoints

### POST /translate
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

### GET /health
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "message": "Translation API is running"
}
```

## Supported Languages

- **French (fr)**: Beginner, Intermediate, Advanced levels
- **Spanish (es)**: Beginner, Intermediate, Advanced levels  
- **German (de)**: Beginner, Intermediate, Advanced levels

## Learning Levels

- **Beginner**: Basic vocabulary (hello, world, good, etc.)
- **Intermediate**: More complex words (beautiful, important, difficult, etc.)
- **Advanced**: Sophisticated vocabulary (sophisticated, revolutionary, philosophical, etc.)

## Development Notes

- The current implementation uses mock data for demonstration
- In production, integrate with a real translation API (Google Translate, DeepL, etc.)
- The word filtering algorithm removes common English words to focus on meaningful translations
- CORS is enabled to allow requests from the Chrome extension

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:5000/health

# Translation test
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "level": "beginner", "targetLanguage": "fr"}'
``` 