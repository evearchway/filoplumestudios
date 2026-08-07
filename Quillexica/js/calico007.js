
// ~~~~~ CALICO VERSION 006 ~~~~~

//Does a more compliated yet concise way of console.log
function purr(input, type){
  if(input == undefined && type === undefined){
    console.log("Code is running");
    return;
  }

  if(type == undefined){
    console.log(`${input}`)
  }else if(type == "title"){
    console.log(`-----${input}-----`);
  }else if(type == "object"){
    console.log(input);
  }else if(type == "table"){
    console.table(input);
  }else if(type == "string"){
    input = JSON.stringify(input)
    input = input.substring(1);
    input = input.substring(0, input.length - 1);
    console.log(input);
  }
}

//Error finder
meowStatus = true;
function meow(message, id){
  if(meowStatus[id] === true){
    console.log(`MEOW: ${message}`);
  }
}

//LOCAL STORAGE CLASS
// ~~~GUIDE~~~
// const NAMEOFBOX = new cardboardBox("NAMEOFBOX");
// NAMEOFBOX.set(DATAYOUWANTTOSAVE);
// NAMEOFBOX.save();
// console.log(NAMEOFBOX.get())
class cardboardBox{
  constructor(name){
    this.name = name;
    this.data;
    if(JSON.parse(localStorage.getItem(this.name)) === null){
      this.data = `${name} data goes here`;
      window.localStorage.setItem(name, JSON.stringify(this.data));
    }else{
      this.data = JSON.parse(localStorage.getItem(this.name));
    }
    
  }
  save(){
    window.localStorage.setItem(name, JSON.stringify(this.data));
  }
  set(data){
    this.data = data;
    window.localStorage.setItem(this.name, JSON.stringify(this.data));
  }
  get(){
    if(JSON.parse(localStorage.getItem(this.name)) === this.data){
      return JSON.parse(localStorage.getItem(this.name));
    }else{
      purr(`Local storage and data do not match on ${this.name}`)
      console.log(`data: ${this.data}`);
      console.log(`local: ${JSON.parse(localStorage.getItem(this.name))}`)
    }
  }
}



//Title Case
function titleCase(string) {
  if (typeof string !== "string"){
    purr("CALICO ERROR: TYPEOF IS NOT A STRING"); 
    return "ERROR: TYPEOF IS NOT A STRING";
  }else{
    string = string.toLowerCase().split(' ');
    for (var i = 0; i < string.length; i++) {
      string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1); 
    }
    return string.join(' ');
  }
}

function getRandomInt(min, max) {
  if(min === undefined){min = 1;}
  if(max === undefined){max = 100;}
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//ON KEY PRESS FUNCTION
//Light Mode and Dark Mode toggle
//ctrlKey and metaKey make it work on Windows and Mac.
//This function, keyPressSetup, ~~~NEEDS~~~ a window.onload = function to work
function keyPressSetup(){
  document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "k"){
      alert("k key pressed");
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "l") { 
        toggleNightMode();
    }
  });
}


//CSS Stuff
//Night Mode

const nightMode = new cardboardBox("nightMode");
nightMode.save();
function toggleNightMode(){
  if(nightMode.get() === false){
    switchToNightMode();
  }else{
    switchToDayMode();
  }
}
//Colors and switch functions are in main.js