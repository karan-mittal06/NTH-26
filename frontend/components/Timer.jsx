"use client";

import API from "@/utils/api";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import Link from "next/link";
import { Button } from "pixel-retroui";
import { toast } from "react-toastify";
import "./NavLink.css";
import "../app/button.css";

const Timer = () => {
  const [eventStartTime, setEventStartTime ]= useState(null);
  const [eventEndTime, setEventEndTime ]= useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  function calculateTimeRemaining() {
    const now = new Date();
    const diff = eventStartTime - now;
    if (now >= eventEndTime) return {days: -1, hours: -1, minutes: -1, seconds: -1}
    if (diff <= 0) return {days: 0, hours: 0, minutes: 0, seconds: 0};
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  const fetchEventStartTime = async () => {
    try {
      const response = await API.get("/timer/time");
      if (response.status === 200) {
        const { start_time, end_time } = response.data; 
        setEventStartTime(new Date(start_time));
        setEventEndTime(new Date(end_time));
      } else {
        // console.error("Failed to fetch event start time.");
        toast.error("Failed to fetch event start time.");
      }
    } catch (error) {
      // console.error("Error fetching event start time:", error);
    }finally{
        await new Promise(resolve => {
            setTimeout(() => { resolve('') }, 1000);
        })
        setLoading(false);
    }
  };

  useEffect(() => {
    if (eventStartTime || eventEndTime) {
    //   setTimeRemaining(calculateTimeRemaining(eventStartTime));

      const timer = setInterval(() => {
        const remaining = calculateTimeRemaining(eventStartTime);

        if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
          setHasEventStarted(true);
          clearInterval(timer); 
        } else if(remaining.days === -1 && remaining.hours === -1 && remaining.minutes === -1 && remaining.seconds === -1){
            setHasEventEnded(true);
            clearInterval(timer); 
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(timer); 
    }
  }, [eventStartTime]);

  useEffect(() => {
    fetchEventStartTime();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-fit text-white">
      <div className="text-center mb-10">
        <img
          src="/nth-logo.png" 
          alt="NTH Logo"
          className="w-[35vh] h-[35vh] mx-auto"
        />
        <h1 className="md:text-6xl text-4xl font-bold mt-4 text-shadow">Network Treasure Hunt</h1>
        <h1 className="md:text-4xl text-2xl font-bold md:mt-2 text-shadow">Decrypt The Encrypted</h1>
      </div>

      { loading ? (<Loader/>) :
        (hasEventStarted || hasEventEnded || !timeRemaining ? (
        <div className="text-center">
            <h2 className="md:text-4xl text-2xl font-bold text-shadow">{hasEventStarted ? "The Hunt Has Begun!" : (hasEventEnded ? "The Hunt Has Ended!" : "")}</h2>
        </div>
        ) : (
        <div className="text-center text-shadow">
            <h2 className="text-4xl font-semibold">Time Remaining:</h2>
            <div className="flex justify-center space-x-6 mt-4 text-4xl ">
                <div>
                    <span>{timeRemaining?.days}</span>
                <div className="text-lg uppercase">Days</div>
                </div>
                <div>
                    <span>{timeRemaining?.hours}</span>
                <div className="text-lg uppercase">Hours</div>
                </div>
                <div>
                    <span>{timeRemaining?.minutes}</span>
                <div className="text-lg uppercase">Minutes</div>
                </div>
                <div>
                    <span>{timeRemaining?.seconds}</span>
                <div className="text-lg uppercase">Seconds</div>
                </div>
            </div>
        </div>
        ))
      }
      <Link href={'/register'}>
        <button className="cybr-btn how-to-play my-4">
          Register Now<span aria-hidden>_</span>
          <span aria-hidden className="cybr-btn__glitch">Register Now_</span>
          <span aria-hidden className="cybr-btn__tag">NTH</span>
        </button>
      </Link>
      {/* <Link href={'/instructions'}>
        <Button 
          bg="white"
          borderColor="black"
          className="px-4 py-1 my-4 iceland-regular text-xl"
        >
          How to Play
        </Button>
      </Link> */}
    </div>
  );
};

export default Timer;
