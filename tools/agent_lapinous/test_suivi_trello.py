"""Tests isolés : faux Trello/Discord, dépôts Git jetables conservés sans purge."""
import sys
sys.dont_write_bytecode = True
import contextlib
import io
import json
import re
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import agent
import suivi_trello as suivi

CID = 'a' * 24
LISTS = {name: {'id': ident, 'name': name} for name, ident in [
    ('en cours', 'working'), ('à valider en jeu', 'validate'),
    ('réalisé — code et historique', 'done'), ('bloqué', 'blocked'), ('idées à sélectionner', 'ideas')]}
TASK = {'card_id': CID, 'nom': 'Sauvegardes', 'automatique': True,
        'chemins': ['shared.js'], 'preuves': [{'chemin': 'shared.js', 'motifs': ['saveGame']}]}
TODO = '- [ ] Sauvegardes [trello:' + CID + ']'


def scratch():
    parent = Path(__file__).resolve().parents[2] / '.cloudinary-local' / 'tests-agent'
    parent.mkdir(parents=True, exist_ok=True)
    return Path(tempfile.mkdtemp(dir=parent))


def run_git(root, *args):
    result = subprocess.run(['git', '-C', str(root), *args], capture_output=True, check=True)
    return result.stdout.decode('utf-8').strip()


def repo():
    root = scratch()
    run_git(root, 'init')
    run_git(root, 'config', 'user.name', 'Test local sans réseau')
    run_git(root, 'config', 'user.email', 'test@localhost')
    (root / '.gitignore').write_text('.cloudinary-local/\n', encoding='utf-8')
    (root / 'shared.js').write_text('saveGame = 1;\nbossPower = 1;\n', encoding='utf-8')
    (root / 'A_FAIRE.md').write_text(TODO, encoding='utf-8')
    (root / 'readme.md').write_text('# Test\n', encoding='utf-8')
    run_git(root, 'add', '.')
    run_git(root, 'commit', '-m', 'base de test')
    return root


class Decisions(unittest.TestCase):
    def test_ambiguous_list_aliases_rejected(self):
        lists = {**LISTS, 'a valider en jeu': {'id': 'other', 'name': 'A valider en jeu'}}
        with self.assertRaises(ValueError):
            agent.list_id(lists, 'a_valider')

    def plan(self, todo=TODO, changes=None, current='todo', task=TASK):
        return agent.plan_card(task, changes or {}, todo, LISTS,
                               {'id': CID, 'name': 'Sauvegardes', 'idList': current, 'closed': False})

    def test_shared_file_without_relevant_lines(self):
        changes = {'shared.js': {'lignes': ['bossPower = 2;'], 'existe': True}}
        self.assertIsNone(self.plan(changes=changes)['vers'])

    def test_relevant_lines(self):
        changes = {'shared.js': {'lignes': ['saveGame = 2;'], 'existe': True}}
        self.assertEqual(self.plan(changes=changes)['vers'], 'working')

    def test_subtasks_do_not_finish_parent(self):
        todo = TODO + '\n- [x] Code [trello:' + CID + ':code:export]\n- [ ] Téléphone [trello:' + CID + ':manuel:mobile]'
        plan = self.plan(todo=todo)
        self.assertIsNone(plan['vers'])
        self.assertEqual((plan['suivi']['cochees'], plan['suivi']['total']), (1, 2))

    def test_checked_parent_with_pending_code_is_not_ready(self):
        todo = TODO.replace('[ ]', '[x]') + '\n- [ ] Code [trello:' + CID + ':code:export]'
        self.assertIsNone(self.plan(todo=todo)['vers'])

    def test_checked_parent_goes_only_to_validation(self):
        todo = TODO.replace('[ ]', '[x]') + '\n- [x] Code [trello:' + CID + ':code:export]\n- [ ] Manuel [trello:' + CID + ':manuel:mobile]'
        self.assertEqual(self.plan(todo=todo)['vers'], 'validate')

    def test_protected_lists(self):
        for current in ('done', 'validate', 'blocked', 'ideas'):
            self.assertIsNone(self.plan(todo=TODO.replace('[ ]', '[x]'), current=current)['vers'])

    def test_legacy_file_mapping_alone_is_not_evidence(self):
        task = {**TASK, 'preuves': []}
        self.assertIsNone(self.plan(task=task, changes={'shared.js': {'lignes': ['saveGame'], 'existe': True}})['vers'])

    def test_ambiguous_markers_rejected(self):
        with self.assertRaises(ValueError):
            suivi.validate_tasks([TASK], TODO + '\n' + TODO)

    def test_duplicate_card_rejected(self):
        with self.assertRaises(ValueError):
            suivi.validate_tasks([TASK, TASK], TODO)

    def test_bad_proof_rejected(self):
        with self.assertRaises(ValueError):
            suivi.validate_tasks([{**TASK, 'preuves': [{'chemin': '../other.js', 'dedie': True}]}], TODO)

    def test_api_readonly_and_no_card_creation(self):
        with patch.object(agent.requests, 'request', side_effect=AssertionError('Réseau interdit')):
            with self.assertRaises(RuntimeError):
                agent.api('PUT', 'cards/' + CID, {'idList': 'working'})
            with patch.object(agent, 'REMOTE_WRITES', True):
                with self.assertRaises(RuntimeError):
                    agent.api('POST', 'cards', {'name': 'Interdit'})

    def test_never_apply_realised(self):
        with patch.object(agent, 'api', side_effect=AssertionError('Aucune écriture')):
            with self.assertRaises(ValueError):
                agent.apply_plan({'id': CID, 'vers': 'done'}, LISTS)

    def test_discord_failure_does_not_stop_others(self):
        called = []
        def fail():
            called.append('first')
            raise RuntimeError('échec fictif')
        errors = agent.notify_all([('a', fail), ('b', lambda: called.append('second') or False),
                                   ('c', lambda: called.append('third') or True)])
        self.assertEqual(called, ['first', 'second', 'third'])
        self.assertEqual(len(errors), 2)


class GitHistory(unittest.TestCase):
    def test_accents_and_renames(self):
        root = repo()
        name = 'sauvegarde été.json'
        (root / name).write_text('{}', encoding='utf-8')
        self.assertIn(name, suivi.dirty_paths(root))
        run_git(root, 'add', '.')
        run_git(root, 'commit', '-m', 'accent')
        run_git(root, 'mv', name, 'nouveau été.json')
        self.assertTrue({name, 'nouveau été.json'}.issubset(suivi.dirty_paths(root)))

    def test_commits_and_uncommitted_changes_are_not_repeated(self):
        root = repo()
        state_file = root / '.cloudinary-local' / 'trello-state.json'
        changes, state, _ = suivi.collect(root, state_file, [TASK])
        self.assertFalse(changes)
        state_file.parent.mkdir()
        state_file.write_text(json.dumps(state), encoding='utf-8')
        (root / 'shared.js').write_text('saveGame = 2;\nbossPower = 1;\n', encoding='utf-8')
        run_git(root, 'add', '.')
        run_git(root, 'commit', '-m', 'commit pertinent')
        changes, state, _ = suivi.collect(root, state_file, [TASK])
        self.assertTrue(suivi.evidence(TASK, changes))
        state_file.write_text(json.dumps(state), encoding='utf-8')
        self.assertFalse(suivi.collect(root, state_file, [TASK])[0])
        (root / 'shared.js').write_text('saveGame = 3;\nbossPower = 1;\n', encoding='utf-8')
        changes, state, _ = suivi.collect(root, state_file, [TASK])
        self.assertTrue(changes)
        state_file.write_text(json.dumps(state), encoding='utf-8')
        run_git(root, 'add', '.')
        run_git(root, 'commit', '-m', 'commit de travail deja traite')
        self.assertFalse(suivi.collect(root, state_file, [TASK])[0])

    def test_explicit_first_commit_and_simulation_no_checkpoint(self):
        root = repo()
        base = run_git(root, 'rev-parse', 'HEAD')
        (root / 'shared.js').write_text('saveGame = 2;\n', encoding='utf-8')
        run_git(root, 'add', '.')
        run_git(root, 'commit', '-m', 'avant premier bilan')
        file = root / '.cloudinary-local' / 'trello-state.json'
        self.assertFalse(suivi.collect(root, file, [TASK])[0])
        self.assertTrue(suivi.evidence(TASK, suivi.collect(root, file, [TASK], since=base)[0]))
        self.assertFalse(file.exists())

    def test_agent_sources_are_included(self):
        root = repo()
        file = root / 'tools/agent_lapinous/nouveau.py'
        file.parent.mkdir(parents=True)
        file.write_text('pass\n', encoding='utf-8')
        self.assertIn('tools/agent_lapinous/nouveau.py', suivi.dirty_paths(root))


class FullSimulation(unittest.TestCase):
    def test_applied_fake_bilan_records_checkpoint_despite_discord_failure(self):
        root = repo()
        state_file = root / '.cloudinary-local/state.json'
        reports = root / 'test-reports'
        (root / 'shared.js').write_text('saveGame = 2;\n', encoding='utf-8')
        calls = []
        notifications = []
        def notification(channel, message):
            notifications.append(channel)
            if channel == 'bilan':
                raise RuntimeError('Panne fictive')
            return True
        with patch.object(agent, 'ROOT', root), patch.object(agent, 'STATE_FILE', state_file), \
             patch.object(agent, 'REPORTS', reports), patch.object(agent, 'load_mappings', return_value=[TASK]), \
             patch.object(agent, 'get_lists', return_value=LISTS), \
             patch.object(agent, 'get_cards', return_value=[{'id': CID, 'name': 'Sauvegardes', 'idList': 'todo'}]), \
             patch.object(agent, 'api', side_effect=lambda *args: calls.append(args) or {}), \
             patch.object(agent, 'cloudinary_report', return_value=('Fictif', True)), \
             patch.object(agent, 'discord', side_effect=notification), \
             patch.object(agent, 'send_report_file', return_value=True), \
             patch.object(agent, 'quarantine_discord_summary', return_value='Fictif'), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(agent.bilan(True), 1)
        self.assertTrue(state_file.exists())
        self.assertIn('trello', notifications)
        self.assertIn('images', notifications)
        self.assertEqual([c[0] for c in calls], ['PUT', 'POST'])
        self.assertFalse(agent.REMOTE_WRITES)
        self.assertFalse(suivi.collect(root, state_file, [TASK])[0].get('shared.js'))

    def test_full_simulation_cannot_write_or_notify(self):
        root = repo()
        before = {str(p.relative_to(root)): p.read_bytes() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}
        card = {'id': CID, 'name': 'Sauvegardes', 'idList': 'todo', 'closed': False}
        with patch.object(agent, 'ROOT', root), patch.object(agent, 'STATE_FILE', root / '.cloudinary-local/state.json'), \
             patch.object(agent, 'load_mappings', return_value=[TASK]), \
             patch.object(agent, 'get_lists', return_value=LISTS), patch.object(agent, 'get_cards', return_value=[card]), \
             patch.object(agent, 'cloudinary_report', return_value=('Rapport fictif', True)), \
             patch.object(agent, 'discord', side_effect=AssertionError('Discord interdit')), \
             patch.object(agent.requests, 'request', side_effect=AssertionError('Réseau interdit')), \
             patch.object(Path, 'write_text', side_effect=AssertionError('Écriture interdite')), \
             patch.object(Path, 'mkdir', side_effect=AssertionError('Création interdite')), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(agent.bilan(False), 0)
        after = {str(p.relative_to(root)): p.read_bytes() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}
        self.assertEqual(before, after)

    def test_simulation_with_ready_parent_still_does_not_apply(self):
        root = repo()
        (root / 'A_FAIRE.md').write_text(TODO.replace('[ ]', '[x]'), encoding='utf-8')
        with patch.object(agent, 'ROOT', root), patch.object(agent, 'STATE_FILE', root / '.cloudinary-local/state.json'), \
             patch.object(agent, 'load_mappings', return_value=[TASK]), patch.object(agent, 'get_lists', return_value=LISTS), \
             patch.object(agent, 'get_cards', return_value=[{'id': CID, 'name': 'Sauvegardes', 'idList': 'working'}]), \
             patch.object(agent, 'cloudinary_report', return_value=('Fictif', True)), \
             patch.object(agent, 'apply_plan', side_effect=AssertionError('Trello interdit')), \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(agent.bilan(False), 0)
            self.assertIn('Deplacements proposes : 1', output.getvalue())


if __name__ == '__main__':
    unittest.main(verbosity=2)
