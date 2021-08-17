import React, { Component } from 'react';
import { withRouter } from 'react-router';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import { UHST } from 'uhst';
import './Chat.css';

class Chat extends Component {
  client = null;

  constructor(props) {
    super(props);
    this.state = {
      joined: false,
      nickname: null,
      messages: [],
    };
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    const uhst = new UHST();
    try {
      this.client = uhst.join(id);
      this.client.on('open', () => {
        const nickname = this.promptForNickname();
        this.client.send(
          JSON.stringify({
            command: 'set_nickname',
            nickname,
          })
        );
      });
      this.client.on('message', (json) => {
        const message = JSON.parse(json);
        switch (message.event) {
          case 'new_message':
            this.setState({
              messages: [
                ...this.state.messages,
                {
                  me: message.author === this.state.nickname,
                  author: message.author,
                  body: message.body,
                },
              ],
            });
            break;
          case 'nickname_taken':
            const nickname = this.promptForNickname(
              'Nickname already taken. Please choose a new one:',
              message.nickname
            );
            this.client.send(
              JSON.stringify({
                command: 'set_nickname',
                nickname,
              })
            );
            break;
          case 'room_joined':
            this.setState({
              joined: true,
              nickname: message.nickname,
            });
            break;
          default:
            console.log(`Unsupported event: ${message.event}.`);
        }
      });
      this.client.on('error', (message) => {
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

  promptForNickname = (hint, initial) => {
    if (!hint) {
      hint = 'Please enter your nickname:';
    }
    let nickname = prompt(hint, initial);
    while (!nickname) {
      nickname = prompt('Nickname is required:');
    }
    return nickname;
  };

  handleNewMessage = (text) => {
    this.client.send(
      JSON.stringify({
        command: 'new_message',
        body: text,
      })
    );
  };

  render() {
    const id = this.props.match.params.id;

    return (
      <>
        <h3>Room: {id}</h3>
        <div className="Chat">
          <MessageList messages={this.state.messages} />
          {this.state.joined ? (
            <MessageForm onMessageSend={this.handleNewMessage} />
          ) : null}
        </div>
      </>
    );
  }
}

export default withRouter(Chat);
