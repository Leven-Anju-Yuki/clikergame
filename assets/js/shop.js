/* Magasin : catalogue extensible et opérations sans argent réel. */
(() => {
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    let catalog = null;
    function validateCatalog(data) {
        if (!data || !Array.isArray(data.items) || !data.cashier) throw new Error('Catalogue incorrect');
        const ids = new Set();
        for (const item of data.items) {
            if (!item.id || ids.has(item.id) || !Number.isSafeInteger(item.price) || item.price <= 0) throw new Error('Article incorrect');
            if (item.kind !== 'reset' && (item.kind !== 'restore' || !['food','energy','cleanliness'].includes(item.stat))) throw new Error('Effet incorrect');
            ids.add(item.id);
        }
        return data;
    }
    function resetPlan(progress, index) {
        if (!Array.isArray(progress.attackLevels) || !Number.isInteger(index) || index < 0 || index >= progress.attackLevels.length) throw new Error('Choisis une compétence.');
        const levels = [progress.attackLevels[index]];
        if (levels.some(level => !Number.isInteger(level) || level < 0 || level > 5)) throw new Error('Progression incorrecte.');
        return {index, refund: levels.reduce((sum, level) => sum + level, 0), affected: levels.filter(level => level > 0).length};
    }
    function transact(game, progress, item, index) {
        if (!Number.isSafeInteger(item?.price) || item.price <= 0) throw new Error('Prix incorrect.');
        let plan;
        if (item.kind === 'restore') {
            if (!['food','energy','cleanliness'].includes(item.stat)) throw new Error('Article incorrect.');
            const count = game.inventory?.[item.id] || 0;
            if (!Number.isSafeInteger(count) || count < 0 || count >= Number.MAX_SAFE_INTEGER) throw new Error('Stock incorrect.');
        } else if (item.kind === 'reset') {
            plan = resetPlan(progress, index);
            if (!plan.refund) throw new Error('Aucun fragment à récupérer ici.');
            if (!Number.isSafeInteger(progress.attackFragments) || progress.attackFragments < 0 || !Number.isSafeInteger(progress.attackFragments + plan.refund)) throw new Error('Solde de fragments incorrect.');
        } else throw new Error('Article indisponible.');
        if (!Number.isSafeInteger(game.carrots) || game.carrots < item.price) throw new Error('Tu n’as pas assez de carottes.');
        // Valider tous les effets avant de dépenser : aucun débit en cas d’échec.
        game.carrots -= item.price;
        if (plan) {
            progress.attackLevels = progress.attackLevels.map((level, i) => i === index ? 0 : level);
            progress.attackFragments += plan.refund;
            if (progress.attackTraining) {
                progress.attackTraining.points = progress.attackLevels[0];
                progress.attackTraining.bonus = progress.attackLevels[0];
                progress.attackTraining.completed = progress.attackLevels[0] >= 5;
            }
        } else {
            if (!game.inventory) game.inventory = {};
            game.inventory[item.id] = (game.inventory[item.id] || 0) + 1;
        }
        return plan ? `${plan.refund} fragment${plan.refund > 1 ? 's' : ''} récupéré${plan.refund > 1 ? 's' : ''}.` : 'Article ajouté à ton inventaire !';
    }
    function checkout(game, progressByKey, items, lines) {
        if (!Array.isArray(lines) || !lines.length) throw new Error('Ton panier est vide.');
        const workingGame = { carrots: game.carrots, inventory: JSON.parse(JSON.stringify(game.inventory || {})) }, working = Object.create(null), seen = new Set(), results = [];
        for (const line of lines) {
            const item = items.find(item => item.id === line.id);
            if (!item || (item.kind === 'reset' && (!game.ownedSpecies?.includes(line.target) || !Object.prototype.hasOwnProperty.call(progressByKey,line.target)))) throw new Error('Un article ou un lapin du panier n’est plus disponible.');
            const signature = JSON.stringify([line.target,line.id,item.kind === 'reset' ? line.index : null]);
            if (item.kind === 'reset' && seen.has(signature)) throw new Error('Cet article est déjà prévu pour ce lapin.');
            seen.add(signature);
            if (item.kind === 'reset' && !Object.prototype.hasOwnProperty.call(working,line.target)) working[line.target] = JSON.parse(JSON.stringify(progressByKey[line.target]));
            results.push(transact(workingGame,working[line.target],item,line.index));
        }
        // Le panier entier est validé sur des copies avant tout débit ou modification réelle.
        const total = game.carrots - workingGame.carrots;
        for (const key of Object.keys(working)) Object.assign(progressByKey[key],working[key]);
        game.carrots = workingGame.carrots;
        game.inventory = workingGame.inventory;
        return {total, count:lines.length, results};
    }
    function useConsumable(game, progress, item) {
        if (item?.kind !== 'restore' || !['food','energy','cleanliness'].includes(item.stat)) throw new Error('Ce produit ne peut pas être consommé.');
        const count = game.inventory?.[item.id];
        if (!Number.isSafeInteger(count) || count < 1) throw new Error('Cet article est épuisé.');
        if (!Number.isFinite(progress[item.stat]) || progress[item.stat] >= 100) throw new Error('Cette barre est déjà pleine.');
        progress[item.stat] = 100;
        game.inventory[item.id] = count - 1;
    }
    window.LapinousShopReady = fetch('./lapinous-shop.json').then(response => {
        if (!response.ok) throw new Error('Catalogue introuvable');
        return response.json();
    }).then(data => { catalog = validateCatalog(data); }).catch(error => { console.warn('Magasin indisponible', error); });
    function init(api) {
        // Boutique en travaux : réservée au mode administrateur local.
        if (!document.documentElement.classList.contains("local-admin")) return;
        if (catalog) [catalog.cashier.presentation,catalog.cashier.thanks].forEach(src => { const preload = new Image(); preload.src = src; });
        const dialog = document.createElement('dialog');
        dialog.id='shopDialog';dialog.className='shop-dialog';dialog.setAttribute('aria-labelledby','shopTitle');
        dialog.innerHTML=`<div class="shop-layout"><aside class="shop-cashier"><img id="shopCashierImage" alt="Lapin caissier"><p id="shopCashierSpeech" aria-live="polite"></p></aside><section class="shop-panel"><header class="shop-header"><div><small>LE COMPTOIR DU TERRIER</small><h2 id="shopTitle">Magasin</h2></div><button type="button" class="shop-close" aria-label="Fermer le magasin">×</button></header><div class="shop-wallet" id="shopWallet"></div><div class="shop-tabs" role="group" aria-label="Rayons du magasin"><button type="button" data-shop-tab="items">Articles</button><button type="button" data-shop-tab="cart">Panier (0)</button><button type="button" data-shop-tab="inventory">Inventaire</button><button type="button" data-shop-tab="carrots">Carottes</button></div><div class="shop-body" id="shopBody"></div><div class="shop-cart-summary" id="shopCartSummary"></div><p id="shopMessage" class="shop-message" role="status" aria-live="polite"></p></section></div>`;
        document.body.appendChild(dialog);
        const button=document.createElement('button');button.id='shopButton';button.className='shop-trigger';button.type='button';button.textContent='🛍️';button.title='Magasin';button.setAttribute('aria-label','Ouvrir le magasin');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','shopDialog');document.body.appendChild(button);
        const content=dialog.querySelector('#shopBody'),message=dialog.querySelector('#shopMessage'),speech=dialog.querySelector('#shopCashierSpeech'),image=dialog.querySelector('#shopCashierImage');
        let tab='items',target='',chosenIndex=0,cart=[],cartGame=api.game(),thankTimer;
        const owned=()=> (api.game().ownedSpecies||[]).filter(key=>api.species()[key]);
        const name=key=>api.game().speciesNames?.[key]||api.species()[key]?.name||'Lapin';
        const portrait=key=>api.species()[key]?.faceImg||api.species()[key]?.coteImg||'./assets/img/species/mystery.svg';
        const getItem=id=>catalog.items.find(item=>item.id===id);
        const total=()=>cart.reduce((sum,line)=>sum+(getItem(line.id)?.price||0),0);
        const alreadyAdded=(item,key,index)=>item.kind==='reset'&&cart.some(line=>line.id===item.id&&line.target===key&&(item.kind!=='reset'||line.index===index));
        function cashier(thanks=false) {
            if(!catalog)return;clearTimeout(thankTimer);
            image.src=thanks?catalog.cashier.thanks:catalog.cashier.presentation;
            image.classList.toggle('shop-cashier-flipped',!thanks&&catalog.cashier.flipPresentation);
            image.alt=thanks?'Le lapin caissier te remercie':'Le lapin caissier présente les articles';
            speech.textContent=thanks?'Merci pour tes achats ! Prends bien soin de tes compagnons ✨':'Bienvenue ! Choisis tes articles, puis retrouve-les dans ton panier.';
            if(thanks)thankTimer=setTimeout(()=>cashier(false),4000);
        }
        function render() {
            const game=api.game(),keys=owned();
            if(cartGame!==game){cart=[];cartGame=game;}
            if(!keys.includes(target))target=keys.includes(game.species)?game.species:keys[0];
            dialog.querySelector('#shopWallet').textContent=`🥕 ${game.carrots} carottes disponibles`;
            dialog.querySelector('[data-shop-tab="cart"]').textContent=`Panier (${cart.length})`;
            dialog.querySelectorAll('[data-shop-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.shopTab===tab);b.setAttribute('aria-pressed',String(b.dataset.shopTab===tab));});
            const summary=dialog.querySelector('#shopCartSummary');summary.hidden=tab==='cart'||tab==='inventory';
            summary.innerHTML=`<span>🛒 <b>${cart.length}</b> article${cart.length>1?'s':''} · <b>${total()} 🥕</b></span><button type="button" data-shop-tab="cart" ${!cart.length?'disabled':''}>Voir le panier</button>`;
            if(tab==='inventory') {
                const active=game.species, pr=api.progress(active);
                content.innerHTML=`<h3 class="shop-cart-title">Ton inventaire</h3><p class="shop-cart-note">Utiliser un soin sur <b>${escape(name(active))}</b>, ton lapin actif.</p><div class="shop-needs"><span>🥕 ${Math.round(pr.food)} %</span><span>😴 ${Math.round(pr.energy)} %</span><span>🫧 ${Math.round(pr.cleanliness)} %</span></div><div class="shop-items">${catalog.items.filter(item=>item.kind==='restore').map(item=>{
                    const count=game.inventory?.[item.id]||0;
                    return `<article class="shop-item"><div class="shop-product-visual"><img src="${escape(item.image||'./assets/img/species/mystery.svg')}" alt="${escape(item.name)}"></div><h3>${escape(item.emoji)} ${escape(item.name)}</h3><p>Stock : <b>${count}</b></p><button type="button" data-shop-use="${escape(item.id)}" ${!count||pr[item.stat]>=100?'disabled':''}>${pr[item.stat]>=100?'Barre déjà pleine':!count?'Stock épuisé':`Utiliser sur ${escape(name(active))}`}</button></article>`;
                }).join('')}</div>`;
                return;
            }
            if(tab==='carrots'){content.innerHTML='<section class="shop-coming"><span>🥕</span><h3>Des carottes pour tes aventures</h3><p>Les achats avec de l’argent réel ne sont pas encore disponibles.</p><p>Gagne tes carottes en jouant et en affrontant les boss.</p></section>';return;}
            if(tab==='cart') {
                if(!cart.length){content.innerHTML='<section class="shop-coming"><span>🛒</span><h3>Ton panier est vide</h3><p>Ajoute des articles pour les lapins de ton choix.</p><button type="button" class="shop-cart-button" data-shop-tab="items">Choisir des articles</button></section>';return;}
                content.innerHTML=`<h3 class="shop-cart-title">Tes achats</h3><p class="shop-cart-note">Les soins seront rangés dans ton inventaire. Les extracteurs agiront sur les compétences choisies.</p><div class="shop-cart-lines">${cart.map((line,index)=>{
                    const item=getItem(line.id);let detail='Ajouté à l’inventaire · à utiliser sur le lapin actif de ton choix';
                    if(item.kind==='reset'){const pr=api.progress(line.target);detail=`${api.technique(line.target,line.index).name} : ${resetPlan(pr,line.index).refund} fragments récupérés, compétence à 0/5. Les autres restent intactes.`;}
                    return `<article class="shop-cart-line"><img src="${escape(item.image||'./assets/img/species/mystery.svg')}" alt=""><div><strong>${escape(item.emoji)} ${escape(item.name)}</strong><span>${item.kind==='reset'?`Pour ${escape(name(line.target))}`:'Pour ton inventaire'}</span><small>${escape(detail)}</small></div><b>${item.price} 🥕</b><button type="button" data-shop-remove="${index}" aria-label="Retirer ${escape(item.name)}">Retirer</button></article>`;
                }).join('')}</div><section class="shop-cart-payment"><p>Total : <b>${total()} 🥕</b></p>${total()>game.carrots?'<p class="shop-cart-note">Tu n’as pas assez de carottes pour ce panier.</p>':''}<div class="shop-confirm-actions"><button type="button" data-shop-pay ${total()>game.carrots?'disabled':''}>Confirmer et payer ${total()} 🥕</button><button type="button" data-shop-tab="items">Continuer mes achats</button></div></section>`;return;
            }
            if(!target){content.innerHTML='<p>Adopte un compagnon pour choisir des articles.</p>';return;}
            const pr=api.progress(target);
            if(!Number.isInteger(chosenIndex)||chosenIndex>=pr.attackLevels.length)chosenIndex=0;
            const selector=`<section class="shop-rabbit-picker"><h3>Extracteur : pour quel lapin ?</h3><div class="shop-rabbit-grid" role="group" aria-label="Choisir le lapin destinataire">${keys.map(key=>`<button type="button" class="shop-rabbit-choice ${key===target?'selected':''}" data-shop-rabbit="${escape(key)}" aria-pressed="${key===target}"><img src="${escape(portrait(key))}" alt=""><strong>${escape(name(key))}</strong><small>Niveau ${api.progress(key).currentLevel||1}</small></button>`).join('')}</div></section>`;
            content.innerHTML=`<p class="shop-cart-note">Les soins se conservent dans ton inventaire, pour le lapin actif de ton choix.</p><div class="shop-needs"><span>🥕 ${Math.round(pr.food)} %</span><span>😴 ${Math.round(pr.energy)} %</span><span>🫧 ${Math.round(pr.cleanliness)} %</span><span>💎 ${pr.attackFragments} fragments</span></div><div class="shop-items">${catalog.items.map(item=>{
                const reset=item.kind==='reset',plan=reset?resetPlan(pr,chosenIndex):null;
                const full=false,inCart=alreadyAdded(item,target,chosenIndex);
                const unavailable=full||inCart||(reset&&!plan.refund);
                const skills=reset?`${selector}<label>Compétence à réinitialiser<select id="shopSkill">${pr.attackLevels.map((level,index)=>`<option value="${index}" ${chosenIndex===index?'selected':''}>${escape(api.technique(target,index).name)} · ${level}/5</option>`).join('')}</select></label><small>${plan.refund} fragments récupérables sur cette compétence, pour ce lapin.</small>`:'';
                return `<article class="shop-item">${item.image ? `<div class="shop-product-visual"><img src="${escape(item.image)}" alt="${escape(item.name)}" loading="lazy"></div>` : `<span class="shop-item-icon" aria-hidden="true">${escape(item.emoji)}</span>`}<h3>${escape(item.name)}</h3><p>${escape(item.description)}</p>${skills}<button type="button" data-shop-add="${escape(item.id)}" ${unavailable?'disabled':''}>${full?'Barre déjà pleine':inCart?'✓ Au panier':`${item.price} 🥕 · Ajouter au panier`}</button></article>`;
            }).join('')}</div>`;
        }
        function open() {
            if(!catalog){api.toast('Le catalogue n’a pas pu charger.','warn');return;}
            if(!owned().length){api.toast('Adopte un compagnon avant de visiter le magasin.','warn');return;}
            if(api.inCombat()){api.toast('Termine le combat avant de visiter le magasin.','warn');return;}
            target=api.game().species;tab='items';chosenIndex=0;message.textContent='';cashier();render();if(!dialog.open)dialog.showModal();
        }
        window.openLapinousShop=open;button.addEventListener('click',open);
        dialog.querySelector('.shop-close').addEventListener('click',()=>dialog.close());
        dialog.addEventListener('close',()=>{clearTimeout(thankTimer);button.focus();});
        dialog.addEventListener('change',event=>{if(event.target.id==='shopSkill'){chosenIndex=Number(event.target.value);render();}});
        dialog.addEventListener('error',event=>{if(event.target.matches('img')&&event.target.getAttribute('src')!=='./assets/img/species/mystery.svg')event.target.src='./assets/img/species/mystery.svg';},true);
        dialog.addEventListener('click',event=>{
            const clicked=event.target.closest('button');if(!clicked||clicked.disabled)return;
            if(clicked.dataset.shopTab){tab=clicked.dataset.shopTab;message.textContent='';render();}
            if(clicked.dataset.shopRabbit){target=clicked.dataset.shopRabbit;chosenIndex=0;message.textContent='';render();content.querySelector('.shop-rabbit-choice.selected')?.focus();}
            if(clicked.dataset.shopAdd){
                const item=getItem(clicked.dataset.shopAdd);
                if(!item||alreadyAdded(item,target,chosenIndex))return;
                const pr=api.progress(target);
                
                if(item.kind==='reset'&&!resetPlan(pr,chosenIndex).refund)return;
                cart.push({id:item.id,target:item.kind==='reset'?target:null,index:item.kind==='reset'?chosenIndex:null});
                render();message.textContent=`${item.name} ajouté${item.kind==='reset'?` pour ${name(target)}`:' pour ton inventaire'}.`;
                dialog.querySelector('#shopCartSummary button').focus();
            }
            if(clicked.hasAttribute('data-shop-remove')){cart.splice(Number(clicked.dataset.shopRemove),1);render();content.querySelector('button')?.focus();}
            if(clicked.dataset.shopUse){
                try {
                    if(api.inCombat()||cartGame!==api.game())throw new Error('Rouvre le magasin après le combat ou le changement de partie.');
                    const active=api.game().species;
                    if(!owned().includes(active))throw new Error('Choisis un compagnon actif.');
                    useConsumable(api.game(),api.progress(active),getItem(clicked.dataset.shopUse));
                    api.save();api.refresh();render();message.textContent=`Soin utilisé sur ${name(active)} ! Sa barre est pleine.`;
                    content.querySelector('[data-shop-use]')?.focus();
                }catch(error){message.textContent=error.message;}
            }
            if(clicked.hasAttribute('data-shop-pay')){
                try{
                    if(api.inCombat()||cartGame!==api.game())throw new Error('La partie a changé. Rouvre le magasin avant de payer.');
                    const progressByKey=Object.create(null);
                    for(const line of cart){if(getItem(line.id)?.kind!=='reset')continue;if(!owned().includes(line.target))throw new Error('Un lapin du panier n’est plus disponible.');progressByKey[line.target]=api.progress(line.target);}
                    const result=checkout(api.game(),progressByKey,catalog.items,cart);
                    cart=[];api.save();api.refresh();api.sound('purchase');render();cashier(true);
                    message.textContent=`Merci ! ${result.count} article${result.count>1?'s':''} acheté${result.count>1?'s':''} pour ${result.total} carottes.`;
                    content.querySelector('button')?.focus();
                }catch(error){message.textContent=error.message;}
            }
        });
    }
    window.LapinousShop={init,transact,resetPlan,validateCatalog,checkout,useConsumable};
})();
