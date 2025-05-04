import React, { useState, useContext } from 'react';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import ChatBot from 'react-simple-chatbot';
import Review from './Review';

const useStyles = makeStyles((theme) => ({
  title: {
    margin: theme.spacing(2, 0),
  },
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(15),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  choice: {
    marginBottom: '0.75rem',
  },
  textField: {
    minHeight: '5rem',
    margin: '0.25rem 0',
  },
  submit: {
    maxWidth: theme.spacing(12.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    margin: theme.spacing(1),
    position: 'relative',
    textAlign: 'center',
  },
}));


const ChatBot = () => {
  const classes = useStyles();
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    // Fetch related articles and videos based on the current URL or page
    fetch("https://rm-dev-api.buildly.io/help/contextual-help/", {
      method: "GET",
      body: JSON.stringify({ form_name: window.location.pathname }),
    })
      .then((response) => response.json())
      .then((data) => {
        setRelatedArticles(data.articles);
        setRelatedVideos(data.videos);
      });
  }, []);

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("https://rm-dev-api.buildly.io/help/chatbot/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_input: input }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponses([...responses, data]);
        setInput("");
      });
  };

  return (
    <div component="main" maxWidth="md" className={classes.container}>
      <h1>ChatBot</h1>
      <h2>Related Articles:</h2>
      <ul>
        {relatedArticles.map((article, index) => (
          <li key={index}>
            <a href={article.url}>{article.title}</a>
          </li>
        ))}
      </ul>
      <h2>Related Videos:</h2>
      <ul>
        {relatedVideos.map((video, index) => (
          <li key={index}>
            <a href={video.url}>{video.title}</a>
          </li>
        ))}
      </ul>
      <form className={classes.form} onSubmit={handleSubmit}>
        <input type="text" value={input} onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {responses.map((response, index) => (
          <li key={index}>
            <p>User: {response.user_input}</p>
            <p>Chatbot: {response.chatbot_response}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatBot;