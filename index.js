require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;


//console.log(mongoose.connection.readyState);

console.log(process.env.DB_URI)
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });



app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

let schema = new mongoose.Schema({ url: String, shorturl: Number });
let Url = mongoose.model("Url", schema);

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async(req, res) => {
  
  const bodyurl = req.body.url;
  const checkaddress = dns.lookup(urlparser.parse(bodyurl).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' })
    } else {
      let shortUrl = Math.floor(Math.random() * 100000);
      console.log(shortUrl);
      const url = new Url({ url: bodyurl, shorturl: shortUrl });


      let data = await url.save()
      return res.send({original_url:data.url,short_url:data.shorturl})
     


    }
  })

});




app.get('/api/shorturl/:shortUrl', async(req, res) => {
  let shortURL = parseInt(req.params.shortUrl);
  let data=await Url.findOne({ shorturl: shortURL })
  if(data){
    console.log(data)
    res.redirect(data.url)
    return;
    
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
