from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)


@app.route('/process_data', methods=['POST'])
def process_data():
    data = request.json
    url = data.get('link')
    result = requests.get(url)
    if result.status_code == 200:
        soup = BeautifulSoup(result.content, "html.parser")
        img = soup.find('div').find('img')
        src = (img.get_attribute_list(
            'src')[0]).replace('t500x500', 'original')
        title = img.get_attribute_list('alt')[0]
        print('title >>> ', title)
        print('src >>> ' + src)
    return jsonify({'src': src, 'title': title})


if __name__ == '__main__':
    app.run()
