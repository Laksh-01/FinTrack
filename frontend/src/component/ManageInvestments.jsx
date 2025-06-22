import React from 'react'
import CurrentlyUnderProgress from './CurrentlyUnderProgress'
import ChatBotWidget from './ChatBotWidget'
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';
import InvestmentPage from './InvesetmentPage';


const ManageInvestments = () => {

    const {accountId} =useParams();
  return (
    <div>
      <Navbar></Navbar>
      <ChatBotWidget></ChatBotWidget>
      <div className='mt-20'>
        <InvestmentPage accountId={accountId}></InvestmentPage>
      </div>
      
      
      
      
    </div>
    
  )
}

export default ManageInvestments