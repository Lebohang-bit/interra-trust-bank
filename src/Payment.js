import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Table } from 'react-bootstrap';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function Payment() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState('SWIFT');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('');
  const [beneficiaryBank, setBeneficiaryBank] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [reference, setReference] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userAccount, setUserAccount] = useState('');
  const [userId, setUserId] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
    setUserName(localStorage.getItem('userName') || 'Customer');
    setUserAccount(localStorage.getItem('userAccount') || '');
    setUserId(localStorage.getItem('userId') || '');
    
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const q = query(collection(db, 'transactions'), where('customerAccount', '==', localStorage.getItem('userAccount')));
      const querySnapshot = await getDocs(q);
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() });
      });
      transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load transactions');
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  ];

  const validateSwiftCode = (code) => {
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!beneficiaryName || !beneficiaryAccount || !beneficiaryBank || !swiftCode) {
      setError('Please fill in all beneficiary details');
      return;
    }

    if (!validateSwiftCode(swiftCode)) {
      setError('Invalid SWIFT code format (e.g., SBZAZAJJ)');
      return;
    }

    const exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.79, ZAR: 18.5, CAD: 1.37, AUD: 1.52, JPY: 151.5, CNY: 7.24 };
    const convertedAmount = (amount * exchangeRates[currency]).toFixed(2);

    const transaction = {
      transactionRef: 'TXN' + Date.now(),
      customerName: userName,
      customerAccount: userAccount,
      customerId: userId,
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      currency: currency,
      convertedAmount: convertedAmount,
      provider: provider,
      beneficiaryName: beneficiaryName,
      beneficiaryAccount: beneficiaryAccount,
      beneficiaryBank: beneficiaryBank,
      swiftCode: swiftCode.toUpperCase(),
      reference: reference || 'International Transfer',
      status: 'PENDING_VERIFICATION',
      verified: false,
      submittedToSwift: false
    };

    try {
      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      const savedTransaction = { id: docRef.id, ...transaction };
      const updatedTransactions = [savedTransaction, ...transactions];
      setTransactions(updatedTransactions);
      setShowSuccess(true);
      setError('');

      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
        setBeneficiaryName('');
        setBeneficiaryAccount('');
        setBeneficiaryBank('');
        setSwiftCode('');
        setReference('');
      }, 3000);
    } catch (err) {
      setError('Failed to save transaction: ' + err.message);
    }
  };

  const getCurrencySymbol = () => {
    const found = currencies.find(c => c.code === currency);
    return found ? found.symbol : '$';
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={7}>
          <Card className="shadow-lg mb-4">
            <Card.Body className="p-4">
              <h3 className="mb-3" style={{ color: '#1A2A5E', fontWeight: 'bold' }}>New International Payment</h3>
              <p className="text-muted mb-4">Welcome back, {userName}</p>

              {showSuccess && (
                <Alert variant="success">
                  ✅ Payment initiated successfully! Transaction saved to Firebase.
                </Alert>
              )}

              {error && (
                <Alert variant="danger">{error}</Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <h5 className="mb-3" style={{ color: '#1A2A5E' }}>Payment Details</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Currency</Form.Label>
                      <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {currencies.map(c => (
                          <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Payment Provider</Form.Label>
                  <Form.Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                    <option value="SWIFT">SWIFT (Standard)</option>
                    <option value="SWIFT_EXPRESS">SWIFT Express (Faster)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">South Africa primarily uses SWIFT for international transfers</Form.Text>
                </Form.Group>

                <h5 className="mb-3 mt-4" style={{ color: '#1A2A5E' }}>Beneficiary Information</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Beneficiary Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Full name of recipient"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Beneficiary Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Account number"
                        value={beneficiaryAccount}
                        onChange={(e) => setBeneficiaryAccount(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Beneficiary Bank Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Bank name"
                        value={beneficiaryBank}
                        onChange={(e) => setBeneficiaryBank(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>SWIFT Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., SBZAZAJJ (8 or 11 characters)"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                  />
                  <Form.Text className="text-muted">8 or 11 character SWIFT/BIC code</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Payment Reference (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Invoice #, Contract #, etc."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  className="w-100"
                  style={{ backgroundColor: '#1A2A5E', padding: '12px', fontWeight: 'bold' }}
                >
                  Pay Now
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-lg mb-4">
            <Card.Body className="p-4">
              <h5 style={{ color: '#1A2A5E' }}>Exchange Rate Information</h5>
              <Table borderless size="sm" className="mt-3">
                <tbody>
                  <tr><td>USD</td><td>1.00</td><td>Base Currency</td></tr>
                  <tr><td>EUR</td><td>0.92</td><td>+2% fee applies</td></tr>
                  <tr><td>GBP</td><td>0.79</td><td>+2% fee applies</td></tr>
                  <tr><td>ZAR</td><td>18.50</td><td>Local currency</td></tr>
                </tbody>
              </Table>
              <hr />
              <small className="text-muted">SWIFT transfer time: 1-3 business days</small>
            </Card.Body>
          </Card>

          <Card className="shadow-lg">
            <Card.Body className="p-4">
              <h5 style={{ color: '#1A2A5E' }}>Security Notice</h5>
              <p className="small text-muted mb-2">✓ SWIFT GPI tracking enabled</p>
              <p className="small text-muted mb-2">✓ Beneficiary verification</p>
              <p className="small text-muted mb-0">✓ Firebase Security Rules active</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Payment;