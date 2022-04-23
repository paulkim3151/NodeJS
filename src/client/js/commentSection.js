const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');

const addComment = (text, id) => {
	const videoComments = document.querySelector('.video__comments ul');
	const newComment = document.createElement('li');
	newComment.className = 'video__comment';
	newComment.dataset.id = id;
	const content = document.createElement('div');
	content.className = 'video__comment-content';
	const xmark = document.createElement('div');
	xmark.className = 'video__comment-x';
	const xmark_icon = document.createElement('i');
	xmark_icon.className = 'fas fa-xmark';
	const comment_icon = document.createElement('i');
	comment_icon.className = 'fas fa-comment';
	const span = document.createElement('span');
	span.innerText = ` ${text}`;

	xmark.appendChild(xmark_icon);
	content.appendChild(comment_icon);
	content.appendChild(span);
	newComment.appendChild(content);
	newComment.appendChild(xmark);
	videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
	event.preventDefault();
	const textarea = form.querySelector('textarea');
	const text = textarea.value;
	const videoId = videoContainer.dataset.id;

	if (text === '') {
		return;
	}

	const response = await fetch(`/api/videos/${videoId}/comment`, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify({ text }),
	});

	if (response.status === 201) {
		textarea.value = '';
		const { newCommentId } = await response.json();
		addComment(text, newCommentId);
	}
};

if (form) {
	form.addEventListener('submit', handleSubmit);
}