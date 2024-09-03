import mongoose from "mongoose";

class DB {
	constructor() {
		mongoose.connect(`mongodb://localhost:27017/fashionova`).then(() => {
			console.log("Database connected.");
		}).catch(() => { console.log("Failed to connect to the database."); })
	}
}

export default DB;
