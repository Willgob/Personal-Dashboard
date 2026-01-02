from flask import Flask, render_template
import yaml

app = Flask(__name__)

def load_dashboard_config():
    with open('config/dashboard.yaml', 'r') as file:
        config = yaml.safe_load(file)
    return config

@app.route('/')
def home():
    config = load_dashboard_config()
    print(config)
    return render_template("index.html", widgets=config["widgets"])


if __name__ == '__main__':
    app.run(debug=True, port=5050)
