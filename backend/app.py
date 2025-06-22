from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import random
import os
import csv
from datetime import date
from updateDaily import *

app = Flask(__name__)
CORS(app)

# Mock translation data for demonstration
# In a real implementation, you would integrate with a translation API like Google Translate

def extract_words(text):
    """Extract words from text, filtering out common words and keeping only meaningful ones."""
    # Remove HTML tags and special characters
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Split into words and filter
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    
    # Filter out common words that don't need translation
    common_words = {}
    
    # Filter out common words and duplicates
    meaningful_words = [word for word in words if word not in common_words]
    return list(set(meaningful_words))  # Remove duplicates

def get_translations(words, level, target_language):
    """Get translations for words based on level and target language."""
    translations = []
    words_set = set(word.lower() for word in words)  # For efficient lookup
    
    csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader, None)  # Skip the header/date line
        for row in reader:
            english = row[0].strip()
            translated = row[1].strip()
            meaning = row[2].strip()
            pronunciation = row[3].strip()
            # frequency = int(row[4].strip())
            translations.append({
                'original': english,
                'translated': translated,
                'meaning': meaning,
                'pronunciation': pronunciation,
            })
    return translations

@app.route('/api/hover', methods=['POST'])
def hover_word():
    data = request.get_json()
    english_word = data.get('english')
    if not english_word:
        return jsonify({'error': 'No word provided'}), 400

    csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')
    updated = False
    rows = []

    # Read and update frequency
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = list(csv.reader(csvfile))
        for i, row in enumerate(reader):
            if i == 0 or len(row) < 6 or not row[0].strip() or row[0].startswith('//'):
                rows.append(row)
                continue
            if row[0].strip().lower() == english_word.lower():
                try:
                    freq = int(row[4].strip())
                except Exception:
                    freq = 0
                row[4] = str(freq + 1)
                updated = True
            rows.append(row)

    # Write back to CSV if updated
    if updated:
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(rows)

    return jsonify({'updated': updated})


@app.route('/translate', methods=['POST'])
def translate():
    """Main translation endpoint."""
    data = request.get_json()
    text = data.get('text', '')
    level = data.get('level', 'beginner')
    target_language = data.get('targetLanguage', 'fr')


    csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')

    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        first_row = next(reader, None)

    if (first_row[0] != str(date.today())) or (first_row[1] != target_language) or (first_row[2] != level):
        updateDaily(level, target_language)


    # Extract meaningful words from the text
    words = extract_words(text)
    
    # Get translations
    translations = get_translations(words, level, target_language)
    
    return jsonify({"translations": translations})
        

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "message": "Translation API is running"})

if __name__ == '__main__':
    print("Starting SpurHacked Translation API...")
    print("API will be available at: http://localhost:5001")
    print("Available endpoints:")
    print("  - POST /translate - Translate text")
    print("  - GET /health - Health check")
    app.run(debug=True, host='0.0.0.0', port=5001) 