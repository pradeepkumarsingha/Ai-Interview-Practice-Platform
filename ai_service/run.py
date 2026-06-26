import os
import uvicorn
# Import the configured app instance from main.py
from main import app 

if __name__ == "__main__":
    # Render automatically sets the 'PORT' env variable to 10000 by default
    port = int(os.environ.get("PORT", 10000))
    
    # Crucial: host MUST be "0.0.0.0", not "127.0.0.1" or "localhost"
    # Using the string "main:app" with reload=True makes local development much easier
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)