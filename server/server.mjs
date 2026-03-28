import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Serve public static files (images, etc.)
const publicDir = path.join(__dirname, '..', 'public');
app.use('/hostel-pictures', express.static(path.join(publicDir, 'hostel-pictures'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400')
}));
app.use('/vc-zulfiqar-ali.jpg', express.static(path.join(publicDir, 'vc-zulfiqar-ali.jpg')));
app.use('/humera-razaq.jpg', express.static(path.join(publicDir, 'humera-razaq.jpg')));

// Serve Vite built frontend in production
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const HOSTELS_FILE = path.join(__dirname, '..', 'src', 'data', 'hostels.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function mergeBedStatuses(hostels, requests) {
  const bedStatusMap = {};
  const bedOccupantMap = {};
  for (const req of requests) {
    if (req.status === 'approved') {
      bedStatusMap[req.bedId] = 'booked';
      bedOccupantMap[req.bedId] = { userName: req.userName, studentId: req.studentId, requestId: req.id };
    } else if (req.status === 'pending') {
      bedStatusMap[req.bedId] = 'pending';
      bedOccupantMap[req.bedId] = { userName: req.userName, studentId: req.studentId, requestId: req.id };
    }
  }

  return hostels.map(hostel => ({
    ...hostel,
    rooms: hostel.rooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => ({
        ...bed,
        status: bedStatusMap[bed.id] || 'vacant',
        occupant: bedOccupantMap[bed.id] || null
      }))
    }))
  }));
}

// =====================
// AUTH
// =====================

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, studentId, gender, program } = req.body;
    if (!name || !email || !password || !studentId || !gender || !program) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = readJSON(USERS_FILE);
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (users.find(u => u.studentId === studentId)) {
      return res.status(409).json({ error: 'Student ID already registered' });
    }

    const newUser = {
      id: `s${Date.now()}`,
      name, email, password, studentId, gender, program,
      role: 'student',
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// HOSTELS
// =====================

app.get('/api/hostels', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);
    res.json(mergeBedStatuses(hostels, requests));
  } catch (err) {
    console.error('Get hostels error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/hostels/:id', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);
    const merged = mergeBedStatuses(hostels, requests);
    const hostel = merged.find(h => h.id === req.params.id);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });
    res.json(hostel);
  } catch (err) {
    console.error('Get hostel error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// REQUESTS (with audit history)
// =====================

app.post('/api/requests', (req, res) => {
  try {
    const { userId, userName, userEmail, studentId, hostelId, hostelName, roomNumber, bedId, idCardImage } = req.body;
    if (!userId || !userName || !userEmail || !studentId || !hostelId || !hostelName || !roomNumber || !bedId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const requests = readJSON(REQUESTS_FILE);

    if (requests.find(r => r.userId === userId && r.status === 'pending')) {
      return res.status(409).json({ error: 'You already have a pending booking request' });
    }

    if (requests.find(r => r.bedId === bedId && (r.status === 'approved' || r.status === 'pending'))) {
      return res.status(409).json({ error: 'This bed is already taken' });
    }

    const requestId = `req-${Date.now()}`;
    let idCardPath = '';

    if (idCardImage) {
      const base64Data = idCardImage.replace(/^data:image\/\w+;base64,/, '');
      const extMatch = idCardImage.match(/^data:image\/(\w+);base64,/);
      const ext = extMatch ? extMatch[1] : 'jpg';
      const fileName = `id-${requestId}.${ext === 'jpeg' ? 'jpg' : ext}`;
      fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(base64Data, 'base64'));
      idCardPath = `uploads/${fileName}`;
    }

    const now = new Date().toISOString();
    const newRequest = {
      id: requestId,
      userId, userName, userEmail, studentId,
      hostelId, hostelName, roomNumber, bedId,
      idCardImage: idCardPath,
      status: 'pending',
      submittedAt: now,
      history: [
        { status: 'pending', timestamp: now, note: 'Booking request submitted' }
      ]
    };

    requests.push(newRequest);
    writeJSON(REQUESTS_FILE, requests);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/requests', (req, res) => {
  try {
    const requests = readJSON(REQUESTS_FILE);
    const { userId } = req.query;
    if (userId) return res.json(requests.filter(r => r.userId === userId));
    res.json(requests);
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/requests/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    const requests = readJSON(REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Request not found' });

    const now = new Date().toISOString();
    requests[index].status = status;
    requests[index][status === 'approved' ? 'approvedAt' : 'rejectedAt'] = now;

    if (!requests[index].history) requests[index].history = [];
    requests[index].history.push({
      status,
      timestamp: now,
      note: status === 'approved' ? 'Booking approved by admin' : 'Booking rejected by admin'
    });

    writeJSON(REQUESTS_FILE, requests);
    res.json(requests[index]);
  } catch (err) {
    console.error('Update request status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/requests/:id', (req, res) => {
  try {
    const requests = readJSON(REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Request not found' });

    const now = new Date().toISOString();
    // Instead of deleting, mark as vacated to keep history
    requests[index].status = 'vacated';
    requests[index].vacatedAt = now;
    if (!requests[index].history) requests[index].history = [];
    requests[index].history.push({
      status: 'vacated',
      timestamp: now,
      note: 'Booking vacated by student'
    });

    writeJSON(REQUESTS_FILE, requests);
    res.json({ message: 'Booking vacated', request: requests[index] });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// ADMIN
// =====================

app.get('/api/admin/stats', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);
    const users = readJSON(USERS_FILE);

    let totalBeds = 0;
    for (const hostel of hostels) {
      for (const room of hostel.rooms) {
        totalBeds += room.beds.length;
      }
    }

    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    res.json({
      totalBeds,
      vacantBeds: totalBeds - approvedCount - pendingCount,
      pendingRequests: pendingCount,
      approvedBookings: approvedCount,
      registeredStudents: users.filter(u => u.role === 'student').length,
      totalRequests: requests.length
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = readJSON(USERS_FILE);
    res.json(users.map(({ password, ...rest }) => rest));
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export/students — CSV of all students with booking info
app.get('/api/admin/export/students', (req, res) => {
  try {
    const users = readJSON(USERS_FILE).filter(u => u.role === 'student');
    const requests = readJSON(REQUESTS_FILE);

    const headers = ['Name', 'Student ID', 'Email', 'Gender', 'Program', 'Registered', 'Booking Status', 'Hostel', 'Room', 'Bed'];
    const rows = users.map(u => {
      const booking = requests.find(r => r.userId === u.id && r.status === 'approved');
      const pending = requests.find(r => r.userId === u.id && r.status === 'pending');
      const active = booking || pending;
      return [
        u.name, u.studentId, u.email, u.gender, u.program,
        u.registeredAt || '',
        booking ? 'Approved' : pending ? 'Pending' : 'No Booking',
        active ? active.hostelName : '',
        active ? active.roomNumber : '',
        active ? active.bedId : ''
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export/beds — CSV of all beds with occupant info
app.get('/api/admin/export/beds', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);

    const bedMap = {};
    for (const r of requests) {
      if (r.status === 'approved') bedMap[r.bedId] = r;
    }

    const headers = ['Hostel', 'Room', 'Bed ID', 'Status', 'Student Name', 'Student ID', 'Email', 'Booked Since'];
    const rows = [];
    for (const h of hostels) {
      for (const room of h.rooms) {
        for (const bed of room.beds) {
          const occ = bedMap[bed.id];
          rows.push([
            h.name, room.number, bed.id,
            occ ? 'Occupied' : 'Vacant',
            occ ? occ.userName : '',
            occ ? occ.studentId : '',
            occ ? occ.userEmail : '',
            occ ? occ.approvedAt || occ.submittedAt : ''
          ]);
        }
      }
    }

    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bed_assignments.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export beds error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export/history — CSV of complete booking history
app.get('/api/admin/export/history', (req, res) => {
  try {
    const requests = readJSON(REQUESTS_FILE);
    const headers = ['Request ID', 'Student Name', 'Student ID', 'Email', 'Hostel', 'Room', 'Bed', 'Status', 'Submitted', 'Approved', 'Rejected', 'Vacated'];
    const rows = requests.map(r => [
      r.id, r.userName, r.studentId, r.userEmail,
      r.hostelName, r.roomNumber, r.bedId, r.status,
      r.submittedAt || '', r.approvedAt || '', r.rejectedAt || '', r.vacatedAt || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=booking_history.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// SETTINGS
// =====================

app.get('/api/settings', (req, res) => {
  try {
    const settings = readJSON(SETTINGS_FILE);
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const settings = readJSON(SETTINGS_FILE);
    const updated = { ...settings, ...req.body };
    writeJSON(SETTINGS_FILE, updated);
    res.json(updated);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// SPA catch-all — serve index.html for all non-API routes in production
if (fs.existsSync(distDir)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
