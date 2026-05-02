import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, ProgressBar } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Register() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false
  });

  const checkPasswordStrength = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const minLength = pwd.length >= 8;
    
    let score = 0;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (minLength) score++;
    
    let message = '';
    if (score <= 2) message = 'Weak ❌';
    else if (score <= 4) message = 'Medium ⚠️';
    else message = 'Strong ✅';
    
    setPasswordStrength({
      score,
      message,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      minLength
    });
  };

  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '').trim();
  };

  const validateIdNumber = (id) => {
    const idRegex = /^[0-9]{13}$/;
    if (!idRegex.test(id)) {
      return false;
    }
    const year = id.substring(0, 2);
    const month = id.substring(2, 4);
    const day = id.substring(4, 6);
    const date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.getMonth() === parseInt(month) - 1 && date.getDate() === parseInt(day);
  };

  const validateAccountNumber = (acc) => {
    const accRegex = /^[0-9]{6,12}$/;
    return accRegex.test(acc);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Too many attempts. Please wait 5 minutes.');
      return;
    }
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setIsLocked(true);
      setError('Too many registration attempts. Locked for 5 minutes.');
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 300000);
      return;
    }
    
    const sanitizedName = sanitizeInput(fullName);
    const sanitizedId = sanitizeInput(idNumber);
    const sanitizedAccount = sanitizeInput(accountNumber);
    
    if (!sanitizedName || !sanitizedId || !sanitizedAccount || !password) {
      setError('⚠️ All fields are required');
      return;
    }
    
    if (sanitizedName.length < 3) {
      setError('⚠️ Full name must be at least 3 characters');
      return;
    }
    
    if (!validateIdNumber(sanitizedId)) {
      setError('⚠️ Invalid South African ID number (must be 13 digits with valid date)');
      return;
    }
    
    if (!validateAccountNumber(sanitizedAccount)) {
      setError('⚠️ Account number must be 6-12 digits');
      return;
    }
    
    if (password.length < 8) {
      setError('⚠️ Password must be at least 8 characters');
      return;
    }
    
    if (!passwordStrength.hasUpperCase) {
      setError('⚠️ Password must contain at least one uppercase letter');
      return;
    }
    
    if (!passwordStrength.hasLowerCase) {
      setError('⚠️ Password must contain at least one lowercase letter');
      return;
    }
    
    if (!passwordStrength.hasNumber) {
      setError('⚠️ Password must contain at least one number');
      return;
    }
    
    if (!passwordStrength.hasSpecialChar) {
      setError('⚠️ Password must contain at least one special character (!@#$%^&*)');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('⚠️ Passwords do not match');
      return;
    }
    
    const commonPasswords = ['Password123!', 'Admin123!', 'Qwerty123!'];
    if (commonPasswords.includes(password)) {
      setError('⚠️ Password is too common. Please choose a stronger password.');
      return;
    }
    
    setError('');
    
    const email = `${sanitizedName.replace(/\s/g, '')}${Date.now()}@interra.bank`;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'customers', user.uid), {
        fullName: sanitizedName,
        idNumber: sanitizedId,
        accountNumber: sanitizedAccount,
        email: email,
        createdAt: new Date().toISOString()
      });
      
      setShowSuccess(true);
      setAttempts(0);
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Account already exists. Please login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError('Registration failed: ' + err.message);
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-3">
            <small className="text-muted">
              <FaShieldAlt /> Bank-grade security | Firebase Authentication | 256-bit encryption
            </small>
          </div>
          
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4" style={{ color: '#1A2A5E', fontWeight: 'bold' }}>
                Customer Registration
              </h2>
              <p className="text-center text-muted mb-4">
                Secure international payments registration
              </p>
              
              {showSuccess && (
                <Alert variant="success" className="text-center">
                  ✅ Registration successful! Redirecting to login...
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}
              
              {isLocked && (
                <Alert variant="warning" className="text-center">
                  🔒 Too many attempts. Please wait 5 minutes.
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500' }}>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full legal name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ padding: '12px' }}
                    disabled={isLocked}
                    maxLength={100}
                  />
                  <Form.Text className="text-muted">
                    As it appears on your ID
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500' }}>South African ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="0000000000000 (13 digits)"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 13))}
                    style={{ padding: '12px' }}
                    disabled={isLocked}
                    maxLength={13}
                  />
                  <Form.Text className="text-muted">
                    13-digit SA ID number (YYMMDD GGGG SS C)
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500' }}>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your bank account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    style={{ padding: '12px' }}
                    disabled={isLocked}
                    maxLength={12}
                  />
                  <Form.Text className="text-muted">
                    6-12 digit account number
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500' }}>Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={handlePasswordChange}
                      style={{ padding: '12px', paddingRight: '40px' }}
                      disabled={isLocked}
                    />
                    <Button
                      variant="link"
                      style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                  
                  {password && (
                    <>
                      <ProgressBar 
                        className="mt-2"
                        now={(passwordStrength.score / 5) * 100}
                        variant={
                          passwordStrength.score <= 2 ? "danger" :
                          passwordStrength.score <= 4 ? "warning" : "success"
                        }
                      />
                      <small className="text-muted">
                        Password strength: <strong>{passwordStrength.message}</strong>
                      </small>
                      
                      <div className="mt-2" style={{ fontSize: '12px' }}>
                        <div className={passwordStrength.minLength ? "text-success" : "text-danger"}>
                          {passwordStrength.minLength ? "✅" : "❌"} At least 8 characters
                        </div>
                        <div className={passwordStrength.hasUpperCase ? "text-success" : "text-danger"}>
                          {passwordStrength.hasUpperCase ? "✅" : "❌"} Uppercase letter (A-Z)
                        </div>
                        <div className={passwordStrength.hasLowerCase ? "text-success" : "text-danger"}>
                          {passwordStrength.hasLowerCase ? "✅" : "❌"} Lowercase letter (a-z)
                        </div>
                        <div className={passwordStrength.hasNumber ? "text-success" : "text-danger"}>
                          {passwordStrength.hasNumber ? "✅" : "❌"} Number (0-9)
                        </div>
                        <div className={passwordStrength.hasSpecialChar ? "text-success" : "text-danger"}>
                          {passwordStrength.hasSpecialChar ? "✅" : "❌"} Special character (!@#$%^&*)
                        </div>
                      </div>
                    </>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '500' }}>Confirm Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ padding: '12px', paddingRight: '40px' }}
                      disabled={isLocked}
                    />
                    <Button
                      variant="link"
                      style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <Form.Text className="text-danger">
                      ⚠️ Passwords do not match
                    </Form.Text>
                  )}
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
                  Register Securely
                </Button>
              </Form>
              
              <hr className="my-4" />
              
              <p className="text-center text-muted mb-0">
                Already have an account? <a href="/login" style={{ color: '#1A2A5E' }}>Login here</a>
              </p>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  🔒 Firebase Auth | Password hashing + salting | Rate limiting
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;