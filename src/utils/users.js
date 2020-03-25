const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!room || !username) {
    return {
      error: 'Room and username are required'
    };
  }

  const exists = users.find(user => {
    return user.username === username && user.room === room;
  });
  if (exists) {
    return {
      error: 'Username is already in the room'
    };
  }

  const user = { id, username, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const user = { ...users[index] };
    users.splice(index, 1);
    return user;
  }
}

const getUser = (id) => {
  return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
