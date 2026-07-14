
const names = ["Engagement", "Reception", "Wedding"];
let data = [];
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbw8dEXkuZc5NAAepfp2UxPoYrJ-F4YEgvWd7SnBii7_mPRYe1aG6tzke1w3-hfoQaDDjQ/exec";

async function loadData() {
    try {
        const response = await fetch(WEB_APP_URL);

        const sheetData = await response.json();

        console.log(sheetData);

        data = names.map(name => ({
            name,
            rows: (sheetData[name] || []).map(r => ({
                task: r[0] || "",
                vendor: r[1] || "",
                budget: Number(r[2]) || 0,
                quoted: Number(r[3]) || 0,
                paid: Number(r[4]) || 0,
                status: r[5] || "Pending",
                notes: r[6] || ""
            }))
        }));

        render();

    } catch (e) {
        console.error(e);
    }
}

loadData();
if(!data){
 data=names.map(n=>({name:n,rows:[]}));
}

async function save() {

    render();

    try {

        for (const event of data) {

            const rows = event.rows.map(r => [
                r.task,
                r.vendor,
                r.budget,
                r.quoted,
                r.paid,
                r.status,
                r.notes
            ]);

            await fetch(WEB_APP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    event: event.name,
                    rows: rows
                })
            });

        }

        console.log("Saved successfully.");

    } catch (err) {
        console.error("Save failed", err);
    }
}
function addRow(e){e.rows.push({task:"",vendor:"",budget:0,quoted:0,paid:0,status:"Pending",notes:""});save();}
function render(){
 const c=document.getElementById("events");c.innerHTML="";
 let tb=0,tp=0;
 data.forEach((ev,ei)=>{
  let div=document.createElement("div");div.className="event";
  let h=document.createElement("h2");h.textContent=ev.name;div.appendChild(h);
  let b=document.createElement("button");b.textContent="Add Expense";b.onclick=()=>addRow(ev);div.appendChild(b);
  let t=document.createElement("table");
  t.innerHTML="<tr><th>Task</th><th>Vendor</th><th>Budget</th><th>Quoted</th><th>Paid</th><th>Status</th><th>Notes</th><th></th></tr>";
  let eb=0,ep=0;
  ev.rows.forEach((r,ri)=>{
    eb+=Number(r.budget)||0; ep+=Number(r.paid)||0;
    let tr=document.createElement("tr"); tr.className=r.status.toLowerCase();
    const cell=(val,key,type="text")=>{
      let td=document.createElement("td");
      let i=document.createElement("input");i.type=type;i.value=val;
i.onchange = () => {
    r[key] = type === "number" ? Number(i.value) : i.value;
    save();
};      td.appendChild(i);return td;
    };
    tr.appendChild(cell(r.task,"task"));
    tr.appendChild(cell(r.vendor,"vendor"));
    tr.appendChild(cell(r.budget,"budget","number"));
    tr.appendChild(cell(r.quoted,"quoted","number"));
    tr.appendChild(cell(r.paid,"paid","number"));
    let td=document.createElement("td");
    let s=document.createElement("select");
    ["Booked","Enquired","Pending","Cancelled"].forEach(v=>{
      let o=document.createElement("option");o.text=v;s.add(o);
    });
    s.value=r.status;
    s.onchange=()=>{r.status=s.value;save();};
    td.appendChild(s);tr.appendChild(td);
    tr.appendChild(cell(r.notes,"notes"));
    let d=document.createElement("td");
    let x=document.createElement("button");x.textContent="🗑";
    x.onclick=()=>{ev.rows.splice(ri,1);save();};
    d.appendChild(x);tr.appendChild(d);
    t.appendChild(tr);
  });
  let f=document.createElement("tr");
  f.innerHTML=`<th colspan=2>Total</th><th>₹${eb}</th><th></th><th>₹${ep}</th><th colspan=3>Balance ₹${eb-ep}</th>`;
  t.appendChild(f);
  div.appendChild(t);
  c.appendChild(div);
  tb+=eb;tp+=ep;
 });
 document.getElementById("budget").textContent="₹"+tb;
 document.getElementById("paid").textContent="₹"+tp;
 document.getElementById("balance").textContent="₹"+(tb-tp);
}

