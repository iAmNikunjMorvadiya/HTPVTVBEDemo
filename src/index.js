const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const auth0 = require('auth0');
const mysql = require('mysql2');
const app = express();
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

app.use(cors());
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
// Initialize Auth0 management API client
const auth0Client = new auth0.ManagementClient({
  domain: 'dev-j4r00zlzu5nbx3mk.us.auth0.com',
  clientId: 's0LpBdVDArwX0RNGAfZ8uyMesPP6p3eZ',
  clientSecret: 'IRt_gbR84PL2-AKDngw0P2mlzb2QEo-yjqwng-to_2fEAID383H98KUlp9QRBXsu',
  scope: 'read:users create:users'
});

// MySQL database configuration
const dbConfig = {
  host: 'gamedata.cdrluvmrqhlh.us-east-2.rds.amazonaws.com',
  user: 'admin', /* MySQL User */
  password: 'sMOuGumaZuRENtic', /* MySQL Password */
  database: 'HTPV' /* MySQL Database */,
  port: 3306
};

app.use(express.json())



app.get('/api/public', function (req, res) {
    const connection = mysql.createConnection(dbConfig);
  


    connection.query('SELECT * FROM Users', (err, rows) => {
        if (err) {
            console.error('Error executing MySQL query:', err.stack);
            return;
        }

        console.log('Data received from MySQL database:');
        //console.log(rows);
        res.json(rows);
    });

    connection.end();
});






// Start the server
app.listen(3010)
console.log('Listening on http://localhost:3010');
