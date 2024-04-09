import React, {useState} from 'react';
import './style/style.css';

function Stream() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [jresult, setJresult] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputValue) {
      setError('Please enter a prompt!');
      setPrompt('');
      setResult('');
      setJresult('');
      return;
    }

    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text: inputValue}),
        signal: signal,
      });
      if (response.ok) {
        const reader = response.body.getReader();
        let resultData = '';
        let jResultData = [];
        setPrompt(inputValue);
        setResult(resultData);
        //setJresult(JSON.stringify(data.data, null, 2));
        setInputValue('');
        setError('');
        let readerDone = false;
        while (!readerDone) {
          const {value, done} = await reader.read();
          console.log(done);
          if (done) {
            readerDone = true;
          } else {
            let chunck = new TextDecoder('utf-8').decode(value);
            chunck = chunck
              .replace(/(\r\n|\n|\r)/gm, '')
              .replaceAll('[DONE]', '')
              .replaceAll('{"event: "done"}', '')
              .replace(/\}\s*data:\s*\{/g, '')
              .replaceAll('}{', '},{');
            chunck = `[${chunck}]`;
            chunck = JSON.parse(chunck);
            console.log(chunck);

            let text = '';
            for (const element of chunck) {
              const choices = element.choices;
              if (choices && choices.length > 0) {
                text += choices[0].text;
              }
            }
            resultData += text;
            setResult((prevResult) => (prevResult + text).replaceAll('\n\n', '\n'));

            jResultData.push(chunck);
            setJresult(JSON.stringify(jResultData, null, 2));
          }
        }

      } else {
        throw new Error('An error occured');
      }
    } catch (error) {
      console.log(error);
      setResult('');
      setError('An error occured while submitting the form.');
    }
  };

  return (
    <div className='container'>
      <form className='form-horizontal' onSubmit={handleSubmit}>
        <div className='row form-group mt-2'>
          <div className='col-sm-10'>
            <div className='form-floating'>
              <textarea
                className='form-control custom-input'
                id='floatingInput'
                placeholder='Enter a prompt'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <label htmlFor='floatingInput'>Input</label>
            </div>
          </div>
          <div className='col-sm-2'>
            <button type='submit' className='btn btn-primary custom-button'>
              Submit
            </button>
          </div>
        </div>
      </form>
      {error && <div className='alert alert-danger mt-3'>{error}</div>}
      {prompt && <div className='alert alert-secondary mt-3'>{prompt}</div>}
      {result && <div className='alert alert-success mt-3' style={{whiteSpace: 'pre-line'}} dangerouslySetInnerHTML={{__html: result}}></div>}
      {jresult && (
        <pre className='alert alert-info mt-3'>
          <code>{jresult}</code>
        </pre>
      )}
    </div>
  );

}

export default Stream;
