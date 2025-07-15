from app import create_app
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

app = create_app()

if __name__ == "__main__":
    # For Docker containers, bind to all interfaces (0.0.0.0)
    # and use the port specified in the environment or default to 5000
    import os
    port = int(os.environ.get("PORT", 5000))
    
    # In Docker, disable reloader to prevent double initialization
    use_reloader = not os.environ.get('FLASK_ENV') == 'development'
    
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=use_reloader)