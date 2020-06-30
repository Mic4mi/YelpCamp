var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    app = express(),
    seedDB = require("./seeds");

var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");

//mongo atlas
mongoose.connect("mongodb+srv://micahl1981:1473690yo.@cluster0.hfd5i.mongodb.net/<dbname>?retryWrites=true&w=majority",
).then(() => {
    console.log("Conected to DB!")
}).catch(err => {
    console.log("ERROR: " + err.message)
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");
//seedDB(); //Seeding the database

//Passport configuration
app.use(require("express-session")({
    secret: "Saturnino es el gato más tierno de la galaxia",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//¿Cómo logro evitar que el usuario pueda comentar si no esta conectado? Verificando que *está conectado*
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// requering routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function(err){
    if(err){
        console.log("ERROR: " + err.message);
    } else {
        console.log("Server has started!");
    }
});