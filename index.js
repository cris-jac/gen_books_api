
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./connectDB")
const Book = require('./models/Books');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
connectDB();
app.use(cors());
app.use(express.urlencoded( { extended: false } ))   // Changed to false
app.use(express.json());
app.use("/uploads", express.static("uploads")); // For making the images available

// Routes

// GET LIST OF BOOKS
app.get("/api/books", async (req, res) => {
    try {
        // for category functionality
        const category = req.query.category;
        const filter={};
        if (category) {
            filter.category = category;
        }

        const data = await Book.find(filter);   // If its empty -> it shows all results
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "An error ocurred while fetching the data" })
    }
});

// GET BOOK DETAILS
app.get("/api/books/:slug", async (req, res) => {
    try {
        const slugParam = req.params.slug;
        // console.log(slugParam);

        const data = await Book.findOne( { slug: slugParam } ); 
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "An error ocurred while fetching the data" })
    }
});

// CREATE BOOK - WITH IMAGES
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})

const upload = multer({ storage: storage })

app.post("/api/books", upload.single("thumbnail"), async (req, res) => {
    try {

        console.log(req.body);
        console.log(req.file);

        const newBook = new Book({
            title: req.body.title,
            slug: req.body.slug,
            stars: req.body.stars,
            description: req.body.description,
            category: req.body.category,
            thumbnail: req.file.filename,
        })

        await Book.create(newBook);   // If its empty -> it shows all results
        res.json("Data submitted");
    } catch (error) {
        console.log('serever error', error); // For checking the error
        res.status(500).json({ error: "An error ocurred while fetching the data" })
    }
});


// CREATE BOOK - NO IMAGES
// app.post("/api/books", async (req, res) => {
//     try {
//         const newBook = new Book({
//             title: req.body.title,
//             slug: req.body.slug,
//             stars: req.body.stars,
//             description: req.body.description,
//             category: req.body.category,
//             // thumbnail: req.body.thumbnail,
//         })

//         await Book.create(newBook);   // If its empty -> it shows all results
//         res.json("Data submitted");
//     } catch (error) {
//         console.log('serever error', error); // For checking the error
//         res.status(500).json({ error: "An error ocurred while fetching the data" })
//     }
// });


// UPDATE
app.put("/api/books", upload.single("thumbnail"), async (req, res) => {
    try {
        const bookId = req.body.bookId;

        const updatedBook = ({
            title: req.body.title,
            slug: req.body.slug,
            stars: req.body.stars,
            description: req.body.description,
            category: req.body.category,
        })

    if(req.file) {
        updatedBook.thumbnail = req.file.filename;
    }

        await Book.findByIdAndUpdate(bookId, updatedBook);           
        res.json("Data submitted");
    } catch (error) {
        console.log('serever error', error); // For checking the error
        res.status(500).json({ error: "An error ocurred while fetching the data" })
    }
});

app.delete("/api/books/:id", async(req, res) => {
    const bookId = req.params.id;

    try {
        await Book.deleteOne({_id: bookId});
        res.json("How dare you!" + req.body.bookId);
    } catch (error) {
        console.log(error);
    }
})


app.get("/", (req, res) => {
    res.json("Hello mate!")
});

app.get("*", (req, res) => {
    res.sendStatus("404")
});

app.listen(PORT, () => {
    console.log(`server is running on Port: ${PORT}`);
})
