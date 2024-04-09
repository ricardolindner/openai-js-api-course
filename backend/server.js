const express = require('express');
const dotenv = require('dotenv');
const app = express();
const {EventEmitter} = require('events');

app.use(express.json());

dotenv.config();

const {Configuration, OpenAIApi} = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const completionEmitter = new EventEmitter();

async function startCompletionStream(prompt) {
  const response = await openai.createCompletion({
    model: 'gpt-3.5-turbo-instruct',
    prompt: prompt,
    temperature: 1,
    max_tokens: 120,
    top_p: 0.5,
    echo: false,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true
  },
    {
      responseType: 'stream'
    });
  response.data.on('data', data => {
    console.log(data.toString().replace(/^data: /gm, '').trim());
    const message = data.toString().replace(/^data: /gm, '').trim();
    if (message !== '[DONE]') {
      completionEmitter.emit('data', message);
    } else {
      completionEmitter.emit('done');
    }
  });
}

app.post('/api/chatgpt', async (req, res) => {
  try {
    const {text} = req.body;

    startCompletionStream(text);

    const dataListener = (data) => {
      res.write(data);
    };

    const doneListener = () => {
      res.write('{"event: "done"}');
      res.end();
      completionEmitter.off('data', dataListener);
      completionEmitter.off('done', doneListener);
    };

    completionEmitter.on('data', dataListener);
    completionEmitter.on('done', doneListener);

    //res.json({data: completion.data});
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Error with OPENAI API request:', error.message);
      res.status(500).json({
        error: {
          message: 'An error occured during your request.',
        },
      });
    }
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

const {encode, decode} = require('gpt-3-encoder');
const x = encode('This is some text');
console.log(x.length);
