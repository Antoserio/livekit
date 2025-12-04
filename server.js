require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const perplexityKey = process.env.PERPLEXITY_API_KEY;
        const { message, systemPrompt } = req.body;
        if (!message) return res.status(400).json({ error: 'message required' });
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
                { role: 'system', content: systemPrompt || 'Responde breve en español.' },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 150
        }, {
            headers: { 'Authorization': `Bearer ${perplexityKey}`, 'Content-Type': 'application/json' }
        });
        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.send('Backend OK'));
app.listen(process.env.PORT || 8080);
