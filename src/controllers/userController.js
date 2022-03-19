import User from '../models/User';
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
export const edit = (req, res) => res.send('Edit User');
export const remove = (req, res) => res.send('Remove User');
export const getLogin = (req, res) => {
	res.render('login', { pageTitle: 'Login' });
};
export const postLogin = async (req, res) => {
	const pageTitle = 'Login';
	const { username, password } = req.body;
	const user = await User.findOne({ username , socialOnly: false});
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
		const emailObj = emailData.find(
			(email) => email.primary && email.verified);
		if (!emailObj) {
			// No valid email found
			return res.redirect("/login");
		}
			
		// Step 4: Check user and create user if doesn't exist.
		let user = await User.findOne({email: emailObj.email});
		if (!user) {
			user = await User.create({
				avatarUrl: userData.avatar_url,
				name: userData.name,
				username: userData.login,
				email: emailObj.email,
				password: "",
				socialOnly: true,
				location: userData.location,
			})
		}
		req.session.loggedIn = true;
		req.session.user = user;
		
		// Login Completed!
		return res.redirect("/");
	} else {
		// access token error
		return res.redirect('/login');
	}
};

export const see = (req, res) => res.send('See User');