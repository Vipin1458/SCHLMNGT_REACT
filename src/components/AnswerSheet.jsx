import React, { useEffect, useState } from 'react'
import axiosPrivate from '../api/axiosPrivate'
import { useParams } from 'react-router-dom'

const AnswerSheet = () => {
    const [answers,setAnswers]=useState([])
    const {examId}=useParams()
    const fetchMarksheet=async()=>{
    const response=await axiosPrivate.get('/exams/my_marks')
    console.log("examid",examId);
    
    const exam = response.data.find((item) => item.exam === parseInt(examId)); // LATER I HAVE TO ADD THE PASSED ID HERE
    console.log("All",exam);
    console.log("Allans",answers);

    setAnswers(exam.answers)
         
        
    }
    useEffect(()=>{fetchMarksheet()
        console.log("examId",examId);
        
    },[])
  return <>
  <h1>Answer Sheet</h1>
      {answers.length === 0 ? (
        <p>No answers found for this exam.</p>
      ) : (
        answers.map((ans) => (
          <div key={ans.id} style={{ marginBottom: '1rem' }}>
            <strong>Q:</strong> {ans.question_text}<br />
            <strong> Answer:</strong> {ans.answer}<br />
            <strong>Submited Answer:</strong> {ans.is_correct ? "✅" : "❌"}
          </div>
        ))
      )}
  </>
}

export default AnswerSheet