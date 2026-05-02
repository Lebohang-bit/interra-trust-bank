import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLocked) {
      setError('🔒 Too many failed attempts. Contact IT support.');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (!employeeId || !password) {
      setError('⚠️ All fields are required');
      return;
    }

    if (newAttempts >= 3) {
      setIsLocked(true);
      setError('🔒 Account locked. Contact system administrator.');
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 900000);
      return;
    }

    const validEmployees = [
      { id: 'EMP001', password: 'Admin@2024', name: 'John Smith', role: 'Verification Officer' },
      { id: 'EMP002', password: 'Supervisor@2024', name: 'Sarah Johnson', role: 'Supervisor' },
      { id: 'EMP003', password: 'Auditor@2024', name: 'Mike Williams', role: 'Auditor' }
    ];

    const employee = validEmployees.find(emp => emp.id === employeeId && emp.password === password);

    if (employee) {
      localStorage.setItem('employeeLoggedIn', 'true');
      localStorage.setItem('employeeId', employee.id);
      localStorage.setItem('employeeName', employee.name);
      localStorage.setItem('employeeRole', employee.role);
      window.location.href = '/employee-dashboard';
    } else {
      setError('❌ Invalid Employee ID or Password');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <div className="text-center mb-3">
            <small className="text-muted">🛡️ Restricted Access | Bank Staff Only | Firebase Ready</small>
          </div>
          
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4" style={{ color: '#1A2A5E', fontWeight: 'bold' }}>
                Employee Portal
              </h2>
              <p className="text-center text-muted mb-4">Pre-registered staff authentication</p>
              
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              
              {isLocked && (
                <Alert variant="warning" className="text-center">
                  🔒 Account locked. Contact your supervisor.
                </Alert>
              )}
              
              {attempts > 0 && !isLocked && (
                <Alert variant="warning" className="text-center">
                  ⚠️ {3 - attempts} attempt(s) remaining
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="EMP001, EMP002, or EMP003"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    disabled={isLocked}
                  />
                  <Form.Text className="text-muted">Pre-registered employees only</Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Secure Password</Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked}
                  />
                  <div className="mt-1">
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ padding: 0, textDecoration: 'none' }}
                    >
                      {showPassword ? '🙈 Hide' : '👁️ Show'}
                    </Button>
                  </div>
                </Form.Group>
                
                <Button 
                  type="submit" 
                  className="w-100"
                  style={{ backgroundColor: '#1A2A5E', padding: '12px', fontWeight: 'bold' }}
                  disabled={isLocked}
                >
                  Access Portal
                </Button>
              </Form>
              
              <hr className="my-4" />
              <div className="text-center">
                <small className="text-muted">Demo Credentials: EMP001 / Admin@2024</small>
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">🔐 Employees are pre-registered in the system</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeLogin;