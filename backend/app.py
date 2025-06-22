from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import csv
from datetime import date
from updateDaily import *

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# Extract words from text (NO FILTERING)
# ─────────────────────────────────────────────
def extract_words(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    return list(set(words))  # no stop-word filtering

# ─────────────────────────────────────────────
# Get translations from today.csv (5-column version)
# ─────────────────────────────────────────────
def get_translations(words, level, target_language):
    translations = []
    words_set = set(word.lower() for word in words)

    csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader, None)  # Skip date header
        for row in reader:
            if len(row) < 5 or not row[0].strip() or row[0].startswith('//'):
                continue
            english = row[0].strip()
            if english.lower() in words_set:
                translations.append({
                    'original': english,
                    'translated': row[1].strip(),
                    'meaning': row[2].strip(),
                    'pronunciation': row[3].strip(),
                    'frequency': row[4].strip()
                })
    return translations

# ─────────────────────────────────────────────
# Hover endpoint to increment frequency
# ─────────────────────────────────────────────
@app.route('/api/hover', methods=['POST'])
def hover_word():
    data = request.get_json()
    english_word = data.get('english')
    if not english_word:
        return jsonify({'error': 'No word provided'}), 400

    csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')
    updated = False
    rows = []

    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = list(csv.reader(csvfile))
        for i, row in enumerate(reader):
            if i == 0 or len(row) < 5 or not row[0].strip() or row[0].startswith('//'):
                rows.append(row)
                continue
            if row[0].strip().lower() == english_word.lower():
                try:
                    freq = int(row[4].strip())
                except:
                    freq = 0
                row[4] = str(freq + 1)
                updated = True
            rows.append(row)

    if updated:
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(rows)

    return jsonify({'updated': updated})

# ─────────────────────────────────────────────
# Translation endpoint with updateDaily check
# ─────────────────────────────────────────────
@app.route('/translate', methods=['POST'])
def translate():
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

    words = extract_words(text)
    translations = get_translations(words, level, target_language)

    return jsonify({"translations": translations})

# ─────────────────────────────────────────────
# /api/stats endpoint (from File 1)
# ─────────────────────────────────────────────
@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')

        if not os.path.exists(csv_path):
            return jsonify({
                'total_words': 0,
                'words_learned_today': 0,
                'total_hovers': 0,
                'most_common_word': None,
                'learning_progress': 0
            })

        total_words = 0
        total_hovers = 0
        words_learned_today = 0
        most_common_word = None
        max_frequency = 0

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            next(reader, None)

            for row in reader:
                if len(row) < 5 or not row[0].strip() or row[0].startswith('//'):
                    continue
                total_words += 1
                try:
                    frequency = int(row[4].strip())
                    total_hovers += frequency
                    if frequency > 0:
                        words_learned_today += 1
                    if frequency > max_frequency:
                        max_frequency = frequency
                        most_common_word = row[0].strip()
                except:
                    continue

        learning_progress = round((words_learned_today / total_words * 100) if total_words > 0 else 0, 1)

        return jsonify({
            'total_words': total_words,
            'words_learned_today': words_learned_today,
            'total_hovers': total_hovers,
            'most_common_word': most_common_word,
            'learning_progress': learning_progress,
            'max_frequency': max_frequency
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Translation API is running"})

# ─────────────────────────────────────────────
# Launch
# ─────────────────────────────────────────────
if __name__ == '__main__':
    print("Starting SpurHacked Translation API...")
    print("API will be available at: http://localhost:5001")
    print("Available endpoints:")
    print("  - POST /translate - Translate text")
    print("  - GET /health - Health check")
    print("  - POST /api/hover - Increment hover count")
    print("  - GET /api/stats - View learning stats")
    app.run(debug=True, host='0.0.0.0', port=5001)
