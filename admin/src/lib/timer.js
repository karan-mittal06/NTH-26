//SQLITE
// import db from "@/lib/db";
// import schedule from "node-schedule";


// async function storeKeyIncrementTimes(times) {
//     const timesJson = JSON.stringify(times)
//     const query = `UPDATE event_status SET intervals = ? WHERE id=1`

//     return new Promise((resolve, reject)=>{
//         db.run(query, [timesJson], (err)=>{
//             if(err){
//                 console.error("Error storing key intervals: ",err.message)
//                 reject(err)
//             }else{
//                 resolve()
//             }
//         })
//     })
// }

// async function scheduleKeyIncrements(times, end_time, start){
//     console.log("scheduling key intervals at : ", times)
//     for (const time of times){
//         const t = new Date(time)
//         const delay = t.getTime() - Date.now();

//         if (delay>0){
//             schedule.scheduleJob(t, async()=>{
//                 try{
//                     await incrementUserKeys();
//                     console.log(`keys incremented at ${time}`)
//                 }catch(err){
//                     console.log("error incrementing keys: ", err.message)
//                 }
//             })
//         }
//     }

//     schedule.scheduleJob(end_time, async()=>{
//         await endEvent(start, end_time)
//     })
// }

// export async function startTimer(start_time){
//     try{
//         const inputStartTime = new Date(start_time).toISOString();
//         const existingEvent = await new Promise((resolve, reject) => {
//             db.get(`SELECT * FROM event_status WHERE id = 1`, [], (err, row) => {
//               if (err) reject(err);
//               else resolve(row);
//             });
//         });
//         const { status, start_time: dbStartTime, intervals, end_time } = existingEvent;
//         console.log(start_time, inputStartTime, dbStartTime);
//         if (status === "active" && dbStartTime === inputStartTime) {
//             console.log("Timer is already active with the same start time. Rescheduling...");
//             rescheduleJob(dbStartTime, JSON.parse(intervals), end_time);
//             return;
//         }

//         if (status === "active" && dbStartTime !== inputStartTime) {
//             console.log("Active timer exists with a different start time. Overwriting...");
//         } else {
//             console.log("Timer is inactive. Scheduling a new timer...");
//         }

//         const jobs = schedule.scheduledJobs;
//         for (const jobName in jobs) {
//             if (Object.hasOwnProperty.call(jobs, jobName)) {
//                 jobs[jobName].cancel();
//             }
//         }

       
//         const StartTime = new Date(start_time);
//         const endtime = new Date(
//             new Date(start_time).getTime() + 24*60*60 * 1000
//         )

//         const total_intervals = 12

//         const keyIncrementTimes = Array.from({length: total_intervals}, (_,index)=>{
//             // return new Date(StartTime.getTime()+(index+1)*2*60*60*1000)
//             return new Date(StartTime.getTime()+(index+1)*2*60*60*1000)
//         })

//         console.log(keyIncrementTimes)
//         await updateEventStatus("inactive", start_time, endtime.toISOString());

//         schedule.scheduleJob(StartTime, async()=>{
//             await updateEventStatus("active", start_time, endtime.toISOString());
//             await storeKeyIncrementTimes(keyIncrementTimes)

//             await scheduleKeyIncrements(keyIncrementTimes, endtime, start_time)
            

//         })

        
//     }catch(error){
//         console.error(error);
//     }
// }

// const rescheduleJob = async(start_time, intervals, endtime) => {
//     const jobs = schedule.scheduledJobs;
//     for (const jobName in jobs) {
//         if (Object.hasOwnProperty.call(jobs, jobName)) {
//             jobs[jobName].cancel();
//         }
//     }

//     await scheduleKeyIncrements(intervals, endtime,start_time)

// }

// // Utility Functions
// const incrementUserKeys = async() => {
//     const updateQuery = `UPDATE users SET curr_keys = curr_keys + 1 WHERE hidden = 0`;
//     await new Promise((resolve,reject)=>{
//         db.run(updateQuery, [], (err) => {
//             if (err) {
//                 console.error("Error updating user keys:", err.message);
//                 reject(err);
//             } else {
//                 console.log("User keys incremented by 1");
//                 resolve();
//             }
//         });
//     })
// };

// const updateEventStatus = async(status, start, end) => {
//     const query = `UPDATE event_status SET status = ?, start_time = ?, end_time = ?`;
//     await new Promise((resolve,reject)=>{
//         db.run(query, [status, start, end], (err) => {
//             if (err) {
//                 console.error("Error updating event status:", err.message);
//                 reject(err);
//             } else {
//                 console.log(`Event status updated to: ${status}`);
//                 resolve();
//             }
//         });
//     })
// };

// export const endEvent = async(start, end) => {
    
//     const jobs = schedule.scheduledJobs;
   
//     console.log(jobs)
//     for (const jobName in jobs) {
//         if (Object.hasOwnProperty.call(jobs, jobName)) {
//             jobs[jobName].cancel();
//         }
//     }
   
    
//     await updateEventStatus('inactive', new Date(start).toISOString(), new Date(end).toISOString());
// }
import pool from "@/lib/db";
import schedule from "node-schedule";

async function storeKeyIncrementTimes(times) {
    const timesJson = JSON.stringify(times);
    const query = `UPDATE event_status SET intervals = $1 WHERE id = 1`;

    try {
        await pool.query(query, [timesJson]);
    } catch (err) {
        console.error("Error storing key intervals:", err.message);
        throw err;
    }
}

async function scheduleKeyIncrements(times, end_time, start) {
    console.log("scheduling key intervals at:", times);
    for (const time of times) {
        const t = new Date(time);
        const delay = t.getTime() - Date.now();

        if (delay > 0) {
            schedule.scheduleJob(t, async () => {
                try {
                    await incrementUserKeys();
                    console.log(`keys incremented at ${time}`);
                } catch (err) {
                    console.log("error incrementing keys:", err.message);
                }
            });
        }
    }

    schedule.scheduleJob(end_time, async () => {
        await endEvent(start, end_time);
    });
}

export async function startTimer(start_time) {
    try {
        const inputStartTime = new Date(start_time).toISOString();
        const result = await pool.query(`SELECT * FROM event_status WHERE id = 1`);
        const existingEvent = result.rows[0];

        if (!existingEvent) {
            console.log("No existing event found.");
            return;
        }

        const { status, start_time: dbStartTime, intervals, end_time } = existingEvent;
        console.log(start_time, inputStartTime, dbStartTime);

        if (status === "active" && dbStartTime === inputStartTime) {
            console.log("Timer is already active with the same start time. Rescheduling...");
            rescheduleJob(dbStartTime, JSON.parse(intervals), end_time);
            return;
        }

        console.log(status === "active" && dbStartTime !== inputStartTime ? 
            "Active timer exists with a different start time. Overwriting..." : 
            "Timer is inactive. Scheduling a new timer...");

        Object.values(schedule.scheduledJobs).forEach(job => job.cancel());

        const startTime = new Date(start_time);
        const endtime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
        const total_intervals = 12;

        const keyIncrementTimes = Array.from({ length: total_intervals }, (_, index) =>
            new Date(startTime.getTime() + (index + 1) * 2 * 60 * 60 * 1000)
        );
        console.log(keyIncrementTimes);
        await updateEventStatus("inactive", start_time, endtime.toISOString());

        if(new Date() > startTime) {
            await updateEventStatus("active", start_time, endtime.toISOString());
            await storeKeyIncrementTimes(keyIncrementTimes);
            await scheduleKeyIncrements(keyIncrementTimes, endtime, start_time);
        } else {
            schedule.scheduleJob(startTime, async () => {
                await updateEventStatus("active", start_time, endtime.toISOString());
                await storeKeyIncrementTimes(keyIncrementTimes);
                await scheduleKeyIncrements(keyIncrementTimes, endtime, start_time);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

const rescheduleJob = async (start_time, intervals, endtime) => {
    Object.values(schedule.scheduledJobs).forEach(job => job.cancel());
    await scheduleKeyIncrements(intervals, endtime, start_time);
};

// Utility Functions
const incrementUserKeys = async () => {
    const updateQuery = `UPDATE users SET curr_keys = curr_keys + 1 WHERE hidden = FALSE`;

    try {
        await pool.query(updateQuery);
        console.log("User keys incremented by 1");
    } catch (err) {
        console.error("Error updating user keys:", err.message);
        throw err;
    }
};

const updateEventStatus = async (status, start, end) => {
    const query = `UPDATE event_status SET status = $1, start_time = $2, end_time = $3`;

    try {
        await pool.query(query, [status, start, end]);
        console.log(`Event status updated to: ${status}`);
    } catch (err) {
        console.error("Error updating event status:", err.message);
        throw err;
    }
};

export const endEvent = async (start, end) => {
    Object.values(schedule.scheduledJobs).forEach(job => job.cancel());
    await updateEventStatus("inactive", new Date(start).toISOString(), new Date(end).toISOString());
};
