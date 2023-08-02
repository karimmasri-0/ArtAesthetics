from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import base64

app = Flask(__name__)
CORS(app)


def read_image_as_blob(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            blob_data = response.content
            return blob_data
        else:
            print(
                f"Failed to download image. Status code: {response.status_code}")
            raise ValueError('Error while parsing.')
    except requests.RequestException as e:
        raise ValueError('Error while downloading the image.')


def get_soundcloud_data(url):
    try:
        result = requests.get(url)
        print(result)
        result.raise_for_status()
        soup = BeautifulSoup(result.content, "html.parser")
        img = soup.find('div').find('img')
        src = img.get('src').replace('t500x500', 'original')
        title = img.get('alt')
        base64_data = base64.b64encode(read_image_as_blob(src)).decode('utf-8')
        if not base64_data:
            raise ValueError('Error while parsing.')
        return {'src': src, 'title': title, 'image_blob': base64_data}
    except requests.exceptions.HTTPError as e:
        raise ValueError('Not a valid Soundcloud link.')
    except requests.exceptions.RequestException as e:
        raise ValueError('Request failed.')
    except (AttributeError, IndexError, KeyError) as e:
        raise ValueError('Not a valid Soundcloud link.')


@app.route('/process_data', methods=['POST'])
def process_data():
    try:
        data = request.json
        url = data.get('link').split('?', 1)[0]
        result = get_soundcloud_data(url)
        return jsonify(result)
    except ValueError as e:
        print(e)
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(e)
        return jsonify({'error': 'An unexpected error occurred.'}), 500


if __name__ == '__main__':
    app.run()
