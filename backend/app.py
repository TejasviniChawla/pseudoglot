from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import random
import os
import csv

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
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
        'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'ours', 'theirs', 'what', 'when', 'where',
        'why', 'how', 'who', 'which', 'whom', 'whose', 'if', 'then', 'else', 'than', 'as', 'so',
        'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
        'not', 'only', 'own', 'same', 'too', 'very', 'just', 'now', 'here', 'there', 'up', 'down',
        'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'also', 'very', 'well',
        'even', 'still', 'back', 'way', 'far', 'long', 'much', 'many', 'every', 'each', 'both',
        'either', 'neither', 'one', 'two', 'three', 'first', 'second', 'third', 'last', 'next',
        'new', 'old', 'good', 'bad', 'big', 'small', 'high', 'low', 'right', 'left', 'yes', 'no'
    }
    
    # Filter out common words and duplicates
    meaningful_words = [word for word in words if word not in common_words]
    return list(set(meaningful_words))  # Remove duplicates

def get_translations(words, level, target_language):
    """Get translations for words based on level and target language."""
    translations = []
    
    csv_path = os.path.join(os.path.dirname(__file__), 'today.csv')
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader, None)  # Skip the header/date line
        for row in reader:
            if len(row) < 6 or not row[0].strip() or row[0].startswith('//'):
                continue  # skip empty or comment lines
            english = row[0].strip()
            translated = row[1].strip()
            meaning = row[2].strip()
            pronunciation = row[3].strip()
            # frequency = int(row[4].strip())
            word_type = row[5].strip()
            translations.append({
                'original': english,
                'translated': translated,
                'meaning': meaning,
                'pronunciation': pronunciation,
                'word_type': word_type
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

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get learning statistics from CSV data."""
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
            next(reader, None)  # Skip the header/date line
            
            for row in reader:
                if len(row) < 6 or not row[0].strip() or row[0].startswith('//'):
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
                        
                except (ValueError, IndexError):
                    continue
        
        # Calculate learning progress (percentage of words that have been hovered)
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

@app.route('/translate', methods=['POST'])
def translate():
    """Main translation endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        text = data.get('text', '')
        level = data.get('level', 'beginner')
        target_language = data.get('targetLanguage', 'fr')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Extract meaningful words from the text
        words = extract_words(text)
        
        # Get translations
        translations = get_translations(words, level, target_language)
        
        return jsonify({
            "translations": translations,
            "total_words_found": len(words),
            "translations_provided": len(translations)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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