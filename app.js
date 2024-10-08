const express=require("express");
const bodyParser=require("body-parser");
const getDate=require("./date");
const mongoose=require("mongoose");
const { name } = require("ejs");
const app=express();
const _ = require("lodash");
require('dotenv').config();




async function main() {
    await mongoose.connect("mongodb+srv://"+process.env.DB_USERNAME+":"+process.env.DB_PASSWORD+"@cluster0.iiz1a.mongodb.net/toDoDB");
}

main().catch((err)=>console.log(err));

const taskSchema=new mongoose.Schema({
    name:String
})

const listschema=new mongoose.Schema({
    name:String,
    itemList:[taskSchema]
})

const Tasks=new mongoose.model("Tasks",taskSchema);

const Lists=new mongoose.model("Lists",listschema);

let tasks;

const t1=new Tasks({
    name:"Welcome to To Do List"
})

const t2=new Tasks({
    name:"Use + for adding new item with name"
})

const t3=new Tasks({
    name:"Hit checkbox for deleting item"
})

const arr=[t1,t2,t3];

async function query() {
    tasks=await Tasks.find({},'name');
    if(tasks.length==0){
        const res=await Tasks.insertMany(arr,{ordered:true,rawResult:true});
    }
}
query();
 

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.get("/",async function(req,res){    
    let day=getDate();  
    tasks=await Tasks.find({},'name');
    res.render("list",{day:day,tasks:tasks});   
});



app.get("/about",function(req,res){
    res.render("about")
})

app.get("/:customName",async function(req,res){
    const customName=_.capitalize(req.params.customName);
    const list=new Lists({
        name:customName,
        itemList:arr
    })
    if(await Lists.exists({name:customName})){
        console.log("list exists");
    }else{
        await list.save();
    }
    const arrCL=await Lists.findOne({name:customName});
    res.render("list",{day:customName,tasks:arrCL.itemList});
})

app.post("/",async function(req,res){
    let taskName=req.body.task;
    let listName=req.body.button;
    let t4=new Tasks({
        name:taskName
    })
    let today=getDate();
    if(listName===today){
        await t4.save();
        res.redirect("/");
    }else{
        let currList=await Lists.findOne({name:listName});
        currList.itemList.push(t4);
        await currList.save();
        res.redirect("/"+listName); 
    }
     
})

app.post("/delete",async function (req,res) {
    let itemID=req.body.checkbox;
    let listName=req.body.day;
    if(listName===getDate()){
        await Tasks.findByIdAndDelete(itemID);
        res.redirect("/");
    }else{
        await Lists.findOneAndUpdate({name:listName},{$pull:{itemList:{_id:itemID}}});
        res.redirect("/"+listName);
    }
    
})

app.listen(process.env.PORT || 3000,function(){
    console.log("server started");
});