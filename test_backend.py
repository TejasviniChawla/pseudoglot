#!/usr/bin/env python3
"""
Test script for SpurHacked backend API
"""

import requests
import json
import time

def test_backend():
    base_url = "http://localhost:5001"
    
    print("🧪 Testing SpurHacked Backend API")
    print("=" * 40)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure the server is running on localhost:5001")
        return False
    
    # Test 2: Translation endpoint
    print("\n2. Testing translation endpoint...")
    test_data = {
        "text": "Hello world, this is a beautiful morning.",
        "level": "beginner",
        "targetLanguage": "fr"
    }
    
    try:
        response = requests.post(
            f"{base_url}/translate",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data)
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Translation successful!")
            print(f"   Found {data.get('total_words_found', 0)} words")
            print(f"   Translated {data.get('translations_provided', 0)} words")
            
            translations = data.get('translations', [])
            if translations:
                print("   Sample translations:")
                for t in translations[:3]:  # Show first 3 translations
                    print(f"     {t['original']} → {t['translated']} ({t['meaning']})")
        else:
            print(f"❌ Translation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Translation request failed: {e}")
        return False
    
    # Test 3: Different language
    print("\n3. Testing Spanish translation...")
    test_data_es = {
        "text": "Good morning, thank you very much.",
        "level": "beginner",
        "targetLanguage": "es"
    }
    
    try:
        response = requests.post(
            f"{base_url}/translate",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data_es)
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Spanish translation successful!")
            print(f"   Translated {data.get('translations_provided', 0)} words")
        else:
            print(f"❌ Spanish translation failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Spanish translation request failed: {e}")
    
    print("\n🎉 Backend tests completed!")
    return True

if __name__ == "__main__":
    # Wait a moment for server to start if needed
    time.sleep(2)
    test_backend() 