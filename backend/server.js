import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import cookieParser from 'cookie-parser'; 
import answerRoutes from './routes/answerRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js'
import timerRoutes from './routes/timerRoutes.js'
import { createTables } from './models/db.js'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

app.set('trust proxy', true);
app.use(cors({origin:["https://nth.credenz.co.in"],credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.use((req,res,next)=>{
    console.log('user Agent:',req.headers['user-agent'], 'user Origin:',req.headers['origin'], 'IP: ',req.ip);
    console.log(req.method,' ',req.url)
    next()
})

app.use('/api/auth',authRoutes)
app.use('/api/question', questionRoutes )
app.use('/api/answer', answerRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/timer', timerRoutes)

createTables().then(()=>{
    app.listen(PORT, '0.0.0.0', ()=>{
        console.log(`server running on port ${PORT}...`)
    })
}).catch(()=>{
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
})