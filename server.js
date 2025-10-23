const express = require('express');
const bodyParser = require('body-parser');
const shortid = require('shortid');

const app = express();
const port = process.env.PORT || 3000;

// প্রোডাকশনের জন্য BASE_URL সেট করুন, নাহলে ডিফল্ট হিসেবে localhost থাকবে
// লাইভ সার্ভারে BASE_URL=https://shortcode.shortcuturl.com সেট করতে হবে
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// ডেটা স্টোর করার জন্য একটি সাধারণ অবজেক্ট (সার্ভার রিস্টার্ট হলে ডেটা মুছে যাবে)
const shortCodes = {}; // ফরম্যাট: { shortCode: originalURL }

// মিডলওয়্যার সেটআপ
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// শর্ট কোড তৈরি করার জন্য API এন্ডপয়েন্ট
app.post('/generate-shortcode', (req, res) => {
    const originalURL = req.body.url;
    if (!originalURL) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const customShortCode = req.body.customCode || shortid.generate();

    if (shortCodes[customShortCode]) {
        return res.status(409).json({ error: 'Custom short code already exists' });
    }

    shortCodes[customShortCode] = originalURL;

    // ----- ১৫ মিনিটের টাইমারটি এখান থেকে সরিয়ে দেওয়া হয়েছে -----

    // BASE_URL ব্যবহার করে সম্পূর্ণ শর্ট লিঙ্ক তৈরি করুন
    res.json({ originalURL, shortCode: customShortCode, shortURL: `${BASE_URL}/${customShortCode}` });
});

// শর্ট কোড রিডাইরেক্ট করার জন্য এন্ডপয়েন্ট
app.get('/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const originalURL = shortCodes[shortCode];

    if (originalURL) {
        res.redirect(originalURL);
    } else {
        res.status(404).send('Short code not found');
    }
});

// সার্ভার শুরু করুন
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Base URL is set to: ${BASE_URL}`);
});