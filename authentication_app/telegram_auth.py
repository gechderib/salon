"""
MVP Telegram login verification helper.

In production you should implement Telegram Login Widget verification by
checking the hash using your bot token. This helper represents the contract
that the view relies on.
"""
from typing import Optional, Dict


import hashlib
import hmac
import os
from typing import Optional, Dict


def verify_telegram_auth(data: Dict) -> Optional[Dict]:
    """
    Validate the Telegram auth data and return it if valid.
    """
    received_hash = data.get("hash")
    if not received_hash:
        return None

    # Bot token from environment
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        print("TELEGRAM_BOT_TOKEN not found in environment!")
        return None

    # Step 1: Prep data_check_string
    # Exclude 'hash' and sort alphabetically
    auth_data = {k: v for k, v in data.items() if k != "hash"}
    sorted_items = sorted(auth_data.items())
    data_check_string = "\n".join([f"{k}={v}" for k, v in sorted_items])

    # Step 2: Verification
    # secret_key is SHA256 of the bot token
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if calculated_hash == received_hash:
        # Return the verified payload
        return {
            "id": data.get("id"),
            "phone_number": data.get("phone_number", ""),
            "first_name": data.get("first_name", ""),
            "last_name": data.get("last_name", ""),
            "photo_url": data.get("photo_url", ""),
        }
    
    return None

