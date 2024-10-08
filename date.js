
module.exports=getDate;

function getDate(){
var today=new Date();
var day=today.toLocaleDateString('en-US',{weekday:'long',day:'numeric', month:'long'});
return day; 
}

