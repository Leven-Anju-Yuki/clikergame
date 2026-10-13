"""Agent Lapinous : bilan local, suivi Trello explicite et notifications Discord.
Aucun push, aucune modification Cloudinary, aucun effacement de tâches.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
load_dotenv(ROOT / '.env')  # Un seul .env, à la racine du projet
ROOT = Path(os.getenv('PROJECT_ROOT') or ROOT).expanduser().resolve()
CONFIG = HERE / 'liaisons_trello.json'
REPORTS = HERE / 'rapports'
START = '<!-- LAPINOUS_AGENT_DEBUT -->'
END = '<!-- LAPINOUS_AGENT_FIN -->'
SKIP = {'.git', '.venv', 'node_modules', '__pycache__', '.cloudinary-local', 'rapports'}
BOARD = os.getenv('TRELLO_BOARD_ID', '5VmsAFi7').strip()


def safe_error(exc):
    """N'expose jamais les URL d'API contenant des jetons dans les logs/Discord."""
    if isinstance(exc, requests.HTTPError):
        code = exc.response.status_code if exc.response is not None else '?'
        return f'Erreur HTTP {code} (vérifier identifiants, droits ou ID de carte)'
    if isinstance(exc, requests.RequestException):
        return f'Erreur réseau {type(exc).__name__} (détails masqués)'
    message = str(exc)
    for name in ('TRELLO_TOKEN', 'TRELLO_API_KEY'):
        secret = os.getenv(name, '')
        if secret:
            message = message.replace(secret, '[MASQUÉ]')
    message = re.sub(r'https://(?:api\.trello\.com|discord\.com/api/webhooks)/\S+', '[URL MASQUÉE]', message)
    return f'{type(exc).__name__} : {message[:350]}'


def api(method, path, params=None):
    key = os.getenv('TRELLO_API_KEY', '').strip()
    token = os.getenv('TRELLO_TOKEN', '').strip()
    if not key or not token:
        raise RuntimeError('TRELLO_API_KEY ou TRELLO_TOKEN absent du .env racine')
    response = requests.request(
        method, 'https://api.trello.com/1/' + path.lstrip('/'),
        params={**(params or {}), 'key': key, 'token': token}, timeout=25)
    if not response.ok:
        raise RuntimeError(f'Trello HTTP {response.status_code} ({method} {path.split("?")[0]})')
    return response.json() if response.content else {}


def get_lists():
    lists = api('GET', f'boards/{quote(BOARD, safe="")}/lists', {'filter': 'open', 'fields': 'id,name'})
    return {item['name'].strip().casefold(): item for item in lists}


def list_id(lists, name):
    aliases = {
        'en cours': ('en cours',),
        'a_valider': ('à valider en jeu', 'a valider en jeu'),
        'realise': ('réalisé — code et historique', 'réalisé - code et historique'),
        'bloque': ('bloqué', 'bloque'),
        'idees': ('idées à sélectionner', 'idees a selectionner'),
    }
    for candidate in aliases.get(name, (name,)):
        if candidate.casefold() in lists:
            return lists[candidate.casefold()]['id']
    return None


def git_changes():
    p = subprocess.run(['git', '-C', str(ROOT), 'status', '--porcelain=v1', '-uall'],
                       capture_output=True, text=True, timeout=30, encoding='utf-8', errors='replace')
    if p.returncode:
        raise RuntimeError('Git indisponible : ' + p.stderr[:200])
    paths = []
    for line in p.stdout.splitlines():
        path = line[3:].split(' -> ')[-1].strip('"').replace('\\', '/')
        if path and not path.startswith('tools/agent_lapinous/'):
            paths.append(path)
    return sorted(set(paths))


def replace_section(path, title, body):
    original = path.read_text(encoding='utf-8') if path.exists() else f'# {title}\n'
    section = f'{START}\n{body.rstrip()}\n{END}'
    if START in original and END in original and original.index(START) < original.index(END):
        begin = original.index(START)
        finish = original.index(END) + len(END)
        updated = original[:begin] + section + original[finish:]
    else:
        updated = original.rstrip() + '\n\n' + section + '\n'
    if updated != original:
        path.write_text(updated, encoding='utf-8')
    return updated != original


def inventory():
    lines = ['### Inventaire automatique', '', '| Dossier | Fichiers | Taille |', '|---|---:|---:|']
    for folder in ('assets', 'docs', 'tools'):
        base = ROOT / folder
        if not base.is_dir():
            continue
        files = [p for p in base.rglob('*') if p.is_file() and not (set(p.relative_to(ROOT).parts) & SKIP)]
        size = sum(p.stat().st_size for p in files)
        lines.append(f'| `{folder}/` | {len(files)} | {size / 1048576:.2f} Mo |')
    lines.extend(['', '_Inventaire local uniquement : les images déjà archivées ne sont pas considérées manquantes._'])
    return '\n'.join(lines)


def load_mappings():
    if not CONFIG.exists():
        return []
    data = json.loads(CONFIG.read_text(encoding='utf-8'))
    tasks = data.get('taches', [])
    return [task for task in tasks if isinstance(task, dict) and
            task.get('card_id') and not str(task['card_id']).startswith('REMPLACER_')]


def task_state(todo, card_id):
    marker = f'[trello:{card_id}]'
    for line in todo.splitlines():
        if marker in line:
            match = re.match(r'^\s*[-*]\s*\[([ xX])\]', line)
            if match:
                return 'termine' if match.group(1).lower() == 'x' else 'a_faire'
    return None


def get_cards():
    return api('GET', f'boards/{quote(BOARD, safe="")}/cards',
               {'filter': 'open', 'fields': 'id,name,idList,shortUrl'})


def initialise():
    """Importe les cartes, sans inventer de correspondances de fichiers."""
    if CONFIG.exists():
        current = json.loads(CONFIG.read_text(encoding='utf-8'))
        if any(not str(t.get('card_id', '')).startswith('REMPLACER_') for t in current.get('taches', [])):
            raise RuntimeError('Des liaisons réelles existent déjà : import annulé pour ne pas les écraser')
    cards = get_cards()
    data = {'taches': [{'card_id': card['id'], 'nom': card['name'], 'chemins': []}
                       for card in cards]}
    CONFIG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(cards)} cartes importées dans {CONFIG.name}.')
    print('Renseigne les chemins de chaque carte concernée. Aucun déplacement sans correspondance explicite.')


def update_card(task, changes, todo, lists, apply):
    cid = str(task['card_id'])
    paths = [p.replace('\\', '/') for p in task.get('chemins', []) if isinstance(p, str) and p.strip()]
    if not paths:
        return None
    card = api('GET', f'cards/{quote(cid, safe="")}', {'fields': 'id,name,idList,closed'})
    if card.get('closed'):
        return None
    name = card['name']
    current = card['idList']
    realised = list_id(lists, 'realise')
    ideas = list_id(lists, 'idees')
    validate = list_id(lists, 'a_valider')
    blocked = list_id(lists, 'bloque')
    working = list_id(lists, 'en cours')
    # Ne jamais faire reculer une carte validée, bloquée ou en attente de validation.
    if current in (realised, ideas, blocked):
        return None
    state = task_state(todo, cid)
    relevant = [p for p in changes if any(p == prefix.rstrip('/') or p.startswith(prefix.rstrip('/') + '/') for prefix in paths)]
    target = None
    reason = ''
    if state == 'termine' and current != realised:
        target = validate
        reason = 'tâche cochée dans A_FAIRE.md → À valider en jeu'
    elif relevant and current != validate:
        target = working
        reason = f'{len(relevant)} fichier(s) associé(s) modifié(s) → En cours'
    if not target or target == current:
        return None
    if apply:
        api('PUT', f'cards/{quote(cid, safe="")}', {'idList': target})
        note = f'Lapinous Agent : {reason}.'
        api('POST', f'cards/{quote(cid, safe="")}/actions/comments', {'text': note})
    return f'{name} : {reason}' + ('' if apply else ' [SIMULATION]')


def webhook(channel):
    choices = {
        'bilan': ('DISCORD_WEBHOOK_BILAN',),
        'trello': ('DISCORD_WEBHOOK_TRELLO',),
        'erreurs': ('DISCORD_WEBHOOK_ALERTES', 'DISCORD_WEBHOOK_ERREURS'),
        'images': ('DISCORD_WEBHOOK_CLOUDINARY',),
        'general': ('DISCORD_WEBHOOK_GENERAL',),
    }
    for variable in choices.get(channel, ()):
        value = os.getenv(variable, '').strip()
        if value:
            return value
    return ''


def discord(channel, message):
    url = webhook(channel)
    if not url:
        print(f'Discord {channel} : URL de webhook absente du .env racine')
        return False
    for offset in range(0, len(message), 1800):
        response = requests.post(url, json={'content': message[offset:offset + 1800],
                                            'allowed_mentions': {'parse': []}}, timeout=25)
        if not response.ok:
            raise RuntimeError(f'Discord {channel} : HTTP {response.status_code}')
    return True


def bilan(apply):
    changes = git_changes()
    stamp = dt.datetime.now().astimezone().strftime('%d/%m/%Y %H:%M')
    todo_file, readme_file = ROOT / 'A_FAIRE.md', ROOT / 'readme.md'
    afaire = ('### Suivi automatique du projet\n\n'
              f'_Dernier bilan : {stamp}_\n\n'
              f'Fichiers modifiés ou non suivis par Git : **{len(changes)}**\n\n' +
              ('\n'.join(f'- `{p}`' for p in changes[:50]) if changes else 'Aucun changement détecté.'))
    changed_todo = replace_section(todo_file, 'À faire', afaire)
    changed_readme = replace_section(readme_file, 'Lapinous', inventory())
    todo = todo_file.read_text(encoding='utf-8')
    tasks = load_mappings()
    updates, errors = [], []
    if any(task.get('chemins') for task in tasks):
        try:
            lists = get_lists()
            for task in tasks:
                try:
                    result = update_card(task, changes, todo, lists, apply)
                    if result:
                        updates.append(result)
                except Exception as exc:
                    errors.append(f'Carte {task.get("nom", task.get("card_id", "?"))} : {safe_error(exc)}')
        except Exception as exc:
            errors.append('Chargement Trello : ' + safe_error(exc))
    mode = 'APPLICATION' if apply else 'SIMULATION'
    report = '\n'.join([
        f'# Lapinous — {stamp}', '', f'Trello : {mode}',
        f'Git : {len(changes)} fichier(s) modifié(s)',
        f'README : {"mis à jour" if changed_readme else "inchangé"}',
        f'A_FAIRE : {"mis à jour" if changed_todo else "inchangé"}',
        '', '## Trello', *(updates or ['Aucune carte déplacée. Vérifie les chemins dans liaisons_trello.json.']),
        '', '## Erreurs', *(errors or ['Aucune.'])])
    REPORTS.mkdir(parents=True, exist_ok=True)
    report_file = REPORTS / (dt.datetime.now().strftime('%Y-%m-%d_%H%M%S') + '_bilan.md')
    report_file.write_text(report + '\n', encoding='utf-8')
    print(report)
    discord('bilan', '🐰 **Bilan Lapinous**\n' + report)
    if updates:
        discord('trello', '📋 **Actions Trello**\n' + '\n'.join(updates))
    if errors:
        discord('erreurs', '⚠️ **Erreurs Lapinous**\n' + '\n'.join(errors))
        return 1
    return 0


def main():
    parser = argparse.ArgumentParser(description='Agent local Lapinous')
    parser.add_argument('commande', choices=('bilan', 'test-discord', 'test-trello', 'listes-trello', 'initialiser-trello'))
    parser.add_argument('--appliquer', action='store_true', help='Déplacer réellement les cartes Trello')
    args = parser.parse_args()
    if args.commande == 'test-discord':
        for channel in ('general', 'bilan', 'trello', 'erreurs', 'images'):
            if webhook(channel):
                discord(channel, f'🐰 Test Lapinous Agent : salon {channel} opérationnel.')
        return 0
    if args.commande == 'test-trello':
        me = api('GET', 'members/me', {'fields': 'username'})
        print('Connexion Trello :', me['username'])
        return 0
    if args.commande == 'listes-trello':
        for item in get_lists().values():
            print(f'{item["name"]} : {item["id"]}')
        return 0
    if args.commande == 'initialiser-trello':
        initialise()
        return 0
    return bilan(args.appliquer)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        error = safe_error(exc)
        print('ERREUR : ' + error, file=sys.stderr)
        try:
            discord('erreurs', '⚠️ Agent Lapinous : ' + error)
        except Exception:
            pass
        sys.exit(1)
