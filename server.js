require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        console.log('📥 Request:', req.body);
        const perplexityKey = process.env.PERPLEXITY_API_KEY;
        
        if (!perplexityKey) {
            console.error('❌ PERPLEXITY_API_KEY no configurada');
            return res.status(500).json({ error: 'API key missing' });
        }
        
        const { message, systemPrompt } = req.body;
        if (!message) {
            console.log('⚠️ Mensaje vacío');
            return res.status(400).json({ error: 'message required' });
        }
        
        console.log('📤 Llamando a Perplexity...');
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'llama-3.1-sonar-small-128k-chat',
            messages: [
                { role: 'system', content: systemPrompt || 'Responde breve en español.' },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 150
        }, {
            headers: { 
                'Authorization': `Bearer ${perplexityKey}`, 
                'Content-Type': 'application/json' 
            }
        });
        
        console.log('✅ Respuesta de Perplexity recibida');
        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('❌ Error completo:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.get('/', (req, res) => res.send('Backend OK'));
app.listen(process.env.PORT || 10000, () => console.log('Server running'));
