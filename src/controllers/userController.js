import User from '../models/User';
import Video from '../models/Video';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

export const getJoin = (req, res) => {
	res.render('join', { pageTitle: 'Create Account' });
};
export const postJoin = async (req, res) => {
	const { name, username, email, password, password2, location } = req.body;
	const pageTitle = 'Create Account';

	if (password !== password2) {
		return res.status(400).render('join', {
			pageTitle,
			errorMessage: 'Password confirmation does not match',
		});
	}

	const exists = await User.exists({ $or: [{ username }, { email }] });
	if (exists) {
		return res.status(400).render('join', {
			pageTitle,
			errorMessage: 'This username/email is already Taken',
		});
	}

	try {
		await User.create({
			name,
			username,
			email,
			password,
			location,
		});
		return res.redirect('/login');
	} catch (error) {
		return res.status(400).render('join', {
			pageTitle,
			errorMessage: error._message,
		});
	}
};

export const getLogin = (req, res) => {
	res.render('login', { pageTitle: 'Login' });
};
export const postLogin = async (req, res) => {
	const pageTitle = 'Login';
	const { username, password } = req.body;
	const user = await User.findOne({ username, socialOnly: false });
	if (!user) {
		return res.status(400).render('login', {
			pageTitle,
			errorMessage: 'An account not found.',
		});
	}

	const ok = await bcrypt.compare(password, user.password);
	if (!ok) {
		return res.status(400).render('login', {
			pageTitle,
			errorMessage: 'Wrong password.',
		});
	}
	req.session.loggedIn = true;
	req.session.user = user;
	res.redirect('/');
};
export const logout = (req, res) => {
	req.session.destroy();
	res.redirect('/');
};

export const startGithubLogin = (req, res) => {
	const baseUrl = 'https://github.com/login/oauth/authorize';
	const config = {
		client_id: process.env.GH_CID,
		allow_signup: false,
		scope: 'read:user user:email',
	};
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
	// Step 1: Send POST request with github's code to get access_token
	const baseUrl = 'https://github.com/login/oauth/access_token';
	const config = {
		client_id: process.env.GH_CID,
		client_secret: process.env.GH_SECRET,
		code: req.query.code,
	};
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	const tokenRequest = await (
		await fetch(finalUrl, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
		})
	).json();

	if ('access_token' in tokenRequest) {
		// Step 2: Send GET request with acess_token to get userData
		const { access_token } = tokenRequest;
		const apiUrl = 'https://api.github.com';
		const userData = await (
			await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();

		// Step 3: Get primary & verified user email
		const emailData = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		const emailObj = emailData.find((email) => email.primary && email.verified);
		if (!emailObj) {
			// No valid email found
			req.flash("error", "No valid email found.");
			return res.redirect('/login');
		}

		// Step 4: Check user and create user if doesn't exist.
		let user = await User.findOne({ email: emailObj.email });
		if (!user) {
			user = await User.create({
				avatarUrl: userData.avatar_url,
				name: userData.name,
				username: userData.login,
				email: emailObj.email,
				password: '',
				socialOnly: true,
				location: userData.location,
			});
		}
		req.session.loggedIn = true;
		req.session.user = user;

		// Login Completed!
		return res.redirect('/');
	} else {
		// access token error
		req.flash("error", "Access token error.");
		return res.redirect('/login');
	}
};

export const getEdit = (req, res) => {
	return res.render('edit-profile', { pageTitle: 'Edit Profile' });
};

export const postEdit = async (req, res) => {
	const {
		session: {
			user: { _id, avatarUrl},
		},
		file,
		body: { name, email, username, location },
	} = req;
	
	// Check validation of email and user if they were changed
	if (email !== req.session.user.email || username !== req.session.user.username) {
		const exists = await User.exists({ $or: [{ username }, { email }] });
		if (exists) {
			req.flash("error", "User already exist.");
			return res.redirect('/users/edit');
		}
	}
	
	const updatedUser = await User.findByIdAndUpdate(
		_id, 
		{avatarUrl: file ? file.path : avatarUrl,
		 name, email, username, location}, 
		{new: true});
	req.session.user = updatedUser; // update session
	return res.redirect('/users/edit');
};

export const getChangePassword= (req, res) => {
	if(req.session.user.socialOnly) {
		req.flash("error", "Invaild request.");
		return res.redirect("/");
	}
	return res.render("change-password", {pageTitle: "Change Password"});
}

export const postChangePassword= async (req, res) => {
	const {
		session: {
			user: { _id, password },
		},
		body: { oldPassword, newPassword, newPassword2 },
	} = req;
	
	if (newPassword !== newPassword2) {
		return res.status(400).render("change-password", {
			pageTitle: "Change Password",
			errorMessage: "Password Confirmation check failed."
		});
	}
	
	if (oldPassword === newPassword) {
		return res.status(400).render("change-password", {
			pageTitle: "Change Password",
			errorMessage: "New password should not be same with old password."
		});
	}
	
	const ok = await bcrypt.compare(oldPassword, password);
	if (!ok) {
		return res.status(400).render("change-password", {
			pageTitle: "Change Password",
			errorMessage: "The current password is incorrect",
		}); 
	}
	
	// Change password
	const user = await User.findById(_id);
	user.password = newPassword;
	await user.save();
	req.flash("info", "Password changed.");
	req.session.destroy();
	return res.redirect("/login");
}

export const see = async (req, res) => {
	const { id } = req.params;
	const user = await User.findById(id).populate({
		path: "videos",
		populate: {
			path: "owner",
			model: "User",
		}
	});
	if (!user) {
		return res.status(404).render("404", { pageTitle: 'User not found.' });
	}
	return res.render("profile", {pageTitle: `${user.name}의 Profile`, user});
}