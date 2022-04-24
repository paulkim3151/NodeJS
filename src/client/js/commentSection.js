const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');

const addCommentElement = (text, id) => {
	const videoComments = document.querySelector('.video__comments ul');
	const newComment = document.createElement('li');
	newComment.className = 'video__comment new';
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

	xmark.append(xmark_icon);
	content.append(comment_icon, span);
	newComment.append(content, xmark);
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
		addCommentElement(text, newCommentId);
	}
};

const deleteCommentElement = (event) => {
	const comment = event.target;
	comment.classList.remove('delete');
	comment.style.visibility = 'hidden';
	comment.parentNode.insertBefore(comment, null);
}

const handleDelete = async (event) => {
	if(!confirm("정말로 삭제하시겠습니까?")) {
		return;
	}
	const comment = event.path[2];
	const id = comment.dataset.id;

	const response = await fetch(`/api/comment/${id}`, {
		method: 'Delete'
	});
	
	if(response.status === 200) {
		comment.classList.add('delete');
		comment.addEventListener('animationend', deleteCommentElement);
	} else {
		console.log(response.status);
	}
}



if (form) {
	form.addEventListener('submit', handleSubmit);
	const videoComments = document.querySelector('.video__comments ul');
	const xbtnList = videoComments.querySelectorAll('button');
	xbtnList.forEach( xbtn => {xbtn.addEventListener('click', handleDelete)});
	
}