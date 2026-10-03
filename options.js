const DB_NAME="rms-db", STORE="handles";
const sites = [
  ["linkedin","LinkedIn"],["indeed","Indeed"],["jobstreet","JobStreet"],["seek","SEEK"],
  ["monster","Monster"],["stepstone","StepStone"],["totaljobs","Totaljobs"],
  ["cv-library","CV-Library"],["eures","EURES"],["glassdoor","Glassdoor"],
  ["reed","Reed"],["cwjobs","CWJobs"],["jobsite","Jobsite"],["xing","XING Jobs"],
  ["eurojobs","EuroJobs"],["wellfound","Wellfound"],["dice","Dice"],["ziprecruiter","ZipRecruiter"],
  ["custom","Other / fallback"]
];

const req = indexedDB.open(DB_NAME,1);
req.onupgradeneeded = () => req.result.createObjectStore(STORE);

function dbPut(key,value){return new Promise((res,rej)=>{const t=req.result.transaction(STORE,"readwrite");t.objectStore(STORE).put(value,key);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
function dbGet(key){return new Promise((res,rej)=>{const t=req.result.transaction(STORE);const r=t.objectStore(STORE).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}

async function load(){
  const s=await chrome.storage.local.get({
    enabledSites: sites.map(x=>x[0]).filter(x=>x!=="custom"), minScore:55, customSkills:[]
  });
  document.getElementById("sites").innerHTML=sites.map(([id,label])=>`<label class="site"><input type="checkbox" value="${id}" ${s.enabledSites.includes(id)?"checked":""}>${label}</label>`).join("");
  document.getElementById("minScore").value=s.minScore;
  document.getElementById("customSkills").value=s.customSkills.join("\n");
  const h=await dbGet("resumeDir").catch(()=>null);
  if(h){document.getElementById("dirStatus").textContent="Folder configured: "+(h.name||"selected folder");}
}
document.getElementById("pickDir").onclick=async()=>{
  try{
    const h=await window.showDirectoryPicker({id:"resume-match-scout",mode:"read"});
    await dbPut("resumeDir",h);
    document.getElementById("dirStatus").textContent="Folder configured: "+h.name;
  }catch(e){if(e.name!=="AbortError") alert("Folder selection failed: "+e.message)}
};
document.getElementById("save").onclick=async()=>{
  const enabledSites=[...document.querySelectorAll("#sites input:checked")].map(x=>x.value);
  const customSkills=document.getElementById("customSkills").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  await chrome.storage.local.set({enabledSites,minScore:Number(document.getElementById("minScore").value)||55,customSkills});
  const el=document.getElementById("saved");el.textContent=" Saved";setTimeout(()=>el.textContent="",1500);
};
load();