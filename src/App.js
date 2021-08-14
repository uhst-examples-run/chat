import React, { Component } from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { UHST } from 'uhst';
import Chat from './Chat';

class App extends Component {
  startHosting = (props) => {
    const id = props.match.params.id;
    const uhst = new UHST();
    const host = uhst.host(id);
    host.on('ready', () => {
      props.history.push(`/room/${host.hostId}`);
    });
    host.on('connection', function connection(uhstSocket) {
      uhstSocket.on('message', function incoming(message) {
        host.broadcast(message);
      });
    });
  };

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
