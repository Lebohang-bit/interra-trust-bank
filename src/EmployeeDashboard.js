import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col, Alert, Form } from 'react-bootstrap';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

function EmployeeDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [employeeName, setEmployeeName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('employeeLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '/employee-login';
    }
    setEmployeeName(localStorage.getItem('employeeName') || 'Employee');
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() });
      });
      transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  useEffect(() => {
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'VERIFIED') {
        filtered = filtered.filter(t => t.verified === true && t.submittedToSwift === false);
      } else if (statusFilter === 'PENDING') {
        filtered = filtered.filter(t => t.verified === false && t.submittedToSwift === false);
      } else if (statusFilter === 'SUBMITTED') {
        filtered = filtered.filter(t => t.submittedToSwift === true);
      }
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, transactions]);

  const handleVerify = async (id) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, {
        verified: true,
        status: 'VERIFIED'
      });
      await loadTransactions();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      alert('Failed to verify transaction');
    }
  };

  const handleVerifyAll = async () => {
    const pendingTransactions = transactions.filter(t => !t.verified && !t.submittedToSwift);
    
    if (pendingTransactions.length === 0) {
      alert('No pending transactions to verify');
      return;
    }

    try {
      for (const transaction of pendingTransactions) {
        const transactionRef = doc(db, 'transactions', transaction.id);
        await updateDoc(transactionRef, {
          verified: true,
          status: 'VERIFIED'
        });
      }
      await loadTransactions();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      alert('Failed to verify transactions');
    }
  };

  const handleSubmitToSwift = async () => {
    const verifiedUnsubmitted = transactions.filter(t => t.verified === true && t.submittedToSwift === false);
    
    if (verifiedUnsubmitted.length === 0) {
      alert('No verified transactions to submit to SWIFT');
      return;
    }

    try {
      for (const transaction of verifiedUnsubmitted) {
        const transactionRef = doc(db, 'transactions', transaction.id);
        await updateDoc(transactionRef, {
          submittedToSwift: true,
          status: 'SUBMITTED_TO_SWIFT'
        });
      }
      await loadTransactions();
      alert(`✅ ${verifiedUnsubmitted.length} transaction(s) submitted to SWIFT network`);
    } catch (err) {
      alert('Failed to submit to SWIFT');
    }
  };

  const pendingCount = transactions.filter(t => !t.verified && !t.submittedToSwift).length;
  const verifiedCount = transactions.filter(t => t.verified && !t.submittedToSwift).length;
  const submittedCount = transactions.filter(t => t.submittedToSwift).length;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 style={{ color: '#1A2A5E', fontWeight: 'bold' }}>International Payments Portal</h2>
          <p className="text-muted">Welcome, {employeeName} | Role: Verification Officer | Firebase Database</p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('employeeLoggedIn');
              window.location.href = '/employee-login';
            }}
          >
            Logout
          </Button>
        </Col>
      </Row>

      {showSuccess && (
        <Alert variant="success" className="text-center">
          ✅ Transaction updated successfully in Firebase
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3>{pendingCount}</h3>
              <p className="text-muted mb-0">Pending Verification</p>
              <Badge bg="warning">Awaiting Review</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3>{verifiedCount}</h3>
              <p className="text-muted mb-0">Verified</p>
              <Badge bg="success">Ready for SWIFT</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3>{submittedCount}</h3>
              <p className="text-muted mb-0">Submitted to SWIFT</p>
              <Badge bg="info">Completed</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Button variant="success" onClick={handleVerifyAll} disabled={pendingCount === 0}>
                ✅ Verify All ({pendingCount})
              </Button>
              <Button 
                variant="primary" 
                className="mt-2 w-100" 
                onClick={handleSubmitToSwift} 
                disabled={verifiedCount === 0}
              >
                📤 Submit to SWIFT ({verifiedCount})
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-lg">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="🔍 Search by transaction ID, customer, or beneficiary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Transactions</option>
                <option value="PENDING">Pending Verification</option>
                <option value="VERIFIED">Verified</option>
                <option value="SUBMITTED">Submitted to SWIFT</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="outline-primary" onClick={loadTransactions}>Refresh</Button>
            </Col>
          </Row>

          <Table responsive hover className="mt-3">
            <thead style={{ backgroundColor: '#1A2A5E', color: 'white' }}>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Beneficiary</th>
                <th>SWIFT Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5">No transactions found</td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id}>
                    <td><small>{t.transactionRef || t.id}</small></td>
                    <td><small>{new Date(t.date).toLocaleDateString()}</small></td>
                    <td>{t.customerName}</td>
                    <td><strong>{t.currency} {t.amount}</strong><br/><small>≈ ZAR {t.convertedAmount}</small></td>
                    <td><small>{t.beneficiaryName}<br/>{t.beneficiaryAccount}</small></td>
                    <td><code>{t.swiftCode}</code></td>
                    <td>
                      {t.submittedToSwift ? (
                        <Badge bg="info">✅ Submitted to SWIFT</Badge>
                      ) : t.verified ? (
                        <Badge bg="success">✓ Verified</Badge>
                      ) : (
                        <Badge bg="warning">⏳ Pending</Badge>
                      )}
                    </td>
                    <td>
                      {!t.verified && !t.submittedToSwift && (
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleVerify(t.id)}
                        >
                          ✓ Verify
                        </Button>
                      )}
                      {t.verified && !t.submittedToSwift && (
                        <Badge bg="success">Ready</Badge>
                      )}
                      {t.submittedToSwift && (
                        <Badge bg="info">Complete</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EmployeeDashboard;