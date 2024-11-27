from flask import Flask, render_template, request
import requests
import os

# Set up the paths to the folders where HTML, CSS, and JS files are located
template_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'html')
static_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')

# Initialize Flask app with the custom template and static folder paths
app = Flask(__name__, template_folder=template_folder_path, static_folder=static_folder_path)

# Firebase project settings
FIREBASE_URL = 'https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app'
FIREBASE_API_KEY = 'AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk'

@app.route('/')
def home():
    # Flask will automatically look for index.html in the specified 'html' folder
    return render_template('index.html')

@app.route('/add_message', methods=['POST'])
def add_message():
    data = request.json
    message_content = data.get('content')
    
    response = requests.post(f'{FIREBASE_URL}/messages.json?auth={FIREBASE_API_KEY}', json={'content': message_content})
    return 'Message added: ' + response.text

if __name__ == "__main__":
    app.run(debug=True)
