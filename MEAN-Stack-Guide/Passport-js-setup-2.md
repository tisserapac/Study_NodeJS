In Express.js how to use Passport.js with JWT to implement user login and logout routes? When the user logout blacklist the token.

Sure! Here's a basic guide to set up Passport.js with JWT for user authentication in Express.js. This also includes token blacklisting on logout:

1. **Setting Up Basic Express.js App**
   - Initialize a new npm project with `npm init`.
   - Install required packages:
     ```bash
     npm install express passport passport-jwt jsonwebtoken mongoose body-parser
     ```

2. **Set Up MongoDB Model for User (with Mongoose)**
   - Create a `User` model (`models/User.js`):
     ```js
     const mongoose = require('mongoose');
     const userSchema = new mongoose.Schema({
       email: { type: String, unique: true },
       password: String
     });
     module.exports = mongoose.model('User', userSchema);
     ```

3. **Set Up Passport.js with JWT**
   - Create a new file `passport.js`:
     ```js
     const passport = require('passport');
     const JwtStrategy = require('passport-jwt').Strategy;
     const ExtractJwt = require('passport-jwt').ExtractJwt;
     const User = require('./models/User');

     const opts = {
       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
       secretOrKey: 'YOUR_JWT_SECRET' // make sure to keep this secret safe!
     };

     passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
       try {
         const user = await User.findById(jwt_payload.id);
         if (user) {
           return done(null, user);
         }
         return done(null, false);
       } catch (error) {
         done(error, false);
       }
     }));

     module.exports = passport;
     ```

4. **Create Routes for Login and Logout**
   - In your main Express app file:
     ```js
     const express = require('express');
     const bodyParser = require('body-parser');
     const jwt = require('jsonwebtoken');
     const passport = require('./passport');
     const User = require('./models/User');

     const app = express();
     const PORT = 3000;

     // Middlewares
     app.use(bodyParser.json());
     app.use(passport.initialize());

     let blacklistedTokens = [];

     app.post('/login', async (req, res) => {
       try {
         const user = await User.findOne({ email: req.body.email });
         if (!user) {
           return res.status(401).json({ error: "User not found." });
         }

         // Here, you would also check the password, using something like bcrypt
         // For simplicity, we skip that step.

         const token = jwt.sign({ id: user.id }, 'YOUR_JWT_SECRET', { expiresIn: '1h' });
         res.json({ token });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     app.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
       const token = req.header('Authorization').split(' ')[1];
       blacklistedTokens.push(token);
       res.json({ message: 'Logged out successfully' });
     });

     app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
       res.json({ message: 'This is a protected route!' });
     });

     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
     ```

5. **Enhance the JWT Strategy to Check Blacklisted Tokens**:
   Modify the `passport.js` JwtStrategy to check if a token is blacklisted:
   ```js
   //... rest of the code

   passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
     try {
       const token = opts.jwtFromRequest(req);
       if (blacklistedTokens.includes(token)) {
         return done(null, false);
       }

       const user = await User.findById(jwt_payload.id);
       if (user) {
         return done(null, user);
       }
       return done(null, false);
     } catch (error) {
       done(error, false);
     }
   }));

   //... rest of the code
   ```

6. **Run Your Express App**

This is a very basic implementation and might not be suited for production use. For instance, for security reasons, passwords should be hashed before being stored in the database (e.g., with bcrypt). The token blacklisting mechanism can be enhanced further with a more persistent storage (like Redis) instead of an in-memory array, especially if you're working across multiple server instances.



Using Redis

To use Redis for token handling, especially for JWT blacklisting, you'll need to set up a Redis server and integrate it into your Express app. Redis is a high-performance, in-memory key-value data structure store that's ideal for caching and scenarios like JWT blacklisting.

Here's how to integrate Redis for token handling in the context of your JWT authentication system:

1. **Install Redis**
   - Install Redis on your machine or use a cloud provider like Redis Labs.
   - Make sure the Redis server is running by using the command `redis-server`.

2. **Install Required npm Packages**
   - You will need the `redis` package:
     ```bash
     npm install redis
     ```

3. **Integrate Redis in Your Express.js App**

   Create or update a file, perhaps named `redis.js`, to set up and export your Redis client:

   ```javascript
   const redis = require('redis');
   const client = redis.createClient();

   client.on('error', (err) => {
       console.error("Error connecting to Redis:", err);
   });

   module.exports = client;
   ```

4. **Modify Token Logic for Blacklisting with Redis**

   Update your login and logout routes to use Redis for token handling:

   ```javascript
   const redisClient = require('./redis');
   const jwt = require('jsonwebtoken');
   // ... other imports ...

   app.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
       const token = req.header('Authorization').split(' ')[1];
       // Set the token in Redis with an expiry equal to JWT expiry
       redisClient.setex(token, 3600, 'blacklisted', (err) => {
           if (err) {
               return res.status(500).json({ error: "Error blacklisting token." });
           }
           res.json({ message: 'Logged out successfully' });
       });
   });
   ```

5. **Update Passport JWT Strategy to Check Blacklisted Tokens in Redis**

   Modify the JWT Strategy to check if a token is blacklisted in Redis:

   ```javascript
   // ... imports ...

   passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
       try {
           const token = opts.jwtFromRequest(req);
           redisClient.get(token, (err, result) => {
               if (err) {
                   return done(err, false);
               }
               if (result) {
                   // Token is blacklisted
                   return done(null, false);
               }
               // ... existing user check logic ...
           });
       } catch (error) {
           done(error, false);
       }
   }));
   ```

6. **Clean up**

   Optionally, you can set up logic to periodically clear out expired tokens from Redis. Since we're using `setex`, tokens will auto-expire, but if you have other data or structures, you might consider cleanup routines.

Remember to handle potential Redis failures gracefully; for instance, if Redis is down, you might want to allow requests to proceed or implement a fallback mechanism. 

Always keep security in mind. While Redis is fast and efficient for this kind of use case, you must ensure that Redis itself is secured, especially if exposed to the wider internet. If you're using Redis in production, consider Redis security best practices such as binding to localhost, using a firewall, and enabling authentication.


Protected Route


Sure! Let's implement a protected route to fetch a list of posts. For the purpose of this example, let's assume you're using MongoDB and Mongoose to manage your posts.

1. **Setting Up the Post Model (if you haven't)**

   Create a new file `models/Post.js`:
   ```js
   const mongoose = require('mongoose');

   const postSchema = new mongoose.Schema({
     title: String,
     content: String,
     author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
   });

   module.exports = mongoose.model('Post', postSchema);
   ```

2. **Protected Route to Fetch Posts**

   In your Express app, implement the protected route. You'll make use of the passport authentication middleware to ensure only authenticated users can access this route:

   ```js
   const Post = require('./models/Post');
   const passport = require('passport');

   // ... other parts of your Express setup ...

   app.get('/posts', passport.authenticate('jwt', { session: false }), async (req, res) => {
       try {
           const posts = await Post.find().populate('author', 'email'); // This also fetches author email for each post
           res.json(posts);
       } catch (err) {
           res.status(500).json({ error: err.message });
       }
   });
   ```

   In the above route, the `passport.authenticate('jwt', { session: false })` middleware will ensure the request has a valid JWT token. If the token is valid, the request proceeds and fetches the posts. If not, it returns an unauthorized response.

3. **Testing the Route**

   You can test the protected route by:
   
   - First, logging in to obtain a JWT token (using the `/login` route you've implemented before).
   - Making a GET request to `/posts` using tools like Postman or `curl`, and including the JWT token in the Authorization header as a Bearer token:
     ```
     Authorization: Bearer YOUR_JWT_TOKEN_HERE
     ```

If the token is valid, you should receive a list of posts in the response. If the token is missing or invalid, you should receive an unauthorized error.




