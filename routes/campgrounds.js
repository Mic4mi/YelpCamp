var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// campground index (show all campgrounds)
router.get("/", function (req, res) {
    //Obtener los campings de la base de datos
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds });
        }
    });
});

// NEW. create form -
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new.ejs");
});

// create logic - add campgrund to a database
router.post("/", middleware.isLoggedIn, function (req, res) {
    // obtener los datos de un formulario
    var name = req.body.name;
    var price = req.body.price;
    var img = req.body.img;
    var desc = req.body.desc;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: name, price: price, img: img, desc: desc, author: author };
    // Crear un nuevo camping y guardarlo en la base de datos
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            // Redireccionar a la pagina de campgrounds
            console.log("Newly created!");
            res.redirect("/campgrounds");
        }
    });
});

// SHOW - Muestra más información del camping solicitado
router.get("/:id", function (req, res) {
    // Buscar el campoing por ID
    // Hay un método que otorga mongoose que es findById
    // Hay que cargar los comentarios de la siguiente forma
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            // ¿El campground existe? 
            if (!foundCampground) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }
            // Renderizar el template render
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (!foundCampground) {
            req.flash("error", "Item not found.");
            return res.redirect("back");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});

// UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    // encontrar y updatear
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Successfully updated");
            // redireccionar 
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    //borrar comentarios. 
    //recorrer el array de comentarios del campground
    //Delete the post
    Campground.findByIdAndRemove(req.params.id, function (err, campgroundRemoved) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            //borrar también los comentarios, sintaxis de mongoose
            Comment.deleteMany({ _id: { $in: campgroundRemoved.comments } }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    //Redirect somewhere
                    res.redirect("/campgrounds");
                }
            });
        }
    })
});

module.exports = router;





