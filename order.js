
(() => {
  const path = location.pathname.split("/").pop() || "index.html";
  const menuName = path.replace(".html","");
  const cart = new Map();
  const money = n => `${Number(n).toLocaleString("en-US")} LE`;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const style = document.createElement("style");
  style.textContent = `
    .sky7-add{display:inline-block;margin-top:14px;padding:10px 16px;border:1px solid #b9965b;background:#11110f;color:#fffdf8;font-size:11px;letter-spacing:.08em;cursor:pointer}
    .sky7-add:hover{background:#b9965b;color:#10110f}
    .sky7-cart-fab{position:fixed;z-index:100;bottom:22px;right:22px;border:0;background:#10110f;color:#fffdf8;padding:15px 20px;box-shadow:0 8px 28px #0003;cursor:pointer;font:700 14px Arial,sans-serif}
    .sky7-cart-fab span{display:inline-grid;place-items:center;background:#b9965b;color:#111;border-radius:50%;width:24px;height:24px;margin-left:8px}
    .sky7-modal{position:fixed;inset:0;z-index:200;background:#0009;display:none;align-items:center;justify-content:center;padding:16px}
    .sky7-modal.open{display:flex}.sky7-panel{background:#f4f0e8;color:#10110f;width:min(680px,100%);max-height:90vh;overflow:auto;padding:24px;border:1px solid #b9965b;box-shadow:0 20px 60px #0005}
    .sky7-panel h2{margin:0 0 16px;font:600 30px Georgia,serif}.sky7-panel label{display:block;font-size:13px;margin:12px 0}.sky7-panel input,.sky7-panel select,.sky7-panel textarea{display:block;width:100%;margin-top:6px;padding:11px;border:1px solid #cfc5b3;background:#fffdf8;color:#10110f;font:14px Arial,sans-serif}
    .sky7-cart-line{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #d8d0c2;font-size:13px}
    .sky7-qty button{width:28px;height:28px;border:1px solid #b9965b;background:transparent;cursor:pointer}.sky7-qty span{padding:0 8px}
    .sky7-total{display:flex;justify-content:space-between;font-weight:bold;font-size:18px;padding:16px 0}
    .sky7-actions{display:flex;gap:10px;flex-wrap:wrap}.sky7-actions button{padding:12px 16px;border:1px solid #10110f;cursor:pointer;font-weight:bold}.sky7-submit{background:#10110f;color:#fffdf8}.sky7-close{background:transparent;color:#10110f}
    .sky7-status{font-size:13px;font-weight:bold;margin-top:12px}.sky7-status.ok{color:#14764f}.sky7-status.err{color:#b22d39}
    @media(max-width:600px){.sky7-cart-fab{right:12px;bottom:12px}.sky7-panel{padding:17px}.sky7-cart-line{grid-template-columns:1fr auto}.sky7-cart-line>strong{grid-column:1/-1}}
  `;
  document.head.appendChild(style);
  document.querySelectorAll("article.card").forEach((card,i) => {
    const title = card.querySelector("h3")?.textContent.trim();
    const priceText = card.querySelector(".price")?.textContent.trim() || "";
    const category = card.querySelector(".cat")?.textContent.trim() || "";
    const desc = card.querySelector(".desc")?.textContent.trim() || "";
    if (!title || !priceText) return;
    const numbers = priceText.match(/\d[\d,]*/g) || ["0"];
    const price = Number(numbers[0].replace(/,/g,""));
    const id = `${menuName}:${i}`;
    card.dataset.sky7Id=id;
    card.insertAdjacentHTML("beforeend",`<button class="sky7-add" type="button">ADD TO ORDER · ${esc(priceText)}</button>`);
    card.querySelector(".sky7-add").addEventListener("click",()=>{
      const current=cart.get(id)||{id,name:title,category,desc,price,priceText,qty:0,menu:menuName};
      current.qty++;cart.set(id,current);renderCart();
    });
  });
  document.body.insertAdjacentHTML("beforeend",`
    <button class="sky7-cart-fab" id="sky7OpenCart">YOUR ORDER <span id="sky7Count">0</span></button>
    <div class="sky7-modal" id="sky7Modal" role="dialog" aria-modal="true" aria-label="Your order"><section class="sky7-panel">
      <h2>Your Order</h2><div id="sky7Lines"></div><div class="sky7-total"><span>Total (estimated)</span><strong id="sky7Total">0 LE</strong></div>
      <label>Service location
        <select id="sky7PlaceType"><option value="Room">Hotel room</option><option value="Restaurant">Restaurant table</option><option value="Bar">Bar</option><option value="Pool">Pool</option><option value="Other">Other</option></select>
      </label>
      <label>Room / table / location number <input id="sky7Place" maxlength="60" placeholder="e.g. Room 205 or Table 4" required></label>
      <label>Guest name (optional) <input id="sky7Guest" maxlength="80" placeholder="Guest name"></label>
      <label>Notes for the kitchen <textarea id="sky7Notes" maxlength="300" placeholder="Special requests or allergies"></textarea></label>
      <div class="sky7-actions"><button class="sky7-submit" id="sky7Submit">CONFIRM ORDER</button><button class="sky7-close" id="sky7Close">CONTINUE MENU</button></div>
      <p id="sky7Status" class="sky7-status" role="status"></p><p style="font-size:11px;color:#706d66">Menu prices shown as supplied. Items with price ranges use the lower value for this estimate; confirm before live use.</p>
    </section></div>`);
  const $=id=>document.getElementById(id);
  $("sky7OpenCart").onclick=()=>{$("sky7Modal").classList.add("open");renderCart();};
  $("sky7Close").onclick=()=>$("sky7Modal").classList.remove("open");
  $("sky7Modal").addEventListener("click",e=>{if(e.target===$("sky7Modal"))$("sky7Modal").classList.remove("open")});
  function renderCart(){
    const items=[...cart.values()];
    $("sky7Count").textContent=items.reduce((s,x)=>s+x.qty,0);
    $("sky7Lines").innerHTML=items.length?items.map(x=>`<div class="sky7-cart-line"><div><strong>${esc(x.name)}</strong><br><small>${esc(x.priceText)}</small></div><div class="sky7-qty"><button data-minus="${esc(x.id)}">−</button><span>${x.qty}</span><button data-plus="${esc(x.id)}">+</button></div><strong>${money(x.price*x.qty)}</strong></div>`).join(""):'<p>Your cart is empty. Add items from the menu.</p>';
    $("sky7Total").textContent=money(items.reduce((s,x)=>s+x.price*x.qty,0));
    document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{const x=cart.get(b.dataset.minus);if(x){x.qty--;if(x.qty<=0)cart.delete(x.id);renderCart()}});
    document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{const x=cart.get(b.dataset.plus);if(x){x.qty++;renderCart()}});
    $("sky7Submit").disabled=!items.length;
  }
  $("sky7Submit").onclick=async()=>{
    if(!cart.size)return;
    if(!$("sky7Place").value.trim()){$("sky7Status").className="sky7-status err";$("sky7Status").textContent="Please enter the room, table or service location.";return;}
    const btn=$("sky7Submit");btn.disabled=true;btn.textContent="SENDING…";$("sky7Status").textContent="";
    try{
      const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        placeType:$("sky7PlaceType").value,place:$("sky7Place").value.trim(),guestName:$("sky7Guest").value.trim(),notes:$("sky7Notes").value.trim(),
        items:[...cart.values()].map(x=>({id:x.id,name:x.name,category:x.category,price:x.price,priceText:x.priceText,qty:x.qty,menu:x.menu}))
      })});
      const result=await response.json();if(!response.ok)throw new Error(result.error||"Order could not be sent.");
      cart.clear();renderCart();$("sky7Status").className="sky7-status ok";$("sky7Status").textContent=`Order #${result.number} sent to the cashier.`;
      $("sky7Notes").value="";
    }catch(e){$("sky7Status").className="sky7-status err";$("sky7Status").textContent=e.message||"Could not connect. Please try again."}
    finally{btn.textContent="CONFIRM ORDER";btn.disabled=!cart.size}
  };
  renderCart();
})();
