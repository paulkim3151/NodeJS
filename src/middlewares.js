import multer from "multer";

export const localsMiddleware = (req, res, next) => {
	res.locals.siteName = "Wetube";
	res.locals.loggedIn = Boolean(req.session.loggedIn);
	res.locals.loggedInUser = req.session.user || {};
	next();
}

export const protectorMiddleware = (req, res, next) => {
	if (req.session.loggedIn) {
		next();
	} else {
		// TODO
		console.log("Login required")
		return res.redirect("/login");
	}
}

export const publicOnlyMiddleware = (req, res, next) => {
	if (!req.session.loggedIn) {
		next();
	} else {
		// TODO
		console.log("User already loggedIn.")
		return res.redirect("/");
	}
}

export const avatarUpload = multer({
	dest: "uploads/avatars/",
	limits: {
		fileSize: 3000000,
	}
})

export const videoUpload = multer({
	dest: "uploads/videos/",
	limits: {
		fileSize: 10000000,
	}
})

export const notFoundMiddleware = (req, res, next) => {
	return res.status(404).render('404', { pageTitle: 'Page not found.' });
}