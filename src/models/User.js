import mongoose from 'mongoose';
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	avatarUrl: String,
	username: { type: String, required: true, unique: true },
	password: { type: String},
	socialOnly: {type: Boolean, default: false},
	name: { type: String, required: true },
	location: String,
});

userSchema.pre("save", async function() {
	if (this.socialOnly) {
		return;
	}
	this.password = await bcrypt.hash(this.password, 5);
})

const User = mongoose.model('User', userSchema);

export default User;