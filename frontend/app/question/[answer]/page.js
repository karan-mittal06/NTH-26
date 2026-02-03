"use client"

import API from "@/utils/api";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { toast } from "react-toastify";
import CustomModal from "@/components/CustomModal";
import {FaQuestionCircle, FaPhoneAlt} from 'react-icons/fa'
import { IoMdKey } from "react-icons/io";
import { Button } from 'pixel-retroui';
import { FaLightbulb } from "react-icons/fa";
import { useAuth } from "@/context/AuthProvider";
import Loader from "@/components/Loader";

const QuestionPage = ({params})=>{
    const [question, setQuestion] = useState(null)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); 
    const [isHintModalOpen, setIsHintModalOpen] = useState(false); 
    const [isContactModalOpen, setIsContactModalOpen] = useState(false); 
    const [loading, setLoading] = useState(false);
    const {answer} = React.use(params)
    const {keys, setKeys} = useAuth();
    const router = useRouter()
    const initialized = useRef(false);
    const submitting = useRef(false);

    const fetchEventStartTime = async () => {
      try {
        const res = await API.get("/timer/time");
        if (res.status === 200) {
          const { start_time } = res.data; 
          return start_time
        } else {
          toast.error("Failed to fetch event start time.");
        }
      } catch (error) {
        console.error("Error fetching event start time:", error);
        toast.error("An error occurred while fetching event start time.");
      }
    };

    
    
    useEffect(() => {
      const checkEventTime = async () => {
        try {
          if (initialized.current || loading || question) return;
        
          initialized.current = true;
          setLoading(true);
    
          const start = new Date(await fetchEventStartTime());
          const currentTime = new Date();
    
          if (currentTime < start) {
            toast.info("Hunt hasn't started yet!");
            router.push("/");
          } else {
            await fetchQuestion();
          }
        } catch (error) {
          console.error("Error checking event time:", error);
        } finally {
          setLoading(false);
        }
      };
    
      checkEventTime();
    }, []);
    

    useEffect(() => {
      const handleAnswer = async () => {
        if (answer && answer !== "put_your_answer_here" && !submitting.current) {
          await submitAnswer(answer);
        }
      };
      
      handleAnswer();
    }, [answer]);


    const openHintModal = () => {
      setIsHintModalOpen(true);
    };
  
    const closeHintModal = () => {
      setIsHintModalOpen(false);
    };
    const openContactModal = () => {
      setIsContactModalOpen(true);
    };
  
    const closeContactModal = () => {
      setIsContactModalOpen(false);
    };
    const openInfoModal = () => {
      setIsInfoModalOpen(true);
    };
  
    const closeInfoModal = () => {
      setIsInfoModalOpen(false);
    };

    const submitAnswer = async (submittedAnswer) => {
      if (submitting.current) return;
        submitting.current = true;
      try {
        
        const response = await API.post("/answer", { answer: submittedAnswer });
        if (response.status === 200) {
          toast.success("Correct answer!");
          
          router.push('/question/put_your_answer_here')
        } else if (response.status==202){
          console.log(response)
          toast.dark(response.data.message || "You are close.");
          window.history.pushState(null, '', '/question/put_your_answer_here');
        }else {
          toast.error(response.data.message || "Wrong answer, please try again.");
          window.history.pushState(null, '', '/question/put_your_answer_here');

        }
      } catch (err) {
        if (err.response.status==400) {
          toast.error(err.response?.data?.message);

          window.history.replaceState(null, '', '/question/put_your_answer_here');
      
        } else if(err.response.status==429) {
     
          toast.error(err.response.data);
        }
        else{
    
          toast.error("Unexpected error occurred");
        }
      }
    };

    const buyHint = async () => {
        try {
          const response = await API.post("question/hint", { level: question.level });
          if (response.status === 200) {
            setQuestion({...question, paid_hint : JSON.parse(response.data.paid_hint).join(',')})
            setKeys(keys-question.hint_cost);
            toast.success("Hint purchased successfully!");
          }
        } catch (err) {
          if (err.response) {
         
            toast.error(err.response?.data?.error || "Error purchasing hint");
          } else {
            toast.error("An unexpected error occurred");
          }
        }
      };

      const fetchQuestion = async () => {
        if (question) return; 
        try {
          const response = await API.get('/question/curr');
          if (response.status === 200) {
            if(response.data.question.paid_hint){
              setQuestion({...response.data.question, hint:JSON.parse(response.data.question.hint).join(","), paid_hint:JSON.parse(response.data.question.paid_hint).join(",")});
            }
            else{
              setQuestion({...response.data.question, hint:JSON.parse(response.data.question.hint).join(",")});}

            setKeys(response.data.keys);
          } else {
            toast.error(response.data);
          }
        } catch (err) {
          if (err.response?.status==403) {
            toast.info(err.response?.data?.error || "Error fetching current question");
            router.push('/')
          }
          else if (err.response?.status==404) {
            toast.info("Error fetching. Something went wrong.");
            router.push('/')
          } else if (err.request) {
            toast.error("Network error. Please try again");
          } else{
            toast.error("An unexpected error occurred");
          }
        }
      };

    

    if (!question) {
        return <Loader/>;
      }

    return (
      <div className="h-[100%]">
      <div className="">
          <img
            src={`/pokemons/p${question.level % 10}.gif`}
            alt="Background"
            className="absolute right-[8%] bottom-[15%] object-cover xl:object-fill z-[-2] sm:block sm:w-auto sm:h-auto  sm:scale-[2] scale-[1] hidden"
          />
      </div>
  
      <div className="p-8 max-w-3xl mx-auto h-[100%]">
       
        <div className="flex justify-center gap-10 items-center">
        <div className="flex flex-col items-center mb-2 group relative">
          <img
            src="/pika.gif"
            alt="Pika Gif"
            className="cursor-pointer h-10"
          />
          <div className="absolute hidden group-hover:block bg-gray-100 text-black sm:text-sm font-bold rounded-lg px-4 py-2 right-[105%] border-[0.20rem] border-yellow-500 shadow-lg sm:w-max text-xs w-20">
            {question.tooltip}
          </div>
        </div>
        <h1 className="text-2xl font-bold flex items-center">
            
            <img
              src="/key.png"
              alt="Key"
              className="ml-2 mr-2 h-10 r"
              
            />
            {keys}
            
          </h1>
        
        </div>

        <div className="flex justify-center mb-4">
          <h1 className="text-3xl font-bold">
            Level: {question.level}
          </h1>
        </div>
  
        {question.img1 && !question.img2? (
          <div className="relative aspect-w-1 aspect-h-1 col-span-1">
            <img
              src={question.img1}
              alt="Image 1"
              className="absolute inset-0 w-full  object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 col-span-3 lg:col-span-4">
          {question.img1 && (
            <div className="bg-black z-0 flex justify-center items-center h-60">
              <img
                src={question.img1}
                alt="Image 1"
                className="w-full h-full  rounded-lg shadow-lg aspect-video"
                
              />
            </div>
          )}
          {question.img2 && (
            <div className="bg-black z-0 flex justify-center items-center h-60">
              <img
                src={question.img2}
                alt="Image 2"
                className="w-full h-full  rounded-lg shadow-lg aspect-video"
              />
            </div>
          )}
          {question.img3 && (
            <div className="bg-black z-0 flex justify-center items-center h-60">
              <img
                src={question.img3}
                alt="Image 3"
                className="w-full h-full object-fit rounded-lg shadow-lg aspect-video"
              />
            </div>
          )}
          {question.img4 && (
            <div className="bg-black z-0 flex justify-center items-center h-60">
              <img
                src={question.img4}
                alt="Image 4"
                className="w-full h-full object-fit rounded-lg shadow-lg aspect-video"
              />
            </div>
          )}
        </div>
            )}

          {/* Hint and Contact Icon */}
          <div className="absolute top-[40%] left-0 z-50 flex flex-col gap-4">
            <div className="flex items-center">
              <FaQuestionCircle
                className="text-2xl text-gray-200 cursor-pointer hover:text-blue-500"
                onClick={openInfoModal}
              />
            </div>
            <div className="flex items-center">
              <FaLightbulb
                className="text-2xl text-gray-200 cursor-pointer hover:text-blue-500"
                onClick={openHintModal}
              />
            </div>

            {/* Contact Icon */}
            <div className="flex items-center">
              <FaPhoneAlt
                className="text-2xl text-gray-200 cursor-pointer hover:text-blue-500"
                onClick={openContactModal} 
              />
            </div>
          </div>
    
      {/* Modal for Hint */}
      <CustomModal isOpen={isHintModalOpen} onClose={closeHintModal}>
        <h2 className="text-2xl font-semibold mb-4 text-black self-center">HINTS</h2>
        {question.hint.split(',').map((h,i)=>(
          <p key={i} className=" text-lg mb-4 break-words">{i+1}. {h}</p>
        ))}
        
        {question.paid_hint ? (
          <div>
            <p className="text-xl">Paid Hint: </p>
            {question.paid_hint.split(',').map((h,i)=>(
              <p key={i} className=" text-lg mb-4">{i+1}. {h}</p>
            ))}
          </div>
        ) : (
          <div className="flex mt-2 gap-1 items-center text-xl">
            <p className="font-bold ">Paid Hint Cost:     {question.hint_cost} </p>
            <IoMdKey className=" rotate-90" size={15}/>
          </div>
        )}
        <div className="flex justify-between items-center gap-5 mt-6">
          {!question.paid_hint &&
        <Button
          
          onClick={buyHint}
          className="text-sm flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg disabled:hover:bg-gray-500 hover:bg-gray-600"
          disabled={keys < question.hint_cost}
          
        >
          {keys >= question.hint_cost ? 'Buy Hint' : 'Not enough keys'}
        </Button>}
    
      
        </div>
      </CustomModal>

      {/* Modal for Contact */}
      <CustomModal isOpen={isContactModalOpen} onClose={closeContactModal}>
        <h2 className="text-2xl font-semibold mb-4 text-black self-center">Contacts</h2>
       
        <p className="text-lg">B Shrinidhi : 7506211747</p>
        <p className="text-lg"> Samir Wankhede : 7770011526</p>
        <div className="flex justify-between items-center gap-5 mt-6">
         
        </div>
      </CustomModal>

      {/* Modal for Info */}
      <CustomModal isOpen={isInfoModalOpen} onClose={closeInfoModal}>
        <h2 className="text-2xl font-semibold mb-4 text-black self-center">How to Hunt</h2>
       
        <p className="text-lg">1. Images provide the clues to victory.</p>
        <p className="text-lg">2. Enter your answer in the URL and you shall proceed!</p>
        <p className="text-lg">3. Happy Hunting!</p>
        <div className="flex justify-between items-center gap-5 mt-6">
        </div>
      </CustomModal>

      
    </div>
    </div>
  );
}

export default QuestionPage;

