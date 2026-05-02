import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import Register from './Register';
import Login from './Login';
import Payment from './Payment';
import EmployeeLogin from './EmployeeLogin';
import EmployeeDashboard from './EmployeeDashboard';

function App() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAccount');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="page-container">
        <Navbar style={{ backgroundColor: '#1A2A5E' }} variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
              🏦 INTERRA TRUST BANK SYSTEM
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/" style={{ color: 'white' }}>Home</Nav.Link>
                {!isLoggedIn && <Nav.Link as={Link} to="/register" style={{ color: 'white' }}>Register</Nav.Link>}
                {!isLoggedIn && <Nav.Link as={Link} to="/login" style={{ color: 'white' }}>Customer Login</Nav.Link>}
                <Nav.Link as={Link} to="/employee-login" style={{ color: 'white' }}>Employee Login</Nav.Link>
                {isLoggedIn && (
                  <>
                    <Nav.Link as={Link} to="/payment" style={{ color: 'white' }}>Make Payment</Nav.Link>
                    <Button variant="outline-light" size="sm" onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</Button>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="text-center py-3">
          <div className="security-badge">
            <small className="text-muted">🔐 256-bit SSL Encryption | PCI DSS Certified | SWIFT GPI Enabled</small>
          </div>
        </Container>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
        npm start  <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/" element={
            <Container className="text-center py-5">
              <h1 style={{ color: '#1A2A5E', fontWeight: 'bold' }}>Welcome to Interra Trust Bank</h1>
              <p style={{ color: '#4B5563', fontSize: '1.2rem', maxWidth: '600px', margin: '20px auto' }}>
                Secure international payments. Fast. Reliable. Global.
              </p>
              <div className="mt-4">
                {!isLoggedIn && <><a href="/register" className="btn-navy me-3">Register Now</a><a href="/login" className="btn-outline-navy">Login</a></>}
                {isLoggedIn && <a href="/payment" className="btn-navy">Make a Payment</a>}
              </div>
            </Container>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;