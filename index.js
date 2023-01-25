//jshint esversion:6

const express = require("express");

// const bodyParser = require("body-Parser");

const mongoose = require("mongoose");

const app = express();

const _  = require('lodash');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true}));

// app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json());

app.use(express.static("public"));

mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://admin-Ammar:8f1RyGhKUbDaKejy@cluster0.nwycpvo.mongodb.net/todoDB", {useNewUrlParser: true});

//define model based on schema

const itemsSchema = {
  name: String
};

//create some items

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
name: "welcome to my todo list."
});

const item2 = new Item({
name: " hit the + to add new item."
});

const item3 = new Item({
name: " hit -- tosave your daily activities."
});

// schema for customlist

const listSchema ={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("list",listSchema);

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("items added successfully to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today",newListItems: foundItems});
}
  });

});

app.get("/:customListName", function (req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name :customListName}, function (err, foundList){

if(!err){

  if(!foundList){

// create a new list

const list = new List ({
name : customListName,
items : defaultItems
});

list.save();

res.redirect("/" + customListName);

}else{

// show an exesting list

res.render("list",{listTitle: foundList.name,newListItems: foundList.items})
}
}
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;

  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {

      if (!err) {
        console.log(" checked item deleted successfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList) {
      if (!err) {
        res.redirect("/"+ listName);
      }
    });
  }

 
});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
