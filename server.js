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
        const openaiKey = process.env.OPENAI_API_KEY;
        
        if (!openaiKey) {
            console.error('❌ OPENAI_API_KEY no configurada');
            return res.status(500).json({ error: 'API key missing' });
        }
        
        const { message, systemPrompt } = req.body;
        if (!message) {
            console.log('⚠️ Mensaje vacío');
            return res.status(400).json({ error: 'message required' });
        }
        
        console.log('📤 Llamando a OpenAI...');
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt || 'Responde breve en español.' },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 150
        }, {
            headers: { 
                'Authorization': `Bearer ${openaiKey}`, 
                'Content-Type': 'application/json' 
            }
        });
        
        console.log('✅ Respuesta de OpenAI recibida');
        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('❌ Error completo:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.get('/', (req, res) => res.send('Backend OK'));
app.listen(process.env.PORT || 10000, () => console.log('Server running'));
