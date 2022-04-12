import '../socket.io/socket.io.js'
let numberOfIssues = 0;
let table = document.getElementById("issues-table");
window.onload = numberOfRows();

function numberOfRows() {
let numberOfRows = document.querySelectorAll("#issueRow")
console.log(numberOfRows.length)
  numberOfIssues = numberOfRows.length;
}


console.log("public/index!!!!!!")
const socket = window.io()

socket.on('issues/index', ( issue) => insertIssue( issue.data))
// console.log("hatt")
function insertIssue(issue) {
  // console.log("req.session.avatarUrl: " + req.session.avatarUrl)
  numberOfIssues++
  let newRow = document.getElementById("issues-table").insertRow(numberOfIssues);

  newRow.setAttribute("style", "background-color: #ffc107ff;");
  let cell = newRow.insertCell(0);
    cell.innerHTML = numberOfIssues;


  for(let i=0; i<6; i++){
    console.log(issue[i])
    let cell = newRow.insertCell(i+1);
    if(i === 3){
      
      cell.innerHTML = "<i class=\"fa-solid fa-calendar-days\"></i> " + issue[i].substring(0,10) + " <i class=\"fa-regular fa-clock\"></i> " + issue[i].substring(12,21);
    }
    else if(i === 5){

      cell.innerHTML = "<img src=\"" + issue[i] + "\" alt=\"avatar\" class=\"w-50 img-thumbnail\">";
    }else {
      cell.innerHTML = issue[i];
    }
    
  }
  cell = newRow.insertCell(7)
  // cell.innerHTML = "<a class=\"btn btn-warning align-middle customButton\" href=\"/close/"+issue[1]+"\" role=\"button\" style=\"vertical-align: middle\"><i class=\"fa-solid fa-xmark\"></i></a><a class=\"btn btn-warning align-middle customButton\" href=\"/updateTitle/"+issue[1]+"\" role=\"button\" style=\"vertical-align: middle\"><i class=\"fa-solid fa-bolt\"></i></a>";
}
