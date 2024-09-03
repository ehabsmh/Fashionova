import { db } from './../index';
class UserController {
	static async register(req: any, res: any) {
		try {
			const newUser = await db.createUser(req.body);
			await newUser.save();
			res.status(201).json({ message: "User created successfully.", newUser })
		} catch (e) {
			if (e instanceof Error)
				res.status(400).json({ error: e.message })
		}
	}
}

export default UserController
