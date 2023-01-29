/*
This is the main apparatus for the website to fetch, update, and submit data as requested by
the user. 
*/
const dotenv = require("dotenv").config(); 
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const {MongoClient} = require("mongodb");
const ObjectId = require('mongodb').ObjectID;
require("dotenv").config();

//connect:
const DBconnection = process.env.MONGO_LINK;
const table = process.env.TABLE;
const database = process.env.DATABASE;

MongoClient.connect(DBconnection, { useUnifiedTopology: true})
	.then(client => {
	console.log(`Connected to database: ${database}`);
	console.log(`Connected to collection: ${table}`);

	app.use(bodyParser.urlencoded({ extended: true }));
	app.set('views', './views');
	app.set('view engine', 'ejs');

	const db = client.db(database);
	const collection = db.collection(table);	


			function randomNumber(min, max){
			return Math.floor(Math.random() * (max - min) + min); 
		}

			let rand1 = randomNumber(1,10)
			let rand2 = randomNumber(1,rand1)
			let rand3 = randomNumber(rand1,rand2)
			R = randomNumber(rand2,rand3)

			let doc = function(data){
  			return db.collection(table).find().limit(-1).skip(R-1).next()
  		}

			app.get("/", async (req, res) => {
				console.log("rand1: "+rand1+" rand2: "+rand2+" rand3: "+rand3+" R: "+R)

				await doc()
		      .then(numbers => {
		        res.render("template.ejs", { numbers: numbers});
		      })
		      .catch(error => console.error(error));
		    })

			app.get("/new", async(req,res)=> {

				await db.collection(table).estimatedDocumentCount()
				.then((count) => {
					rand1 = randomNumber(1,count)
				})
				.catch(error => console.error(error));

				rand2 = randomNumber(1,rand1)
				rand3 = randomNumber(rand1,rand2)
				R = randomNumber(rand2,rand3)
				console.log("Got new R: "+R);

				await doc(R)
				.then(result => {
					res.redirect("/")
				})
				.catch(error => console.error(error));
			})


			app.post(`/${table}`, (req, res) => {
				console.log("inputted");
				collection.insertOne(req.body)
				.then(result => {
					res.redirect('/')
				})
				.catch(error => console.error(error))
			});

	app.post("/likes", async (req, res) => {
	console.log("liked")
      let waitForDoc = await doc()
      let waitForDoc_ID = waitForDoc._id
      let waitForDocLikes = parseInt(waitForDoc["likes"])+1
      let updatedData = await db.collection(table).updateOne({"_id":ObjectId(waitForDoc_ID)}, { $set: { likes: waitForDocLikes } })
      res.redirect("/new"); 
  	});

  	app.post("/dislikes", async (req, res) => {
  	  console.log("dislikes")
      let w = await doc()
      let oid = w._id
      let s = parseInt(w["likes"])-1
      let updatedData = await db.collection(table).updateOne({"_id":ObjectId(oid)}, { $set: { likes: s } })
      res.redirect("/new"); 
  	});
});

app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, './public')));

app.listen(process.env.PORT || 4000, () => {
	console.log(`We are live at localhost ${process.env.PORT}!`);
});