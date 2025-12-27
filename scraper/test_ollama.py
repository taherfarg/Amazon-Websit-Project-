import json
from curl_cffi import requests as crequests

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "devstral-small-2:24b" # as requested by user

def test_ollama():
    print(f"🧪 Testing Ollama connection with model: {MODEL_NAME}...")
    
    payload = {
        "model": MODEL_NAME,
        "prompt": "Say hello! Respond in JSON format like {'message': 'hello'}",
        "stream": False,
        "format": "json" # Ollama supports json mode
    }
    
    try:
        response = crequests.post(OLLAMA_API_URL, json=payload, impersonate="chrome110", timeout=300)
        
        if response.status_code == 200:
            print("✅ Connection Successful!")
            data = response.json()
            print("Response:", json.dumps(data, indent=2))
            
            # Check if actual response is there
            if "response" in data:
                print("parsed content:", data["response"])
        else:
            print(f"❌ Failed. Status Code: {response.status_code}")
            print("Response:", response.text)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ollama()
