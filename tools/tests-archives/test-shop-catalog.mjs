import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const data = JSON.parse(fs.readFileSync('lapinous-shop.json', 'utf8'));
const source = fs.readFileSync('assets/js/shop.js', 'utf8');
/** Charge le vrai module avec une réponse JSON locale, sans réseau ni achat. */
async function load(catalog) {
  const window = {};
  vm.runInNewContext(source, { window, console: { warn() {} }, document: { documentElement: { classList: { contains: () => false } } },
    fetch: async () => ({ ok: true, json: async () => structuredClone(catalog) }) });
  await window.LapinousShopReady; return window.LapinousShop;
}
assert.ok(data.items.every(item => item.category !== 'prepared'));
assert.ok(data.recipes.every(recipe => 'image' in recipe && recipe.ingredients && recipe.item));
const shop = await load(data);
assert.ok(shop.getCatalog());
assert.equal(shop.getCatalog().recipesEnabled, data.recipesEnabled);
assert.ok(shop.getCatalog().apothecary.greeting);
assert.doesNotThrow(() => shop.validateCatalog({ ...data, recipesEnabled: true }));
assert.throws(() => shop.validateCatalog({ ...data, recipesEnabled: true, recipes: [{ ...data.recipes[0], ingredients: { missing_ingredient: 1 } }] }), /Recette incorrecte/);
assert.throws(() => shop.validateCatalog({ ...data, items: [{ ...data.items[0], price: 0 }] }), /Article incorrect/);
const invalid = await load({ items: [] });
assert.equal(invalid.init({}), false);
console.log('Catalogue : recettes désactivées acceptées, recettes actives et prix contrôlés, initialisation sans catalogue protégée.');
