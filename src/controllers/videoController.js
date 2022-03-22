import Video from '../models/Video';
import User from '../models/User';

export const home = async (req, res) => {
	const videos = await Video.find({}).sort({createdAt: "desc"}).populate("owner");
	return res.render('home', { pageTitle: 'Home', videos });
};
export const watch = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id).populate("owner");
	
	if (!video) {
		return res.status(404).render('404', { pageTitle: 'Video not found.'});
	}
	
	video.meta.views++;
	await video.save()
	return res.render('watch', { pageTitle: `Watching ${video.title}`, video});
};
export const getEdit = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render('404', { pageTitle: 'Video not found.' });
	}
	
	// Video owner check
	const loggedUserId = req.session.user._id;
	if (String(video.owner) !== String(loggedUserId)) {
		// TODO: not allowed
		return res.status(403).redirect("/");
	}
	
	return res.render('edit', { pageTitle: `Editing: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
	const { id } = req.params;
	const { title, description, hashtags } = req.body;
	const video = await Video.exists({ _id: id });
	if (!video) {
		return res.status(404).render('404', { pageTitle: 'Video not found.' });
	}
	
	// Video owner check
	const loggedUserId = req.session.user._id;
	if (String(video.owner) !== String(loggedUserId)) {
		// TODO: not allowed
		return res.status(403).redirect("/");
	}
	
	await Video.findByIdAndUpdate(id, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	});
	return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
	return res.render('upload', { pageTitle: 'Upload Video' });
};

export const postUpload = async (req, res) => {
	const { path: fileUrl} = req.file;
	const { title, description, hashtags } = req.body;
	const userId = req.session.user._id;
	try {
		const newVideo = await Video.create({
			title,
			description,
			fileUrl,
			owner: userId,
			hashtags: Video.formatHashtags(hashtags),
		});
		
		// update User's Video array
		const user = await User.findById(userId);
		user.videos.push(newVideo._id);
		user.save();
		return res.redirect('/');
	} catch (error) {
		console.log(error)
		return res.status(400).render('upload', { pageTitle: 'Upload Video', errorMessage: error._message });
	}
};

export const search = async (req, res) => {
	const { keyword } = req.query;
	let videos = [];
	if (keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, "i")
			},
		}).populate("owner");
	}
	return res.render('search', { pageTitle: 'Search Video' , videos });
};

export const deleteVideo = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render('404', { pageTitle: 'Video not found.' });
	}
	
	// Video owner check
	const loggedUserId = req.session.user._id;
	if (String(video.owner) !== String(loggedUserId)) {
		// TODO: not allowed
		return res.status(403).redirect("/");
	}
	
	await Video.findByIdAndDelete(id);
	return res.redirect('/');
};
