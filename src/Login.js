import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Login() {
  const [username, setUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('🔒 Too many failed attempts. Please wait 5 minutes.');
      return;
    }
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (!username || !accountNumber || !password) {
      setError('⚠️ All fields are required');
      return;
    }
    
    if (!/^[0-9]{6,12}$/.test(accountNumber)) {
      setError('⚠️ Invalid account number format');
      return;
    }
    
    if (newAttempts >= 3) {
      setIsLocked(true);
      setError('🔒 Too many failed login attempts. Locked for 5 minutes.');
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 300000);
      return;
    }
    
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('accountNumber', '==', accountNumber));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('❌ Invalid account number');
        return;
      }
      
      let customerData = null;
      querySnapshot.forEach((doc) => {
        customerData = { id: doc.id, ...doc.data() };
      });
      
      if (customerData.fullName !== username) {
        setError('❌ Invalid username');
        return;
      }
      
      const email = customerData.email;
      await signInWithEmailAndPassword(auth, email, password);
      
      setError('');
      setShowSuccess(true);
      setAttempts(0);
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userAccount', accountNumber);
      localStorage.setItem('userName', username);
      localStorage.setItem('userId', customerData.id);
      
      setTimeout(() => {
        window.location.href = '/payment';
      }, 2000);
    } catch (err) {
      setError('❌ Invalid password');
      setShowSuccess(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-3">
            <small className="text-muted">
              🛡️ Secure login | Firebase Authentication | 256-bit encryption
            </small>
          </div>
          
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4" style={{ color: '#1A2A5E', fontWeight: 'bold' }}>
                Customer Login
              </h2>
              <p className="text-center text-muted mb-4">
                Access your international payments
              </p>
              
              {showSuccess && (
                <Alert variant="success" className="text-center">
                  ✅ Login successful! Redirecting to payment portal...
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}
              
              {isLocked && (
                <Alert variant="warning" className="text-center">
                  🔒 Account temporarily locked. Try again in 5 minutes.
                </Alert>
              )}
              
              {attempts > 0 && !isLocked && (
                <Alert variant="warning" className="text-center">
                  ⚠️ {3 - attempts} login attempt(s) remaining before lockout
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500' }}>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '12px' }}
                    disabled={isLocked}
                  />
                  <Form.Text className="text-muted">
                    The username you registered with
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500' }}>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your 6-12 digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    style={{ padding: '12px' }}
                    disabled={isLocked}
                  />
                  <Form.Text className="text-muted">
                    Registered account number
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500' }}>Password</Form.Label>
                  <div>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ padding: '12px' }}
                      disabled={isLocked}
                    />
                  </div>
                  <div className="mt-1">
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ padding: 0, textDecoration: 'none' }}
                    >
                      {showPassword ? '🙈 Hide password' : '👁️ Show password'}
                    </Button>
                  </div>
                </Form.Group>
                
                <Button 
                  type="submit" 
                  className="w-100"
                  style={{ 
                    backgroundColor: '#1A2A5E', 
                    padding: '12px',
                    fontWeight: 'bold',
                    border: 'none'
                  }}
                  disabled={isLocked}
                >
                  Login Securely
                </Button>
              </Form>
              
              <hr className="my-4" />
              
              <p className="text-center text-muted mb-0">
                Don't have an account? <a href="/register" style={{ color: '#1A2A5E' }}>Register here</a>
              </p>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  🔐 Firebase Auth | Password hashing + salting | Rate limiting
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;