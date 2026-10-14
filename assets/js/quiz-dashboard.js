/* Éditeur du quiz : les mêmes données servent au jeu et au dashboard. */
document.addEventListener('DOMContentLoaded',async()=>{
  if(!['localhost','127.0.0.1','::1','[::1]'].includes(location.hostname))return;
  const data=await window.LapinousQuiz.ready;if(!data)return;
  let working=structuredClone(data);
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const accordion=document.createElement('details');accordion.className='dashboard-accordion';accordion.id='dashboard-quiz';
  accordion.innerHTML='<summary>Quiz des lapins</summary><section class="dash-section"><p>Questions, réponses, explications et sources. Enregistre pour tester localement, puis exporte lapinous-quiz.json dans le projet.</p><label>Questions par partie<input id="quizRoundSize" type="number" min="1" max="30"></label><div id="quizQuestionCards" class="quiz-admin-cards"></div><div class="save-io-row"><button data-quiz-save>Enregistrer localement</button><button data-quiz-export>Exporter lapinous-quiz.json</button><button data-quiz-add>Ajouter une question</button></div><p id="quizEditorStatus" role="status"></p></section>';
  const main=document.querySelector('main');
  const security=[...main.children].find(el=>el.querySelector('summary,h2')?.textContent.includes('Sécurité'));
  main.insertBefore(accordion,security||null);
  /** Rend les fiches avec des champs texte, sans demander d'éditer du code. */
  function render(){
    accordion.querySelector('#quizRoundSize').value=working.roundSize;
    accordion.querySelector('#quizQuestionCards').innerHTML=working.questions.map((q,index)=>`<details class="quiz-admin-card" data-quiz-index="${index}"><summary>${escape(q.question)}</summary><label>Active<input type="checkbox" data-quiz-field="enabled" ${q.enabled!==false?'checked':''}></label>${[['id','Identifiant'],['category','Thème'],['question','Question'],['explanation','Explication'],['source','Source'],['sourceUrl','Lien de la source']].map(([key,label])=>`<label>${label}<input data-quiz-field="${key}" value="${escape(q[key])}"></label>`).join('')}${q.choices.map((choice,i)=>`<label>Réponse ${i+1}<input data-quiz-choice="${i}" value="${escape(choice)}"></label>`).join('')}<label>Bonne réponse<select data-quiz-field="answer">${q.choices.map((_,i)=>`<option value="${i}" ${i===q.answer?'selected':''}>Réponse ${i+1}</option>`).join('')}</select></label><button data-quiz-remove="${index}">Supprimer cette question</button></details>`).join('');
  }
  /** Collecte les champs et valide avant tout enregistrement ou export. */
  function collect(){
    working.roundSize=Number(accordion.querySelector('#quizRoundSize').value);
    accordion.querySelectorAll('[data-quiz-index]').forEach(card=>{
      const q=working.questions[Number(card.dataset.quizIndex)];
      card.querySelectorAll('[data-quiz-field]').forEach(input=>{const key=input.dataset.quizField;q[key]=key==='enabled'?input.checked:key==='answer'?Number(input.value):input.value;});
      card.querySelectorAll('[data-quiz-choice]').forEach(input=>q.choices[Number(input.dataset.quizChoice)]=input.value);
    });
    return window.LapinousQuiz.validate(working);
  }
  accordion.addEventListener('click',async event=>{
    const target=event.target;const status=accordion.querySelector('#quizEditorStatus');
    try{
      if(target.hasAttribute('data-quiz-save')){window.LapinousQuiz.save(collect());status.textContent='Quiz enregistré. Recharge le jeu pour tester.';}
      if(target.hasAttribute('data-quiz-export')){const mode=await window.LapinousLocalFiles.exportJSON('lapinous-quiz.json',collect());document.getElementById('quizEditorStatus').textContent=mode==='written'?'Quiz enregistré dans le projet.':'Quiz téléchargé.';}
      if(target.hasAttribute('data-quiz-add')){collect();working.questions.push({id:'question_'+Date.now(),category:'Lapins',question:'Nouvelle question',choices:['Réponse 1','Réponse 2','Réponse 3','Réponse 4'],answer:0,explanation:'Explication à compléter.',source:'Source à préciser',enabled:false});render();}
      if(target.dataset.quizRemove!==undefined){collect();working.questions.splice(Number(target.dataset.quizRemove),1);render();}
    }catch(error){status.textContent=error.message;}
  });
  render();
  // La navigation peut être construite après le chargement du catalogue.
  const attachNavigation=()=>{const nav=document.querySelector('.dashboard-jump-menu');if(!nav||nav.querySelector('[data-quiz-jump]'))return;const button=document.createElement('button');button.type='button';button.dataset.quizJump='';button.textContent='Quiz des lapins';button.onclick=()=>{accordion.open=true;accordion.scrollIntoView({behavior:'smooth'});};nav.insertBefore(button,nav.lastElementChild);};
  attachNavigation();const observer=new MutationObserver(()=>{attachNavigation();if(document.querySelector('[data-quiz-jump]'))observer.disconnect();});observer.observe(main,{childList:true,subtree:true});
});
