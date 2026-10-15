'use strict';
// Independent versioned storage keeps conversations intact when documents change.
const CHAT_KEY='qcoda-collaboration-v1';
function chatSeed(){return {messages:[],notifications:[]};}
function readChat(){try{const value=JSON.parse(localStorage.getItem(CHAT_KEY));if(Array.isArray(value?.messages)&&Array.isArray(value?.notifications))return {demoInitialized:Array.isArray(value.demoInitialized)?value.demoInitialized:[],messages:value.messages.filter(m=>!String(m.id).startsWith('demo-')),notifications:value.notifications.filter(n=>!String(n.id).startsWith('notice-'))};}catch{}return chatSeed();}
let chatData=readChat(),chatPeer=null;
try{localStorage.setItem(CHAT_KEY,JSON.stringify(chatData));}catch{}
function saveChat(next){try{localStorage.setItem(CHAT_KEY,JSON.stringify(next));chatData=next;return true;}catch{toast('Không thể lưu cuộc trò chuyện. Bộ nhớ có thể đã đầy; hãy thử tệp PDF nhỏ hơn.');return false;}}
const memberRole=id=>USERS.find(u=>u.id===id)?.title||'Developer';
function demoPdf(){
  const content='BT /F1 18 Tf 50 760 Td (System design - Review document) Tj ET';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
  let pdf='%PDF-1.4\n',offsets=[0];
  objects.forEach((object,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${object}\nendobj\n`;});
  const start=pdf.length;
  pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return 'data:application/pdf;base64,'+btoa(pdf);
}
function ensureMemberDemo(){
  if(!user||canUpload())return;
  const next=readChat(),id=`pc-intro-${projectId}-${user.id}`;
  if(next.messages.some(m=>m.id===id)||next.demoInitialized?.includes(id))return;
  const time=new Date().toISOString();
  next.messages.push({id,projectId,from:'lan',to:user.id,text:'Hi anh check giúp em file này để lát em đưa vào hệ thống nha',attachment:{name:'System_design.pdf',url:demoPdf()},time});
  next.notifications.push({id:`notification-${id}`,projectId,to:user.id,peer:'lan',text:'Bạn có tin nhắn mới từ PC (Nguyễn Thị Lan)',read:false,time});
  saveChat(next);
}
const replyTimers=new Set();
function scheduleReplies(){
  for(const message of chatData.messages){
    if(!message.replyAt||replyTimers.has(message.id))continue;
    replyTimers.add(message.id);
    setTimeout(()=>{
      replyTimers.delete(message.id);
      const next=readChat(),original=next.messages.find(m=>m.id===message.id);
      if(!original?.replyAt)return;
      delete original.replyAt;
      const time=new Date().toISOString(),name=USERS.find(u=>u.id===original.to)?.name||'Thành viên';
      next.messages.push({id:`reply-${original.id}`,projectId:original.projectId,from:original.to,to:original.from,text:'ok',time});
      next.notifications.push({id:`reply-notice-${original.id}`,projectId:original.projectId,to:original.from,peer:original.to,text:`${name} đã trả lời tin nhắn của bạn`,read:false,time});
      if(saveChat(next)&&user){
        updateBell();
        if(projectId===original.projectId&&location.hash==='#members'&&chatPeer===original.to){
          const draft=$('#chat-text')?.value||'',fileInput=$('#chat-pdf'),files=fileInput?.files;
          showChat();
          if($('#chat-text'))$('#chat-text').value=draft;
          if(files?.length&&$('#chat-pdf'))$('#chat-pdf').files=files;
        }
      }
    },Math.max(0,message.replyAt-Date.now()));
  }
}
function myNotices(){return chatData.notifications.filter(n=>n.to===user?.id&&n.projectId===projectId).sort((a,b)=>b.time.localeCompare(a.time));}
function updateBell(){const bell=$('#notifications');if(!bell)return;const count=myNotices().filter(n=>!n.read).length;bell.innerHTML=icon('bell')+(count?`<span class="notification-count">${count}</span>`:'');bell.setAttribute('aria-label',`Thông báo${count?`, ${count} chưa đọc`:''}`);bell.onclick=showNotifications;}
function showNotifications(){modal(`<h2>Thông báo</h2><div class="notice-list">${myNotices().map(n=>`<button class="notice-item ${n.read?'':'unread'}" data-chat-notice="${esc(n.id)}"><strong>${esc(n.text)}</strong><small>${date(n.time)} · ${n.read?'Đã đọc':'Chưa đọc'}</small></button>`).join('')||'<p class="muted">Chưa có thông báo trong dự án này.</p>'}</div><div class="actions"><button class="btn secondary" data-close>Đóng</button></div>`);}
function conversation(peer){return chatData.messages.filter(m=>m.projectId===projectId&&(!String(m.id).startsWith('pc-intro-')||m.to===user.id)&&((m.from===user.id&&m.to===peer)||(m.to===user.id&&m.from===peer)));}
function membersView(){
  const members=USERS.filter(u=>role(u.id,projectId));
  if(!members.some(u=>u.id===chatPeer&&u.id!==user.id))chatPeer=null;
  $('#content').innerHTML=heading('Thành viên','Trao đổi và kiểm tra tài liệu trước khi cập nhật vào nguồn tri thức.')+`<div class="members-layout"><section class="member-list">${members.map(u=>`<article class="card member-card ${chatPeer===u.id?'selected':''}"><div class="avatar">${esc(u.name.split(' ').slice(-1)[0][0])}</div><div><h3>${esc(u.name)}${u.id===user.id?' (Bạn)':''}</h3><p>${memberRole(u.id)}</p><span class="badge">Đang hoạt động</span></div>${u.id!==user.id?`<button class="btn secondary" data-chat-peer="${u.id}" aria-label="Nhắn tin với ${esc(u.name)}">Nhắn tin</button>`:''}</article>`).join('')}</section><section class="card chat-panel" id="chat-panel"></section></div>`;
  document.querySelectorAll('[data-chat-peer]').forEach(b=>b.onclick=()=>openChat(b.dataset.chatPeer));
  document.querySelectorAll('.member-card').forEach(card=>{card.onclick=e=>{if(e.target.closest('button'))return;const button=card.querySelector('[data-chat-peer]');if(button)openChat(button.dataset.chatPeer);};});
  showChat();
}
function chatMarkup(peer){const person=USERS.find(u=>u.id===peer);return `<div class="chat-heading"><button class="btn secondary chat-refresh" id="refresh-chat" type="button">Refresh</button><h2>${esc(person.name)}</h2><small>${memberRole(peer)}</small></div><div class="chat-messages" aria-live="polite">${conversation(peer).map(m=>`<div class="message ${m.from===user.id?'own':''}"><strong>${esc(USERS.find(u=>u.id===m.from)?.name)}</strong><p>${esc(m.text)}</p>${m.attachment?`<button class="attachment" data-chat-file="${esc(m.id)}">${icon('file')} ${esc(m.attachment.name)} · ${m.attachment.sample?'PDF mẫu':'Tải PDF'}</button>`:''}<small>${date(m.time)}</small></div>`).join('')||'<p class="muted">Bắt đầu cuộc trò chuyện mới.</p>'}</div><form id="chat-form"><label for="chat-text">Nội dung tin nhắn</label><textarea id="chat-text" rows="3" maxlength="4000" placeholder="Nhập tin nhắn…"></textarea><label for="chat-pdf">Đính kèm PDF (tối đa 2 MB)</label><input id="chat-pdf" type="file" accept=".pdf,application/pdf"><p id="chat-error" class="muted" role="alert"></p><button class="btn" type="submit">Gửi tin nhắn</button></form>`;}
function showChat(){
  const panel=$('#chat-panel');
  if(!panel)return;
  panel.innerHTML=chatPeer?chatMarkup(chatPeer):'<div class="empty"><h2>Trò chuyện với thành viên</h2><p>Chọn một thành viên bên trái để nhắn tin và gửi tài liệu.</p></div>';
  if(chatPeer)bindChat();
}
function openChat(peer){
  if(!user||peer===user.id||!role(peer))return;
  chatPeer=peer;
  const next=readChat();
  next.notifications=next.notifications.map(n=>n.to===user.id&&n.projectId===projectId&&n.peer===peer?{...n,read:true}:n);
  saveChat(next);closeModal();updateBell();if(location.hash!=='#members')go('members');else membersView();
}
function refreshChat(){
  if(!user||!chatPeer)return;
  const next=readChat(),sender=user.id,peer=chatPeer;
  const inConversation=m=>m.projectId===projectId&&((m.from===sender&&m.to===peer)||(m.from===peer&&m.to===sender));
  next.messages=next.messages.filter(m=>!inConversation(m));
  next.notifications=next.notifications.filter(n=>!(n.projectId===projectId&&((n.to===sender&&n.peer===peer)||(n.to===peer&&n.peer===sender))));
  // Keep cleared demo messages from being seeded again after navigation or reload.
  next.demoInitialized=[...new Set([...(next.demoInitialized||[]),`pc-intro-${projectId}-${sender==='lan'?peer:sender}`])];
  if(saveChat(next)){showChat();updateBell();toast('Đã xóa tin nhắn, tệp đính kèm và thông báo của cuộc trò chuyện.');}
}
function bindChat(){
  $('#refresh-chat').onclick=refreshChat;
  const messages=$('.chat-messages');messages.scrollTop=messages.scrollHeight;
  document.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{$('#chat-text').value=b.dataset.reply;$('#chat-text').focus();});
  document.querySelectorAll('[data-chat-file]').forEach(b=>b.onclick=()=>{const m=conversation(chatPeer).find(m=>m.id===b.dataset.chatFile);if(m?.attachment?.sample){toast('PDF mẫu minh họa. PC có thể đính kèm PDF thật để tải và kiểm tra.');return;}if(m?.attachment?.url?.startsWith('data:application/pdf;base64,')){const a=document.createElement('a');a.href=m.attachment.url;a.download=m.attachment.name;a.click();}});
  $('#chat-form').onsubmit=async e=>{
    e.preventDefault();const form=e.currentTarget,text=$('#chat-text').value.trim(),file=$('#chat-pdf').files[0],sender=user.id,pid=projectId,peer=chatPeer;
    if(!text&&!file){$('#chat-error').textContent='Vui lòng nhập tin nhắn hoặc đính kèm PDF.';return;}
    const button=form.querySelector('[type="submit"]');button.disabled=true;
    try{
      let attachment=null;
      if(file){if(!/\.pdf$/i.test(file.name)||file.size>2*1024*1024||new TextDecoder().decode(await file.slice(0,5).arrayBuffer())!=='%PDF-')throw Error('Vui lòng chọn PDF hợp lệ, tối đa 2 MB.');const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Không thể đọc tệp.'));r.readAsDataURL(new Blob([file],{type:'application/pdf'}));});attachment={name:file.name,url,size:file.size};}
      if(user?.id!==sender||projectId!==pid||chatPeer!==peer||!form.isConnected)return;
      const next=readChat(),time=new Date().toISOString(),previous=conversation(peer).slice().reverse().find(m=>m.attachment),documentName=attachment?.name||previous?.attachment.name;
      next.messages.push({id:crypto.randomUUID(),projectId:pid,from:sender,to:peer,text,attachment,time,...(role(sender,pid)==='coordinator'&&role(peer,pid)==='member'?{replyAt:Date.now()+1200}:{})});
      next.notifications.push({id:crypto.randomUUID(),projectId:pid,to:peer,peer:sender,text:sender==='lan'?`Bạn có tin nhắn mới từ Điều phối viên dự án${documentName?' về tài liệu '+documentName:''}`:`${user.name} đã phản hồi${documentName?' về tài liệu '+documentName:''}`,read:false,time});
      if(saveChat(next)){showChat();updateBell();scheduleReplies();toast('Đã gửi tin nhắn và thông báo cho người nhận.');}
    }catch(error){if(form.isConnected)$('#chat-error').textContent=error.message;}finally{button.disabled=false;}
  };
}
const originalShell=shell;
shell=function(route){originalShell(route);ensureMemberDemo();scheduleReplies();const projectsLink=$('nav a[href="#projects"]');projectsLink.insertAdjacentHTML('afterend',`<a href="#members" class="${route==='members'?'active':''}" ${route==='members'?'aria-current="page"':''}>${icon('users')}<span>Thành viên</span></a>`);updateBell();};
const originalRender=render;
render=function(){originalRender();if(!user||busy)return;if(location.hash==='#members')membersView();};
document.addEventListener('click',e=>{const b=e.target.closest('[data-chat-notice]');if(b){const n=myNotices().find(n=>n.id===b.dataset.chatNotice);if(n)openChat(n.peer);}});
window.addEventListener('storage',e=>{if(e.key===CHAT_KEY){chatData=readChat();if(user&&!busy){updateBell();if(location.hash==='#members'&&!$('#chat-text')?.value&&!$('#chat-pdf')?.files.length)showChat();}}});
render();
