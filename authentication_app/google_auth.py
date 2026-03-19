"""
MVP Google OAuth token verification helper.

In production you should use `google-auth` or a similar library to validate the
ID token, verify signatures, audience, issuer, etc. For now this helper
represents the contract that the view relies on.
"""
from typing import Optional, Dict


import os
from typing import Optional, Dict
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_id_token(token: str) -> Optional[Dict]:
    """
    Validate the Google ID token and return its payload.
    """
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        print(f"DEBUG: Verifying token for client_id: {client_id}")
        # Verify the token
        id_info = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        
        # User details from the Google payload
        return {
            "sub": id_info.get("sub"),
            "email": id_info.get("email"),
            "given_name": id_info.get("given_name", ""),
            "family_name": id_info.get("family_name", ""),
            "picture": id_info.get("picture", ""),
        }
    except ValueError:
        # Invalid token
        return None

