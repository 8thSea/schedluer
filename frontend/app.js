const { useState, useEffect } = React;

function fetchJSON(url, options) {
  return fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options }).then(r => r.json());
}

function ClientList({ clients, selectClient, selectedId, addClient }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  return (
    <div className="section">
      <h2>Clients</h2>
      <ul>
        {clients.map(c => (
          <li key={c.id} onClick={() => selectClient(c.id)} style={{ cursor: 'pointer', fontWeight: c.id === selectedId ? 'bold' : 'normal' }}>
            {c.name}
          </li>
        ))}
      </ul>
      <h3>Add Client</h3>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Contact" value={contact} onChange={e => setContact(e.target.value)} />
      <button onClick={() => { addClient({ name, contact }); setName(''); setContact(''); }}>Add</button>
    </div>
  );
}

function BillList({ bills, clients, addBill, payBill }) {
  const [form, setForm] = useState({ clientId: '', amount: '', dueDate: '', description: '' });

  const today = new Date();

  const statusClass = bill => {
    if (bill.paid) return 'paid';
    const due = new Date(bill.dueDate);
    if (due < today) return 'overdue';
    return 'upcoming';
  };

  return (
    <div className="section">
      <h2>Bills</h2>
      {bills.map(b => (
        <div key={b.id} className={`bill-item ${statusClass(b)}`}>
          <div>{clients.find(c => c.id === b.clientId)?.name} - {b.description}</div>
          <div>Due: {b.dueDate} Amount: ${b.amount}</div>
          <div>Status: {b.paid ? 'Paid' : 'Unpaid'}</div>
          {!b.paid && <button onClick={() => payBill(b.id)}>Mark Paid</button>}
        </div>
      ))}
      <h3>Add Bill</h3>
      <select value={form.clientId} onChange={e => setForm({ ...form, clientId: parseInt(e.target.value) })}>
        <option value="">Select Client</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
      <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <button onClick={() => { addBill(form); setForm({ clientId: '', amount: '', dueDate: '', description: '' }); }}>Add</button>
    </div>
  );
}

function PaymentHistory({ bills, clientId }) {
  const list = bills.filter(b => b.clientId === clientId && b.paid);
  return (
    <div className="section">
      <h2>Payment History</h2>
      <ul>
        {list.map(b => (
          <li key={b.id}>{b.description} - Paid {b.paidDate?.slice(0,10)}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchJSON('/api/clients').then(setClients);
    fetchJSON('/api/bills').then(setBills);
  }, []);

  const addClient = client => {
    fetchJSON('/api/clients', { method: 'POST', body: JSON.stringify(client) }).then(c => setClients([...clients, c]));
  };

  const addBill = bill => {
    fetchJSON('/api/bills', { method: 'POST', body: JSON.stringify(bill) }).then(b => setBills([...bills, b]));
  };

  const payBill = id => {
    fetchJSON(`/api/bills/${id}/pay`, { method: 'POST' }).then(updated => setBills(bills.map(b => b.id === id ? updated : b)));
  };

  return (
    <div>
      <h1>Bill Scheduler</h1>
      <div className="container">
        <ClientList clients={clients} selectClient={setSelectedClient} selectedId={selectedClient} addClient={addClient} />
        <BillList bills={bills} clients={clients} addBill={addBill} payBill={payBill} />
        {selectedClient && <PaymentHistory bills={bills} clientId={selectedClient} />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
