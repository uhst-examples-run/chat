import React, { Component } from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { UHST } from 'uhst';
import Chat from './Chat';

class App extends Component {
  clients = {};
  host = null;

  startHosting = (props) => {
    const id = props.match.params.id;
    const uhst = new UHST();
    this.host = uhst.host(id);
    this.host.on('ready', () => {
      props.history.push(`/room/${this.host.hostId}`);
    });
    this.host.on('connection', (uhstSocket) => {
      uhstSocket.on('message', (json) => {
        const message = JSON.parse(json);
        switch (message.command) {
          case 'new_message':
            this.broadcast(this.clients[uhstSocket.remoteId], message.body);
            break;
          case 'set_nickname':
            const nickname = message.nickname;
            let nicknameTaken = false;
            for (const clientId of Object.keys(this.clients)) {
              nicknameTaken = (this.clients[clientId] === nickname)
              if (nicknameTaken) {
                break;
              }
            }
            if (nicknameTaken) {
              uhstSocket.send(JSON.stringify({
                event: 'nickname_taken',
                timestamp: Date.now(),
                nickname
              }));
            } else {
              uhstSocket.send(JSON.stringify({
                event: 'room_joined',
                timestamp: Date.now(),
                nickname
              }));
              this.clients[uhstSocket.remoteId] = nickname;
              this.broadcast(null, `${this.clients[uhstSocket.remoteId]} joined the room.`);
            }
        }
      });
    });
  };

  broadcast = (author, body) => {
    this.host.broadcast(
      JSON.stringify({
        event: 'new_message',
        timestamp: Date.now(),
        author,
        body
      })
    );
  }

  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route
              exact
              path="/"
              render={(props) => (
                <button
                  type="button"
                  onClick={() => props.history.push('/new')}
                >
                  Create Room
                </button>
              )}
            />
            <Route path="/new/:id?" render={this.startHosting} />
            <Route path="/room/:id" component={Chat} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
