In Express.js how to setup Passport.js with JWT for user authentication?

Certainly! Setting up Passport.js with JWT (JSON Web Tokens) for user authentication in an Express.js application can be divided into the following steps:

1. **Installing Required Packages**:
First, make sure you have all the required packages installed:

```bash
npm install passport passport-jwt jsonwebtoken express express-session bcrypt
```

2. **Setup Express and Passport**:

Start by setting up the basic Express application and integrating Passport:

```javascript
const express = require('express');
const passport = require('passport');

const app = express();

// Initialize passport with Express
app.use(passport.initialize());

// Additional middleware, if you're also using sessions
// app.use(passport.session());
```

3. **Configure Passport to use JWT Strategy**:

Passport requires strategies to handle authentication mechanisms. For JWT, we use the `passport-jwt` strategy:

```javascript
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'YOUR_SECRET_KEY', // Replace with your secret key
};

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  // Find the user based on the JWT payload (e.g., user id)
  User.findById(jwtPayload.id, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));
```

4. **User Registration and JWT Token Generation**:

When a user registers or logs in successfully, you can issue them a JWT:

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
  // Store user with hashed password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({ username: req.body.username, password: hashedPassword });
  await newUser.save();

  const payload = { id: newUser.id };
  const token = jwt.sign(payload, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
  res.json({ message: "User registered!", token });
});
```

5. **Authenticate Routes using Passport**:

Protect your routes using Passport's authenticate method:

```javascript
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send("You're authenticated!");
});
```

6. **Error Handling**:
Ensure you have error handling for authentication failures. Passport will automatically return a 401 Unauthorized response when authentication fails, but you may want to handle these cases in a more granular way.

7. **Storing the Secret Key**:

It's a good practice not to hard-code secret keys in your source code. Use environment variables or some secret management service.

That's a basic setup for user authentication in Express.js using Passport and JWT. In a real-world scenario, make sure to add error handling, handle edge cases, and secure your application using best practices.

Login Route

Certainly! In order to implement a login route that uses JWT for authentication, you'll need to:

1. Receive the user's credentials (typically a username and password) from a POST request.
2. Look up the user in the database based on the provided username.
3. Check that the provided password matches the hashed password stored in the database.
4. If the credentials are valid, generate a JWT and send it back to the user.
5. If the credentials are invalid, respond with an appropriate error message.

Let's implement this:

### 1. Setting up the Express route:

First, set up the necessary routes and import required libraries:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/user');  // Path to your User model

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
```

### 2. Implement the login route:

```javascript
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    try {
        // Look up the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Check the password
        user.comparePassword(password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            // If user is found and password is right, create a JWT
            const payload = { id: user._id, username: user.username };
            const token = jwt.sign(payload, 'your_jwt_secret', {
                expiresIn: '1h'
            });

            // Return the information including token as JSON
            return res.json({ message: 'Successfully authenticated!', token });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
```

### 3. Start the Express server:

```javascript
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Notes:
- The `/login` route above does a few things. It first checks if the client provided both a username and password in the body of the POST request.
- It then tries to find a user in the database with the provided username. If the user doesn't exist, or if the password is wrong, an error message is returned.
- The password check uses the `comparePassword` method we added to the User schema earlier.
- If the username and password are correct, a JWT is generated and returned to the client. The client can then use this JWT to authenticate subsequent requests.
- The secret key 'your_jwt_secret' should be stored in an environment variable or a configuration file in a real-world application for security reasons.
- Consider adding more robust error handling and security measures for a production application.

With this setup, users can now send a POST request to `/login` with their credentials, and if they are correct, receive a JWT to authenticate further requests.

With passport.js and JWT how to handle logout with Short expiration times for tokens?

Handling logout with JWT can be a bit tricky because JWTs are stateless by nature; once issued, they are valid until they expire. If you have set a short expiration time for tokens, then the JWT will automatically become invalid after that duration. However, if you want to enforce a logout action that invalidates a JWT immediately, you have to implement additional mechanisms.

Here's how you can handle logout with short expiration times for JWTs when using Passport.js:

### 1. Use a Token Blacklist:

One approach is to maintain a blacklist of tokens that have been explicitly logged out before their expiration time.

- When a user logs out, store the token in a database (or cache like Redis) with its expiration time.
- On each authenticated request, check if the token exists in the blacklist. If it's there, treat it as invalid.
  
This approach introduces some overhead since you have to check against the blacklist on every request. However, using a fast cache or database (like Redis) can mitigate the performance concerns.

### 2. Refresh Tokens:

Use a combination of access tokens (with a short lifespan) and refresh tokens (with a longer lifespan but still relatively short, e.g., a few days or weeks).

- The access token is used to authenticate the user for API requests.
- The refresh token is used to get a new access token once it expires.
- On logout, invalidate the refresh token.

If an attacker gets the short-lived access token, they can't do much with it for long. And if they get the refresh token, you've invalidated it upon logout.

Here's a brief flow:

1. **Login**:
   - Check user's credentials.
   - If valid, issue an access token (e.g., expires in 15 minutes) and a refresh token (e.g., expires in 7 days).
   - Send both tokens to the client.

2. **Authenticated Request**:
   - Use the access token for authentication.
   - If access token expires, use the refresh token to get a new access token.

3. **Logout**:
   - Receive the refresh token from the client.
   - Blacklist or delete the refresh token so it can't be used anymore.

4. **Token Renewal**:
   - If the access token expires, the client sends the refresh token to the server.
   - The server checks if the refresh token is valid and not blacklisted.
   - If valid, the server issues a new access token.

### Notes:

- With both methods, you must ensure secure token storage on the client-side, often in HTTP-only cookies or session storage.
- Consider using HTTPS to ensure the tokens cannot be intercepted during transit.
- When using the blacklist approach, regularly clean up expired tokens to avoid bloating the storage.
- For many systems, the combination of short-lived access tokens and longer-lived refresh tokens offers a good balance between security and user experience.

In summary, to handle "logout" with JWT, you need to have mechanisms in place to invalidate tokens, either by blacklisting them or using a combination of access and refresh tokens.


Token blacklisting

Blacklisting tokens, especially JWTs, typically involves storing tokens that you want to invalidate before their natural expiration time. Here's how you can implement token blacklisting:

### 1. Choose a Storage:

You need a storage mechanism to maintain the blacklist. Common choices are:

- **Databases** (e.g., MongoDB, PostgreSQL): Suitable for larger applications or longer blacklisting times.
- **In-memory databases** (e.g., Redis): Faster than traditional databases and suitable for short-lived tokens.

For this example, I'll use Redis since it's performant and has an expiration feature built-in, which is handy for this use case.

### 2. Set Up Your Storage:

First, install and set up Redis. If you're using Node.js, you can use the `node-redis` client:

```bash
npm install redis
```

Then, initialize the Redis client in your application:

```javascript
const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis', err);
});
```

### 3. Blacklist Token on Logout:

When a user logs out, add their token to the Redis store. Use the token itself as the key and set an expiration time equivalent to the token's remaining valid time.

```javascript
app.post('/logout', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Assuming token is passed as a Bearer token in the Authorization header
    const remainingTime = jwt.decode(token).exp - Date.now() / 1000;

    if (remainingTime > 0) {
        redisClient.setex(token, remainingTime, 'blacklisted'); // The 'blacklisted' value is arbitrary; you're essentially blacklisting the token key
    }

    res.status(200).send({ message: 'Successfully logged out' });
});
```

### 4. Check Token Against Blacklist on Authenticated Requests:

Before authenticating any request with a token, check if the token is in the blacklist.

```javascript
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret',
}, (jwtPayload, done) => {
    // Check if token is blacklisted
    redisClient.get(jwtPayload.jti, (err, reply) => {
        if (err) {
            return done(err, false);
        }
        if (reply) { // If the token exists in Redis, it's blacklisted
            return done(null, false);
        }

        // ... continue your existing user authentication logic
    });
}));
```

### Notes:

- This example assumes you're passing tokens via the Authorization header in the format: `Authorization: Bearer YOUR_TOKEN_HERE`.
- JWTs have a unique identifier (`jti`) that you can use as the key if you want. This could prevent storing the full token in Redis.
- The actual logic can differ based on how you handle user authentication and tokens in your application, but the general idea remains the same.
- Ensure Redis is securely set up, especially if sensitive data (even JWTs) are stored.
- Regularly back up Redis data or replicate it to avoid data loss.
- Cleaning up isn't required for Redis since the blacklisted tokens automatically expire, but if you're using a different database, you might need a job to clean up expired tokens.

By following these steps, you'll be able to blacklist JWTs or other types of tokens effectively, thereby adding an extra layer of security and control to your application's authentication mechanism.

