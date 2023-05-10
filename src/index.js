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

// const checkJwt =  auth({
//   issuer: 'https://dev-j4r00zlzu5nbx3mk.us.auth0.com',
//   audience: 'https://localhost:3010',
//   secret: 'HTBV',
//   tokenSigningAlg: 'HS256',
// })

app.get('/api/public', function (req, res) {
    const connection = mysql.createConnection(dbConfig);
    // const rows = connection.query('select * from Users');
    // console.log(rows)
    // connection.end();

    // const user = rows[0];
    // res.json(user);
    // if (!user) {
    //   return res.status(401).send('Invalid credentials');
    // }


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

app.get('/api/private', function (req, res) {
  checkJwt(req, res)
});
// Signup API endpoint
app.post('/api/signup', async (req, res) => {
  const { firstname, lastname, email, password, address } = req.body;
  try {
    const connection = mysql.createConnection(dbConfig);
    const query = "INSERT INTO Users (FirstName, LastName,Email,Password,Address) VALUES (?,?,?,?,?)"
    const result = await connection.execute('INSERT INTO Users (FirstName, LastName,Email,Password,Address) VALUES (?,?,?,?,?)', [firstname, lastname, email, /*encrypt(password)*/password, address]);
    const userId = result.insertId;
    await connection.end();
    var data = {
      "user" : "User created successfully"
    }
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create user');
  }
});

// Login API endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  // Check user credentials in the MySQL database
  try {
    const connection = mysql.createConnection(dbConfig);
    // with placeholder
    connection.query(
      'SELECT * FROM `Users` WHERE `email` = ?',
      username,
      function (err, results) {
        // if (password == decrypt(results[0].Password.toString())) {
        if (password == results[0].Password.toString()) {
          const user = results[0];
           // Generate JWT token
          const token = jwt.sign({ sub: user.id }, 'HTBV', { algorithm: 'HS256' }); // Secret key = HTBV
          res.json({ access_token: token });
        }
        else {

          return res.status(401).send('Invalid credentials');

        }
      }
    );
    //console.log(rows)
    await connection.end();


  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to authenticate user');
  }
});

// Login API endpoint
app.get('/auth/:id', async (req, res) => {
  checkJwt(req, res);
  const { id } = req.params;
  try {
    const connection = mysql.createConnection(dbConfig);
    // with placeholder
    connection.query(
      'SELECT * FROM `Users` WHERE `UserID` = ?',
      [id],
      function (err, results) {
        const user = results[0];
        console.log(user)
        if (!user) {
          return res.status(401).send('User not found');
        }
        res.send(user);
      }
    );
    //console.log(rows)
    await connection.end();


  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});




// Define the protected endpoint
app.get('/protected', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    // Verify the JWT token with the secret key
    const decodedToken = jwt.verify(token, 'HTBV');

    res.status(200).json({ message: 'Authenticated user', user: decodedToken });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

function checkJwt(req, res) {
  const token = req.headers.authorization.split(' ')[1];

  try {
    // Verify the JWT token with the secret key
    const decodedToken = jwt.verify(token, 'HTBV');
    return true;
    //res.status(200).json({ message: 'Authenticated user', user: decodedToken });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}
function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');

  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
// Start the server
app.listen(3010)
console.log('Listening on http://localhost:3010');

// const express = require('express');
// const app = express();
// const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
// const cors = require('cors');
// require('dotenv').config();

// if (!process.env.ISSUER_BASE_URL || !process.env.AUDIENCE) {
//   throw 'Make sure you have ISSUER_BASE_URL, and AUDIENCE in your .env file';
// }

// const corsOptions =  {
//   origin: 'http://localhost:3010'
// };

// app.use(cors(corsOptions));

// const checkJwt = auth({
//     audience: process.env.AUDIENCE,
//     issuerBaseURL: process.env.ISSUER_BASE_URL,
// });

// app.get('/api/public', function(req, res) {
//   res.json({
//     message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
//   });
// });

// app.get('/api/private', checkJwt, function(req, res) {
//   res.json({
//     message: 'Hello from a private endpoint! You need to be authenticated to see this.'
//   });
// });

// app.get('/api/private-scoped', checkJwt, requiredScopes('read:messages'), function(req, res) {
//   res.json({
//     message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
//   });
// });

// app.use(function(err, req, res, next){
//   console.error(err.stack);
//   return res.set(err.headers).status(err.status).json({ message: err.message });
// });

// app.listen(3010);
// console.log('Listening on http://localhost:3010');
