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
TRANSLATION_DATA = {
    "fr": {  # French
        "beginner": {
            "hello": {"translated": "bonjour", "meaning": "hello", "pronunciation": "bohn-ZHOOR"},
            "world": {"translated": "monde", "meaning": "world", "pronunciation": "mohnd"},
            "good": {"translated": "bon", "meaning": "good", "pronunciation": "bohn"},
            "morning": {"translated": "matin", "meaning": "morning", "pronunciation": "mah-TAN"},
            "thank": {"translated": "merci", "meaning": "thank you", "pronunciation": "mehr-SEE"},
            "you": {"translated": "vous", "meaning": "you", "pronunciation": "voo"},
            "please": {"translated": "s'il vous plaît", "meaning": "please", "pronunciation": "seel voo PLEH"},
            "yes": {"translated": "oui", "meaning": "yes", "pronunciation": "wee"},
            "no": {"translated": "non", "meaning": "no", "pronunciation": "nohn"},
            "water": {"translated": "eau", "meaning": "water", "pronunciation": "oh"},
            "food": {"translated": "nourriture", "meaning": "food", "pronunciation": "noo-ree-TUUR"},
            "time": {"translated": "temps", "meaning": "time", "pronunciation": "tahn"},
            "day": {"translated": "jour", "meaning": "day", "pronunciation": "zhoor"},
            "night": {"translated": "nuit", "meaning": "night", "pronunciation": "nwee"},
            "house": {"translated": "maison", "meaning": "house", "pronunciation": "meh-ZOHN"},
            "car": {"translated": "voiture", "meaning": "car", "pronunciation": "vwah-TUUR"},
            "book": {"translated": "livre", "meaning": "book", "pronunciation": "LEE-vruh"},
            "friend": {"translated": "ami", "meaning": "friend", "pronunciation": "ah-MEE"},
            "family": {"translated": "famille", "meaning": "family", "pronunciation": "fah-MEE"},
            "work": {"translated": "travail", "meaning": "work", "pronunciation": "trah-VAI"}
        },
        "intermediate": {
            "beautiful": {"translated": "beau", "meaning": "beautiful", "pronunciation": "boh"},
            "important": {"translated": "important", "meaning": "important", "pronunciation": "an-por-TAHN"},
            "difficult": {"translated": "difficile", "meaning": "difficult", "pronunciation": "dee-fee-SEEL"},
            "interesting": {"translated": "intéressant", "meaning": "interesting", "pronunciation": "an-teh-reh-SAHN"},
            "possible": {"translated": "possible", "meaning": "possible", "pronunciation": "poh-see-BLUH"},
            "necessary": {"translated": "nécessaire", "meaning": "necessary", "pronunciation": "neh-seh-SAIR"},
            "different": {"translated": "différent", "meaning": "different", "pronunciation": "dee-feh-RAHN"},
            "special": {"translated": "spécial", "meaning": "special", "pronunciation": "speh-syal"},
            "modern": {"translated": "moderne", "meaning": "modern", "pronunciation": "moh-DAIRN"},
            "traditional": {"translated": "traditionnel", "meaning": "traditional", "pronunciation": "trah-dee-syo-NEHL"}
        },
        "advanced": {
            "sophisticated": {"translated": "sophistiqué", "meaning": "sophisticated", "pronunciation": "soh-fee-stee-KAY"},
            "revolutionary": {"translated": "révolutionnaire", "meaning": "revolutionary", "pronunciation": "reh-voh-loo-syo-NAIR"},
            "philosophical": {"translated": "philosophique", "meaning": "philosophical", "pronunciation": "fee-loh-soh-FEEK"},
            "theoretical": {"translated": "théorique", "meaning": "theoretical", "pronunciation": "teh-oh-REEK"},
            "analytical": {"translated": "analytique", "meaning": "analytical", "pronunciation": "ah-nah-lee-TEEK"}
        }
    },
}

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