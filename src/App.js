import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [myRefCode, setMyRefCode] = useState('');
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Withdrawal States
  const [withdrawMethod, setWithdrawMethod] = useState('JazzCash');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const API_URL = "https://earning-backend-api.onrender.com"; 
  const AD_LINK = "https://auctionr.org/4/127385e7ba2241d837118ee560a6ed84"; 
  const OFFERWALL_LINK = "https://cpalead.com/dummy-offerwall-link"; // Y apna CPALead/TimeWall link dalein

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
        setMessage(`Welcome, ${username.trim()}!`);
      }
    } catch (error) {
      setMessage("Server connection failed!");
    }
  };

  const fetchUserInfo = async (user) => {
    try {
      const response = await fetch(`${API_URL}/user-info/${user}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setMyRefCode(data.referral_code);
      }
    } catch (error) {
      console.error("Fetch failed");
    }
  };

  const triggerEarning = (endpoint, requiredWaitTime) => {
    window.open(AD_LINK, '_blank'); 
    setIsLoading(true);
    setMessage(`Processing task... please wait ${requiredWaitTime}s ⏳`);

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
          setMessage(`⚠️ ${data.detail || "Error completing task"}`);
        }
      } catch (error) {
        setMessage("Server error.");
      }
      setIsLoading(false);
    }, requiredWaitTime * 1000); 
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!accountNumber || !withdrawAmount) {
      setMessage("⚠️ Please fill all withdrawal fields!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/request-withdrawal/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loggedInUser,
          secret_token: "MySuperSecretAppToken123",
          amount: parseInt(withdrawAmount),
          method: withdrawMethod,
          account_number: accountNumber
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setBalance(data.new_balance);
        setAccountNumber('');
        setWithdrawAmount('');
      } else {
        setMessage(`⚠️ ${data.detail}`);
      }
    } catch (error) {
      setMessage("Withdrawal failed due to server error.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '450px', margin: 'auto', textAlign: 'center' }}>
      <h2>CashUp - Earning App 💰</h2>
      
      {!loggedInUser ? (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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
            <small>Your Invite Code: <b>{myRefCode}</b> (Get 100 Coins per invite)</small>
          </div>
          
          {/* Earning & Offerwall Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Offerwalls Button (Highest Payout) */}
            <button onClick={() => window.open(`${OFFERWALL_LINK}?subid=${loggedInUser}`, '_blank')} style={btnStyle('#17a2b8')}>
              🔥 Complete Offers & Surveys (High Pay)
            </button>

            <button onClick={() => triggerEarning('daily-bonus', 3)} disabled={isLoading} style={btnStyle('#e83e8c')}>
              🎁 Claim Daily Bonus (50 Coins)
            </button>

            <button onClick={() => triggerEarning('watch-video', 5)} disabled={isLoading} style={btnStyle('#dc3545')}>
              🎬 Watch Video Ad (30 Coins)
            </button>

            <button onClick={() => triggerEarning('add-points', 3)} disabled={isLoading} style={btnStyle('#007bff')}>
              📺 Quick Ad View (10 Coins)
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => triggerEarning('spin-wheel', 3)} disabled={isLoading} style={{...btnStyle('#6f42c1'), flex: 1}}>
                🎡 Spin Wheel
              </button>
              <button onClick={() => triggerEarning('scratch-card', 3)} disabled={isLoading} style={{...btnStyle('#fd7e14'), flex: 1}}>
                🎟️ Scratch Card
              </button>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px', textAlign: 'left' }}>
            <h4 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333' }}>💸 Request Withdrawal (JazzCash / EasyPaisa)</h4>
            <form onSubmit={handleWithdraw}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Payment Method:</label>
              <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)} style={{...inputStyle, width: '100%', marginBottom: '8px'}}>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Account Number / Phone:</label>
              <input type="text" placeholder="03001234567" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={{...inputStyle, width: '100%', marginBottom: '8px'}} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Amount (Min 500 Coins):</label>
              <input type="number" placeholder="500" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{...inputStyle, width: '100%', marginBottom: '10px'}} />

              <button type="submit" style={btnStyle('#28a745')}>Submit Withdrawal</button>
            </form>
          </div>

        </div>
      )}

      <p style={{ marginTop: '15px', fontSize: '14px', fontWeight: 'bold', color: message.includes('🎉') || message.includes('✅') ? 'green' : (message.includes('⚠️') ? 'red' : '#ff9800') }}>
        {message}
      </p>
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = (bg) => ({ padding: '12px', cursor: 'pointer', background: bg, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', width: '100%' });

export default App;