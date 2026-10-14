"""Surveillance discrète de la batterie Lapinous (Windows, sans dépendance externe)."""
import ctypes
import datetime as dt
import json
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # tools/agent_lapinous/surveillance_batterie.py
STATE = Path(__file__).with_name('etat_batterie.json')

class SYSTEM_POWER_STATUS(ctypes.Structure):
    _fields_ = [('ACLineStatus', ctypes.c_byte), ('BatteryFlag', ctypes.c_byte),
                ('BatteryLifePercent', ctypes.c_byte), ('SystemStatusFlag', ctypes.c_byte),
                ('BatteryLifeTime', ctypes.c_ulong), ('BatteryFullLifeTime', ctypes.c_ulong)]

def lire_batterie():
    status = SYSTEM_POWER_STATUS()
    if not ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(status)):
        raise OSError('Lecture de la batterie impossible')
    if status.BatteryLifePercent == -1 or status.ACLineStatus == -1:
        return None, None
    return int(status.BatteryLifePercent), status.ACLineStatus == 1

def lire_env():
    path = ROOT / '.env'
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, val = line.split('=', 1)
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), val)

def envoyer(message):
    lire_env()
    url = os.getenv('DISCORD_WEBHOOK_ALERTES') or os.getenv('DISCORD_WEBHOOK_ERREURS')
    if not url:
        raise RuntimeError('Webhook alertes absent du .env racine')
    data = json.dumps({'content': message, 'allowed_mentions': {'parse': []}}).encode('utf-8')
    request = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status not in (200, 204):
            raise RuntimeError(f'Discord HTTP {response.status}')

def main():
    now = dt.datetime.now().astimezone()
    pct, plugged = lire_batterie()
    if pct is None:
        print('Batterie non disponible : aucune alerte')
        return
    try:
        state = json.loads(STATE.read_text(encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        state = {}
    # Une tâche Windows réveille éventuellement le script toutes les 30 min.
    # Ce script espace les lectures utiles à 3 h tant que la charge est suffisante.
    due = state.get('next_check')
    if due:
        try:
            if now < dt.datetime.fromisoformat(due):
                return
        except ValueError:
            pass
    sent = set(state.get('sent', []))
    if plugged or pct >= 50:
        sent.clear()  # Nouveau cycle après recharge/retour secteur
    elif pct <= 30:
        crossed = [threshold for threshold in (30, 25, 20, 15) if pct <= threshold and threshold not in sent]
        if crossed:
            severity = '🚨 CRITIQUE' if pct <= 15 else '🔋 Batterie faible'
            envoyer(f'{severity} — Lapinous : batterie à **{pct} %**, chargeur débranché. '
                    f'Seuil(s) atteint(s) : {", ".join(map(str, crossed))} %. '
                    'Branche le PC dès que possible pour protéger la synchronisation Cloudinary.')
            sent.update(crossed)  # Enregistrer seulement après envoi réussi
    interval = 180 if plugged or pct >= 50 else 30
    state = {'sent': sorted(sent), 'last_check': now.isoformat(),
             'next_check': (now + dt.timedelta(minutes=interval)).isoformat(),
             'last_percent': pct, 'plugged': plugged}
    temp = STATE.with_suffix('.tmp')
    temp.write_text(json.dumps(state, indent=2), encoding='utf-8')
    temp.replace(STATE)
    print(f'Batterie {pct} %, secteur={plugged}, prochain contrôle dans {interval} min')

if __name__ == '__main__':
    main()
