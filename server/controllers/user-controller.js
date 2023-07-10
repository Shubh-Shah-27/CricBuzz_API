const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { User } = require("../models");

/* Register Route
========================================================= */
router.post('/register', async (req, res) => {

    const hash = bcrypt.hashSync(req.body.password, 10);
  
    try {
      let user = await User.create(
        Object.assign(req.body, { password: hash })
      );
  
      let userDetails = await user.authorize();
  
      // client { user, authToken }
    res.status(200)
    .send({status: "Admin Account Created Successfully", status_code:"200", data: userDetails});
    } catch(err) {
      return res.status(400).send(err);
    }
  
  });
  
  /* Login Route
  ========================================================= */
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({status: "Failed", error:'Request missing username or password param'}
      );
    }
  
    try {
      let user = await User.authenticate(username, password)
    //     console.log("Authenticated"+json(user));
    //   user = await user.authorize();
    //   console.log("Authorized");
      return res.status(200).send({
        status:"Login Successful", 
        status_code:"200", 
        user_id:user.user.id,
        data:user.authToken.token,
    });
  
    } catch (err) {
      return res.status(400).send({status:"Incorrect username/ password provided. Please retry", status_code: 401});
    }
  
  });
  
  /* Logout Route
  ========================================================= */
  router.delete('/logout', async (req, res) => {
  
    const { user, cookies: { auth_token: authToken } } = req
  
    if (user && authToken) {
      await req.user.logout(authToken);
      return res.status(204).send()
    }
  
    return res.status(400).send(
      { status:"Failed", errors: [{ message: 'not authenticated' }] }
    );
  });
  
  /* Me Route - get the currently logged in user
  ========================================================= */
  router.get('/me', (req, res) => {
    if (req.user) {
      return res.send(req.user);
    }
    res.status(404).send(
        { status:"Failed", errors: [{ message: 'Missiing Authentication Token' }] }
    );
  });

module.exports = router;