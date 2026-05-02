import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path


def run_detached(cmd, cwd=None):
    creationflags = 0
    if os.name == "nt":
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
    return subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creationflags,
    )


def main():
    base = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parent.parent / "release" / "pikomin-win-portable"
    venv_py = base / "venv" / "Scripts" / "python.exe"
    if not venv_py.exists():
        print(f"Missing runtime: {venv_py}")
        sys.exit(1)

    backend_port = os.environ.get("BACKEND_PORT", "5679")
    frontend_port = os.environ.get("FRONTEND_PORT", "5678")

    # 1) tunneld (TCP)
    run_detached([str(venv_py), "-m", "pymobiledevice3", "remote", "tunneld", "--protocol", "tcp"])

    # 2) backend
    run_detached(
        [str(venv_py), "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", backend_port],
        cwd=str(base / "backend"),
    )

    # 3) frontend static server
    run_detached(
        [str(venv_py), "-m", "http.server", frontend_port],
        cwd=str(base / "frontend" / "dist"),
    )

    time.sleep(1.2)
    webbrowser.open(f"http://localhost:{frontend_port}")
    print("Pikomin started. You can close this window.")


if __name__ == "__main__":
    main()
