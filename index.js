const express = require('express')
const mongoose= require('mongoose')
const bodyParser= require("body-parser")
const path= require('path')
const port= process.env.PORT || 8000



/* Connecting to Database (MongoDB Atlas) */
mongoose.connect('mongodb+srv://piyush28:piyush94145@cluster0.jhrdy.mongodb.net/sManager')
var db= mongoose.connection;

db.on('error', console.log.bind(console, "connection error"))

db.once('open', function(callback){
    console.log("Connection Succeeded")
})




var app= express()
app.use(express.static(__dirname + '/public'))

app.set("views", path.join(__dirname, "views"))




/* EJS */

// ejs is a templating engine.
// Using ejs, we can add dynamic data to our HTML File.
// Inorder to use ejs, our file should be stored in the 'views' folder only.
const ejs= require('ejs')

// Setting the view engine to ejs
app.set('view engine', 'ejs')







/* Setting 'allowAccess' as global variable */
allowAccess= "No";






/* get Methods */
app.get('/login', function(req, res){
    res.render('login.ejs', {
        LOgin: "No"
    })
})

app.get('/signUp', function(req, res){
    res.sendFile(path.join(__dirname, ('public/signUp.html')))
})

app.get('/contactUs', function(req, res){
    res.sendFile(path.join(__dirname, ('public/contactUs.html')))
})

app.get('/addStudent', function(req, res){
    
    res.render("addStudent.ejs", {
        ADDed: "No"
    })
})

app.get('/findStudent', function(req, res){
    res.render('findStudent.ejs', {
        /* Initially, when no form has been submitted, then let us set variable FOund to be "Yes" in our ejs file */
        FOund: "Yes"
    });
})

app.get('/studentList', function(req, res){

    db.collection('Students').find().toArray(function(err, result){
        if (err){
            throw err;
        }
        else{
            /* console.log(result)
            console.log(result.length) */
            
            return res.render('studentList.ejs', {
                SIze: result.length,
                REsult:result,
            })
           
        }
        
    })

})

app.get('/deleteStudent', function(req, res){
    res.render('deleteStudent.ejs', {
        DEleted: "No"
    })
})

app.get('/mailSent', function(req, res){
    return res.sendFile(path.join(__dirname, 'public/mailSent.html'))
})




/* post Methods */

/* If we do not use this, then body property will be undefined. */
app.use(bodyParser.urlencoded({
    extended: true
}))

app.post('/signUp', function(req, res){
    var name= req.body.Name;
    var email= req.body.Email;
    var pass= req.body.Password;
    var phone= req.body.Phone;

    console.log(name)

    var data= {
        "name": name,
        "email": email,
        "password": pass,
        "phone": phone
    }

    db.collection('Users').insertOne(data, function(err, collection){
        if(err){
            throw err;
        }
        else{
            console.log("Record Inserted Successfully")
            allowAccess= "Yes";
        }

        return res.sendFile(path.join(__dirname, 'public/signUpSuccess.html'))
    });
})

app.post('/login', function(req, res){
    var email_check= req.body.Email;
    var pass_check= req.body.Password;

    console.log("email is:"+ email_check)
    console.log("password is: "+ pass_check)

    db.collection('Users').find( {"email":email_check, "password": pass_check} ).toArray(function(err, result){
        // if(err){
        //     console.log("The login error is: ");
        //     throw err;
        // }

        // else{
        //     console.log("Printing the result: ");
        //     console.log(result)
        // }

        // if(result.length == 0){
            
        //     res.render('login.ejs', {
        //         LOgin: "Invalid",
        //     })
        // }

        else{
            allowAccess= "Yes";
            res.sendFile(path.join(__dirname, ('public/loginSuccess.html')))
        }
    })
})

app.post('/addStudent', function(req, res){
    var name= req.body.Name;
    var fname= req.body.Fname;
    var phone= req.body.Number;
    var gender= req.body.Gender;
    var city= req.body.City;

    console.log(name)

    var data= {
        "name": name,
        "fname": fname,
        "phone": phone,
        "gender": gender,
        "city": city
    }

    db.collection('Students').insertOne(data, function(err, collection){
        if(err){
            throw err;
        }
        else{
            console.log("Student Added Successfully!")
            
            return res.render("addStudent.ejs", {
                ADDed: "Yes"
            })
        }

        
    })
})

OLDNAME= "";
OLDFNAME= "";

app.post('/findStudent', function(req, res){
    var name= req.body.Name;

    console.log(name); 

    /* After creation of index in MongoDB, this method of search will be is for case-insensitive search. */
    db.collection('Students').find( {$text: {$search: name} }  ).toArray(function(err, result){
        if(err){
            throw err;
        }

        if(result.length == 0){
            console.log("No Such Student Exists!")

            return res.render('findStudent.ejs', {
                FOund: "No"
            })
        }

        else{
            let NAME= result[0].name;
            let FNAME= result[0].fname;
            let PHONE= result[0].phone;
            let GENDER= result[0].gender;
            let CITY= result[0].city;
            
            OLDNAME= NAME;
            OLDFNAME= FNAME;

            let AVATAR= "maleAvatar";

            if (GENDER == "Female") {
                AVATAR= "femaleAvatar";
            }

            // While using ejs file, we have to use 'res.render' instead of using 'res.sendFile'
            res.render('studentDetailCard.ejs', {
                STAtus: "Not Updated",
                Sname: NAME,
                Fname: FNAME,
                PHone: PHONE,
                GEnder: GENDER,
                CIty: CITY,

                AVAtar: AVATAR
            })
        }
    })
})

app.post('/deleteSTUDENT', function(req, res){
    var name= req.body.Name;
    var fname= req.body.Fname;
    
    console.log(name)

    db.collection('Students').find( {"name": name, "fname": fname} ).toArray(function(err, result){
        if(err){
            throw err
        }

        else{
            console.log(result)
        }

        if(result.length == 0){
            console.log("No Such Student Exists!")

            return res.render('deleteStudent.ejs', {
                DEleted: "No Data"
            })
        }

        else{
            db.collection('Students').deleteOne( {"name":name, "fname": fname} )
            console.log("Student Deleted Successfully!")

            return res.render("deleteStudent.ejs", {
                DEleted: "Yes"
            })
        }

        
    })
})

app.post('/updateStudentDetails', function(req, res){

    var name= OLDNAME;
    var fname= OLDFNAME;

    console.log(name);
    console.log(fname);

    db.collection('Students').find( {'name': name, "fname": fname} ).toArray(function(err, result){
        if (err){
            throw err;
        }

        else{

            /* console.log(result) */

            let NAME= result[0].name;
            let FNAME= result[0].fname;
            let PHONE= result[0].phone;
            let GENDER= result[0].gender;
            let CITY= result[0].city;

            let AVATAR= "maleAvatar";

            if (GENDER == "Female") {
                AVATAR= "femaleAvatar";
            }

            /* console.log(GENDER) */
            /* console.log(OLDNAME) */
            
            return res.render('addNewDetails.ejs', {
                NAme: NAME,
                Fname: FNAME,
                PHOne: PHONE,
                GEnder: GENDER,
                CIty: CITY,
            
            })
        }
    })

    
})

app.post('/addNewDetails', function(req, res){

    var oldName= OLDNAME;
    var oldFname= OLDFNAME;

    var name= req.body.Name;
    var fname= req.body.Fname;
    var phone= req.body.Number;
    var gender= req.body.Gender;
    var city= req.body.City;

    /* console.log( name.toUpperCase() );

    console.log("\n\n"+ OLDNAME)
    console.log(OLDFNAME)

    console.log("\n\n"+ name)
    console.log(fname)
    console.log(phone)
    console.log(gender)
    console.log(city) */

    db.collection('Students').updateOne( {"name": oldName,"fname": oldFname}, {
        $set: {
            "name": name,
            "fname": fname,
            "phone": phone,
            "gender": gender,
            "city": city
        }
        
    } ) 

    let avatar= "maleAvatar";

    if(gender == "Female"){
        avatar= "femaleAvatar"
    }

    return res.render('studentDetailCard.ejs', {
        STAtus: "Updated",
        AVAtar: avatar,
        Sname: name,
        Fname: fname,
        GEnder: gender,
        PHone: phone,
        CIty: city,
    
    })

})

/* get method */
app.get('/', function(req, res){
    res.render('index.ejs', {
        ACCess: allowAccess
    })
})


app.listen(port, ()=>{
    console.log(`Server Listening on Port: ${port}`)
})

process.on("unhandledRejection", err =>{
    console.log("unhandled error is -----> "+ err);
})