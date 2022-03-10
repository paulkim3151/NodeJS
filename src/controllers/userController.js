import User from '../models/User';
import bcrypt from 'bcrypt';

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
	const user = await User.findOne({ username });
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
export const logout = (req, res) => res.send('Log out');
export const see = (req, res) => res.send('See User');