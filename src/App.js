import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [myRefCode, setMyRefCode] = useState('');
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Math Quiz States
  const [mathNum1, setMathNum1] = useState(5);
  const [mathNum2, setMathNum2] = useState(4);
  const [mathAnswer, setMathAnswer] = useState('');

  const API_URL = "https://earning-backend-api.onrender.com/"; 
  const AD_LINK = "https://auctionr.org/4/127385e7ba2241d837118ee560a6ed84"; 
  // Naye tab mein Offerwall ka link (Aap apna CPALead/TimeWall link yahan lagayenge)
  const OFFERWALL_LINK = "https://cpalead.com/dummy-offerwall-link"; 

  // --- LOGIN ---
  const handleLogin = async () => {
    if (!username.trim()) return setMessage("Enter a username!");
    try {
      const response = await fetch(`${API_URL}/create-user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), referred_by: inviteCode.trim() || null })
      });
      if (response.ok || response.status === 400) {
        setLoggedInUser(username.trim());
        fetchUserInfo(username.trim());
        setMessage(`Welcome to Max Earning App!`);
      }
    } catch (error) {
      setMessage("Server connection failed!");
    }
  };

  const fetchUserInfo = async (user) => {
    const response = await fetch(`${API_URL}/user-info/${user}`);
    if (response.ok) {
      const data = await response.json();
      setBalance(data.balance);
      setMyRefCode(data.referral_code);
    }
  };

  // --- GENERAL EARNING FUNCTION ---
  const triggerEarning = (endpoint, requiredWaitTime) => {
    window.open(AD_LINK, '_blank'); // Har action par ad chalega
    setIsLoading(true);
    setMessage(`Action processing... wait ${requiredWaitTime} seconds ⏳`);

    setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/${endpoint}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loggedInUser, secret_token: "MySuperSecretAppToken123" })
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(`🎉 ${data.message}`);
          setBalance(data.new_balance);
        } else {
          setMessage(`⚠️ ${data.detail}`);
        }
      } catch (error) {
        setMessage("Server error.");
      }
      setIsLoading(false);
    }, requiredWaitTime * 1000); 
  };

  // --- MATH QUIZ LOGIC ---
  const handleMathSubmit = async () => {
    const correctAnswer = mathNum1 + mathNum2;
    if (parseInt(mathAnswer) !== correctAnswer) {
      setMessage("⚠️ Wrong Answer! Try again.");
      return;
    }
    window.open(AD_LINK, '_blank'); // Math hal karne par bhi Ad khulega
    try {
      const response = await fetch(`${API_URL}/solve-math/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUser, secret_token: "MySuperSecretAppToken123", is_correct: true })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`🧠 ${data.message}`);
        setBalance(data.new_balance);
        // Naya sawal generate karein
        setMathNum1(Math.floor(Math.random() * 20));
        setMathNum2(Math.floor(Math.random() * 20));
        setMathAnswer('');
      }
    } catch (error) {
      setMessage("Error submitting answer.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '450px', margin: 'auto', textAlign: 'center' }}>
      <h2>CashUp - Mega Earning 💰</h2>
      
      {!loggedInUser ? (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
          <p>Login or Create Account:</p>
          <input type="text" placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Invite Code (Optional)" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} style={inputStyle} />
          <button onClick={handleLogin} style={btnStyle('#28a745')}>Start Earning</button>
        </div>
      ) : (
        <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h3>👤 {loggedInUser}</h3>
          <h1 style={{ color: '#ff9800', margin: '10px 0' }}>{balance} Coins</h1>
          
          <div style={{ background: '#e9ecef', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            <small>Your Invite Code: <b>{myRefCode}</b> (Get 100 Coins)</small>
          </div>
          
          {/* Earning Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Standard Tasks */}
            <button onClick={() => triggerEarning('daily-bonus', 3)} disabled={isLoading} style={btnStyle(isLoading ? '#ccc' : '#e83e8c')}>
              🎁 Claim Daily Bonus (50 Coins)
            </button>

            <button onClick={() => triggerEarning('watch-video', 30)} disabled={isLoading} style={btnStyle(isLoading ? '#ccc' : '#dc3545')}>
              🎬 Watch Premium Video (30 Coins - Wait 30s)
            </button>

            <button onClick={() => triggerEarning('add-points', 5)} disabled={isLoading} style={btnStyle(isLoading ? '#ccc' : '#007bff')}>
              📺 Quick Ad View (10 Coins - Wait 5s)
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => triggerEarning('spin-wheel', 5)} disabled={isLoading} style={{...btnStyle(isLoading ? '#ccc' : '#6f42c1'), flex: 1}}>
                🎡 Spin Wheel
              </button>
              <button onClick={() => triggerEarning('scratch-card', 5)} disabled={isLoading} style={{...btnStyle(isLoading ? '#ccc' : '#fd7e14'), flex: 1}}>
                🎟️ Scratch Card
              </button>
            </div>

            {/* Offerwalls (Highest Paying) */}
            <button onClick={() => window.open(OFFERWALL_LINK, '_blank')} style={btnStyle('#17a2b8')}>
              🔥 Complete Offers & Surveys (Max Earnings)
            </button>

            {/* Math Quiz Section */}
            <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }}>
              <h4>🧠 Math Quiz (5 Coins)</h4>
              <p>Solve: {mathNum1} + {mathNum2} = ?</p>
              <input 
                type="number" 
                value={mathAnswer} 
                onChange={(e) => setMathAnswer(e.target.value)} 
                style={{ padding: '8px', width: '60px', marginRight: '10px' }} 
              />
              <button onClick={handleMathSubmit} style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

      <p style={{ marginTop: '15px', fontSize: '14px', fontWeight: 'bold', color: message.includes('🎉') || message.includes('🧠') ? 'green' : (message.includes('⚠️') ? 'red' : '#ff9800') }}>
        {message}
      </p>
    </div>
  );
}

// Minimal Styles
const inputStyle = { padding: '10px', width: '90%', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btnStyle = (bg) => ({ padding: '12px', cursor: 'pointer', background: bg, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' });

export default App;