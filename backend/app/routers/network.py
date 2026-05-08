"""
Network info endpoint.

Returns the best available URL for the QR code:
  1. TUNNEL_URL env var  — set this to your ngrok/cloudflare/localtunnel URL
  2. LAN IP              — works when phone & laptop are on the same Wi-Fi
  3. localhost fallback  — last resort

Set TUNNEL_URL before starting the backend:
  Windows PowerShell:  $env:TUNNEL_URL="https://xxxx.ngrok-free.app"
  Windows CMD:         set TUNNEL_URL=https://xxxx.ngrok-free.app
  Linux/Mac:           export TUNNEL_URL=https://xxxx.ngrok-free.app
"""

from __future__ import annotations

import os
import socket
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["network"])


class NetworkInfo(BaseModel):
    lan_ip: str
    frontend_url: str
    backend_url: str
    tunnel_url: str | None
    qr_url: str          # the URL that should go into the QR code
    mode: str            # "tunnel" | "lan" | "localhost"


def _get_lan_ip() -> str:
    """Return the machine's primary LAN IP (not 127.0.0.1)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"


@router.get("/network/info", response_model=NetworkInfo)
def get_network_info() -> NetworkInfo:
    """Return the best URL for the QR code."""
    tunnel_url = os.environ.get("TUNNEL_URL", "").strip().rstrip("/") or None
    lan_ip = _get_lan_ip()
    lan_frontend = f"http://{lan_ip}:5173"

    if tunnel_url:
        qr_url = tunnel_url
        mode = "tunnel"
    elif lan_ip != "127.0.0.1":
        qr_url = lan_frontend
        mode = "lan"
    else:
        qr_url = "http://localhost:5173"
        mode = "localhost"

    return NetworkInfo(
        lan_ip=lan_ip,
        frontend_url=lan_frontend,
        backend_url=f"http://{lan_ip}:8000",
        tunnel_url=tunnel_url,
        qr_url=qr_url,
        mode=mode,
    )
