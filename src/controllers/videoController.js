import Video from '../models/Video';
import User from '../models/User';
import Comment from '../models/Comment';

export const home = async (req, res) => {
	const videos = await Video.find({}).sort({ createdAt: 'desc' }).populate('owner');
	return res.render('home', { pageTitle: 'Home', videos });
};
export const watch = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id).populate('owner').populate("comments");

	if (!video) {
		return res.status(404).render('404', { pageTitle: 'Video not found.' });
	}
	
	return res.render('watch', { pageTitle: `Watching ${video.title}`, video });
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
		req.flash('error', 'Not allowed.');
		return res.status(403).redirect('/');
	}

	return res.render('edit', { pageTitle: `Editing: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
	const { id } = req.params;
	const { title, description, hashtags } = req.body;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render('404', { pageTitle: 'Video not found.' });
	}

	// Video owner check
	const loggedUserId = req.session.user._id;
	if (String(video.owner) !== String(loggedUserId)) {
		req.flash('error', 'Not allowed.');
		return res.status(403).redirect('/');
	}

	await Video.findByIdAndUpdate(id, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	});
	req.flash('success', 'Video Edited.');
	return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
	return res.render('upload', { pageTitle: 'Upload Video' });
};

export const postUpload = async (req, res) => {
	const { video, thumb } = req.files;
	const { title, description, hashtags } = req.body;
	const userId = req.session.user._id;
	try {
		const newVideo = await Video.create({
			title,
			description,
			fileUrl: video[0].path,
			thumbUrl: thumb[0].path,
			owner: userId,
			hashtags: Video.formatHashtags(hashtags),
		});

		// update User's Video array
		const user = await User.findById(userId);
		user.videos.push(newVideo._id);
		user.save();
		req.flash('success', 'Video Uploaded.');
		return res.redirect('/');
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.render('upload', { pageTitle: 'Upload Video', errorMessage: error._message });
	}
};

export const search = async (req, res) => {
	const { keyword } = req.query;
	let videos = [];
	if (keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, 'i'),
			},
		}).populate('owner');
	}
	return res.render('search', { pageTitle: 'Search Video', videos });
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
		req.flash('error', 'Not allowed.');
		return res.status(403).redirect('/');
	}

	await Video.findByIdAndDelete(id);
	req.flash('success', 'Video Deleted.');
	return res.redirect('/');
};

export const registerView = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (!video) {
		return res.sendStatus(404);
	}

	video.meta.views++;
	await video.save();

	return res.sendStatus(200);
};

export const createComment = async (req, res) => {
	const {
		session: { user },
		body: { text },
		params: { id },
	} = req;
	
	if (!user) {
		// user doensn't exist
		return res.sendStatus(403); //403 forbidden
	}
	const userModel = await User.findById(user._id);
	if(!userModel) {
		return res.sendStatus(400);
	}
	
	const video = await Video.findById(id);
	if (!video) {
		// video doesn't exist
		return res.sendStatus(404);
	}
	
	const comment = await Comment.create({
		text,
		owner: user._id,
		video: id,
	})
	
	video.comments.push(comment._id);
	userModel.comments.push(comment._id);
	
	await video.save();
	await userModel.save();
	
	return res.status(201).json({newCommentId:comment._id}); //201 Created
};