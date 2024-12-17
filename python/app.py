from flask import Flask, render_template, request, jsonify, url_for, session, redirect
import requests, logging    
import firebase_admin
from firebase_admin import credentials, auth
import os

# Set up the paths to the folders where HTML, CSS, and JS files are located
template_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'html')
static_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')

# Initialize Flask app with the custom template and static folder paths
app = Flask(__name__, template_folder=template_folder_path, static_folder=static_folder_path)
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
# Initialize Firebase Admin SDK
cred = credentials.Certificate("./primeroastweb-firebase-adminsdk-pki6f-3cc481f6f9.json")  # Ensure this path is correct
firebase_admin.initialize_app(cred)

# Set a secret key for session handling
app.secret_key = 'your_secret_key_here'  # Replace with a secure, random string

# Firebase project settings
FIREBASE_URL = 'https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app'
FIREBASE_API_KEY = 'AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk'

@app.route('/set_session', methods=['POST'])
def set_session():
    data = request.json
    id_token = data.get('idToken')

    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        user_uid = decoded_token['uid']

        # Check the user's role in the Firebase database
        user_role_url = f"{FIREBASE_URL}/users/{user_uid}/role.json?auth={FIREBASE_API_KEY}"
        role_response = requests.get(user_role_url)
        role = role_response.json()

        if role == "admin":
            session['user_id'] = user_uid
            session['role'] = role
            return jsonify({'message': 'Session set successfully'}), 200
        else:
            return jsonify({'message': 'Access denied. Not an admin.'}), 403
    except Exception as e:
        app.logger.error(f"Error verifying ID token: {e}")
        return jsonify({'message': 'Invalid ID token'}), 401

@app.before_request
def require_login():
    if request.endpoint not in ['admin_login', 'set_session', 'static']:
        if 'user_id' not in session or session.get('role') != "admin":
            return redirect(url_for('admin_login'))

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clear the session
    return redirect(url_for('admin_login'))

@app.route('/adminlogin')
def admin_login():
    return render_template('adminlogin.html')

@app.route('/index')
def index():
    return render_template('index.html')

import logging
import requests

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/')
def home():
    logging.debug("Home route accessed")
    print("Home route accessed")


    # Fetch orders and users from Firebase
    orders_response = requests.get(f'{FIREBASE_URL}/orders.json?auth={FIREBASE_API_KEY}')
    users_response = requests.get(f'{FIREBASE_URL}/users.json?auth={FIREBASE_API_KEY}')

    print("Orders response status:", orders_response.status_code)
    print("Users response status:", users_response.status_code)

    logging.debug("Orders response status: %s", orders_response.status_code)
    logging.debug("Users response status: %s", users_response.status_code)

    # Parse responses
    orders = orders_response.json() if orders_response.status_code == 200 else {}
    users = users_response.json() if users_response.status_code == 200 else {}

    print("Orders data:", orders)
    print("Users data:", users)

    logging.debug("Orders data: %s", orders)
    logging.debug("Users data: %s", users)

    # Handle empty orders
    if not orders:
        print("No orders found.")
        logging.info("No orders found.")
        return render_template('index.html', orders=[])

    # Process data
    order_list = []
    seen_orders = set()

    for user_id, order_data in orders.items():
        print(f"Processing orders for user ID: {user_id}")
        logging.debug("Processing orders for user ID: %s", user_id)

        user_info = users.get(user_id, {})
        user_name = user_info.get('name', 'Unknown User')

        # Handle dictionary-type order data
        if isinstance(order_data, dict):
            for order_index, order_details in order_data.items():
                if isinstance(order_details, dict):
                    order_key = f"{user_id}-{order_details.get('Status')}-{order_details.get('orderTime')}"
                    if order_key not in seen_orders:
                        seen_orders.add(order_key)
                        print(f"Processing order: {order_key}")

                        # Process order items
                        order_items = order_details.get('orderItems', {})
                        items_list = [
                            {
                                'cartItemId': item_data.get('cartItemId', ''),
                                'price': item_data.get('price', '0'),
                                'productId': item_data.get('productId', ''),
                                'productImage': item_data.get('productImage', ''),
                                'productName': item_data.get('productName', 'Unknown Product'),
                                'quantity': item_data.get('quantity', 0),
                                'variant': item_data.get('variant', 'N/A'),
                            }
                            for item_id, item_data in order_items.items()
                            if isinstance(item_data, dict)
                        ]

                        # Append processed order
                        order_list.append({
                            'UserID': user_id,
                            'Name': user_name,
                            'Status': order_details.get('Status', 'N/A'),
                            'ContactNumber': order_details.get('contactNumber', 'N/A'),
                            'OrderTime': order_details.get('orderTime', 'N/A'),
                            'OrderItems': items_list,
                            'orderKey': order_index
                        })

        # Handle list-type order data
        elif isinstance(order_data, list):
            for item in order_data:
                if isinstance(item, dict):
                    order_key = f"{user_id}-{item.get('Status')}-{item.get('orderTime')}"
                    if order_key not in seen_orders:
                        seen_orders.add(order_key)
                        print(f"Processing order from list: {order_key}")

                        # Process order items
                        order_items = item.get('orderItems', {})
                        items_list = [
                            {
                                'cartItemId': item_data.get('cartItemId', ''),
                                'price': item_data.get('price', '0'),
                                'productId': item_data.get('productId', ''),
                                'productImage': item_data.get('productImage', ''),
                                'productName': item_data.get('productName', 'Unknown Product'),
                                'quantity': item_data.get('quantity', 0),
                                'variant': item_data.get('variant', 'N/A'),
                            }
                            for item_id, item_data in order_items.items()
                            if isinstance(item_data, dict)
                        ]

                        # Append processed order
                        order_list.append({
                            'UserID': user_id,
                            'Name': user_name,
                            'Status': item.get('Status', 'N/A'),
                            'ContactNumber': item.get('contactNumber', 'N/A'),
                            'OrderTime': item.get('orderTime', 'N/A'),
                            'OrderItems': items_list,
                            'orderKey': None  # No specific key for list orders
                        })

    print("Final order list:", order_list)
    logging.debug("Final order list: %s", order_list)

    # Render template with processed orders
    return render_template('index.html', orders=order_list)





if __name__ == '__main__':
    app.run(debug=True)
