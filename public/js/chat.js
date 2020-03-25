const socket = io();

// Elements
const $messageFormButton = document.getElementById('submit');
const $messageFormInput = document.getElementById('message');
const $messageForm = document.getElementById('form');
const $sendLocationButton = document.getElementById('sendlocation');
const $messages = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const getTime = (time) => moment(time).format('h:mm a');

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.offsetHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: getTime(message.createdAt)
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: getTime(message.createdAt)
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit',  (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', $messageFormInput.value, (error) => {
    $messageFormButton.removeAttribute('disabled');

    if (error) {
      return console.log(error);
    }

    $messageFormInput.value = '';
    $messageFormInput.focus();
    console.log('Message delivered');
  });
});


$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('No geolocation supported');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      console.log('Location shared');
      $sendLocationButton.removeAttribute('disabled');
    });
  }, () => {
    console.log('Error');
    $sendLocationButton.removeAttribute('disabled');
  });
});

socket.emit('join', { username, room}, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});