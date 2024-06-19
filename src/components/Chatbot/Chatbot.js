import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import {
  Box, Button, Fab, Popover, useTheme,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Set sender here
const sender = 'Buildly Product Labs';
// Initial message state
const initialMessages = [{
  message: 'Hello there! How can I help you today?',
  sender,
}];

const Chatbot = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const history = useHistory();
  const theme = useTheme();
  const open = Boolean(anchorEl);
  const id = open ? 'chatbot-popover' : undefined;

  useEffect(() => {
    if (history.action === 'PUSH') {
      setMessages(initialMessages);
    }
  }, []);

  const handleSend = async (message) => {
    const newMessages = [...messages, { message, sender: 'user' }];
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToBabble(newMessages);
  };

  async function processMessageToBabble(chatMessages) {
    await fetch(window.env.BABBLE_CHATBOT_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: _.last(chatMessages).message }),
      })
      .then((data) => data.json())
      .then((data) => {
        setMessages([...chatMessages, {
          message: data.response,
          sender,
        }]);
        setIsTyping(false);
      })
      .catch((error) => {
        setIsTyping(false);
      });
  }

  return (
    <div style={{ position: 'fixed', right: theme.spacing(4), bottom: theme.spacing(3) }}>
      <Button variant="text" onClick={(e) => setAnchorEl(e.currentTarget)} pt={theme.spacing(2)}>
        <Fab color="primary" aria-label="Ask for help here">
          <SmartToyIcon />
        </Fab>
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={(e) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box width={theme.spacing(48)} height={theme.spacing(75)}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={isTyping ? <TypingIndicator content={`${sender} is typing`} /> : null}
              >
                {_.map(messages, (message, i) => <Message key={i} model={message} />)}
              </MessageList>
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </Box>
      </Popover>
    </div>
  );
};

export default Chatbot;
