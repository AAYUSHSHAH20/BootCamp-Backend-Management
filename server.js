const express = require('express');
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const errorhandler = require('./middleware/errorhandler')
const fileupload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongosanitizer = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const ratelimit = require('express-rate-limit')
const hpp = require('hpp')

// Load env varibles
dotenv.config({path : './config/config.env'});

// Connect to the database
connectDB();

//Route files
const bootcamp = require('./routes/bootcamp');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const user = require('./routes/user');
const review = require('./routes/reviews')

const app = express();

//Body Parser
app.use(express.json());

//File uploads
app.use(fileupload());

//Sanitize Data
app.use(mongosanitizer());

// Set Static folder
app.use(express.static(path.join(__dirname,'public')));

// Set Security headers
app.use(helmet());

// Prevent XSS Attack
app.use(xss());

// Rate Limit
const limiter = ratelimit({
    windowMs : 5 * 1000 * 60,
    max : 10
})

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

//Cookie parser
app.use(cookieParser());

//Mount routers
app.use('/api/v1/bootcamps',bootcamp);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',user);
app.use('/api/v1/reviews',review)

app.use(errorhandler);

const PORT = process.env.PORT || 5000

const server = app.listen(PORT , console.log(`server running at ${PORT}`))   

process.on('unhandledRejection' , (err, promise) => {
    console.log(`Error : ${err.message}`)
    server.close(() => process.exit(1))
})