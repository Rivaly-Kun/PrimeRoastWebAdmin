from flask import Flask, render_template, request, jsonify
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
    # Fetch orders and user data from Firebase
    orders_response = requests.get(f'{FIREBASE_URL}/orders.json?auth={FIREBASE_API_KEY}')
    users_response = requests.get(f'{FIREBASE_URL}/users.json?auth={FIREBASE_API_KEY}')
    
    orders = orders_response.json() if orders_response.status_code == 200 else {}
    users = users_response.json() if users_response.status_code == 200 else {}

    # Convert Firebase data into a unique list of dictionaries for easier handling
    order_list = []
    seen_orders = set()  # Track unique orders based on UserID + order attributes

    for user_id, order_data in orders.items():
        user_info = users.get(user_id, {})  # Get the user information based on UserID
        user_name = user_info.get('name', 'Unknown User')  # Default to 'Unknown User' if no name is found

        if isinstance(order_data, dict):  # If it's a single order (dictionary)
            order_key = f"{user_id}-{order_data.get('Status')}-{order_data.get('orderTime')}"
            if order_key not in seen_orders:  # Avoid duplicates
                seen_orders.add(order_key)
                order_list.append({
                    'UserID': user_id,
                    'Name': user_name,
                    'Status': order_data.get('Status', 'N/A'),
                    'ContactNumber': order_data.get('contactNumber', 'N/A'),
                    'OrderTime': order_data.get('orderTime', 'N/A')
                })
        elif isinstance(order_data, list):  # If it's a list of orders
            for item in order_data:
                if isinstance(item, dict):  # Ensure the item is a valid order dictionary
                    order_key = f"{user_id}-{item.get('Status')}-{item.get('orderTime')}"
                    if order_key not in seen_orders:  # Avoid duplicates
                        seen_orders.add(order_key)
                        order_list.append({
                            'UserID': user_id,
                            'Name': user_name,
                            'Status': item.get('Status', 'N/A'),
                            'ContactNumber': item.get('contactNumber', 'N/A'),
                            'OrderTime': item.get('orderTime', 'N/A')
                        })

    return render_template('index.html', orders=order_list)

@app.route('/add_message', methods=['POST'])
def add_message():
    data = request.json
    message_content = data.get('content')
    
    response = requests.post(f'{FIREBASE_URL}/messages.json?auth={FIREBASE_API_KEY}', json={'content': message_content})
    return 'Message added: ' + response.text

@app.route('/mark_outgoing', methods=['POST'])
def mark_outgoing():
    data = request.json
    app.logger.info(f"Incoming request data: {data}")  # Debugging line

    user_id = data.get('userId')
    order_index = data.get('orderIndex')

    if not user_id or order_index is None:
        return jsonify({'message': 'Invalid request data'}), 400

    # Fetch the specific order details
    orders_response = requests.get(f'{FIREBASE_URL}/orders/{user_id}.json?auth={FIREBASE_API_KEY}')
    orders = orders_response.json() if orders_response.status_code == 200 else {}

    # Get the specific order using the index
    order_keys = list(orders.keys())
    if not order_keys or int(order_index) >= len(order_keys):
        return jsonify({'message': 'Order not found'}), 404

    order_key = order_keys[int(order_index)]
    selected_order = orders[order_key]

    # Move the order to 'outgoing/<UID>'
    outgoing_response = requests.patch(
        f'{FIREBASE_URL}/outgoing/{user_id}.json?auth={FIREBASE_API_KEY}',
        json={order_key: selected_order}
    )

    if outgoing_response.status_code != 200:
        return jsonify({'message': 'Failed to mark as outgoing'}), 500

    # Delete the order from 'orders/<UID>'
    delete_response = requests.delete(
        f'{FIREBASE_URL}/orders/{user_id}/{order_key}.json?auth={FIREBASE_API_KEY}'
    )

    if delete_response.status_code != 200:
        return jsonify({'message': 'Failed to delete the original order'}), 500

    return jsonify({'message': 'Order marked as outgoing and removed successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
