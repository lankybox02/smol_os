import fetch from 'node-fetch'; import calc from 'expression-calculator'; import { dirname } from 'path'; import { fileURLToPath } from 'url'; import editJsonFile from 'edit-json-file'; const Calc = new calc(); const __dirname = dirname(fileURLToPath(import.meta.url)); import fs from 'fs';

const url = "example.com"; // to be replaced
let ver = fs.readFileSync(__dirname + '/ver.txt');
let turbo = Math.floor(Math.random() * 3000);

const regedit = editJsonFile(__dirname + '/registry.json'); let reg = regedit.get(); let stop = false;if (reg.skipTimeout == true) {turbo = 0;}
if (reg.preventBoot == true) {console.log("BOOT DISABLED BY REGISTRY — UNDOABLE FATALITY");process.exit();}
if (reg.password) {
  stop = true;
  function pass() {
  if (prompt("PASSWORD") != reg.password) {
    console.error("WRONG PASSWORD");
    pass();
  }else{
    updateCheck();
  }
   }
  pass();
}

console.log(genver());

function diagnostics(){
  let i = 0;if (reg.preventBoot == true) i++;console.log(i + ' ISSUE(S) FOUND');if (i > 0) {if (prompt('PRESS Y TO APPLY FIXES').toLowerCase() == 'y') {regedit.set('preventBoot', false);regedit.save();
      
console.log('CHANGES APPLIED')
      return;
    }
  }
}

  if (reg.skipUpdates) {
    if(!stop)start()
  }else{
  if(!stop)console.log("\nCHECKING FOR UPDATES...");

 if (!stop) updateCheck();
  }

let r;
function start() {
  setTimeout(async function() {
    console.clear()
    while (true) {
      try {
 			 r = await run(prompt(''));
        if (r) console.log(r)
      }catch(e){
        console.log("ERROR WHILE OPERATING");
        fs.appendFileSync(__dirname + '/.logs', e.toString())
      }
    }
  }, turbo);
}

async function run(com) {
  if (com == 'terminate') {
    process.exit();
  }

  if (com == 'clear') {
    console.clear();
    return;
  }
  if (com == 'diagnostics') {
    diagnostics()
    return;
  }
  if (com.startsWith("regedit ")) {
    if (com.split(" ").length != 3) return;
    if (reg[com.split(" ")[1]] == null) return;
    let val = com.split(" ")[2];
    if (val == 'true') val = true;
    if (val == 'false') val = false;
    regedit.set(com.split(" ")[1], val);
    regedit.save();
    return "CHANGES APPLIED — PLEASE RESTART TO SEE CHANGES";
  }

  if (com == 'dir') {
    let list = '';
    console.log("===ROOT==========")
    fs.readdirSync(__dirname + '/files', {withFileTypes: true})
.map(item => item.name).forEach(item => {
  if (fs.statSync(__dirname + '/files/' + item).isDirectory()) {
    list = `
${item.toUpperCase()}/` + " ".repeat(20 - item.length) + " DIR" + list;
  }else{
    let type= " FILE";
    if (item.endsWith(".smol")) type = " EXEC";
    list += `
${item.toUpperCase()}` + " ".repeat(20 - item.length) + type;
  }
});
    return list.slice(1);
  }

  if (com.startsWith('dir ')) {
    if (com.includes("..")) return;
    let list = '';
console.log("===" + com.slice(4) + "=".repeat(17 - com.slice(4).length))
  fs.readdirSync(__dirname + '/files/' + com.slice(4), {withFileTypes: true})
.map(item => item.name).forEach(item => {
  if (fs.statSync(__dirname + '/files/' + com.slice('4').split('/')[0] + '/'+item).isDirectory()) {
    list = `
${item.toUpperCase()}/` + " ".repeat(20 - item.length) + " DIR" + list;
  }else{
    let type= " FILE";
    if (item.endsWith(".smol")) type = " EXEC";
    list += `
${item.toUpperCase()}` + " ".repeat(20 - item.length) + type;
  }
});
    return list.slice(1);
  }

  if (com.startsWith("open ")) {
    if (com.includes("..")) return;
    if (fs.existsSync(__dirname + "/files/" + com.slice(5).toLowerCase())) {
  return fs.readFileSync(__dirname + "/files/" + com.slice(5).toLowerCase(), 'utf8');
} else {
  return "FILE DOES NOT EXIST"
}
  }

  if (com.startsWith("run ")) {
    if (com.includes("..")) return;
    if (com.slice(-5) != '.smol') return 'CAN ONLY RUN .SMOL FILES!';
    if (fs.existsSync(__dirname + "/files/" + com.slice(4).toLowerCase())) {
  return await interpret(fs.readFileSync(__dirname + "/files/" + com.slice(4).toLowerCase(), 'utf8'));
} else {
  return "FILE DOES NOT EXIST"
}
  }

  if (com.startsWith('delete ')) {
    if (com.includes("..")) return;
    try {
    fs.unlinkSync(__dirname + '/files/' + com.slice(7));
      return "FILE WAS DELETED";
  }catch(e){
      return "ERROR DELETING FILE";
  }
  }

  if (com.startsWith('write ')) {
    if (com.includes("..") || com.slice(6).length > 20) return;
    try {
    fs.writeFileSync(__dirname + '/files/' + com.slice(6).toLowerCase(), prompt("NEW CONTENT").replace(/\\n/gi, "\n"));
      return "WRITTEN TO PATH";
  }catch(e){
      return "ERROR WRITING TO PATH";
  }
}
if (com.startsWith('append ')) {
    if (com.includes("..") || com.slice(7).length > 20) return;
    try {
    fs.appendFileSync(__dirname + '/files/' + com.slice(7).toLowerCase(), prompt("CONTENT TO APPEND").replace(/\\n/gi, "\n"));
      return "WRITTEN TO PATH";
  }catch(e){
      return "ERROR WRITING TO PATH";
  }
  }

if (com.startsWith('c ')) {
    return Calc.compile(com.slice(2)).calc();
 }

  if (com.startsWith('mkdir ')) {
    if (com.includes("..") || com.slice(6).length > 20) return;
    try {
    if (!fs.existsSync(__dirname + '/files/' + com.slice(6))){
    fs.mkdirSync(__dirname + '/files/' + com.slice(6), { recursive: true });
  }else{
      return "DIRECTORY ALREADY EXISTS";
  }
      return "DIRECTORY CREATED";
  }catch(e){
      return "ERROR CREATING DIRECTORY";
  }
}

  if (com.startsWith('rmdir ')) {
    if (com.includes("..")) return;
    try {
    if (fs.existsSync(__dirname + '/files/' + com.slice(6))){
    fs.rmSync(__dirname + '/files/' + com.slice(6), { recursive: true });
  }else{
      return "DIRECTORY DOES NOT EXIST";
  }
      return "DIRECTORY REMOVED";
  }catch(e){
      return "ERROR CREATING DIRECTORY";
  }
  }

  if (com == 'ver') {
    return genver();
  }

  if (com.trim()=='')return;
  return "BAD COMMAND";
}
function updateCheck() {
  if (reg.devWarn) {
    console.log("DEVELOPER BUILD — WILL NOT CHECK FOR UPDATES");
    start();
    return;
  }
  fetch('https://raw.githubusercontent.com/lankybox02/smol_os/main/ver.txt')
 		.then(response => response.text())
 		.then(data => {
      if (ver == data) {
        console.log("NO NEW UPDATES");
        start();
      }else{ver = data;


        console.log("NEW UPDATE DETECTED!")
        setTimeout(function(){
          console.log("INSTALLING...");
          fetch('https://raw.githubusercontent.com/lankybox02/smol_os/main/index.js')
          .then(response => response.text())
 		.then(data => {
      fs.writeFileSync(__dirname + '/index.js', data);
      console.log("1/5")
      fetch('https://raw.githubusercontent.com/lankybox02/smol_os/main/registry.json')
          .then(response => response.text())
 		.then(data => {
      fs.writeFileSync(__dirname + '/registry.json', data);
      console.log("2/5")
      fs.writeFileSync(__dirname + '/.logs', `~smol_os error logs~

`);
      console.log("3/5")
fs.writeFileSync(__dirname + '/ver.txt', ver);
      console.log("4/5")

console.log("INSTALLATION FINISHED! PLEASE RESTART")
      console.log("IF YOU ENCOUNTER ANY PROBLEMS, PLEASE REPORT THEM ON THE GITHUB REPOSITORY")
     });
     });
        }, 2000)
      }
    })
		.catch(err => {
      console.log("FAILED FETCHING UPDATES");
      start()
    })
 }

async function interpret(smol) {
  smol = smol.split("\n");
  if (smol.length > 10) {
    console.error("PROGRAM CANNOT CONTAIN MORE THAN 10 LINES OF CODE");
    return;
  }
  let ans = 'UNANSWERED';
  for (let i = 0; i < smol.length; i++) {
    if (smol[i].startsWith("print ")) {
      console.log(smol[i].slice(6).replace(/<ans>/gi, ans));
    }
    if (smol[i] == 'prompt') {
      ans = prompt("PROMPT");
    }
    if (smol[i].startsWith('write ')) {
      if (smol[i].split(" ")[1].includes("..")) continue;
      try {
        fs.writeFileSync(__dirname + '/files/' + smol[i].slice(6).split(" ")[0], smol[i].split(" ")[2]);
      }catch(e){
        console.log(e)
        continue;
      }
    }
    if(smol[i].startsWith('browse ')) {
      let url = smol[i].slice(7).replace(/<ans>/gi, ans);
      console.log(url)
      
      let browsed = await fetch(url);
      console.log(await browsed.text());
    }
    if (smol[i].startsWith("random ")) {
      console.log(Math.ceil(Math.random() * parseInt(smol[i].slice(7))));
    }
  }
}

function genver() {
  let devWarn = ``;
  if (reg.devWarn) devWarn = `\n* Confidential development build — may not be released without proper authorisation.`;
return `____________________

     SMOL_OS ${ver}
    COMMAND LINE
  OPERATING SYSTEM

    AUTHOR: ARI
  WRITTEN IN: NODE

      WARNING
   VERY UNSTABLE
____________________${devWarn}`;
    }