const express = require('express');
const router = express.Router();
const nodecallspython = require('node-calls-python');
const py = nodecallspython.interpreter;
const path = require('path');
const axios = require('axios');
const { Host } = require('../utils/new/common')

// Initialize Python module
let imageGenerator = null;


const API_KEY = process.env.ZHIPUAI_API_KEY;

// Initialize Python interpreter and load the module
(async () => {
    try {
        const pymodule = await py.import(path.join(__dirname, '../scripts/image_generator.py'));
        imageGenerator = await py.create(pymodule, "ImageGenerator", API_KEY);
    } catch (error) {
        console.error('Failed to initialize Python module:', error);
    }
})();

// Route to render the chat page
router.get('/', (req, res) => {
    res.render('image-chat', {
        title: 'Image Chat',
        layout: 'layouts/main'
    });
});

// API endpoint for image generation
router.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, img_sessionId } = req.body;
        // if (!prompt) {
        //     return res.status(400).json({ error: 'Prompt is required' });
        // }
        // Try the external image generation API first
        try {
            console.log('prompt:', prompt);
            // const img_sessionId = localStorage.getItem('img_sessionId', sessionId);
            console.log('img_sessionId:', img_sessionId);
            const apiResponse = await axios.get(`${Host.prod}/ai/image/generate?message=${prompt}&sessionId=${img_sessionId}`);
            
            console.log('apiResponse:', apiResponse.data);
            if (apiResponse.data.code === 200) {
                return res.json({ imageUrl: apiResponse.data.data, message: apiResponse.data.message });
            } else {
                res.status(200).json({ error: 'Failed to generate image' });
            }
        } catch (error) {
            console.log('External API failed, falling back to local generator:', error);
            // Continue to local generator if external API fails
        }
        // if (!imageGenerator) {
        //     throw new Error('Image generator not initialized');
        // }

        // // Call Python function to generate image - pass prompt as a single argument
        // const response = await py.call(imageGenerator, "generate_image", prompt);
        
        // if (!response) {
        //     throw new Error('Failed to generate image');
        // }

        // if (response.error) {
        //     return res.status(400).json({ error: response.error });
        // }

        // res.json({ imageUrl: response.url });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// Add new endpoint for downloading images
router.post('/api/download-image', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        // Fetch the image using axios
        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer'
        });

        // Set appropriate headers
        res.set({
            'Content-Type': response.headers['content-type'],
            'Content-Disposition': 'attachment; filename=generated-image.png'
        });

        // Send the image data
        res.send(Buffer.from(response.data, 'binary'));

    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Failed to download image' });
    }
});

module.exports = router; 