import React, { Component } from 'react';
import { withRouter } from 'react-router';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import { UHST } from 'uhst';
import './Chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    };
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    const uhst = new UHST();
    try {
      var client = uhst.join(id);
      client.on('open', () => {
        this.setState({
          client,
        });
      });
      client.on('message', (message) => {
        this.setState({
          messages: [
            ...this.state.messages,
            { me: true, author: 'Me', body: message },
          ],
        });
      });
      client.on('error', (message) => {
        this.props.history.push(`/new/${id}`);
      });
    } catch (err) {
      this.setState({
        messages: [
          ...this.state.messages,
          { body: `Client received error: ${err}` },
        ],
      });
    }
  }

  handleNewMessage = (text) => {
    this.state.client.send(text);
  };

  render() {
    const id = this.props.match.params.id;

    return (
      <>
        <h3>Room: {id}</h3>
        <div className="Chat">
          <MessageList messages={this.state.messages} />
          {this.state.client ? (
            <MessageForm onMessageSend={this.handleNewMessage} />
          ) : null}
        </div>
      </>
    );
  }
}

export default withRouter(Chat);
