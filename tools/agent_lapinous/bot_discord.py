"""Bot interactif facultatif Lapinous (slash commands).

Le bot n'exécute aucune synchronisation ni commande système depuis Discord.
Les bilans planifiés sont envoyés séparément par les webhooks de agent.py.
"""
import os
from pathlib import Path

import discord
from discord import app_commands
from dotenv import load_dotenv

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
load_dotenv(ROOT / '.env')
load_dotenv(HERE / '.env', override=False)
TOKEN = os.getenv('DISCORD_BOT_TOKEN', '').strip()
REPORTS = HERE / 'rapports'

class LapinousBot(discord.Client):
    def __init__(self):
        super().__init__(intents=discord.Intents.default())
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()

bot = LapinousBot()

@bot.event
async def on_ready():
    print(f'Bot Lapinous connecté : {bot.user}')

@bot.tree.command(name='statut', description='Vérifier que le bot Lapinous est connecté')
async def statut(interaction: discord.Interaction):
    await interaction.response.send_message('🐰 Le bot Lapinous est connecté.', ephemeral=True)

@bot.tree.command(name='bilan', description='Lire le dernier bilan enregistré')
async def bilan(interaction: discord.Interaction):
    reports = sorted(REPORTS.glob('*_bilan.md')) if REPORTS.exists() else []
    if not reports:
        await interaction.response.send_message('Aucun bilan enregistré pour le moment.', ephemeral=True)
        return
    latest = reports[-1]
    content = latest.read_text(encoding='utf-8')
    # Fichier joint pour ne pas dépasser la limite de longueur des messages Discord.
    await interaction.response.send_message(
        f'📋 Dernier bilan : {latest.name}',
        file=discord.File(latest),
        ephemeral=True,
    )

@bot.tree.command(name='images', description='Lire le dernier rapport des images')
async def images(interaction: discord.Interaction):
    reports = sorted(REPORTS.glob('*_images.md')) if REPORTS.exists() else []
    if not reports:
        await interaction.response.send_message('Aucun rapport images enregistré.', ephemeral=True)
        return
    latest = reports[-1]
    await interaction.response.send_message(
        f'🖼️ Dernier rapport : {latest.name}',
        file=discord.File(latest), ephemeral=True,
    )

if __name__ == '__main__':
    if not TOKEN:
        raise SystemExit('DISCORD_BOT_TOKEN absent du .env à la racine du projet.')
    bot.run(TOKEN)
