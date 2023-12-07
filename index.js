const multer = require('multer');
//Adding Dependencies
const express = require("express");
const myApp = express();
const bodyParser = require("body-parser");
const { validationResult } = require("express-validator");
const path = require("path");
const session = require("express-session");

myApp.use(bodyParser.urlencoded({ extended: true }));

//Path to Public and Views folder
myApp.set("views", path.join(__dirname + "/views"));
myApp.use(express.static(path.join(__dirname, "/public")));
myApp.set("view engine", "ejs");

myApp.use(express.json());

// Setup DB Connection
const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb://127.0.0.1:27017/Project",
    {
      UseNewURLParser: true,
      UseUnifiedTopology: true,
    }
  )
  .then(() => console.log("mongo db connected successfully"))
  .catch((err) => console.log("error : ", err.message));
mongoose.set("strictQuery", false);
const Admin = mongoose.model("admin", {
  username: String,
  password: String,
});
const Donor = mongoose.model("donor", {
  name: String,
  email: String,
  phone: String,
  type: String,
  donationPreference: String,
  message: String,
});
const Recipient = mongoose.model("recipient", {
  name: String,
  age: Number,
  gender: String,
  contactNumber: Number,
  organNeeded: String,
  bloodType: String,
  medicalCondition: String,
  message: String,
});

myApp.post("/form", (req, res) => {
  const errors = validationResult(req);
  console.log(errors);

  if (!errors.isEmpty()) {
    res.render("form", { errors: errors.array(), formData: undefined });
  } else {
    let formData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      type: req.body.type,
      donationPreference: req.body.donationPreference,
      message: req.body.message,
    };

    const myData = new Donor(formData);
    myData
      .save()
      .then(function () {
        console.log("New Data Created in Database!");
      })
      .catch(function (Ex) {
        console.log(`Error: ${Ex}`);
      });

    console.log(formData);
    res.render("form", { formData });
  }
});
myApp.post("/recipient", (req, res) => {
  const errors = validationResult(req);
  console.log(errors);

  if (!errors.isEmpty()) {
    res.render("Recipient", { errors: errors.array(), formData: undefined });
  } else {
    let formData = {
      name: req.body.fullName,
      age: Number(req.body.age),
      gender: req.body.gender,
      contactNumber: Number(req.body.contactNumber),
      organNeeded: req.body.organNeeded,
      bloodType: req.body.bloodType,
      medicalCondition: req.body.medicalCondition,
      message: req.body.message,
    };

    const myData = new Recipient(formData);
    myData
      .save()
      .then(function () {
        console.log("New Data Created in Database!");
      })
      .catch(function (Ex) {
        console.log(`Error: ${Ex}`);
      });

    console.log(formData);
    res.render("Recipient", { formData });
  }
});
//adding  form.ejs
myApp.get("/", (req, res) => {
  res.render("home");
});
myApp.get("/login", (req, res) => {
  res.render("login");
});
myApp.get("/form", (req, res) => {
  res.render("form", { formData: undefined });
});
myApp.get("/Recipient", (req, res) => {
  res.render("Recipient", { formData: undefined });
});

// Setup Session
myApp.use(
  session({
    secret: "thisismyrandomsite",
    resave: false,
    saveUninitialized: true,
  })
);

myApp.get("/", (req, res) => {
  if (req.session.userLoggedIn) {
    res.render("admin");
  } else {
    res.render("home");
  }
});
myApp.get("/admin", (req, res) => {
  res.render("admin");
});
myApp.get("/home", (req, res) => {
  res.render("home");
});
myApp.get("/aspects", (req, res) => {
  res.render("aspects");
});
myApp.get("/stories", (req, res) => {
  res.render("stories");
});
myApp.post("/login", (req, res) => {
  var user = req.body.username;
  var pass = req.body.password;
  console.log(`Username is = ${user}`);
  console.log(`Password is = ${pass}`);
  Admin.findOne({ username: user, password: pass })
    .then((admin) => {
      console.log(`Admin Object: ${admin}`);

      if (admin) {
        req.session.username = admin.username;
        req.session.userLoggedIn = true;
        res.redirect("admin");
      } else {
        res.render("login", { error: "Sorry Login Failed. Please Try Again!" });
      }
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
    });
});
//Edit Page
myApp.get('/editPage', (req, res) => {
  if (req.session.userLoggedIn) {
    Donor.find({}).then((editData) => {
      res.render('editPage', { editData });
    }).catch(function (error) {
      console.log(`Error fetching edit donor data: ${error}`);
      res.render('editPage', { editData: [] });
    });
  } else {
    res.redirect('/home');
  }
});

//add new User
myApp.get("/adminAddUserForm", (req, res) => {
  res.render("adminAddUserForm", { formData: undefined });
});
// Update Page
myApp.get("/update/:id", (req, res) => {
  if (req.session.userLoggedIn) {
    var id = req.params.id;
    console.log(`Update Id: ${id}`);
    Donor
      .findById({ _id: id })
      .then((donor) => {
        console.log(`Update Object: ${donor}`);
        if (donor) {
          res.render("update", { donor: donor });
        } else {
          res.send("No data found with this Id!");
        }
      })
      .catch((err) => {
        console.log(`Update Error: ${err}`);
      });
  } else {
    // Otherwise, redirect user to Login page
    res.redirect("/login");
  }
});

//Delete
myApp.get("/delete/:id", (req, res) => {
  if (req.session.userLoggedIn) {
    var id = req.params.id;
    console.log(`Deleted Object Id: ${id}`);
    Donor
      .findByIdAndDelete({ _id: id })
      .then((donor) => {
        console.log(`Deleted Object: ${donor}`);
        if (donor) {
          res.render("delete", {
            message: "Record Deleted Successfully...!!!",
          });
        } else {
          res.render("delete", {
            message: "Sorry Record Not Deleted. Please Try Again...!!!",
          });
        }
      })
      .catch((err) => {
        console.log(`Delete Error: ${err}`);
      });
  } else {
    // Otherwise, redirect user to Login page
    res.redirect("/login");
  }
});
// Logout Page
myApp.get("/logout", (req, res) => {
  req.session.username = "";
  req.session.userLoggedIn = false;
  res.render("login", { error: "Succesfully Logged Out!" });
});
myApp.get("/addStory",(req,res)=>{
  res.render("addStory");
})
myApp.listen(8000, () => {
  console.log(
    `everything executed fine, server started. Open http://localhost:8000/`
  );
});


const storySchema = new mongoose.Schema({
  title: String,
  image: String,
  content: String,
});

const Story = mongoose.model('Story', storySchema);

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle POST requests to submit a story
myApp.post('/addStory', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file.buffer.toString('base64');

  const newStory = new Story({
    title,
    image: `data:image/jpeg;base64,${image}`,
    content,
  });
  console.log('Form Data:', req.body);
  console.log('File Data:', req.file);
  
  newStory.save()
  .then(() => {
    console.log('Story saved successfully');
    res.json({ success: true });
  })
  .catch((err) => {
    console.error('Error saving story:', err);
    res.json({ success: false });
  });

});

 
myApp.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find(); 
    res.json({ success: true, stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.json({ success: false, error: 'Error fetching stories' });
  }
});
// Serve static files
myApp.use(express.static('public'));
