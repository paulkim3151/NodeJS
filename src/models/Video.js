import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	fileUrl: { type: String, required: true },
	thumbUrl: { type: String, required: true },
	description: { type: String, required: true, trim: true },
	createdAt: { type: Date, required: true, default: Date.now },
	hashtags: [{ type: String, trim: true }],
	meta: {
		views: { type: Number, default: 0, required: true },
		rating: { type: Number, default: 0, required: true },
	},
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
	owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

videoSchema.static('formatHashtags', function (hashtags) {
	return hashtags.split(',').map((word) => (word.startsWith('#') ? word.trim() : `#${word.trim()}`));
});

const Video = mongoose.model('Video', videoSchema);
export default Video;