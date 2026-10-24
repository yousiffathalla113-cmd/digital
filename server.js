const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.join(__dirname,"public"),dataDir=path.join(__dirname,"data"),file=path.join(dataDir,"orders.json");
fs.mkdirSync(dataDir,{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,"[]");
const statuses=["New","Preparing","Ready","Delivered","Cancelled"];
const read=()=>{try{return JSON.parse(fs.readFileSync(file,"utf8"))}catch{return[]}};
const save=x=>fs.writeFileSync(file,JSON.stringify(x,null,2));
function send(res,code,data,type="application/json; charset=utf-8"){res.writeHead(code,{"Content-Type":type,"Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PATCH,OPTIONS","Access-Control-Allow-Headers":"Content-Type"});res.end(typeof data==="string"?data:JSON.stringify(data))}
function parse(req){return new Promise((resolve,reject)=>{let s="";req.on("data",c=>{s+=c;if(s.length>1e6)reject(Error("Request too large"))});req.on("end",()=>{try{resolve(JSON.parse(s||"{}"))}catch{reject(Error("Invalid JSON"))}})})}
const server=http.createServer(async(req,res)=>{
 if(req.method==="OPTIONS")return send(res,204,"");
 const u=new URL(req.url,`http://${req.headers.host||"localhost"}`);
 if(req.method==="GET"&&u.pathname==="/api/orders")return send(res,200,read().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
 if(req.method==="POST"&&u.pathname==="/api/orders"){
  try{
   const b=await parse(req);if(!String(b.place||"").trim())return send(res,400,{error:"A service location is required."});
   if(!Array.isArray(b.items)||!b.items.length)return send(res,400,{error:"Cart is empty."});
   const items=b.items.map(i=>({name:String(i.name||"Item").slice(0,160),category:String(i.category||"").slice(0,80),price:Math.max(0,Number(i.price)||0),priceText:String(i.priceText||"").slice(0,40),qty:Math.max(1,Math.min(30,parseInt(i.qty)||1)),menu:String(i.menu||"").slice(0,60)}));
   const orders=read(),order={id:crypto.randomUUID(),number:1000+orders.length+1,placeType:String(b.placeType||"Other").slice(0,40),place:String(b.place).trim().slice(0,60),guestName:String(b.guestName||"").slice(0,80),notes:String(b.notes||"").slice(0,300),items,total:items.reduce((s,i)=>s+i.price*i.qty,0),status:"New",createdAt:new Date().toISOString()};
   orders.push(order);save(orders);return send(res,201,order)
  }catch(e){return send(res,400,{error:e.message})}
 }
 const m=u.pathname.match(/^\/api\/orders\/([a-f0-9-]+)\/status$/i);
 if(req.method==="PATCH"&&m){try{const b=await parse(req);if(!statuses.includes(b.status))return send(res,400,{error:"Invalid status"});const a=read(),i=a.findIndex(o=>o.id===m[1]);if(i<0)return send(res,404,{error:"Order not found"});a[i].status=b.status;a[i].updatedAt=new Date().toISOString();save(a);return send(res,200,a[i])}catch(e){return send(res,400,{error:e.message})}}
 let p=decodeURIComponent(u.pathname==="/"?"/index.html":u.pathname),full=path.normalize(path.join(root,p));
 if(!full.startsWith(root))return send(res,403,"Forbidden","text/plain");
 fs.readFile(full,(e,b)=>{if(e)return send(res,404,"Not found","text/plain");const ext=path.extname(full),types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8"};send(res,200,b,types[ext]||"application/octet-stream")});
});
server.listen(process.env.PORT||3000,"0.0.0.0",()=>console.log("SKY 7 ordering: http://localhost:3000 | cashier: http://localhost:3000/cashier.html"));
