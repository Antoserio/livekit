require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Allow all origins for now
app.use(express.json());

// Endpoint to generate LiveAvatar session token
app.post('/generate-token', async (req, res) => {
    try {
        const apiKey = process.env.HEYGEN_API_KEY;

        if (!apiKey) {
            console.error('HEYGEN_API_KEY is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const { avatar_id, knowledge_base_id } = req.body;

        if (!avatar_id) {
            return res.status(400).json({ error: 'avatar_id is required' });
        }

        // Prepare request body for LiveAvatar API
        const requestBody = {
            mode: 'FULL', // FULL mode for complete avatar interaction
            avatar_id: avatar_id,
            avatar_persona: {
                language: 'es' // Spanish by default, can be made configurable
            }
        };

        // Include knowledge_base_id if provided
        if (knowledge_base_id) {
            requestBody.avatar_persona.context_id = knowledge_base_id;
        }

        console.log('📤 Requesting LiveAvatar token with:', requestBody);

        // Call LiveAvatar API to create session token
        const response = await axios.post(
            'https://api.liveavatar.com/v1/sessions/token',
            requestBody,
            {
                headers: {
                    'X-API-KEY': apiKey,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ LiveAvatar token generated successfully');

        // Return the session data
        res.json(response.data);

    } catch (error) {
        console.error('❌ Error generating token:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to generate token',
            details: error.response ? error.response.data : error.message
        });
    }
});

// Endpoint to chat with Perplexity AI
app.post('/chat', async (req, res) => {
    try {
        const perplexityKey = process.env.PERPLEXITY_API_KEY;

        if (!perplexityKey) {
            console.error('PERPLEXITY_API_KEY is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const { message, systemPrompt } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        const defaultSystemPrompt = systemPrompt || 'Eres un asistente virtual útil y amigable. Responde de manera concisa y clara en español.';

        console.log('📤 Enviando mensaje a Perplexity:', message);

        // Call Perplexity API
        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    { role: 'system', content: defaultSystemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${perplexityKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        console.log('✅ Respuesta de Perplexity recibida');

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('❌ Error en chat:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to get AI response',
            details: error.response ? error.response.data : error.message
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('HeyGen Token Service is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
