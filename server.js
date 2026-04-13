const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(__dirname));

// Serve audience page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'audience.html'));
});

// Serve artist dashboard
app.get('/artist', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend.html'));
});

// State
let currentPrompt = {
  text: 'Welcome. The performance is about to begin.',
  id: 0,
  active: false
};
let responses = []; // { id, participantId, promptId, promptText, response, timestamp }
let participantCount = 0;

io.on('connection', (socket) => {
  const isArtist = socket.handshake.query.role === 'artist';

  if (isArtist) {
    console.log(`Artist connected: ${socket.id}`);

    // Send current state to artist
    socket.emit('state', { currentPrompt, responses, participantCount });

    // Artist sends a new prompt to all audience members
    socket.on('send_prompt', (promptText) => {
      currentPrompt = {
        text: promptText,
        id: currentPrompt.id + 1,
        active: true
      };
      console.log(`New prompt [${currentPrompt.id}]: "${promptText}"`);
      io.to('audience').emit('new_prompt', currentPrompt);
      io.to('artists').emit('prompt_updated', currentPrompt);
    });

    // Artist clears/closes the current prompt
    socket.on('close_prompt', () => {
      currentPrompt.active = false;
      io.to('audience').emit('prompt_closed');
      io.to('artists').emit('prompt_updated', currentPrompt);
    });

    // Artist clears all responses
    socket.on('clear_responses', () => {
      responses = [];
      io.to('artists').emit('responses_cleared');
    });

    socket.join('artists');

    socket.on('disconnect', () => {
      console.log(`Artist disconnected: ${socket.id}`);
    });

  } else {
    participantCount++;
    console.log(`Audience member connected: ${socket.id} (total: ${participantCount})`);

    // Send current prompt to new participant
    socket.emit('current_state', { currentPrompt });

    // Notify artists of participant count
    io.to('artists').emit('participant_count', participantCount);

    socket.join('audience');

    // Audience member submits a response
    socket.on('submit_response', (text) => {
      if (!currentPrompt.active) return;

      const entry = {
        id: Date.now(),
        participantId: socket.id.slice(0, 6),
        promptId: currentPrompt.id,
        promptText: currentPrompt.text,
        response: text,
        timestamp: new Date().toISOString()
      };
      responses.push(entry);
      console.log(`Response from ${entry.participantId}: "${text}"`);

      // Send to all artists
      io.to('artists').emit('new_response', entry);

      // Confirm to the participant
      socket.emit('response_received');
    });

    socket.on('disconnect', () => {
      participantCount = Math.max(0, participantCount - 1);
      io.to('artists').emit('participant_count', participantCount);
      console.log(`Audience member disconnected: ${socket.id} (total: ${participantCount})`);
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎭 Performance server running`);
  console.log(`   Audience  → http://localhost:${PORT}`);
  console.log(`   Artist    → http://localhost:${PORT}/backend\n`);
});
