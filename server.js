import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
env.config();

const app = express();
const port = 3000;
const saltRounds = 2;


app.use(
    session({
        secret: process.env.SESSION_SECRETE,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000*60*60*24
        }
    })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());


const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/auth", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("auth.ejs");
      } else {
        res.redirect("/login");
      }
});

app.post("/register", async (req, res) => {

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    try{
        const checkresult = await db.query("SELECT * FROM users WHERE email = $1",[email]);

        if(checkresult.rows.length > 0){
            res.send("Users already exists try login");
        } else {
            bcrypt.hash(password , saltRounds, async (err, hash) => {
                if(err){
                    console.log(err);
                } else {
                    console.log(hash);
                    await db.query(
                        "INSERT INTO USERS (username, email, password) VALUES ($1, $2, $3)",
                        [username, email, hash]);
                        res.render("auth.ejs");
                }
            });
        }
    }
    catch(err){
        console.log(err);
    }
});


app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );
    
  app.get(
    "/auth/google/secrets",
    passport.authenticate("google", {
      successRedirect: "/auth",
      failureRedirect: "/login",
    })
  );

app.post("/login", 
    passport.authenticate("local", {
        successRedirect: "/auth",
        failureRedirect: "/login"
    })
);

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if(err){
            console.log(err);
        }
        res.redirect("/");
    })
});   


passport.use(
    "local",
    new Strategy(async function verify(username , password, cb) {

        try{
            const result = await db.query(
                "SELECT * FROM users WHERE email = $1 OR username = $2",[username,username]);
                console.log(result.rows);
            if(result.rows.length > 0){
                const user = result.rows[0];
                const StoredPassword = user.password;
    
                bcrypt.compare(password, StoredPassword, (err, valid) => {
                    if(err){
                        console.log("error comparing passwords : ", err);
                        return cb(err);
                    } else {
                        if(valid){
                            return cb(null , user);
                        } else {
                            return cb(null , false);
                        }
                    }
                })
            } else {
                return cb("user not found");
            }
        }
        catch (err){
            console.log(err);
        }
        
    })
);


passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          console.log(profile);
          const result = await db.query("SELECT * FROM users WHERE email = $1", [
            profile.email,
          ]);
  
          if (result.rows.length === 0) {
            const newUser = await db.query(
              "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
              [profile.email, profile.email, "google"]
            );
            return cb(null, newUser.rows[0]);
          } else {
            return cb(null, result.rows[0]);
          }
        } catch (err) {
          console.log(err);
          return cb(err, null);
        }
      }
    )
  );



passport.serializeUser((user, cb) => {
    cb(null, user);
    console.log(user);
})

passport.deserializeUser((user, cb) => {
    cb(null, user);
})


app.listen(port, () => {
    console.log(`server runngin on port ${port}`);
})