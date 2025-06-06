const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

let db = { clients: [], bills: [] };

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    db = JSON.parse(fs.readFileSync(DATA_FILE));
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function generateId(collection) {
  return collection.length ? Math.max(...collection.map(i => i.id)) + 1 : 1;
}

loadData();

// Client endpoints
app.get('/api/clients', (req, res) => {
  res.json(db.clients);
});

app.post('/api/clients', (req, res) => {
  const client = { id: generateId(db.clients), ...req.body };
  db.clients.push(client);
  saveData();
  res.json(client);
});

app.put('/api/clients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.clients.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).end();
  db.clients[idx] = { id, ...req.body };
  saveData();
  res.json(db.clients[idx]);
});

app.delete('/api/clients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.clients = db.clients.filter(c => c.id !== id);
  db.bills = db.bills.filter(b => b.clientId !== id);
  saveData();
  res.status(204).end();
});

// Bill endpoints
app.get('/api/bills', (req, res) => {
  res.json(db.bills);
});

app.post('/api/bills', (req, res) => {
  const bill = { id: generateId(db.bills), paid: false, ...req.body };
  db.bills.push(bill);
  saveData();
  res.json(bill);
});

app.put('/api/bills/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.bills.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).end();
  db.bills[idx] = { ...db.bills[idx], ...req.body };
  saveData();
  res.json(db.bills[idx]);
});

app.delete('/api/bills/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.bills = db.bills.filter(b => b.id !== id);
  saveData();
  res.status(204).end();
});

app.post('/api/bills/:id/pay', (req, res) => {
  const id = parseInt(req.params.id);
  const bill = db.bills.find(b => b.id === id);
  if (!bill) return res.status(404).end();
  bill.paid = true;
  bill.paidDate = new Date().toISOString();
  saveData();
  res.json(bill);
});

app.get('/api/clients/:id/report', (req, res) => {
  const id = parseInt(req.params.id);
  const client = db.clients.find(c => c.id === id);
  if (!client) return res.status(404).end();
  const bills = db.bills.filter(b => b.clientId === id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=client-${id}-report.csv`);
  stringify(
    bills.map(b => ({ id: b.id, amount: b.amount, dueDate: b.dueDate, description: b.description, paid: b.paid, paidDate: b.paidDate || '' })),
    { header: true }
  ).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
