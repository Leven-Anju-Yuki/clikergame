import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('assets/js/lapidoku.js','utf8'),ctx);
const api=ctx.LapinousSudoku;
for(const level of api.levels){
  const puzzle=api.create(level.index);
  assert.equal(puzzle.board.length,level.size**2);
  assert.equal(api.solutions(puzzle.board,level),1,'Solution unique au niveau '+level.index);
  assert(!api.conflicts(puzzle.solution,level).some(Boolean));
  assert(puzzle.board.some(v=>!v));
  assert(puzzle.board.every((v,i)=>!v||v===puzzle.solution[i]));
  const duplicate=puzzle.solution.slice();duplicate[1]=duplicate[0];
  assert(api.conflicts(duplicate,level).some(Boolean));
  assert.deepEqual(api.create(level.index).board,puzzle.board);
}
assert.throws(()=>api.create(99));
console.log('Lapidoku : 12 niveaux 4×4, 6×6 et 9×9, solutions uniques, chiffres fixes et conflits vérifiés.');
