import base64
import json

token = "AAD7DVo0-GnMLb_uWpUKFGE-Wb4L9tXOq0FVsGeJeRFj9-cdZcyVlEZ4ZW_YEa9meZAOi5Z3_vSt3cTDZcfZX-G0KVI8jfSXNYFXTvnaQVV5nYqDaCbg-fvEs4ICqhFdIk3flw5G3nR3hf7R"

payload = token.split(".")[1]
payload += "=" * (-len(payload) % 4)  # padding
decoded = base64.urlsafe_b64decode(payload)

print(json.loads(decoded))
