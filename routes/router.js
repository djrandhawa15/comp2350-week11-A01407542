const router = require('express').Router();
const database = include('databaseConnection');
// const dbModel = include('databaseAccessLayer');
// const dbModel = include('staticData');

// const userModel = include('models/web_user');
// const petModel = include('models/pet');

const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const Joi = require("joi");
const { ObjectId } = require("mongodb");

const passwordPepper = "SeCretPeppa4MySal+";

router.get('/', async (req, res) => {
	console.log("page hit");
	try {
		const userCollection = database.db('lab_example').collection('users');
		const users = await userCollection.find().project({ first_name: 1, last_name: 1, email: 1, _id: 1 }).toArray();
		if (users === null) {
			res.render('error', { message: 'Error connecting to MongoDB' });
			console.log("Error connecting to userCollection");
		} else {
			console.log(users);
			res.render('index', { allUsers: users });
		}
	}
	catch (ex) {
		res.render('error', { message: 'Error connecting to MongoDB' });
		console.log("Error connecting to MongoDB");
		console.log(ex);
	}
});

// Pets and showPets left unchanged (Sequelize-based)
// Optional to update if you're using them with MongoDB too

router.get('/pets', async (req, res) => {
	console.log("page hit");
	try {
		const pets = await petModel.findAll({ attributes: ['name'] });
		if (pets === null) {
			res.render('error', { message: 'Error connecting to MySQL' });
			console.log("Error connecting to petModel");
		}
		else {
			console.log(pets);
			res.render('pets', { allPets: pets });
		}
	}
	catch (ex) {
		res.render('error', { message: 'Error connecting to MySQL' });
		console.log("Error connecting to MySQL");
		console.log(ex);
	}
});

router.get('/showPets', async (req, res) => {
	console.log("page hit");
	try {
		let userId = req.query.id;
		const user = await userModel.findByPk(userId);
		if (user === null) {
			res.render('error', { message: 'Error connecting to MySQL' });
			console.log("Error connecting to userModel");
		}
		else {
			let pets = await user.getPets();
			console.log(pets);
			let owner = await pets[0].getOwner();
			console.log(owner);

			res.render('pets', { allPets: pets });
		}
	}
	catch (ex) {
		res.render('error', { message: 'Error connecting to MySQL' });
		console.log("Error connecting to MySQL");
		console.log(ex);
	}
});

router.get('/deleteUser', async (req, res) => {
	try {
		console.log("delete user");

		const schema = Joi.string().max(50).required();
		const validationResult = schema.validate(req.query.id);

		if (validationResult.error) {
			console.log("Validation error:", validationResult.error);
			throw validationResult.error;
		}

		let userId = req.query.id;
		const userCollection = database.db('lab_example').collection('users');

		const deleteResult = await userCollection.deleteOne({ _id: new ObjectId(userId) });
		console.log("Delete Result:", deleteResult);

		res.redirect("/");
	}
	catch (ex) {
		res.render('error', { message: 'Error deleting user in MongoDB' });
		console.log("Error deleting in MongoDB");
		console.log(ex);
	}
});

router.post('/addUser', async (req, res) => {
	try {
		console.log("form submit");

		const schema = Joi.object({
			first_name: Joi.string().max(50).required(),
			last_name: Joi.string().max(50).required(),
			email: Joi.string().email().required(),
			password: Joi.string().min(6).required()
		});

		const validationResult = schema.validate(req.body);
		if (validationResult.error) {
			console.log("Validation error:", validationResult.error);
			throw validationResult.error;
		}

		const saltHash = crypto.createHash('sha512');
		saltHash.update(uuid());
		const salt = saltHash.digest('hex');

		const hash = crypto.createHash('sha512');
		hash.update(req.body.password + passwordPepper + salt);
		const password = hash.digest('hex');

		const userCollection = database.db('lab_example').collection('users');

		const newUser = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password_salt: salt,
			password_hash: password
		};

		await userCollection.insertOne(newUser);
		res.redirect("/");
	}
	catch (ex) {
		res.render('error', { message: 'Error adding user to MongoDB' });
		console.log("Error adding to MongoDB");
		console.log(ex);
	}
});

module.exports = router;
