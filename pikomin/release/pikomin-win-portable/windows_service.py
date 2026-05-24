import json
import os
import signal
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


def creation_flags() -> int:
    if os.name != "nt":
        return 0
    return subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW


def start_process(cmd: list[str], cwd: Path | None, env: dict[str, str], stdout_path: Path, stderr_path: Path) -> subprocess.Popen:
    stdout = stdout_path.open("ab")
    stderr = stderr_path.open("ab")
    return subprocess.Popen(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=stdout,
        stderr=stderr,
        creationflags=creation_flags(),
    )


def wait_ready(url: str, timeout_seconds: float = 15.0) -> bool:
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(f"{url}/api/status", timeout=2) as response:
                if response.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False


def stop_pid(pid: int) -> None:
    try:
        os.kill(pid, signal.CTRL_BREAK_EVENT)
        time.sleep(0.5)
    except Exception:
        pass

    try:
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
            creationflags=creation_flags(),
        )
    except Exception:
        pass


def main() -> int:
    base = Path(__file__).resolve().parent
    logs = base / "logs"
    logs.mkdir(exist_ok=True)
    pid_file = logs / "pids.json"
    venv_py = base / "venv" / "Scripts" / "python.exe"
    pmd3_exe = base / "venv" / "Scripts" / "pymobiledevice3.exe"
    backend_port = os.environ.get("BACKEND_PORT", "5679")
    app_url = f"http://localhost:{backend_port}"

    if len(sys.argv) > 1 and sys.argv[1] == "stop":
        if not pid_file.exists():
            print("Pikomin is not running, no pid file found.")
            return 0
        data = json.loads(pid_file.read_text(encoding="utf-8"))
        for name in ("backend", "tunnel"):
            pid = data.get(name)
            if isinstance(pid, int):
                print(f"Stopping {name} pid={pid}...")
                stop_pid(pid)
        pid_file.unlink(missing_ok=True)
        print("Pikomin stopped.")
        return 0

    if not venv_py.exists():
        print(f"Missing runtime: {venv_py}")
        return 1
    if not pmd3_exe.exists():
        print(f"Missing pymobiledevice3 runtime: {pmd3_exe}")
        return 1

    env = os.environ.copy()
    env["FRONTEND_DIST_DIR"] = str(base / "frontend" / "dist")
    env["HOST_BRIDGE_URL"] = ""
    env["PMD3_PATH"] = str(pmd3_exe)

    tunnel = start_process(
        [str(venv_py), "-m", "pymobiledevice3", "remote", "tunneld", "--protocol", "tcp"],
        None,
        env,
        logs / "tunneld.log",
        logs / "tunneld.err.log",
    )
    backend = start_process(
        [str(venv_py), "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", backend_port],
        base / "backend",
        env,
        logs / "backend.log",
        logs / "backend.err.log",
    )

    pid_file.write_text(
        json.dumps({"tunnel": tunnel.pid, "backend": backend.pid}, indent=2),
        encoding="utf-8",
    )

    if wait_ready(app_url):
        webbrowser.open(app_url)
        print(f"Pikomin is running at {app_url}")
        print(f"Logs: {logs}")
        return 0

    print(f"Pikomin started, but the app did not become ready at {app_url}.")
    print(f"Check logs: {logs}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
