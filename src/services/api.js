const API_URL = 'http://localhost:5000';

export const api = {
  async register(customerData) {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    return response.json();
  },

  async getTransactions() {
    const response = await fetch(`${API_URL}/transactions`);
    return response.json();
  },

  async createTransaction(transaction) {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  },

  async updateTransaction(id, data) {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};